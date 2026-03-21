import React, { useState, useEffect } from 'react';
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

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  confirmed: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
  completed: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
  no_show: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.2)' },
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [total, setTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (filterStatus) params.status = filterStatus;

      const res = await axios.get('http://localhost:3000/appointments', { params });
      setAppointments(res.data.appointments);
      setTotal(res.data.pagination.total);

      // Compute stats
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const allAppts = res.data.appointments as AppointmentData[];
      setTodayCount(allAppts.filter(a => a.date.startsWith(todayStr)).length);
      setUpcomingCount(allAppts.filter(a => new Date(a.date) > now && a.status === 'confirmed').length);
      setConfirmedCount(allAppts.filter(a => a.status === 'confirmed').length);
    } catch (e) {
      console.error('Failed to fetch appointments', e);
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
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="title" style={{ margin: 0 }}>Appointments</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid-cards">
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <Calendar size={28} style={{ color: '#3b82f6', marginBottom: 8 }} />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{todayCount}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Today's Appointments</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <Clock size={28} style={{ color: '#22c55e', marginBottom: 8 }} />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{upcomingCount}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Upcoming</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <CheckCircle size={28} style={{ color: '#a78bfa', marginBottom: 8 }} />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{confirmedCount}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Confirmed</div>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <User size={28} style={{ color: '#f97316', marginBottom: 8 }} />
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{total}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Appointments</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Filter:</span>
        {['', 'confirmed', 'completed', 'cancelled', 'no_show'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={filterStatus === status ? 'btn' : 'btn btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {status === '' ? 'All' : status.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="glass-panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</td></tr>
              )}
              {!loading && appointments.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <AlertCircle size={32} style={{ color: 'var(--text-secondary)', marginBottom: 8 }} />
                    <div style={{ color: 'var(--text-secondary)' }}>No appointments found. Clients can book via WhatsApp!</div>
                  </td>
                </tr>
              )}
              {appointments.map(appt => {
                const sc = statusColors[appt.status] || statusColors.confirmed;
                return (
                  <tr key={appt.id}>
                    <td style={{ fontWeight: 500 }}>{appt.clientName}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{appt.clientPhone}</td>
                    <td>{appt.service?.name || '—'}</td>
                    <td>{formatDate(appt.date)}</td>
                    <td>{formatTime(appt.date)}</td>
                    <td>{appt.duration} min</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: sc.bg,
                        color: sc.color,
                        border: `1px solid ${sc.border}`,
                      }}>
                        {appt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {appt.status === 'confirmed' && (
                          <>
                            <button
                              className="btn"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#22c55e' }}
                              onClick={() => updateStatus(appt.id, 'completed')}
                              title="Mark as completed"
                            >
                              <CheckCircle size={14} /> Done
                            </button>
                            <button
                              className="btn"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#ef4444' }}
                              onClick={() => updateStatus(appt.id, 'cancelled')}
                              title="Cancel appointment"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
