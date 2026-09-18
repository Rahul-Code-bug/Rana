import { useEffect, useState } from 'react';
import * as videosApi from '../api/videos';
import VideoCard from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import { Film } from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sections, setSections] = useState({ trending: [], latest: [], recommended: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    videosApi.fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = activeCategory ? { category: activeCategory } : {};
    Promise.all([
      videosApi.fetchFeed({ section: 'trending', ...params }),
      videosApi.fetchFeed({ section: 'latest', ...params }),
      videosApi.fetchFeed({ section: 'recommended', ...params }),
    ])
      .then(([trending, latest, recommended]) => {
        setSections({ trending: trending.results, latest: latest.results, recommended: recommended.results });
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const noVideos = !loading && sections.trending.length === 0 && sections.latest.length === 0 && sections.recommended.length === 0;

  return (
    <div>
      <div className="chip-row">
        <button className={`chip ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>All</button>
        {categories.map((c) => (
          <button key={c.id} className={`chip ${activeCategory === c.slug ? 'active' : ''}`} onClick={() => setActiveCategory(c.slug)}>
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <VideoGridSkeleton />
      ) : noVideos ? (
        <EmptyState
          icon={<Film size={40} />}
          title="No videos yet"
          description="Be the first to upload a video to StreamTube."
        />
      ) : (
        <>
          <Section title="Trending" videos={sections.trending} />
          <Section title="Recommended for you" videos={sections.recommended} />
          <Section title="Latest uploads" videos={sections.latest} />
        </>
      )}
    </div>
  );
}

function Section({ title, videos }) {
  if (!videos.length) return null;
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 className="section-heading">{title}</h2>
      <div className="video-grid">
        {videos.map((v) => <VideoCard key={v.id} video={v} />)}
      </div>
    </section>
  );
}
