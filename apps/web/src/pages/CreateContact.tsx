import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';

const CreateContact = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!phone) return alert("Phone number is required!");
      await axios.post('http://localhost:3000/contacts', {
        phone: phone,
        name,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        optedIn: true
      }, { headers: { 'x-workspace-id': 'default-workspace' }});
      navigate('/contacts');
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/contacts')} style={{ padding: '8px' }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="title" style={{ margin: 0 }}>Add New Contact</h1>
      </div>

      <div className="glass-panel" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Phone Number</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              placeholder="+1234567890"
              style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
              required 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Tags (comma separated)</label>
            <input 
              type="text" 
              value={tags} 
              onChange={e => setTags(e.target.value)}
              placeholder="VIP, New Lead, NYC"
              style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem' }}
            />
          </div>

          <button type="submit" className="btn" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>
            <Save size={18} /> Save Contact
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateContact;
