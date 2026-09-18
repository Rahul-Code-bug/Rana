import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import * as adminApi from '../../api/admin';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast, extractErrorMessage } from '../../context/ToastContext';

export default function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const load = () => adminApi.adminListUsers(q).then((d) => setUsers(d.results));
  useEffect(() => { load(); }, [q]);

  const toggle = async (id, field, value) => {
    try { await adminApi.adminUpdateUser(id, { [field]: value }); load(); }
    catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const remove = async () => {
    try { await adminApi.adminDeleteUser(toDelete); setToDelete(null); load(); }
    catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  if (users === null) return <p className="muted">Loading...</p>;

  return (
    <div>
      <div className="field" style={{ maxWidth: 300, position: 'relative', marginBottom: 16 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-tertiary)' }} />
        <input placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 34 }} />
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Username</th><th>Email</th><th>Verified</th><th>Staff</th><th>Status</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.is_email_verified ? 'Yes' : 'No'}</td>
                <td>
                  <label className="checkbox-row"><input type="checkbox" checked={u.is_staff} onChange={(e) => toggle(u.id, 'is_staff', e.target.checked)} /></label>
                </td>
                <td>
                  <span className={`status-pill ${u.is_disabled ? 'status-failed' : 'status-published'}`}>{u.is_disabled ? 'Disabled' : 'Active'}</span>
                </td>
                <td className="muted">{new Date(u.date_joined).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => toggle(u.id, 'is_disabled', !u.is_disabled)}>{u.is_disabled ? 'Enable' : 'Disable'}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setToDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toDelete && (
        <ConfirmModal title="Delete this account?" message="This permanently removes the user and their content." confirmLabel="Delete" danger onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
    </div>
  );
}
