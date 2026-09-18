import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, Globe, Link2 } from 'lucide-react';
import * as socialApi from '../api/social';
import * as videosApi from '../api/videos';
import Avatar from '../components/Avatar';
import VideoCard from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/Skeletons';
import { formatCount } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useToast, extractErrorMessage } from '../context/ToastContext';
import ErrorPage from './ErrorPage';

const TABS = ['Home', 'Videos', 'Playlists', 'About'];

export default function ChannelPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tab, setTab] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    socialApi.fetchChannel(slug)
      .then(setChannel)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!channel) return;
    videosApi.fetchFeed({ section: 'latest', channel: channel.slug }).then((d) => setVideos(d.results));
  }, [channel]);

  if (notFound) return <ErrorPage code={404} title="Channel not found" />;
  if (loading || !channel) return <VideoGridSkeleton />;

  const isOwner = user && user.channel_id === channel.id;

  const toggleSubscribe = async () => {
    if (!user) return showToast('Sign in to subscribe.', 'error');
    try {
      const r = await socialApi.toggleSubscription(channel.slug);
      setChannel((c) => ({ ...c, is_subscribed: r.subscribed, subscriber_count: r.subscriber_count }));
    } catch (err) { showToast(extractErrorMessage(err), 'error'); }
  };

  return (
    <div>
      <div style={{
        height: 160, borderRadius: 'var(--radius-lg)', marginBottom: -44,
        background: channel.banner ? `url(${channel.banner}) center/cover` : 'linear-gradient(135deg, var(--accent), #8A6CFF)',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, padding: '0 8px' }}>
        <Avatar src={channel.owner.avatar} name={channel.name} size="lg" style={{ border: '4px solid var(--bg)' }} />
        <div style={{ flex: 1, paddingBottom: 6 }}>
          <h1 style={{ margin: 0, fontSize: 22, display: 'flex', alignItems: 'center', gap: 6 }}>
            {channel.name} {channel.is_verified && <BadgeCheck size={18} className="verified" />}
          </h1>
          <p className="muted" style={{ margin: '2px 0 0', fontSize: 13.5 }}>
            @{channel.owner.username} · {formatCount(channel.subscriber_count)} subscribers · {channel.video_count} videos
          </p>
        </div>
        {!isOwner && (
          <button className={`btn ${channel.is_subscribed ? 'btn-subscribed' : 'btn-primary'}`} onClick={toggleSubscribe}>
            {channel.is_subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>

      <div className="tabs" style={{ marginTop: 24 }}>
        {TABS.map((t) => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {(tab === 'Home' || tab === 'Videos') && (
        videos.length === 0 ? <p className="muted">No public videos yet.</p> :
          <div className="video-grid">{videos.map((v) => <VideoCard key={v.id} video={v} />)}</div>
      )}

      {tab === 'Playlists' && <p className="muted">This channel hasn't shared any public playlists yet.</p>}

      {tab === 'About' && (
        <div className="panel" style={{ maxWidth: 560 }}>
          <p>{channel.description || 'No description provided.'}</p>
          {channel.social_links?.website && (
            <p><Globe size={14} style={{ verticalAlign: -2 }} /> <a href={channel.social_links.website} target="_blank" rel="noreferrer">{channel.social_links.website}</a></p>
          )}
          {channel.social_links?.twitter && (
            <p><Link2 size={14} style={{ verticalAlign: -2 }} /> <a href={channel.social_links.twitter} target="_blank" rel="noreferrer">{channel.social_links.twitter}</a></p>
          )}
          <p className="muted" style={{ fontSize: 12.5 }}>Joined {new Date(channel.created_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
