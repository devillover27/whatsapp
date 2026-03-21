import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';

const CreateTemplate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('MARKETING');
  const [language, setLanguage] = useState('en_US');
  const [body, setBody] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/templates', {
        name,
        category,
        language,
        body
      }, { headers: { 'x-workspace-id': 'default-workspace' }});
      navigate('/templates');
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/templates')} style={{ padding: '8px' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="title" style={{ margin: 0 }}>Create Message Template</h1>
      </div>

      <div className="glass-panel" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Template Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. holiday_promo_v1 (snake_case)"
              style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
              >
                <option value="MARKETING" style={{ color: 'black' }}>Marketing</option>
                <option value="UTILITY" style={{ color: 'black' }}>Utility</option>
                <option value="AUTHENTICATION" style={{ color: 'black' }}>Authentication</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Language</label>
              <select 
                value={language} 
                onChange={e => setLanguage(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
              >
                <option value="en_US" style={{ color: 'black' }}>English (US)</option>
                <option value="en_GB" style={{ color: 'black' }}>English (UK)</option>
                <option value="es_ES" style={{ color: 'black' }}>Spanish</option>
                <option value="hi_IN" style={{ color: 'black' }}>Hindi</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Message Body</label>
            <textarea 
              value={body} 
              onChange={e => setBody(e.target.value)}
              placeholder="Hi {{1}}, thank you for your order! Your confirmation is {{2}}."
              style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem', minHeight: '120px', resize: 'vertical' }}
              required 
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Use double curly braces like {"{{1}}"} for variables.</p>
          </div>

          <button type="submit" className="btn" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
            <Save size={18} /> Submit to Meta for Approval
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplate;
