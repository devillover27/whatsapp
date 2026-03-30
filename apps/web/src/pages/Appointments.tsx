import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import axios from 'axios';

interface ServiceData {
  id: string;
  name: string;
  duration: number;
}

interface AppointmentData {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  duration: number;
  status: string;
  notes: string | null;
  service: ServiceData;
  createdAt: string;
}

const statusMap: Record<string, string> = {
  confirmed: 'pending',
  completed: 'success',
  cancelled: 'error',
  no_show: 'pending',
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([
    { id: '1', clientName: 'Jessica Williams', clientPhone: '+91 91100 12345', date: new Date().toISOString(), duration: 30, status: 'confirmed', notes: null, service: { id: 's1', name: 'Haircut', duration: 30 }, createdAt: '' },
    { id: '2', clientName: 'David Smith', clientPhone: '+91 99911 88822', date: new Date(Date.now() + 86400000).toISOString(), duration: 60, status: 'confirmed', notes: null, service: { id: 's2', name: 'Facial', duration: 60 }, createdAt: '' },
    { id: '3', clientName: 'Anita Gupta', clientPhone: '+91 92233 44455', date: new Date(Date.now() - 3600000).toISOString(), duration: 30, status: 'completed', notes: null, service: { id: 's3', name: 'Spa', duration: 30 }, createdAt: '' }
  ]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [total, setTotal] = useState(145);
  const [todayCount, setTodayCount] = useState(12);
  const [upcomingCount, setUpcomingCount] = useState(8);
  const [confirmedCount, setConfirmedCount] = useState(24);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (filterStatus) params.status = filterStatus;

      const res = await axios.get('http://localhost:3000/appointments', { params });
      
      const appts = res.data?.appointments || [];
      const pagination = res.data?.pagination || { total: 0 };
      
      if (appts.length > 0) {
        setAppointments(appts);
        setTotal(pagination.total);
      } else {
        // Keep dummy data if no data returned
      }

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      if (appts.length > 0) {
        setTodayCount(appts.filter((a: any) => a.date && a.date.startsWith(todayStr)).length);
        setUpcomingCount(appts.filter((a: any) => a.date && new Date(a.date) > now && a.status === 'confirmed').length);
        setConfirmedCount(appts.filter((a: any) => a.status === 'confirmed').length);
      }
    } catch (e) {
      console.log("Using fallback dummy data for appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`http://localhost:3000/appointments/${id}`, { status });
      fetchAppointments();
    } catch (e) {
      console.error('Failed to update appointment', e);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
        <h1 className="title" style={{ margin: 0 }}>Business Appointments</h1>
      </div>

      <div className="grid-cards">
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div className="flex-center gap-2 mb-2 text-secondary" style={{ justifyContent: 'center' }}>
            <Calendar size={20} className="text-accent" />
            <h3 style={{ fontSize: '0.9rem' }}>Today's Bookings</h3>
          </div>
          <div className="stats-value" style={{ fontSize: '2rem' }}>{todayCount}</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div className="flex-center gap-2 mb-2 text-secondary" style={{ justifyContent: 'center' }}>
            <Clock size={20} style={{ color: 'var(--success)' }} />
            <h3 style={{ fontSize: '0.9rem' }}>Upcoming</h3>
          </div>
          <div className="stats-value" style={{ fontSize: '2rem' }}>{upcomingCount}</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div className="flex-center gap-2 mb-2 text-secondary" style={{ justifyContent: 'center' }}>
            <CheckCircle size={20} style={{ color: '#a78bfa' }} />
            <h3 style={{ fontSize: '0.9rem' }}>Confirmed</h3>
          </div>
          <div className="stats-value" style={{ fontSize: '2rem' }}>{confirmedCount}</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <div className="flex-center gap-2 mb-2 text-secondary" style={{ justifyContent: 'center' }}>
            <User size={20} style={{ color: '#f97316' }} />
            <h3 style={{ fontSize: '0.9rem' }}>Total Life-time</h3>
          </div>
          <div className="stats-value" style={{ fontSize: '2rem' }}>{total}</div>
        </div>
      </div>

      <div className="flex-center gap-2 mb-4 mt-6" style={{ flexWrap: 'wrap' }}>
        <Filter size={16} className="text-secondary" />
        <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Quick Filter:</span>
        {['', 'confirmed', 'completed', 'cancelled', 'no_show'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? 'btn' : 'btn btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.7rem', height: 'auto', borderRadius: '20px', textTransform: 'capitalize' }}
          >
            {status === '' ? 'All Appointments' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="glass-panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Client Details</th>
                <th>Service Type</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Record Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                  <div className="text-secondary">Retrieving calendar...</div>
                </td></tr>
              )}
              {!loading && appointments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                    <AlertCircle size={32} className="text-secondary mb-4" />
                    <div className="text-secondary">No matching appointments found.</div>
                  </td>
                </tr>
              )}
              {!loading && appointments.map(appt => (
                <tr key={appt.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{appt.clientName || 'Unnamed'}</div>
                    <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{appt.clientPhone}</div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: '#f1f5f9', color: '#444' }}>
                      {appt.service?.name || 'Standard'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{formatDate(appt.date)}</div>
                    <div className="text-secondary" style={{ fontSize: '0.75rem' }}>{formatTime(appt.date)}</div>
                  </td>
                  <td>
                    <span className={`badge ${statusMap[appt.status] || 'pending'}`} style={{ textTransform: 'capitalize' }}>
                      {appt.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="flex-center gap-2">
                      {appt.status === 'confirmed' && (
                        <>
                          <button
                            className="btn"
                            style={{ padding: '6px 10px', fontSize: '0.7rem', background: 'var(--success)', boxShadow: 'none' }}
                            onClick={() => updateStatus(appt.id, 'completed')}
                          >
                            <CheckCircle size={12} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.7rem', color: 'var(--error)', border: 'none', background: 'transparent', boxShadow: 'none' }}
                            onClick={() => updateStatus(appt.id, 'cancelled')}
                          >
                            <XCircle size={14} />
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

export default Appointments;
