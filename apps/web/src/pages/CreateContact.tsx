import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, UserPlus } from 'lucide-react';

const CreateContact = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return alert("Phone number is required!");
    
    try {
      setLoading(true);
      await axios.post('http://localhost:3000/contacts', {
        phone: phone,
        name,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        optedIn: true
      }, { headers: { 'x-workspace-id': 'default-workspace' }});
      navigate('/contacts');
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
          <button className="btn btn-secondary" onClick={() => navigate('/contacts')} style={{ padding: '8px', borderRadius: '12px' }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="title" style={{ margin: 0 }}>Add New Contact</h1>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Phone Number</label>
            <input 
              type="tel" 
              className="input-field"
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required 
            />
            <p className="text-secondary mt-2" style={{ fontSize: '0.7rem' }}>Include country code (e.g. +91, +1).</p>
          </div>

          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
            <input 
              type="text" 
              className="input-field"
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="John Doe"
              required 
            />
          </div>

          <div className="mb-4">
            <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600 }}>Tags (comma separated)</label>
            <input 
              type="text" 
              className="input-field"
              value={tags} 
              onChange={e => setTags(e.target.value)}
              placeholder="VIP, Frequent Flyer, NYC"
            />
          </div>

          <div className="mt-8" style={{ display: 'flex', justifyContent: 'flex-end' }}>
             <button type="submit" className="btn" disabled={loading} style={{ padding: '12px 24px' }}>
               <UserPlus size={18} /> {loading ? 'Saving...' : 'Save Contact'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContact;
