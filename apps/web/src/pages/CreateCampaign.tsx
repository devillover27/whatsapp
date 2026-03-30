import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Send } from 'lucide-react';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/templates')
      .then(res => {
        if (Array.isArray(res.data)) {
          setTemplates(res.data);
        } else {
          setTemplates([]);
        }
      })
      .catch(err => {
        console.error(err);
        setTemplates([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !templateId) return alert("Please fill all required fields!");
    
    try {
      setLoading(true);
      await axios.post('http://localhost:3000/campaigns', {
        name,
        templateId,
        audienceType: "all"
      }, { headers: { 'x-workspace-id': 'default-workspace' }});
      navigate('/campaigns');
    } catch (e: any) {
      alert("Error: " + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
        <div className="flex-center gap-4">
          <button className="btn btn-secondary" onClick={() => navigate('/campaigns')} style={{ padding: '8px', borderRadius: '12px' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="title" style={{ margin: 0 }}>Create New Campaign</h1>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Campaign Name</label>
            <input 
              type="text" 
              className="input-field"
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Summer Special Offer"
              required 
            />
          </div>

          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Message Template</label>
            <select 
              className="input-field"
              value={templateId} 
              onChange={e => setTemplateId(e.target.value)}
              required
              style={{ appearance: 'none' }}
            >
              <option value="" disabled>Select a Template</option>
              {Array.isArray(templates) && templates.map(t => (
                <option key={t.id || t.name} value={t.id} style={{ color: '#1e293b' }}>
                  {t.name} ({t.category || 'MARKETING'})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Target Audience</label>
            <select 
              className="input-field"
              defaultValue="all"
              style={{ appearance: 'none' }}
            >
              <option value="all" style={{ color: '#1e293b' }}>All Opted-In Contacts ({templates.length > 0 ? 'Ready' : 'No Contacts'})</option>
            </select>
            <p className="text-secondary mt-2" style={{ fontSize: '0.75rem' }}>
              Messages will only be sent to contacts who have explicitly opted-in.
            </p>
          </div>

          <div className="mt-8" style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <button type="submit" className="btn" disabled={loading} style={{ padding: '12px 24px' }}>
               <Send size={18} /> {loading ? 'Launching...' : 'Launch Campaign'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
