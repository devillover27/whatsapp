import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Send, Users, FileText, Settings, Calendar, Briefcase, Shield, Trash2 } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar animate-slide-up">
      <div className="logo">
        <img src="/logo.jpeg" alt="Souvenir-IT Logo" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
        <span>Souvenir-IT</span>
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

      <div className="mt-4" style={{ borderTop: '1px solid var(--border-color)', margin: '16px 24px 0' }}></div>
      
      <ul className="nav-links mt-4">
        <li style={{ padding: '0 24px', marginBottom: '8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            Terms
          </NavLink>
        </li>
        <li>
          <NavLink to="/data-deletion" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Trash2 size={20} />
            Data Removal
          </NavLink>
        </li>
        <li className="mt-4">
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
