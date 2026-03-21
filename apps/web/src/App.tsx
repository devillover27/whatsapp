import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import Contacts from './pages/Contacts';
import CreateContact from './pages/CreateContact';
import Templates from './pages/Templates';
import CreateTemplate from './pages/CreateTemplate';
import Appointments from './pages/Appointments';
import Services from './pages/Services';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/new" element={<CreateCampaign />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/new" element={<CreateContact />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/new" element={<CreateTemplate />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/services" element={<Services />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
