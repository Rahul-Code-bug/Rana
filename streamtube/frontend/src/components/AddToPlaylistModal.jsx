import { useEffect, useState } from 'react';
import * as socialApi from '../api/social';
import { useToast, extractErrorMessage } from '../context/ToastContext';

export default function AddToPlaylistModal({ videoSlug, onClose }) {
  const { showToast } = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialApi.fetchPlaylists().then((d) => setPlaylists(d.results || d)).finally(() => setLoading(false));
  }, []);

  const add = async (id) => {
    try {
      await socialApi.addToPlaylist(id, videoSlug);
      showToast('Added to playlist.', 'success');
      onClose();
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  const createAndAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const p = await socialApi.createPlaylist({ title: newTitle.trim(), is_public: true });
      await add(p.id);
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <p className="modal-title">Save to playlist</p>
        {loading ? <p className="muted">Loading...</p> : (
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {playlists.length === 0 && <p className="muted">You don't have any playlists yet.</p>}
            {playlists.map((p) => (
              <button key={p.id} className="dropdown-item" style={{ width: '100%' }} onClick={() => add(p.id)}>{p.title}</button>
            ))}
          </div>
        )}
        <form onSubmit={createAndAdd} style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <input className="field" style={{ flex: 1, height: 38, padding: '0 12px', borderRadius: 6, border: '1px solid var(--border-strong)', background: 'var(--bg)', color: 'var(--text)' }}
            placeholder="New playlist name" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <button className="btn btn-primary btn-sm">Create</button>
        </form>
        <div className="modal-actions">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
