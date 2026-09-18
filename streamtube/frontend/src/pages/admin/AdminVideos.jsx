import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import * as adminApi from '../../api/admin';
import ConfirmModal from '../../components/ConfirmModal';
import { formatCount } from '../../utils/format';
import { useToast, extractErrorMessage } from '../../context/ToastContext';

export default function AdminVideos() {
  const { showToast } = useToast();
  const [videos, setVideos] = useState(null);
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const load = () => adminApi.adminListVideos(q).then((d) => setVideos(d.results));
  useEffect(() => { load(); }, [q]);

  const changeVisibility = async (id, visibility) => {
    try { await adminApi.adminUpdateVideo(id, { visibility }); load(); }
    catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const remove = async () => {
    try { await adminApi.adminDeleteVideo(toDelete); setToDelete(null); load(); }
    catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  if (videos === null) return <p className="muted">Loading...</p>;

  return (
    <div>
      <div className="field" style={{ maxWidth: 300, position: 'relative', marginBottom: 16 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-tertiary)' }} />
        <input placeholder="Search videos" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 34 }} />
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Channel</th><th>Visibility</th><th>Views</th><th>Uploaded</th><th></th></tr></thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id}>
                <td><Link to={`/watch/${v.slug}`}>{v.title}</Link></td>
                <td className="muted">{v.channel_name}</td>
                <td>
                  <select value={v.visibility} onChange={(e) => changeVisibility(v.id, e.target.value)} className={`status-pill status-${v.visibility}`} style={{ border: 'none' }}>
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private (remove)</option>
                  </select>
                </td>
                <td>{formatCount(v.view_count)}</td>
                <td className="muted">{new Date(v.created_at).toLocaleDateString()}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => setToDelete(v.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toDelete && (
        <ConfirmModal title="Delete this video?" message="This permanently removes the video." confirmLabel="Delete" danger onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
    </div>
  );
}
