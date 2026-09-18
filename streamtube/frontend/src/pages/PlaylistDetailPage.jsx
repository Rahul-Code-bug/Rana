import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import * as socialApi from '../api/social';
import VideoCard from '../components/VideoCard';
import ConfirmModal from '../components/ConfirmModal';
import ErrorPage from './ErrorPage';
import { useAuth } from '../context/AuthContext';

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = () => socialApi.fetchPlaylist(id).then(setPlaylist).catch(() => setNotFound(true));
  useEffect(() => { load(); }, [id]);

  if (notFound) return <ErrorPage code={404} title="Playlist not found" />;
  if (!playlist) return <p className="muted">Loading...</p>;

  const removeItem = async (itemId) => {
    await socialApi.removeFromPlaylist(id, itemId);
    load();
  };

  const deletePlaylist = async () => {
    await socialApi.deletePlaylist(id);
    navigate('/playlists');
  };

  return (
    <div>
      <div className="flex-between">
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{playlist.title}</h1>
          <p className="muted">{playlist.video_count} videos {playlist.is_public ? '· Public' : '· Private'}</p>
        </div>
        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete playlist</button>
      </div>
      {playlist.description && <p style={{ marginTop: 10 }}>{playlist.description}</p>}

      <div style={{ marginTop: 20 }}>
        {playlist.items.length === 0 ? (
          <p className="muted">This playlist is empty.</p>
        ) : playlist.items.map((item) => (
          <div key={item.id} style={{ position: 'relative' }}>
            <VideoCard video={item.video} layout="list" />
            <button className="icon-btn" style={{ position: 'absolute', top: 10, right: 10 }} onClick={(e) => { e.preventDefault(); removeItem(item.id); }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Delete this playlist?" message="This can't be undone." confirmLabel="Delete" danger
          onConfirm={deletePlaylist} onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
