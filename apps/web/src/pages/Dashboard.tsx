import { useState, useEffect } from 'react';
import { Users, Send, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    activeCampaigns: 0,
    messagesSent: 0,
    deliveryRate: 0
  });

  const [campaigns, setCampaigns] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [statsRes, campsRes] = await Promise.all([
        axios.get('http://localhost:3000/stats'),
        axios.get('http://localhost:3000/campaigns')
      ]);
      setStats(statsRes.data);
      setCampaigns(campsRes.data.slice(0, 5)); // Last 5
    } catch (e) {
      console.error(e);
    }
  };

  const seedData = async () => {
    try {
      await axios.post('http://localhost:3000/seed');
      fetchData();
      alert("Test data successfully generated in your PostgreSQL Database! Refresh the page if needed.");
    } catch (e: any) {
      alert("Failed to seed data. Is the Backend API fully running? Please ensure you have run 'npm run dev:api' in your terminal!\n\nDetails: " + e.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="title">Overview</h1>
        <button className="btn btn-secondary" onClick={seedData}>Generate Test Data</button>
      </div>
      
      <div className="grid-cards">
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            <Users size={24} style={{ color: 'var(--accent)' }}/>
            <h3>Total Contacts</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.totalContacts.toLocaleString()}</p>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            <Send size={24} style={{ color: '#eab308' }}/>
            <h3>Active Campaigns</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.activeCampaigns}</p>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            <CheckCircle size={24} style={{ color: 'var(--success)' }}/>
            <h3>Delivery Rate</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.deliveryRate}%</p>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            <Clock size={24} style={{ color: '#a855f7' }}/>
            <h3>Messages Sent</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.messagesSent.toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '24px' }}>
        <h2 style={{ marginBottom: '24px' }}>Recent Activity</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 && (
                <tr><td colSpan={4}>No recent activity found. Click Generate Test Data above.</td></tr>
              )}
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td><span className={`badge ${c.status === 'completed' ? 'success' : 'pending'}`}>{c.status.toUpperCase()}</span></td>
                  <td>-</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
