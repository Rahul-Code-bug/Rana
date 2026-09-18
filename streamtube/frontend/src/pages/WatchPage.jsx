import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ThumbsUp, ThumbsDown, Share2, Bookmark, Download, BadgeCheck, Flag, ListPlus,
} from 'lucide-react';
import * as videosApi from '../api/videos';
import * as socialApi from '../api/social';
import VideoPlayer from '../components/VideoPlayer';
import VideoCard from '../components/VideoCard';
import Avatar from '../components/Avatar';
import CommentSection from '../components/CommentSection';
import { formatCount, timeAgo } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast, extractErrorMessage } from '../context/ToastContext';
import ErrorPage from './ErrorPage';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

export default function WatchPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const viewRecorded = useRef(false);

  useEffect(() => {
    setVideo(null);
    setNotFound(false);
    viewRecorded.current = false;
    videosApi.fetchVideo(slug)
      .then((v) => {
        setVideo(v);
        setSaved(v.is_saved_watch_later);
      })
      .catch(() => setNotFound(true));
    videosApi.fetchRelated(slug).then((d) => setRelated(d.results)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (video && !viewRecorded.current) {
      viewRecorded.current = true;
      const timer = setTimeout(() => {
        videosApi.recordView(slug, { watch_seconds: 3 }).then((d) => {
          setVideo((v) => v && { ...v, view_count: d.view_count });
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [video, slug]);

  if (notFound) return <ErrorPage code={404} title="Video not found" message="This video may be private, unlisted, or removed." />;
  if (!video) return <p className="muted">Loading...</p>;

  const react = async (type) => {
    if (!user) return showToast('Sign in to react to videos.', 'error');
    try {
      const r = await videosApi.reactToVideo(slug, type);
      setVideo((v) => ({ ...v, my_reaction: r.my_reaction, like_count: r.like_count, dislike_count: r.dislike_count }));
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const toggleSubscribe = async () => {
    if (!user) return showToast('Sign in to subscribe.', 'error');
    try {
      const r = await socialApi.toggleSubscription(video.channel.slug);
      setVideo((v) => ({ ...v, channel: { ...v.channel, is_subscribed: r.subscribed, subscriber_count: r.subscriber_count } }));
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const toggleWatchLater = async () => {
    if (!user) return showToast('Sign in to save videos.', 'error');
    try {
      await socialApi.addWatchLater(slug);
      setSaved(true);
      showToast('Saved to Watch Later.', 'success');
    } catch { showToast('Already saved.', 'default'); }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: video.title, url }); return; } catch { /* cancelled */ } }
    await navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard.', 'success');
  };

  const report = async () => {
    if (!user) return showToast('Sign in to report videos.', 'error');
    try {
      await socialApi.reportContent({ target_type: 'video', video: video.id, reason: 'other' });
      showToast('Video reported. Our team will review it.', 'success');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  return (
    <div className="watch-layout">
      <div>
        <VideoPlayer
          renditions={video.renditions}
          poster={video.thumbnail}
          onProgress={(secs) => { if (user) socialApi.upsertHistory(slug, secs).catch(() => {}); }}
        />
        <h1 className="watch-title">{video.title}</h1>

        <div className="watch-actions-row">
          <div className="channel-row">
            <Link to={`/channel/${video.channel.slug}`}>
              <Avatar src={video.channel.owner.avatar} name={video.channel.name} />
            </Link>
            <div>
              <Link to={`/channel/${video.channel.slug}`} style={{ fontWeight: 700, fontSize: 14.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                {video.channel.name} {video.channel.is_verified && <BadgeCheck size={14} className="verified" />}
              </Link>
              <p className="muted" style={{ fontSize: 12.5 }}>{formatCount(video.channel.subscriber_count)} subscribers</p>
            </div>
            {!(user && user.channel_id === video.channel.id) && (
              <button className={`btn btn-sm ${video.channel.is_subscribed ? 'btn-subscribed' : 'btn-primary'}`} onClick={toggleSubscribe} style={{ marginLeft: 8 }}>
                {video.channel.is_subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          <div className="action-btns">
            <div className="reaction-group">
              <button className={video.my_reaction === 'like' ? 'active' : ''} onClick={() => react('like')}>
                <ThumbsUp size={15} /> {formatCount(video.like_count)}
              </button>
              <div className="reaction-divider" />
              <button className={video.my_reaction === 'dislike' ? 'active' : ''} onClick={() => react('dislike')}>
                <ThumbsDown size={15} />
              </button>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={share}><Share2 size={15} /> Share</button>
            <button className="btn btn-secondary btn-sm" onClick={toggleWatchLater}><Bookmark size={15} /> {saved ? 'Saved' : 'Save'}</button>
            <button className="btn btn-secondary btn-sm" onClick={() => user ? setShowPlaylistModal(true) : showToast('Sign in to use playlists.', 'error')}><ListPlus size={15} /></button>
            {video.allow_download && video.renditions[0] && (
              <a className="btn btn-secondary btn-sm" href={video.renditions[video.renditions.length - 1].url} download>
                <Download size={15} /> Download
              </a>
            )}
            <button className="btn btn-secondary btn-sm" onClick={report}><Flag size={15} /></button>
          </div>
        </div>

        <div className="description-box">
          <p style={{ fontWeight: 600, marginTop: 0 }}>{formatCount(video.view_count)} views · {timeAgo(video.published_at)}</p>
          <p>{video.description || 'No description provided.'}</p>
          {video.tags.map((t) => (
            <Link key={t.id} to={`/search?q=${encodeURIComponent(t.name)}`} className="tag-pill">#{t.name}</Link>
          ))}
        </div>

        <CommentSection video={video} />
      </div>

      <div>
        <h3 style={{ marginTop: 0 }}>Up next</h3>
        {related.map((v) => <VideoCard key={v.id} video={v} layout="list" />)}
      </div>

      {showPlaylistModal && (
        <AddToPlaylistModal videoSlug={slug} onClose={() => setShowPlaylistModal(false)} />
      )}
    </div>
  );
}
