"""
Video processing pipeline.

Runs FFmpeg to probe metadata, generate a thumbnail, and transcode a handful
of resolutions, then updates the Video row when finished.

This is deliberately run on a background thread (see `queue_processing`)
rather than inline in the request/response cycle, so uploads return
immediately. In production this function body should be moved into a Celery
task (`@shared_task`) run by real workers instead of an in-process thread —
the function itself doesn't need to change, only how it's invoked.
"""
import json
import logging
import os
import subprocess
import tempfile
import threading
from pathlib import Path

from django.core.files import File
from django.utils import timezone

logger = logging.getLogger(__name__)

# Only generate resolutions <= the source's own height, so we never upscale.
TARGET_RESOLUTIONS = [360, 480, 720, 1080]


def _run(cmd):
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.decode(errors='ignore')[-2000:])
    return result.stdout


def probe_video(path):
    """Returns (duration_seconds, height) using ffprobe."""
    cmd = [
        'ffprobe', '-v', 'error', '-print_format', 'json',
        '-show_format', '-show_streams', str(path),
    ]
    out = _run(cmd)
    data = json.loads(out)
    duration = float(data.get('format', {}).get('duration', 0))
    height = 0
    for stream in data.get('streams', []):
        if stream.get('codec_type') == 'video':
            height = int(stream.get('height', 0))
            break
    return int(duration), height


def generate_thumbnail(source_path, out_path, timestamp_seconds=1):
    cmd = [
        'ffmpeg', '-y', '-ss', str(timestamp_seconds), '-i', str(source_path),
        '-frames:v', '1', '-q:v', '3', str(out_path),
    ]
    _run(cmd)


def transcode(source_path, out_path, height):
    cmd = [
        'ffmpeg', '-y', '-i', str(source_path),
        '-vf', f"scale=-2:{height}",
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart',
        str(out_path),
    ]
    _run(cmd)


def process_video_sync(video_id):
    """Does the actual work; safe to call from a thread or a Celery task."""
    from .models import Video, VideoRendition  # local import to avoid app-loading issues

    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist:
        return

    source_path = Path(video.original_file.path)
    tmpdir = Path(tempfile.mkdtemp(prefix='streamtube_'))

    try:
        duration, source_height = probe_video(source_path)
        video.duration_seconds = duration
        video.save(update_fields=['duration_seconds'])

        if not video.thumbnail:
            thumb_path = tmpdir / 'thumb.jpg'
            generate_thumbnail(source_path, thumb_path, timestamp_seconds=min(1, max(duration - 1, 0)))
            with open(thumb_path, 'rb') as f:
                video.thumbnail.save(f'{video.slug}-thumb.jpg', File(f), save=False)

        resolutions = [r for r in TARGET_RESOLUTIONS if r <= source_height] or [min(TARGET_RESOLUTIONS)]
        for height in resolutions:
            out_path = tmpdir / f'{height}p.mp4'
            transcode(source_path, out_path, height)
            rendition = VideoRendition(video=video, resolution=height)
            with open(out_path, 'rb') as f:
                rendition.file.save(f'{video.slug}-{height}p.mp4', File(f), save=False)
            rendition.file_size_bytes = os.path.getsize(out_path)
            rendition.save()

        video.status = Video.Status.PUBLISHED if video.status == Video.Status.PROCESSING else video.status
        video.processing_error = ''
        video.save()
        logger.info('Video %s processed successfully (%s renditions)', video_id, len(resolutions))
    except Exception as exc:  # noqa: BLE001 - we want to record *any* failure
        logger.exception('Video processing failed for %s', video_id)
        video.status = Video.Status.FAILED
        video.processing_error = str(exc)[-2000:]
        video.save(update_fields=['status', 'processing_error'])
    finally:
        for f in tmpdir.glob('*'):
            try:
                f.unlink()
            except OSError:
                pass
        try:
            tmpdir.rmdir()
        except OSError:
            pass


def queue_processing(video_id):
    """Fire-and-forget background processing so the upload request returns
    instantly. Swap this for `process_video_task.delay(video_id)` (Celery)
    in production for retries, monitoring, and multi-worker scaling."""
    thread = threading.Thread(target=process_video_sync, args=(video_id,), daemon=True)
    thread.start()
