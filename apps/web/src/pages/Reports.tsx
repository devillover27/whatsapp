import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, MessageSquare, Calendar } from 'lucide-react';

const Reports = () => {
  const [msgStats, setMsgStats] = useState<any[]>([]);
  const [appStats, setAppStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'x-workspace-id': 'default-workspace' };
        const [msgRes, appRes] = await Promise.all([
          axios.get('http://localhost:3000/analytics/messages', { headers }),
          axios.get('http://localhost:3000/analytics/appointments', { headers })
        ]);
        setMsgStats(msgRes.data);
        setAppStats(appRes.data);
      } catch (e) {
        console.error('Failed to fetch analytics', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <p>Loading analytics reports...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={32} color="var(--primary)" />
          <div>
            <h1>Analytics & Reports</h1>
            <p>Real-time delivery and booking insights</p>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <MessageSquare className="stat-icon" size={20} />
            <span>Recent Campaigns</span>
          </div>
          <div className="stat-value">{msgStats.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <Calendar className="stat-icon" size={20} />
            <span>Total Appointments</span>
          </div>
          <div className="stat-value">{appStats?.total || 0}</div>
        </div>
      </div>

      <section style={{ marginTop: '40px' }}>
        <h2 style={{ marginBottom: '16px' }}>Campaign Delivery Performance</h2>
        <div className="card" style={{ padding: '0' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th style={{ textAlign: 'center' }}>Sent</th>
                <th style={{ textAlign: 'center' }}>Delivered</th>
                <th style={{ textAlign: 'center' }}>Read</th>
                <th style={{ textAlign: 'center' }}>Delivery %</th>
                <th style={{ textAlign: 'center' }}>Read %</th>
              </tr>
            </thead>
            <tbody>
              {msgStats.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No campaign data available.</td>
                </tr>
              ) : (
                msgStats.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td style={{ textAlign: 'center' }}>{c.sent}</td>
                    <td style={{ textAlign: 'center' }}>{c.delivered}</td>
                    <td style={{ textAlign: 'center' }}>{c.read}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge badge-${Number(c.deliveryRate) > 80 ? 'success' : 'warning'}`}>
                        {c.deliveryRate}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge">
                        {c.readRate}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px' }}>Appointments by Service</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {appStats && Object.entries(appStats.byService).length > 0 ? (
            Object.entries(appStats.byService).map(([name, count]: any) => (
              <div key={name} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>{name}</span>
                <span className="badge badge-success" style={{ fontSize: '1.2rem', padding: '4px 12px' }}>{count}</span>
              </div>
            ))
          ) : (
            <div className="card">No appointment data available.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reports;
