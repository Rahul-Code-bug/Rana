import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as socialApi from '../../api/social';
import { formatCount } from '../../utils/format';

const COLORS = ['#5B7CFF', '#8A6CFF', '#2FD98A', '#F5A623', '#FF4D67'];

export default function StudioDashboard() {
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState(null);

  useEffect(() => {
    socialApi.fetchAnalyticsSummary().then(setSummary);
    socialApi.fetchAnalyticsTimeseries(30).then(setSeries);
  }, []);

  if (!summary) return <p className="muted">Loading dashboard...</p>;

  const viewsChartData = (series?.views_by_day || []).map((d) => ({ date: d.day?.slice(5), views: d.views }));
  const trafficData = (series?.traffic_sources || []).map((t) => ({ name: t.source, value: t.count }));

  return (
    <div>
      <div className="stat-grid">
        <Stat label="Total views" value={formatCount(summary.total_views)} />
        <Stat label="Watch time (hrs)" value={summary.total_watch_time_hours} />
        <Stat label="Subscribers" value={formatCount(summary.subscriber_count)} />
        <Stat label="Total likes" value={formatCount(summary.total_likes)} />
        <Stat label="Comments" value={formatCount(summary.total_comments)} />
        <Stat label="Est. revenue" value={`$${summary.estimated_revenue}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="panel">
          <p style={{ fontWeight: 600, marginBottom: 14 }}>Views (last 30 days)</p>
          {viewsChartData.length === 0 ? <p className="muted">No view data yet.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={viewsChartData}>
                <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={11} />
                <YAxis stroke="var(--text-tertiary)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }} />
                <Line type="monotone" dataKey="views" stroke="#5B7CFF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="panel">
          <p style={{ fontWeight: 600, marginBottom: 14 }}>Traffic sources</p>
          {trafficData.length === 0 ? <p className="muted">No data yet.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={trafficData} dataKey="value" nameKey="name" outerRadius={80}>
                  {trafficData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="panel">
          <p style={{ fontWeight: 600, marginBottom: 10 }}>Top videos</p>
          {summary.top_videos.map((v) => (
            <Link key={v.slug} to={`/watch/${v.slug}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13.5 }}>
              <span>{v.title}</span><span className="muted">{formatCount(v.view_count)} views</span>
            </Link>
          ))}
        </div>
        <div className="panel">
          <p style={{ fontWeight: 600, marginBottom: 10 }}>Recent uploads</p>
          {summary.recent_videos.map((v) => (
            <Link key={v.slug} to={`/watch/${v.slug}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13.5 }}>
              <span>{v.title}</span><span className={`status-pill status-${v.status}`}>{v.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
