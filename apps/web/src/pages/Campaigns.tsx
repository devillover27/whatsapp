import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Campaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('http://localhost:3000/campaigns');
      setCampaigns(res.data);
    } catch (e) {
      console.error('Failed to fetch campaigns', e);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="title" style={{ margin: 0 }}>Campaigns</h1>
        <button className="btn" onClick={() => navigate('/campaigns/new')}>
          <Plus size={18} />
          New Campaign
        </button>
      </div>

      <div className="glass-panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Template</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 && (
                <tr><td colSpan={5}>No campaigns found. Generate test data from Dashboard!</td></tr>
              )}
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.templateId}</td>
                  <td>{c.audienceType}</td>
                  <td><span className={`badge ${c.status === 'completed' ? 'success' : 'pending'}`}>{c.status.toUpperCase()}</span></td>
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

export default Campaigns;
