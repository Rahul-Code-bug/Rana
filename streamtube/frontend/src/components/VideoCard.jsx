import { Link } from 'react-router-dom';
import { BadgeCheck, PlayCircle } from 'lucide-react';
import Avatar from './Avatar';
import { formatDuration, formatCount, timeAgo } from '../utils/format';

export default function VideoCard({ video, layout = 'grid' }) {
  const isList = layout === 'list';
  return (
    <Link to={`/watch/${video.slug}`} className={isList ? 'list-row' : 'video-card'}>
      <div className="thumb-wrap">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} loading="lazy" />
        ) : (
          <div className="thumb-placeholder"><PlayCircle size={36} /></div>
        )}
        {video.duration_seconds > 0 && (
          <span className="duration-badge">{formatDuration(video.duration_seconds)}</span>
        )}
      </div>
      <div className="video-meta-row">
        {!isList && <Avatar src={video.channel?.avatar} name={video.channel?.name} size="sm" />}
        <div className="video-info">
          <p className="video-title">{video.title}</p>
          <p className="video-sub">
            {video.channel?.name}
            {video.channel?.is_verified && <BadgeCheck size={12} className="verified" style={{ display: 'inline', marginLeft: 4, verticalAlign: -2 }} />}
          </p>
          <p className="video-sub">{formatCount(video.view_count)} views · {timeAgo(video.published_at || video.created_at)}</p>
        </div>
      </div>
    </Link>
  );
}
