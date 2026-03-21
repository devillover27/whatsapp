import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Download } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/contacts');
      setContacts(res.data);
    } catch (e) {
      console.error('Failed to fetch contacts', e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      
      // Simple CSV Parse
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) return alert("Invalid CSV. Must have headers like Phone, Name, Tags.");
      
      const parsedContacts = lines.slice(1).map(line => {
        const [phone, name, rawTags] = line.split(',');
        return {
          phone: phone?.trim(),
          name: name?.trim() || '',
          tags: rawTags ? rawTags.split('|').map(t => t.trim()) : []
        };
      }).filter(c => c.phone); // Require phone number

      if (parsedContacts.length === 0) return alert("No valid phone numbers found in CSV.");

      try {
        const res = await axios.post('http://localhost:3000/contacts/bulk', { contacts: parsedContacts }, { headers: { 'x-workspace-id': 'default-workspace' }});
        alert(`Import Successful: ${res.data.count} contacts imported from CSV.`);
        fetchContacts();
      } catch (err: any) {
        alert("Failed to import CSV. Is API running? Error: " + err.message);
      }
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="title" style={{ margin: 0 }}>Contacts</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Download size={18} />
            Import CSV
          </button>
          <button className="btn" onClick={() => navigate('/contacts/new')}>
            <UserPlus size={18} />
            Add Contact
          </button>
        </div>
      </div>

      <div className="glass-panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Phone Number</th>
                <th>Name</th>
                <th>Tags</th>
                <th>Opted In</th>
                <th>Added</th>
              </tr>
            </thead>
             <tbody>
              {contacts.length === 0 && (
                <tr><td colSpan={5}>No contacts found. Generate test data from Dashboard!</td></tr>
              )}
              {contacts.map(c => (
                <tr key={c.id}>
                  <td>{c.phone}</td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>
                    {c.tags.map((tag: string) => (
                      <span key={tag} style={{ fontSize: '0.8rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginRight: '4px' }}>{tag}</span>
                    ))}
                  </td>
                  <td><span className={`badge ${c.optedIn ? 'success' : 'pending'}`}>{c.optedIn ? 'Yes' : 'No'}</span></td>
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

export default Contacts;
