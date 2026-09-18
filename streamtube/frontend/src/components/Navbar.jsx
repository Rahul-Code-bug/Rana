import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, Search, Upload, Bell, Sun, Moon, Video, LogOut, Settings, User as UserIcon, LayoutDashboard, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';
import * as socialApi from '../api/social';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    socialApi.fetchUnreadCount().then((d) => { if (active) setUnread(d.unread_count); }).catch(() => {});
    const interval = setInterval(() => {
      socialApi.fetchUnreadCount().then((d) => { if (active) setUnread(d.unread_count); }).catch(() => {});
    }, 30000);
    return () => { active = false; clearInterval(interval); };
  }, [user]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const doLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="topnav">
      <div className="topnav-left">
        <button className="icon-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar"><Menu size={20} /></button>
        <Link to="/" className="brand">
          <span className="brand-mark"><Video size={17} /></span>
          StreamTube
        </Link>
      </div>

      <form className="search-form" onSubmit={submitSearch}>
        <input
          className="search-input"
          placeholder="Search videos, channels, tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search-submit" type="submit" aria-label="Search"><Search size={18} /></button>
      </form>

      <div className="topnav-right">
        <button className="icon-btn mobile-search-btn" onClick={() => navigate('/search')} aria-label="Search">
          <Search size={20} />
        </button>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {user ? (
          <>
            <Link to="/upload" className="btn btn-secondary btn-sm" title="Upload">
              <Upload size={16} /> <span className="hide-mobile">Upload</span>
            </Link>
            <Link to="/notifications" className="icon-btn" style={{ position: 'relative' }} aria-label="Notifications">
              <Bell size={19} />
              {unread > 0 && <span className="badge" style={{ position: 'absolute', top: 4, right: 4 }}>{unread > 9 ? '9+' : unread}</span>}
            </Link>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button className="icon-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Account menu">
                <Avatar src={user.avatar} name={user.username} size="sm" />
              </button>
              {menuOpen && (
                <div className="dropdown-menu">
                  <div style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>{user.username}</div>
                  <div className="dropdown-divider" />
                  <Link to={`/channel/${user.channel_slug || ''}`} className="dropdown-item" onClick={() => setMenuOpen(false)}><UserIcon size={16} /> My channel</Link>
                  <Link to="/studio" className="dropdown-item" onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} /> Creator studio</Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setMenuOpen(false)}><Settings size={16} /> Settings</Link>
                  {user.is_staff && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setMenuOpen(false)}><ShieldCheck size={16} /> Admin dashboard</Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={doLogout}><LogOut size={16} /> Sign out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>
        )}
      </div>
    </header>
  );
}
