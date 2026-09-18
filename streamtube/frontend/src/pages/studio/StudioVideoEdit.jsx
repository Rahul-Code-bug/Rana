import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as videosApi from '../../api/videos';
import { useToast, extractErrorMessage } from '../../context/ToastContext';

export default function StudioVideoEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [video, setVideo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [thumbFile, setThumbFile] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    videosApi.fetchVideo(slug).then((v) => setVideo({
      title: v.title, description: v.description, category: v.category?.id || '',
      language: v.language, visibility: v.visibility, allow_comments: v.allow_comments,
      allow_download: v.allow_download, tags: v.tags.map((t) => t.name).join(', '),
      thumbnail_preview: v.thumbnail,
    }));
    videosApi.fetchCategories().then(setCategories);
  }, [slug]);

  if (!video) return <p className="muted">Loading...</p>;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title', video.title);
      fd.append('description', video.description);
      if (video.category) fd.append('category', video.category);
      fd.append('language', video.language);
      video.tags.split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => fd.append('tags', t));
      fd.append('visibility', video.visibility);
      fd.append('allow_comments', String(video.allow_comments));
      fd.append('allow_download', String(video.allow_download));
      if (thumbFile) fd.append('thumbnail', thumbFile);
      await videosApi.updateVideo(slug, fd);
      showToast('Video updated.', 'success');
      navigate('/studio/videos');
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="upload-grid">
      <div>
        <div className="field">
          <label>Title</label>
          <input value={video.title} onChange={(e) => setVideo({ ...video, title: e.target.value })} required />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea rows={5} value={video.description} onChange={(e) => setVideo({ ...video, description: e.target.value })} />
        </div>
        <div className="field">
          <label>Tags</label>
          <input value={video.tags} onChange={(e) => setVideo({ ...video, tags: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field">
            <label>Category</label>
            <select value={video.category} onChange={(e) => setVideo({ ...video, category: e.target.value })}>
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Visibility</label>
            <select value={video.visibility} onChange={(e) => setVideo({ ...video, visibility: e.target.value })}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <div className="panel" style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, marginBottom: 10 }}>Thumbnail</p>
          <img src={thumbFile ? URL.createObjectURL(thumbFile) : video.thumbnail_preview} alt="thumbnail" className="thumb-preview" />
          <label className="btn btn-secondary btn-sm btn-block" style={{ marginTop: 10, cursor: 'pointer' }}>
            Change thumbnail
            <input type="file" accept="image/*" hidden onChange={(e) => setThumbFile(e.target.files[0])} />
          </label>
        </div>
        <label className="checkbox-row" style={{ marginBottom: 10 }}>
          <input type="checkbox" checked={video.allow_comments} onChange={(e) => setVideo({ ...video, allow_comments: e.target.checked })} /> Allow comments
        </label>
        <label className="checkbox-row" style={{ marginBottom: 16 }}>
          <input type="checkbox" checked={video.allow_download} onChange={(e) => setVideo({ ...video, allow_download: e.target.checked })} /> Allow download
        </label>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>
      </div>
    </form>
  );
}
