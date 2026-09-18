import { useEffect, useState } from 'react';
import * as adminApi from '../../api/admin';
import { timeAgo } from '../../utils/format';
import { useToast, extractErrorMessage } from '../../context/ToastContext';

export default function AdminReports() {
  const { showToast } = useToast();
  const [reports, setReports] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  const load = () => adminApi.adminListReports(statusFilter || undefined).then((d) => setReports(d.results));
  useEffect(() => { load(); }, [statusFilter]);

  const resolve = async (id, action, removeContent) => {
    try { await adminApi.adminResolveReport(id, action, removeContent); load(); }
    catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  if (reports === null) return <p className="muted">Loading...</p>;

  return (
    <div>
      <div className="chip-row">
        {['pending', 'resolved', 'rejected', ''].map((s) => (
          <button key={s} className={`chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>{s || 'All'}</button>
        ))}
      </div>
      {reports.length === 0 ? <p className="muted">No reports here.</p> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Type</th><th>Reason</th><th>Reported by</th><th>Status</th><th>Filed</th><th></th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td style={{ textTransform: 'capitalize' }}>{r.target_type}</td>
                  <td>{r.reason}</td>
                  <td className="muted">{r.reporter_username}</td>
                  <td><span className={`status-pill status-${r.status}`}>{r.status}</span></td>
                  <td className="muted">{timeAgo(r.created_at)}</td>
                  <td>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => resolve(r.id, 'resolve', true)}>Remove content</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => resolve(r.id, 'resolve', false)}>Resolve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => resolve(r.id, 'reject', false)}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
