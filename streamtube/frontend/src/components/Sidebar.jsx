import { NavLink } from 'react-router-dom';
import {
  Home, Compass, TrendingUp, Bell, Film, History, Clock, ThumbsUp, ListVideo,
  User, LayoutDashboard, Settings, HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const guestLinks = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/trending', icon: TrendingUp, label: 'Trending' },
  { to: '/shorts', icon: Film, label: 'Shorts' },
];

const userLinks = [
  { to: '/subscriptions', icon: Bell, label: 'Subscriptions' },
];

const libraryLinks = [
  { to: '/history', icon: History, label: 'History' },
  { to: '/watch-later', icon: Clock, label: 'Watch Later' },
  { to: '/liked', icon: ThumbsUp, label: 'Liked Videos' },
  { to: '/playlists', icon: ListVideo, label: 'Playlists' },
];

export default function Sidebar({ collapsed }) {
  const { user } = useAuth();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-section">
        {guestLinks.map((l) => <SideLink key={l.to} {...l} />)}
      </nav>

      {user && (
        <>
          <hr />
          <nav className="sidebar-section">
            {userLinks.map((l) => <SideLink key={l.to} {...l} />)}
          </nav>
          <hr />
          <div className="sidebar-label">Library</div>
          <nav className="sidebar-section">
            {libraryLinks.map((l) => <SideLink key={l.to} {...l} />)}
          </nav>
          <hr />
          <div className="sidebar-label">Creator</div>
          <nav className="sidebar-section">
            <SideLink to={`/channel/${user.channel_slug || ''}`} icon={User} label="My Channel" />
            <SideLink to="/studio" icon={LayoutDashboard} label="Creator Studio" />
            <SideLink to="/settings" icon={Settings} label="Settings" />
          </nav>
        </>
      )}
      <hr />
      <nav className="sidebar-section">
        <SideLink to="/help" icon={HelpCircle} label="Help" />
      </nav>
    </aside>
  );
}

function SideLink({ to, icon: Icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end={to === '/'}>
      <Icon size={19} />
      <span>{label}</span>
    </NavLink>
  );
}
