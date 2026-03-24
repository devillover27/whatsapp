import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Send, Users, FileText, Settings, Calendar, Briefcase, Shield, Trash2 } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar animate-fade-in">
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.jpeg" alt="Souvenir-IT Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
        <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Souvenir-IT</span>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/campaigns" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Send size={20} />
            Campaigns
          </NavLink>
        </li>
        <li>
          <NavLink to="/contacts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Contacts
          </NavLink>
        </li>
        <li>
          <NavLink to="/templates" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            Templates
          </NavLink>
        </li>
        <li>
          <NavLink to="/appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            Appointments
          </NavLink>
        </li>
        <li>
          <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Briefcase size={20} />
            Services
          </NavLink>
        </li>
        <li>
          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Reports
          </NavLink>
        </li>
      </ul>

      <ul className="nav-links" style={{ flex: 0, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
        <li style={{ padding: '0 16px', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Legal & Policies
        </li>
        <li>
          <NavLink to="/privacy-policy" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Shield size={20} />
            Privacy Policy
          </NavLink>
        </li>
        <li>
          <NavLink to="/terms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={20} />
            Terms of Service
          </NavLink>
        </li>
        <li>
          <NavLink to="/data-deletion" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Trash2 size={20} />
            Data Deletion
          </NavLink>
        </li>
        <li style={{ marginTop: '16px' }}>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            Settings
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
