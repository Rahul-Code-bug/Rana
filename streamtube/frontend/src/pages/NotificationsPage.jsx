import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, UserPlus, MessageCircle, ThumbsUp, Video, Reply } from 'lucide-react';
import * as socialApi from '../api/social';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import { timeAgo } from '../utils/format';

const ICONS = {
  new_subscriber: UserPlus, new_comment: MessageCircle, comment_reply: Reply,
  video_like: ThumbsUp, new_upload: Video,
};

const LABELS = {
  new_subscriber: 'subscribed to your channel',
  new_comment: 'commented on your video',
  comment_reply: 'replied to your comment',
  video_like: 'liked your video',
  new_upload: 'uploaded a new video',
};

export default function NotificationsPage() {
  const [items, setItems] = useState(null);

  const load = () => socialApi.fetchNotifications().then((d) => setItems(d.results));
  useEffect(() => { load(); socialApi.markAllNotificationsRead(); }, []);

  if (items === null) return <p className="muted">Loading...</p>;

  return (
    <div>
      <h1 className="page-title">Notifications</h1>
      {items.length === 0 ? (
        <EmptyState icon={<Bell size={40} />} title="No notifications yet" description="Activity on your channel and videos will show up here." />
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          {items.map((n) => {
            const Icon = ICONS[n.notification_type] || Bell;
            const link = n.video_slug ? `/watch/${n.video_slug}` : n.channel_slug ? `/channel/${n.channel_slug}` : '#';
            return (
              <Link key={n.id} to={link} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <Avatar src={n.actor?.avatar} name={n.actor?.username} size="sm" />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14 }}>
                    <strong>{n.actor?.username}</strong> {LABELS[n.notification_type]} {n.video_title ? `"${n.video_title}"` : ''}
                  </p>
                  <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>{timeAgo(n.created_at)}</p>
                </div>
                <Icon size={16} className="muted" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
