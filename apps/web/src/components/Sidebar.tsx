import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Send, Users, FileText, Settings, Calendar, Briefcase } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar animate-fade-in">
      <div className="logo">
        <Send className="logo-icon" size={28} />
        BulkApp
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
      </ul>
      
      <ul className="nav-links" style={{ flex: 0 }}>
        <li>
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
