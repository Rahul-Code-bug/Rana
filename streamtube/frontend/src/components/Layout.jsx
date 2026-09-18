import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileTabbar from './MobileTabbar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Navbar onToggleSidebar={() => setCollapsed((c) => !c)} />
      <div className="layout-body">
        <Sidebar collapsed={collapsed} />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <MobileTabbar />
    </div>
  );
}
