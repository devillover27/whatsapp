import { useState, useEffect } from 'react';
import { FilePlus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('http://localhost:3000/templates');
      setTemplates(res.data);
    } catch (e) {
      console.error('Failed to fetch templates', e);
    }
  };

  const syncMeta = async () => {
    try {
      await axios.post('http://localhost:3000/templates/sync', {}, { headers: { 'x-workspace-id': 'default-workspace' }});
      fetchTemplates();
      alert("Templates successfully synced with Meta Cloud API!");
    } catch (e: any) {
      alert("Sync failed. Check if your API is running. Error: " + e.message);
    }
  };

  const deleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:3000/templates/${id}`, { headers: { 'x-workspace-id': 'default-workspace' }});
      fetchTemplates();
    } catch (e: any) {
      alert("Failed to delete template: " + e.message);
    }
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="title" style={{ margin: 0 }}>Message Templates</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={syncMeta}>
            <FilePlus size={18} />
            Sync from Meta
          </button>
          <button className="btn" onClick={() => navigate('/templates/new')}>
            <FilePlus size={18} />
            New Template
          </button>
        </div>
      </div>

      <div className="grid-cards">
        {templates.length === 0 && (
          <p>No templates found. Generate test data from Dashboard!</p>
        )}
        {templates.map(t => (
          <div key={t.id} className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{t.name}</h3>
                <span className={`badge badge-${t.metaStatus.toLowerCase()}`}>{t.metaStatus}</span>
              </div>
              <button onClick={() => deleteTemplate(t.id, t.name)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '4px' }} title="Delete Template">
                <Trash2 size={18} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Category: {t.category}<br/>
              Language: {t.language}
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
              {t.body || 'No Body Component'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
