import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListVideo, Plus, Lock, Globe2 } from 'lucide-react';
import * as socialApi from '../api/social';
import EmptyState from '../components/EmptyState';
import { useToast, extractErrorMessage } from '../context/ToastContext';

export default function PlaylistsPage() {
  const { showToast } = useToast();
  const [playlists, setPlaylists] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const load = () => socialApi.fetchPlaylists().then((d) => setPlaylists(d.results || d));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await socialApi.createPlaylist({ title, is_public: isPublic });
      setTitle('');
      setShowForm(false);
      load();
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  if (playlists === null) return <p className="muted">Loading...</p>;

  return (
    <div>
      <div className="flex-between">
        <h1 className="page-title">Playlists</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm((v) => !v)}><Plus size={16} /> New playlist</button>
      </div>

      {showForm && (
        <form className="panel" style={{ maxWidth: 420, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-end' }} onSubmit={create}>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label>Playlist name</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>
          <label className="checkbox-row" style={{ marginBottom: 10 }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Public
          </label>
          <button className="btn btn-primary btn-sm">Create</button>
        </form>
      )}

      {playlists.length === 0 ? (
        <EmptyState icon={<ListVideo size={40} />} title="No playlists yet" description="Create a playlist to organize videos." />
      ) : (
        <div className="video-grid compact">
          {playlists.map((p) => (
            <Link key={p.id} to={`/playlist/${p.id}`} className="panel" style={{ display: 'block' }}>
              <div className="flex-between">
                <strong>{p.title}</strong>
                {p.is_public ? <Globe2 size={14} className="muted" /> : <Lock size={14} className="muted" />}
              </div>
              <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>{p.video_count} videos</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
