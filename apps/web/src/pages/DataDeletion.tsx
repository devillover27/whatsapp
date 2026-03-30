import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

const DataDeletion = () => {
  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
        <div className="flex-center gap-3">
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '12px',
            color: 'var(--error)'
          }}>
            <Trash2 size={32} />
          </div>
          <div>
            <h1 className="title" style={{ margin: 0 }}>Data Deletion Policy</h1>
            <p className="text-secondary">Commitment to your data privacy and control</p>
          </div>
        </div>
      </div>

      <div className="glass-panel policy-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
        <section className="mb-6">
          <div className="flex-center gap-2 mb-3">
            <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
            <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>Our Deletion Principles</h2>
          </div>
          <p>At Souvenir-IT, we believe you should have full control over your data. We adhere to "Data Minimization" and "Right to be Forgotten" principles as outlined in the GDPR and other global data protection regulations.</p>
        </section>

        <section className="mb-6">
          <h3 className="mb-3" style={{ fontSize: '1.1rem', fontWeight: 600 }}>1. Self-Service Deletion</h3>
          <p>You can delete specific data points at any time directly through your dashboard:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li><strong>Contacts:</strong> Individual contacts or bulk selections can be deleted from the Contacts page.</li>
            <li><strong>Campaigns:</strong> Past campaign logs can be removed, though this will also remove associated analytics.</li>
            <li><strong>Templates:</strong> Message templates can be deleted, which will also unregister them from our local database.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="mb-3" style={{ fontSize: '1.1rem', fontWeight: 600 }}>2. Full Account Closure</h3>
          <p>To permanently close your account and delete all associated data, please send a formal request from your registered email address to <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a> with the subject line "Account Deletion Request".</p>
          <p style={{ marginTop: '12px' }}>Upon receiving your request, we will:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li>Verify your identity to prevent unauthorized deletion.</li>
            <li>Deactivate your WhatsApp Cloud API integration.</li>
            <li>Permanently delete your workspace, contacts, templates, and campaign history from our production databases within 14 business days.</li>
            <li>Clear your information from our backup systems within 60 days.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="mb-3" style={{ fontSize: '1.1rem', fontWeight: 600 }}>3. What Data is Retained?</h3>
          <p>Even after account deletion, we are legally required to retain certain information:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li><strong>Financial Records:</strong> Invoices and transaction history are retained for 7 years to comply with tax laws.</li>
            <li><strong>Audit Logs:</strong> Security-related logs (e.g., login attempts) may be retained for 6 months for forensic purposes.</li>
          </ul>
        </section>

        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(34, 197, 94, 0.05)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <ShieldCheck size={24} style={{ color: 'var(--success)' }} />
          <p style={{ fontSize: '0.9rem', margin: 0, color: '#15803d' }}>
            Once the 14-day deletion window has passed, data recovery is impossible. Please export any important data before requesting deletion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataDeletion;
