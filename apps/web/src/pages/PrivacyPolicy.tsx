import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
        <div className="flex-center gap-3">
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '12px',
            color: 'var(--accent)'
          }}>
            <Shield size={32} />
          </div>
          <div>
            <h1 className="title" style={{ margin: 0 }}>Privacy Policy</h1>
            <p className="text-secondary">Last updated: March 30, 2026</p>
          </div>
        </div>
      </div>

      <div className="glass-panel policy-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
        <section className="mb-8">
          <div className="flex-center gap-2 mb-4">
            <Eye size={20} className="text-accent" />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>1. Introduction</h2>
          </div>
          <p>We take your privacy seriously. This policy describes how Souvenir-IT collects, uses, and protects your personal information when you use our WhatsApp bulk messaging and appointment booking platform.</p>
        </section>

        <section className="mb-8">
          <div className="flex-center gap-2 mb-4">
            <Lock size={20} className="text-accent" />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>2. Information We Collect</h2>
          </div>
          <p>We collect the following categories of information:</p>
          <ul style={{ marginLeft: '24px', marginTop: '12px' }}>
            <li><strong>Account Data:</strong> Name, email address, and business details.</li>
            <li><strong>WhatsApp Data:</strong> We access your WhatsApp Business Account via Meta Cloud API to send messages on your behalf.</li>
            <li><strong>Contact Data:</strong> Phone numbers and names of your customers that you upload for messaging.</li>
            <li><strong>Usage Data:</strong> How you interact with our dashboard (IP address, browser type, etc.).</li>
          </ul>
        </section>

        <section className="mb-8">
          <div className="flex-center gap-2 mb-4">
            <FileText size={20} className="text-accent" />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>3. Data Usage & Security</h2>
          </div>
          <p>Your data is used strictly for provide the platform's core services. We employ industry-standard encryption (AES-256 for data at rest and TLS for data in transit) to ensure your information remains secure.</p>
          <p style={{ marginTop: '12px' }}>We do not sell your personal data or your customers' contact information to third parties.</p>
        </section>

        <section className="mb-8">
          <h2 style={{ fontSize: '1.25rem' }}>4. Contact Us</h2>
          <p>If you have any questions about this policy, please contact our data protection officer at <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
