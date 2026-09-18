import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, X } from 'lucide-react';
import * as socialApi from '../api/social';
import VideoCard from '../components/VideoCard';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { ListSkeleton } from '../components/Skeletons';

export default function HistoryPage() {
  const [items, setItems] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = () => socialApi.fetchHistory().then((d) => setItems(d.results));
  useEffect(() => { load(); }, []);

  const removeItem = async (id) => {
    await socialApi.deleteHistoryItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = async () => {
    await socialApi.clearHistory();
    setItems([]);
    setConfirmClear(false);
  };

  if (items === null) return <ListSkeleton />;

  return (
    <div>
      <div className="flex-between">
        <h1 className="page-title">Watch history</h1>
        {items.length > 0 && <button className="btn btn-secondary btn-sm" onClick={() => setConfirmClear(true)}>Clear all history</button>}
      </div>
      {items.length === 0 ? (
        <EmptyState icon={<HistoryIcon size={40} />} title="No watch history yet" description="Videos you watch will show up here." />
      ) : (
        items.map((item) => (
          <div key={item.id} style={{ position: 'relative' }}>
            <VideoCard video={item.video} layout="list" />
            <button className="icon-btn" style={{ position: 'absolute', top: 10, right: 10 }} onClick={(e) => { e.preventDefault(); removeItem(item.id); }}>
              <X size={16} />
            </button>
          </div>
        ))
      )}
      {confirmClear && (
        <ConfirmModal
          title="Clear all watch history?"
          message="This will remove your entire watch history. This can't be undone."
          confirmLabel="Clear history" danger
          onConfirm={clearAll} onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}
