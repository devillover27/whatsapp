import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Campaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/campaigns');
      if (Array.isArray(res.data)) {
        setCampaigns(res.data);
      } else {
        setCampaigns([]);
      }
    } catch (e) {
      console.error('Failed to fetch campaigns', e);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
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
                <th>Campaign Name</th>
                <th>Template</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                  <div className="text-secondary">Loading campaigns...</div>
                </td></tr>
              )}
              {!loading && (!Array.isArray(campaigns) || campaigns.length === 0) && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                  <div className="text-secondary">No campaigns found. Start by creating a new one!</div>
                </td></tr>
              )}
              {!loading && Array.isArray(campaigns) && campaigns.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                  <td className="text-secondary">{c.templateId}</td>
                  <td>
                    <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                      {c.audienceType}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'completed' ? 'success' : 'pending'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="text-secondary">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                  </td>
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
