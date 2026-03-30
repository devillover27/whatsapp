import { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, ToggleLeft, ToggleRight, Clock, Edit3, X, Check } from 'lucide-react';
import axios from 'axios';

interface ServiceData {
  id: string;
  name: string;
  duration: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

const Services = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', duration: 30, description: '' });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/services');
      if (Array.isArray(res.data)) {
        setServices(res.data);
      } else {
        setServices([]);
      }
    } catch (e) {
      console.error('Failed to fetch services', e);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const createService = async () => {
    if (!formData.name.trim()) return alert('Service name is required');
    try {
      await axios.post('http://localhost:3000/services', formData);
      setFormData({ name: '', duration: 30, description: '' });
      setShowForm(false);
      fetchServices();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to create service');
    }
  };

  const updateService = async (id: string, data: Partial<ServiceData>) => {
    try {
      await axios.patch(`http://localhost:3000/services/${id}`, data);
      setEditingId(null);
      fetchServices();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to update service');
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateService(id, { isActive: !current });
  };

  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await axios.delete(`http://localhost:3000/services/${id}`);
      fetchServices();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to delete service');
    }
  };

  const startEdit = (svc: ServiceData) => {
    setEditingId(svc.id);
    setFormData({ name: svc.name, duration: svc.duration, description: svc.description || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', duration: 30, description: '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateService(editingId, formData);
    setFormData({ name: '', duration: 30, description: '' });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const activeCount = Array.isArray(services) ? services.filter(s => s.isActive).length : 0;
  const avgDuration = (Array.isArray(services) && services.length > 0) 
    ? Math.round(services.reduce((sum, s) => sum + (s.duration || 0), 0) / services.length) 
    : 0;

  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
        <h1 className="title" style={{ margin: 0 }}>Business Services</h1>
        <button className="btn" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Service'}
        </button>
      </div>

      <div className="grid-cards">
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div className="flex-center gap-2 mb-2 text-secondary" style={{ justifyContent: 'center' }}>
            <Briefcase size={20} className="text-accent" />
            <h3 style={{ fontSize: '0.9rem' }}>Total Services</h3>
          </div>
          <div className="stats-value" style={{ fontSize: '2rem' }}>{Array.isArray(services) ? services.length : 0}</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div className="flex-center gap-2 mb-2 text-secondary" style={{ justifyContent: 'center' }}>
            <Check size={20} style={{ color: 'var(--success)' }} />
            <h3 style={{ fontSize: '0.9rem' }}>Active</h3>
          </div>
          <div className="stats-value" style={{ fontSize: '2rem' }}>{activeCount}</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div className="flex-center gap-2 mb-2 text-secondary" style={{ justifyContent: 'center' }}>
            <Clock size={20} style={{ color: '#a78bfa' }} />
            <h3 style={{ fontSize: '0.9rem' }}>Avg. Duration</h3>
          </div>
          <div className="stats-value" style={{ fontSize: '2rem' }}>{avgDuration} <span style={{ fontSize: '1rem', fontWeight: 500 }}>min</span></div>
        </div>
      </div>

      {showForm && (
        <div className="glass-panel mt-4 mb-4" style={{ border: '2px solid var(--accent-soft)' }}>
          <h3 className="mb-4">Create New Service</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Service Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Health Checkup"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ background: '#f8fafc' }}
              />
            </div>
            <div>
              <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Duration (min)</label>
              <input
                type="number"
                className="input-field"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                style={{ background: '#f8fafc' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="text-secondary mb-2" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Description</label>
              <input
                type="text"
                className="input-field"
                placeholder="Briefly describe what this service includes..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={{ background: '#f8fafc' }}
              />
            </div>
          </div>
          <div className="flex-center gap-3 mt-4" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Discard</button>
            <button className="btn" onClick={createService}>Confirm & Save</button>
          </div>
        </div>
      )}

      <div className="glass-panel mt-4">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Duration</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                  <div className="text-secondary">Retrieving services...</div>
                </td></tr>
              )}
              {!loading && (!Array.isArray(services) || services.length === 0) && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                  <div className="text-secondary">No services configured yet.</div>
                </td></tr>
              )}
              {Array.isArray(services) && services.map(svc => (
                <tr key={svc.id}>
                  <td>
                    {editingId === svc.id ? (
                      <input
                        className="input-field"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ padding: '4px 8px', height: 'auto', fontSize: '0.9rem' }}
                      />
                    ) : (
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{svc.name}</div>
                    )}
                  </td>
                  <td>
                    {editingId === svc.id ? (
                      <input
                        type="number"
                        className="input-field"
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                        style={{ padding: '4px 8px', height: 'auto', fontSize: '0.9rem', width: '80px' }}
                      />
                    ) : (
                      <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{svc.duration} min</span>
                    )}
                  </td>
                  <td>
                    {editingId === svc.id ? (
                      <input
                        className="input-field"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ padding: '4px 8px', height: 'auto', fontSize: '0.9rem' }}
                      />
                    ) : (
                      <span className="text-secondary">{svc.description || '—'}</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${svc.isActive ? 'success' : 'pending'}`}>
                      {svc.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="flex-center gap-2">
                      {editingId === svc.id ? (
                        <>
                          <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'auto' }} onClick={saveEdit}>
                            <Check size={14} /> Save
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'auto' }} onClick={cancelEdit}>
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px', height: 'auto', borderRadius: '8px' }}
                            onClick={() => toggleActive(svc.id, svc.isActive)}
                            title={svc.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {svc.isActive ? <ToggleRight size={18} className="text-accent" /> : <ToggleLeft size={18} className="text-secondary" />}
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px', height: 'auto', borderRadius: '8px' }}
                            onClick={() => startEdit(svc)}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px', height: 'auto', borderRadius: '8px', color: 'var(--error)' }}
                            onClick={() => deleteService(svc.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
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

export default Services;
