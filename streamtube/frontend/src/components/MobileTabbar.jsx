import { NavLink } from 'react-router-dom';
import { Home, Compass, Upload, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileTabbar() {
  const { user } = useAuth();
  return (
    <nav className="mobile-tabbar">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}><Home size={20} /> Home</NavLink>
      <NavLink to="/explore" className={({ isActive }) => isActive ? 'active' : ''}><Compass size={20} /> Explore</NavLink>
      <NavLink to="/upload" className={({ isActive }) => isActive ? 'active' : ''}><Upload size={20} /> Upload</NavLink>
      <NavLink to="/subscriptions" className={({ isActive }) => isActive ? 'active' : ''}><Bell size={20} /> Subs</NavLink>
      <NavLink to={user ? `/channel/${user.channel_slug || ''}` : '/login'} className={({ isActive }) => isActive ? 'active' : ''}><User size={20} /> {user ? 'You' : 'Sign in'}</NavLink>
    </nav>
  );
}
