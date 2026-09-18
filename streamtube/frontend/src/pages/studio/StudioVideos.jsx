import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Pencil, Trash2 } from 'lucide-react';
import * as videosApi from '../../api/videos';
import { formatCount, timeAgo } from '../../utils/format';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast, extractErrorMessage } from '../../context/ToastContext';

export default function StudioVideos() {
  const { showToast } = useToast();
  const [videos, setVideos] = useState(null);
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const load = () => videosApi.fetchMyVideos(q).then((d) => setVideos(d.results));
  useEffect(() => { load(); }, [q]);

  const changeVisibility = async (slug, visibility) => {
    try {
      await videosApi.updateVideo(slug, { visibility });
      load();
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const confirmDelete = async () => {
    try {
      await videosApi.deleteVideo(toDelete);
      setToDelete(null);
      load();
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  if (videos === null) return <p className="muted">Loading...</p>;

  return (
    <div>
      <div className="field" style={{ maxWidth: 320, position: 'relative', marginBottom: 16 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-tertiary)' }} />
        <input placeholder="Search your videos" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 34 }} />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Video</th><th>Visibility</th><th>Status</th><th>Views</th><th>Likes</th><th>Comments</th><th>Uploaded</th><th></th></tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id}>
                <td style={{ maxWidth: 260 }}>
                  <Link to={`/watch/${v.slug}`} style={{ fontWeight: 600 }}>{v.title}</Link>
                </td>
                <td>
                  <select value={v.visibility} onChange={(e) => changeVisibility(v.slug, e.target.value)} className={`status-pill status-${v.visibility}`} style={{ border: 'none', cursor: 'pointer' }}>
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </td>
                <td><span className={`status-pill status-${v.status}`}>{v.status}</span></td>
                <td>{formatCount(v.view_count)}</td>
                <td>{formatCount(v.like_count)}</td>
                <td>{formatCount(v.comment_count)}</td>
                <td className="muted">{timeAgo(v.created_at)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link to={`/studio/videos/${v.slug}/edit`} className="icon-btn"><Pencil size={15} /></Link>
                    <button className="icon-btn" onClick={() => setToDelete(v.slug)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {videos.length === 0 && <p className="muted" style={{ marginTop: 16 }}>You haven't uploaded any videos yet.</p>}

      {toDelete && (
        <ConfirmModal
          title="Delete this video?" message="This will permanently remove the video and its comments. This can't be undone."
          confirmLabel="Delete" danger onConfirm={confirmDelete} onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
