import { Trash2, ShieldAlert } from 'lucide-react';

const DataDeletion = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '12px',
          color: 'var(--error)'
        }}>
          <Trash2 size={32} />
        </div>
        <div>
          <h1 className="title" style={{ marginBottom: '4px' }}>Data Deletion Request</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your personal data and account deletion</p>
        </div>
      </div>

      <div className="glass-panel policy-content" style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--error)', marginBottom: '16px' }}>What Data Will Be Deleted</h2>
          <p>When you submit a data deletion request, we will permanently delete:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li>Your account profile (name, email, phone number, business details)</li>
            <li>All WhatsApp Business Account configurations linked to your Souvenir-IT account</li>
            <li>All messaging data, conversation history, and message logs</li>
            <li>All contact lists and customer data you have uploaded or synced</li>
            <li>All automation workflows, templates, and campaign configurations</li>
            <li>All appointment booking records associated with your account</li>
            <li>All analytics data, reports, and dashboard history</li>
            <li>All API keys, webhook configurations, and integration settings</li>
            <li>All billing records (payment method details are removed; legal invoices may be retained as required by law)</li>
          </ul>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <ShieldAlert size={20} style={{ color: 'var(--error)', flexShrink: 0 }} />
            <p style={{ margin: 0 }}><strong>Important:</strong> Data deletion is permanent and irreversible. Once deleted, your data cannot be recovered. Please export any data you need before submitting a deletion request.</p>
          </div>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>How to Request Data Deletion</h2>
          <p>Choose the method that works best for you:</p>

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '8px' }}>Option A: Delete via Dashboard</h3>
            <p>Log in to your Souvenir-IT account → Go to Settings → Account → Delete Account → Confirm deletion. Your account and all data will be permanently deleted within 30 days.</p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '8px' }}>Option B: Email Request</h3>
            <p>Send an email to <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a> with the subject line "Data Deletion Request". Include your registered email address and the WhatsApp number linked to your account.</p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '8px' }}>Option C: Facebook Login Deletion</h3>
            <p>If you connected Souvenir-IT via Facebook Login, go to your Facebook Settings → Apps and Websites → Souvenir-IT → Remove. Then email us at <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a> to confirm full data deletion from our servers.</p>
          </div>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Data We May Retain After Deletion</h2>
          <p>In certain limited circumstances, we may retain minimal data after your deletion request for legal compliance:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li>Legal invoices and billing records — retained as required by Indian tax law (typically 7 years).</li>
            <li>Security logs — retained for up to 90 days for fraud prevention and security purposes.</li>
            <li>Aggregated, anonymised analytics — retained indefinitely, but this contains no personally identifiable information.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Deletion Timeline</h2>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li><strong>Request received:</strong> Acknowledgement sent within 2 business days.</li>
            <li><strong>Identity verification:</strong> Completed within 5 business days if required.</li>
            <li><strong>Data deletion completed:</strong> Within 30 days of verified request.</li>
            <li><strong>Confirmation sent:</strong> Email confirmation once deletion is complete.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>Contact Us</h2>
          <p>For any questions about this data deletion process or your privacy rights, contact:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li><strong>Email:</strong> <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DataDeletion;
