import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, FileSpreadsheet, Phone, Tag } from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/contacts', { headers: { 'x-workspace-id': 'default-workspace' }});
      if (Array.isArray(res.data)) {
        setContacts(res.data);
      } else {
        setContacts([]);
      }
    } catch (e) {
      console.error('Failed to fetch contacts', e);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet);

        if (json.length === 0) return alert("No data found.");

        const parsedContacts = json.map(row => {
          const keys = Object.keys(row);
          const phoneKey = keys.find(k => k.toLowerCase() === 'phone');
          const nameKey = keys.find(k => k.toLowerCase() === 'name');
          const tagsKey = keys.find(k => k.toLowerCase() === 'tags');

          return {
            phone: String(row[phoneKey || ''] || '').trim(),
            name: String(row[nameKey || ''] || '').trim(),
            tags: row[tagsKey || ''] ? String(row[tagsKey || '']).split('|').map((t: string) => t.trim()) : []
          };
        }).filter(c => c.phone && c.phone !== 'undefined');

        if (parsedContacts.length === 0) return alert("No valid contacts found.");

        await axios.post('http://localhost:3000/contacts/bulk', { contacts: parsedContacts }, { headers: { 'x-workspace-id': 'default-workspace' }});
        alert("Import successful.");
        fetchContacts();
      } catch (err: any) {
        alert("Import failed: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
        <h1 className="title" style={{ margin: 0 }}>Contacts</h1>
        <div className="flex-center gap-2">
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <FileSpreadsheet size={18} />
            Import
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
                <th>Customer Details</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Added Date</th>
              </tr>
            </thead>
             <tbody>
              {loading && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '60px' }}>
                  <div className="text-secondary">Retrieving contact list...</div>
                </td></tr>
              )}
              {!loading && (!Array.isArray(contacts) || contacts.length === 0) && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '60px' }}>
                  <div className="text-secondary">No contacts found. Click Import or Add Contact above.</div>
                </td></tr>
              )}
              {!loading && Array.isArray(contacts) && contacts.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="flex-center gap-2">
                      <div style={{ background: '#f0f9ff', color: 'var(--accent)', padding: '8px', borderRadius: '50%' }}>
                        <Phone size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name || 'Unnamed Contact'}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex-center gap-2" style={{ flexWrap: 'wrap' }}>
                      {Array.isArray(c.tags) && c.tags.length > 0 ? c.tags.map((tag: string) => (
                        <span key={tag} className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.65rem' }}>
                          <Tag size={10} style={{ marginRight: '4px' }} />
                          {tag}
                        </span>
                      )) : <span className="text-secondary" style={{ fontSize: '0.75rem' }}>No tags</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.optedIn ? 'success' : 'pending'}`}>
                      {c.optedIn ? 'Opted In' : 'Pending'}
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

export default Contacts;
