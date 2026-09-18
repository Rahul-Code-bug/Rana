import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as videosApi from '../api/videos';
import VideoCard from '../components/VideoCard';
import { ListSkeleton } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import { SearchX } from 'lucide-react';

export default function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    sort: params.get('sort') || 'relevance',
    category: params.get('category') || '',
    duration: params.get('duration') || '',
    upload_date: params.get('upload_date') || '',
  });

  useEffect(() => { videosApi.fetchCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    videosApi.searchVideos({ q, ...filters }).then((d) => setResults(d.results)).finally(() => setLoading(false));
  }, [q, filters]);

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const p = new URLSearchParams(params);
    if (value) p.set(key, value); else p.delete(key);
    setParams(p);
  };

  return (
    <div>
      <h1 className="page-title">{q ? `Results for "${q}"` : 'Search'}</h1>

      <div className="chip-row">
        <select className="chip" style={{ appearance: 'none' }} value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="views">Most viewed</option>
        </select>
        <select className="chip" style={{ appearance: 'none' }} value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select className="chip" style={{ appearance: 'none' }} value={filters.duration} onChange={(e) => updateFilter('duration', e.target.value)}>
          <option value="">Any length</option>
          <option value="short">Under 4 min</option>
          <option value="medium">4–20 min</option>
          <option value="long">Over 20 min</option>
        </select>
        <select className="chip" style={{ appearance: 'none' }} value={filters.upload_date} onChange={(e) => updateFilter('upload_date', e.target.value)}>
          <option value="">Any time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
        </select>
      </div>

      {loading ? <ListSkeleton /> : results.length === 0 ? (
        <EmptyState icon={<SearchX size={40} />} title="No results found" description="Try different keywords or remove some filters." />
      ) : (
        <div>{results.map((v) => <VideoCard key={v.id} video={v} layout="list" />)}</div>
      )}
    </div>
  );
}
