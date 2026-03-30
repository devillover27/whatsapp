import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const CreateTemplate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('MARKETING');
  const [language, setLanguage] = useState('en_US');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.match(/^[a-z0-9_]+$/)) {
      return alert("Template name must be lowercase alphanumeric with underscores (e.g. welcome_message).");
    }
    
    try {
      setLoading(true);
      await axios.post('http://localhost:3000/templates', {
        name,
        category,
        language,
        body
      }, { headers: { 'x-workspace-id': 'default-workspace' }});
      navigate('/templates');
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
          <button className="btn btn-secondary" onClick={() => navigate('/templates')} style={{ padding: '8px', borderRadius: '12px' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="title" style={{ margin: 0 }}>Create Message Template</h1>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '720px' }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Template Name</label>
            <input 
              type="text" 
              className="input-field"
              value={name} 
              onChange={e => setName(e.target.value.toLowerCase())}
              placeholder="e.g. summer_promo_2026"
              required 
            />
            <p className="text-secondary mt-2" style={{ fontSize: '0.7rem' }}>Lowercase, numbers, and underscores only. This is the unique ID for Meta.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="mb-4">
            <div>
              <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Category</label>
              <select 
                className="input-field"
                value={category} 
                onChange={e => setCategory(e.target.value)}
                style={{ appearance: 'none' }}
              >
                <option value="MARKETING" style={{ color: '#1e293b' }}>Marketing</option>
                <option value="UTILITY" style={{ color: '#1e293b' }}>Utility</option>
                <option value="AUTHENTICATION" style={{ color: '#1e293b' }}>Authentication</option>
              </select>
            </div>

            <div>
              <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Language</label>
              <select 
                className="input-field"
                value={language} 
                onChange={e => setLanguage(e.target.value)}
                style={{ appearance: 'none' }}
              >
                <option value="en_US" style={{ color: '#1e293b' }}>English (US)</option>
                <option value="en_GB" style={{ color: '#1e293b' }}>English (UK)</option>
                <option value="hi_IN" style={{ color: '#1e293b' }}>Hindi</option>
                <option value="es_ES" style={{ color: '#1e293b' }}>Spanish</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Message Content</label>
            <textarea 
              className="input-field"
              value={body} 
              onChange={e => setBody(e.target.value)}
              placeholder="Hello {{1}}, your appointment is confirmed for {{2}}."
              required 
              style={{ minHeight: '150px', lineHeight: '1.6', paddingTop: '12px' }}
            />
            <div className="flex-between mt-2">
              <p className="text-secondary" style={{ fontSize: '0.75rem' }}>Use {"{{1}}"}, {"{{2}}"} etc. for variables.</p>
              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{body.length} characters</span>
            </div>
          </div>

          <div className="mt-8" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
             <button type="button" className="btn btn-secondary" onClick={() => navigate('/templates')}>Cancel</button>
             <button type="submit" className="btn" disabled={loading} style={{ padding: '12px 24px' }}>
               <CheckCircle2 size={18} /> {loading ? 'Submitting...' : 'Submit for Approval'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplate;
