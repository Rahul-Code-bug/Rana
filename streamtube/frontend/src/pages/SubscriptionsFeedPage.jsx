import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import * as socialApi from '../api/social';
import VideoCard from '../components/VideoCard';
import EmptyState from '../components/EmptyState';
import { VideoGridSkeleton } from '../components/Skeletons';

export default function SubscriptionsFeedPage() {
  const [videos, setVideos] = useState(null);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    socialApi.fetchSubscriptionFeed().then((d) => setVideos(d.results));
    socialApi.fetchMySubscriptions().then((d) => setChannels(d.results || d));
  }, []);

  if (videos === null) return <VideoGridSkeleton />;

  return (
    <div>
      <h1 className="page-title">Subscriptions</h1>
      {channels.length > 0 && (
        <div className="chip-row">
          {channels.map((s) => (
            <a key={s.id} href={`/channel/${s.channel.slug}`} className="chip">{s.channel.name}</a>
          ))}
        </div>
      )}
      {videos.length === 0 ? (
        <EmptyState icon={<Bell size={40} />} title="No new videos" description="Subscribe to channels to see their latest uploads here." />
      ) : (
        <div className="video-grid">{videos.map((v) => <VideoCard key={v.id} video={v} />)}</div>
      )}
    </div>
  );
}
