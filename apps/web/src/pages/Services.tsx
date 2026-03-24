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
      setServices(res.data);
    } catch (e) {
      console.error('Failed to fetch services', e);
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

  const activeCount = services.filter(s => s.isActive).length;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="title" style={{ margin: 0 }}>Services</h1>
        <button className="btn" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
          <Plus size={18} />
          Add Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <Briefcase size={28} style={{ color: '#3b82f6', marginBottom: 8 }} />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{services.length}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Services</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <Check size={28} style={{ color: '#22c55e', marginBottom: 8 }} />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{activeCount}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <Clock size={28} style={{ color: '#a78bfa', marginBottom: 8 }} />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>
            {services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length) : 0}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Avg Duration (min)</div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>New Service</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>Service Name</label>
              <input
                type="text"
                placeholder="e.g. Dental Checkup"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>Duration (min)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                style={{
                  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>Description</label>
              <input
                type="text"
                placeholder="Optional description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)',
                  fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" onClick={createService}>
                <Check size={16} /> Create
              </button>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="glass-panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Duration</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</td></tr>
              )}
              {!loading && services.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No services yet. Click "Add Service" to create one.</td></tr>
              )}
              {services.map(svc => (
                <tr key={svc.id}>
                  <td style={{ fontWeight: 500 }}>
                    {editingId === svc.id ? (
                      <input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{
                          padding: '6px 10px', background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--accent)', borderRadius: '6px',
                          color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none',
                        }}
                      />
                    ) : svc.name}
                  </td>
                  <td>
                    {editingId === svc.id ? (
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                        style={{
                          width: '70px', padding: '6px 10px', background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--accent)', borderRadius: '6px',
                          color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none',
                        }}
                      />
                    ) : `${svc.duration} min`}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {editingId === svc.id ? (
                      <input
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{
                          padding: '6px 10px', background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--accent)', borderRadius: '6px',
                          color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none',
                        }}
                      />
                    ) : (svc.description || '—')}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: svc.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: svc.isActive ? '#22c55e' : '#ef4444',
                        border: `1px solid ${svc.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      }}
                    >
                      {svc.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {new Date(svc.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingId === svc.id ? (
                        <>
                          <button className="btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={saveEdit}>
                            <Check size={14} /> Save
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={cancelEdit}>
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => toggleActive(svc.id, svc.isActive)}
                            title={svc.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {svc.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => startEdit(svc)}
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'rgba(239,68,68,0.3)' }}
                            onClick={() => deleteService(svc.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} style={{ color: '#ef4444' }} />
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
