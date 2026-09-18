import { useState } from 'react';
import AdminUsers from './AdminUsers';
import AdminVideos from './AdminVideos';
import AdminComments from './AdminComments';
import AdminReports from './AdminReports';
import AdminCategories from './AdminCategories';

const TABS = ['Users', 'Videos', 'Comments', 'Reports', 'Categories'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Reports');
  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>
      <div className="tabs">
        {TABS.map((t) => <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Users' && <AdminUsers />}
      {tab === 'Videos' && <AdminVideos />}
      {tab === 'Comments' && <AdminComments />}
      {tab === 'Reports' && <AdminReports />}
      {tab === 'Categories' && <AdminCategories />}
    </div>
  );
}
