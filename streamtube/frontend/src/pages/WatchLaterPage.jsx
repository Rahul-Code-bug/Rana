import { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';
import * as socialApi from '../api/social';
import VideoCard from '../components/VideoCard';
import EmptyState from '../components/EmptyState';
import { ListSkeleton } from '../components/Skeletons';

export default function WatchLaterPage() {
  const [items, setItems] = useState(null);

  useEffect(() => { socialApi.fetchWatchLater().then((d) => setItems(d.results)); }, []);

  const remove = async (id) => {
    await socialApi.removeWatchLater(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (items === null) return <ListSkeleton />;

  return (
    <div>
      <h1 className="page-title">Watch later</h1>
      {items.length === 0 ? (
        <EmptyState icon={<Clock size={40} />} title="Nothing saved yet" description="Save videos to watch later from the watch page." />
      ) : items.map((item) => (
        <div key={item.id} style={{ position: 'relative' }}>
          <VideoCard video={item.video} layout="list" />
          <button className="icon-btn" style={{ position: 'absolute', top: 10, right: 10 }} onClick={(e) => { e.preventDefault(); remove(item.id); }}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
