import { useEffect, useState } from 'react';
import * as videosApi from '../api/videos';
import VideoCard from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import { Compass } from 'lucide-react';

export default function BrowsePage({ section, title }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    videosApi.fetchFeed({ section }).then((d) => setVideos(d.results)).finally(() => setLoading(false));
  }, [section]);

  return (
    <div>
      <h1 className="page-title">{title}</h1>
      {loading ? <VideoGridSkeleton /> : videos.length === 0 ? (
        <EmptyState icon={<Compass size={40} />} title="Nothing here yet" description="Check back soon." />
      ) : (
        <div className="video-grid">{videos.map((v) => <VideoCard key={v.id} video={v} />)}</div>
      )}
    </div>
  );
}
