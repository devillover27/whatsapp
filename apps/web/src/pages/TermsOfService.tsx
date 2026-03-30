import { FileText, CheckCircle, Scale, MessageSquare } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
        <div className="flex-center gap-3">
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderRadius: '12px',
            color: 'var(--accent)'
          }}>
            <FileText size={32} />
          </div>
          <div>
            <h1 className="title" style={{ margin: 0 }}>Terms of Service</h1>
            <p className="text-secondary">Last updated: March 30, 2026</p>
          </div>
        </div>
      </div>

      <div className="glass-panel policy-content" style={{ lineHeight: '1.7', color: 'var(--text-primary)' }}>
        <section className="mb-8">
          <div className="flex-center gap-2 mb-4">
            <CheckCircle size={20} className="text-accent" />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>1. Acceptance of Terms</h2>
          </div>
          <p>By using Souvenir-IT, you agree to these Terms of Service and all related Meta Platform Policies for the WhatsApp Business Platform. If you do not agree to these terms, please do not use the service.</p>
        </section>

        <section className="mb-8">
          <div className="flex-center gap-2 mb-4">
            <MessageSquare size={20} className="text-accent" />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>2. Meta WhatsApp Business Account</h2>
          </div>
          <p>You must provide your own WhatsApp Business Account and Meta Developer credentials to use our platform's messaging capabilities. You are responsible for any charges incurred through the Meta WhatsApp Cloud API.</p>
        </section>

        <section className="mb-8">
          <div className="flex-center gap-2 mb-4">
            <Scale size={20} className="text-accent" />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>3. Prohibited Conduct</h2>
          </div>
          <p>You agree not to use Souvenir-IT for:</p>
          <ul style={{ marginLeft: '24px', marginTop: '12px' }}>
            <li>Spamming or sending unsolicited messages to contacts who have not opted-in.</li>
            <li>Sending illegal or harmful content.</li>
            <li>Interfering with the service or its security features.</li>
            <li>Any activity that violates Meta's WhatsApp Business Policy.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 style={{ fontSize: '1.25rem' }}>4. Disclaimer of Warranty</h2>
          <p>Souvenir-IT is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee that message delivery will always be successful, as this depends on external providers like Meta.</p>
        </section>

        <section className="mb-8">
           <h2 style={{ fontSize: '1.25rem' }}>5. Contact Information</h2>
           <p>For legal inquiries, please contact <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
