import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3000/templates')
      .then(res => setTemplates(res.data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!name || !templateId) return alert("Fill all required fields!");
      await axios.post('http://localhost:3000/campaigns', {
        name,
        templateId,
        audienceType: "all"
      }, { headers: { 'x-workspace-id': 'default-workspace' }});
      navigate('/campaigns');
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/campaigns')} style={{ padding: '8px' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="title" style={{ margin: 0 }}>Create New Campaign</h1>
      </div>

      <div className="glass-panel" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Campaign Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Black Friday Promo"
              style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Message Template</label>
            <select 
              value={templateId} 
              onChange={e => setTemplateId(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
              required
            >
              <option value="" disabled>Select a Template</option>
              {templates.map(t => (
                <option key={t.id} value={t.id} style={{ color: 'black' }}>{t.name} ({t.category})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Audience</label>
            <select 
              defaultValue="all"
              style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
            >
              <option value="all" style={{ color: 'black' }}>All Opted-In Contacts</option>
            </select>
          </div>

          <button type="submit" className="btn" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
            <Save size={18} /> Launch Campaign
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
