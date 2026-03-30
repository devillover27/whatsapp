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
      
      if (statsRes.data) {
        setStats(statsRes.data);
      }
      
      if (Array.isArray(campsRes.data)) {
        setCampaigns(campsRes.data.slice(0, 5));
      }
    } catch (e) {
      console.error(e);
      setCampaigns([]);
    }
  };

  const seedData = async () => {
    try {
      await axios.post('http://localhost:3000/seed');
      fetchData();
      alert("Test data successfully generated!");
    } catch (e: any) {
      alert("Failed to seed data. Is the Backend API running?");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
        <h1 className="title" style={{ margin: 0 }}>Overview</h1>
        <button className="btn btn-secondary" onClick={seedData}>
          Generate Test Data
        </button>
      </div>
      
      <div className="grid-cards">
        <div className="glass-panel">
          <div className="flex-center gap-2 mb-4 text-secondary">
            <Users size={20} className="text-accent" />
            <h3>Total Contacts</h3>
          </div>
          <p className="stats-value">{(stats?.totalContacts ?? 0).toLocaleString()}</p>
        </div>

        <div className="glass-panel">
          <div className="flex-center gap-2 mb-4 text-secondary">
            <Send size={20} style={{ color: '#eab308' }}/>
            <h3>Active Campaigns</h3>
          </div>
          <p className="stats-value">{stats?.activeCampaigns ?? 0}</p>
        </div>

        <div className="glass-panel">
          <div className="flex-center gap-2 mb-4 text-secondary">
            <CheckCircle size={20} style={{ color: 'var(--success)' }}/>
            <h3>Delivery Rate</h3>
          </div>
          <p className="stats-value">{stats?.deliveryRate ?? 100}%</p>
        </div>

        <div className="glass-panel">
          <div className="flex-center gap-2 mb-4 text-secondary">
            <Clock size={20} style={{ color: '#a855f7' }}/>
            <h3>Messages Sent</h3>
          </div>
          <p className="stats-value">{(stats?.messagesSent ?? 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-panel mt-4">
        <div className="flex-between mb-4">
          <h2>Recent Activity</h2>
          <button className="btn btn-secondary" onClick={() => (window as any).location.href='/campaigns'}>
            View All
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Status</th>
                <th>Sent</th>
                <th>Date Created</th>
              </tr>
            </thead>
            <tbody>
              {(!Array.isArray(campaigns) || campaigns.length === 0) && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>No recent activity found. Generate test data to begin.</td></tr>
              )}
              {Array.isArray(campaigns) && campaigns.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                  <td>
                    <span className={`badge ${c.status === 'completed' ? 'success' : 'pending'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>-</td>
                  <td className="text-secondary">{new Date(c.createdAt).toLocaleDateString()}</td>
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
