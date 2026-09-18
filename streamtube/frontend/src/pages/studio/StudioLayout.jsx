import { NavLink, Outlet } from 'react-router-dom';

const TABS = [
  { to: '/studio', label: 'Dashboard', end: true },
  { to: '/studio/videos', label: 'Videos' },
];

export default function StudioLayout() {
  return (
    <div>
      <h1 className="page-title">Creator Studio</h1>
      <div className="tabs">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
