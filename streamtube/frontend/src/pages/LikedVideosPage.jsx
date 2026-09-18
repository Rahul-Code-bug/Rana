import { useEffect, useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import client from '../api/client';
import VideoCard from '../components/VideoCard';
import EmptyState from '../components/EmptyState';
import { VideoGridSkeleton } from '../components/Skeletons';

export default function LikedVideosPage() {
  const [videos, setVideos] = useState(null);

  useEffect(() => {
    client.get('/videos/liked/').then((r) => setVideos(r.data.results));
  }, []);

  if (videos === null) return <VideoGridSkeleton />;

  return (
    <div>
      <h1 className="page-title">Liked videos</h1>
      {videos.length === 0 ? (
        <EmptyState icon={<ThumbsUp size={40} />} title="No liked videos" description="Videos you like will appear here." />
      ) : (
        <div className="video-grid">{videos.map((v) => <VideoCard key={v.id} video={v} />)}</div>
      )}
    </div>
  );
}
