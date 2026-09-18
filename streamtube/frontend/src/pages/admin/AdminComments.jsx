import { useEffect, useState } from 'react';
import * as adminApi from '../../api/admin';
import { useToast, extractErrorMessage } from '../../context/ToastContext';

export default function AdminComments() {
  const { showToast } = useToast();
  const [comments, setComments] = useState(null);

  const load = () => adminApi.adminListComments().then((d) => setComments(d.results));
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    try { await adminApi.adminDeleteComment(id); load(); }
    catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  if (comments === null) return <p className="muted">Loading...</p>;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead><tr><th>User</th><th>Video</th><th>Comment</th><th>Posted</th><th></th></tr></thead>
        <tbody>
          {comments.map((c) => (
            <tr key={c.id}>
              <td>{c.username}</td>
              <td className="muted">{c.video_title}</td>
              <td style={{ maxWidth: 320 }}>{c.is_deleted ? <em className="muted">[deleted]</em> : c.text}</td>
              <td className="muted">{new Date(c.created_at).toLocaleDateString()}</td>
              <td>{!c.is_deleted && <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Delete</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
