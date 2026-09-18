import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import * as adminApi from '../../api/admin';
import { useToast, extractErrorMessage } from '../../context/ToastContext';

export default function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState(null);
  const [name, setName] = useState('');

  const load = () => adminApi.adminListCategories().then(setCategories);
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try { await adminApi.adminCreateCategory({ name: name.trim(), order: categories.length }); setName(''); load(); }
    catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const toggleActive = async (c) => {
    try { await adminApi.adminUpdateCategory(c.id, { is_active: !c.is_active }); load(); }
    catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const remove = async (id) => {
    try { await adminApi.adminDeleteCategory(id); load(); }
    catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  if (categories === null) return <p className="muted">Loading...</p>;

  return (
    <div>
      <form onSubmit={create} style={{ display: 'flex', gap: 10, marginBottom: 16, maxWidth: 400 }}>
        <input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, height: 38, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border-strong)', background: 'var(--bg)', color: 'var(--text)' }} />
        <button className="btn btn-primary btn-sm"><Plus size={15} /> Add</button>
      </form>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="muted">{c.slug}</td>
                <td><label className="checkbox-row"><input type="checkbox" checked={c.is_active} onChange={() => toggleActive(c)} /></label></td>
                <td><button className="icon-btn" onClick={() => remove(c.id)}><Trash2 size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
