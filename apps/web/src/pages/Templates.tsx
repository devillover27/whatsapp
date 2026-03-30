import { useState, useEffect } from 'react';
import { FilePlus, Trash2, Globe, Bookmark } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/templates');
      if (Array.isArray(res.data)) {
        setTemplates(res.data);
      } else {
        setTemplates([]);
      }
    } catch (e) {
      console.error('Failed to fetch templates', e);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const syncMeta = async () => {
    try {
      await axios.post('http://localhost:3000/templates/sync', {}, { headers: { 'x-workspace-id': 'default-workspace' }});
      fetchTemplates();
      alert("Templates successfully synced!");
    } catch (e: any) {
      alert("Sync failed: " + e.message);
    }
  };

  const deleteTemplate = async (id: string, name: string) => {
    if (!window.confirm(`Delete template "${name}"?`)) return;
    try {
      await axios.delete(`http://localhost:3000/templates/${id}`, { headers: { 'x-workspace-id': 'default-workspace' }});
      fetchTemplates();
    } catch (e: any) {
      alert("Delete failed: " + e.message);
    }
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
        <h1 className="title" style={{ margin: 0 }}>Message Templates</h1>
        <div className="flex-center gap-2">
          <button className="btn btn-secondary" onClick={syncMeta}>
            <Globe size={18} />
            Sync from Meta
          </button>
          <button className="btn" onClick={() => navigate('/templates/new')}>
            <FilePlus size={18} />
            New Template
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
          <p className="text-secondary">Loading templates...</p>
        </div>
      ) : (
        <div className="grid-cards">
          {(!Array.isArray(templates) || templates.length === 0) ? (
            <div className="glass-panel" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px' }}>
               <p className="text-secondary">No templates found. Start by syncing with Meta or creating a new one.</p>
            </div>
          ) : (
            templates.map(t => (
              <div key={t.id || t.name} className="glass-panel">
                <div className="flex-between mb-4">
                  <div className="flex-center gap-2">
                    <Bookmark size={18} className="text-accent" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t.name}</h3>
                  </div>
                  <button 
                    onClick={() => deleteTemplate(t.id, t.name)} 
                    className="btn btn-secondary"
                    style={{ padding: '6px', border: 'none', background: 'transparent', color: 'var(--error)', boxShadow: 'none' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex-center gap-2 mb-4">
                  <span className={`badge ${t.metaStatus === 'APPROVED' ? 'success' : 'pending'}`}>
                    {t.metaStatus || 'PENDING'}
                  </span>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                    {t.category || 'MARKETING'}
                  </span>
                </div>

                <div style={{ 
                  background: '#f8fafc', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-md)', 
                  fontSize: '0.85rem', 
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  lineHeight: '1.6',
                  maxHeight: '150px',
                  overflow: 'hidden'
                }}>
                  {t.body || 'No message content defined.'}
                </div>
                
                <div className="mt-4 text-secondary" style={{ fontSize: '0.75rem' }}>
                  Language: {t.language || 'en_US'}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Templates;
