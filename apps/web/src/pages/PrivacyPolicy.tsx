import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          color: 'var(--accent)'
        }}>
          <Shield size={32} />
        </div>
        <div>
          <h1 className="title" style={{ marginBottom: '4px' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Last updated: March 24, 2026</p>
        </div>
      </div>

      <div className="glass-panel policy-content" style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>1. Information We Collect</h2>
          <p>We collect the following categories of information:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li><strong>Account Information:</strong> Name, email address, phone number, and business details you provide when registering.</li>
            <li><strong>WhatsApp Business Data:</strong> WhatsApp Business Account ID, phone number, message templates, and configuration settings via Meta WhatsApp Cloud API.</li>
            <li><strong>Messaging Data:</strong> Content of messages sent and received through Souvenir-IT, message status (sent, delivered, read), and message timestamps.</li>
            <li><strong>Contact Data:</strong> Phone numbers, names, and custom attributes of your customers that you upload or sync to Souvenir-IT.</li>
            <li><strong>Booking Data:</strong> Appointment details, booking status, service type, agent assignment, and payment confirmation for bookings made through Souvenir-IT.</li>
            <li><strong>Analytics Data:</strong> Campaign performance metrics, delivery rates, read rates, reply rates, conversion events, and engagement statistics.</li>
            <li><strong>Usage Data:</strong> Log data, IP address, browser type, device information, pages visited, and actions taken within the Souvenir-IT dashboard.</li>
            <li><strong>Payment Information:</strong> Billing details processed through third-party payment processors (e.g., Razorpay, Stripe). We do not store raw card numbers.</li>
            <li><strong>Integration Data:</strong> Data received via API, webhooks, or third-party service integrations you configure (e.g., Google Calendar, Shopify).</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li>Provide, operate, and improve the Souvenir-IT platform and all its features.</li>
            <li>Send and receive WhatsApp messages on your behalf via Meta WhatsApp Cloud API.</li>
            <li>Process appointment bookings, confirmations, reminders, and cancellations.</li>
            <li>Generate analytics reports, dashboards, and performance metrics for your account.</li>
            <li>Execute automation workflows and marketing campaigns as configured by you.</li>
            <li>Process billing and subscription payments.</li>
            <li>Send you service-related communications (e.g., account alerts, billing receipts, security notices).</li>
            <li>Respond to your support requests and inquiries.</li>
            <li>Comply with applicable laws, regulations, and Meta platform policies.</li>
            <li>Detect and prevent fraud, abuse, and unauthorised access.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>3. Legal Basis for Processing (GDPR)</h2>
          <p>If you are located in the European Economic Area (EEA), we process your personal data under the following legal bases:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li><strong>Contract:</strong> Processing necessary to fulfil our agreement with you.</li>
            <li><strong>Legitimate Interests:</strong> Improving services, fraud prevention, and security.</li>
            <li><strong>Consent:</strong> Where you have explicitly given consent, such as for marketing communications.</li>
            <li><strong>Legal Obligation:</strong> Where processing is required to comply with applicable law.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>4. Sharing Your Information</h2>
          <p>We do not sell your personal data. We may share data with:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li><strong>Meta / Facebook:</strong> Your WhatsApp Business data is processed by Meta through the WhatsApp Cloud API in accordance with Meta's Business Terms and Privacy Policy.</li>
            <li><strong>Service Providers:</strong> Third-party providers that assist us in operating Souvenir-IT (cloud hosting, payment processing, analytics, email delivery) under strict data processing agreements.</li>
            <li><strong>Your Integrations:</strong> Third-party services you connect to Souvenir-IT (e.g., Google Calendar, Razorpay, Shopify). You control what data is shared.</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government authority.</li>
            <li><strong>Business Transfer:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred with prior notice.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>5. Data Retention</h2>
          <p>We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your account and associated data at any time. Message logs are retained for a maximum of 12 months unless you configure a shorter period. Booking records are retained for 24 months for legal and audit purposes.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>6. Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data.</li>
            <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
            <li><strong>Objection:</strong> Object to processing of your data in certain circumstances.</li>
            <li><strong>Withdraw Consent:</strong> Where processing is based on consent, withdraw it at any time without affecting prior processing.</li>
          </ul>
          <p style={{ marginTop: '16px' }}>To exercise any of these rights, email us at <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a>. We will respond within 30 days.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>7. Data Security</h2>
          <p>We implement industry-standard security measures including TLS encryption for data in transit, AES-256 encryption for data at rest, access control and authentication, regular security audits, and secure cloud infrastructure. While we take all reasonable precautions, no system is 100% secure and we cannot guarantee absolute security.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>8. Cookies and Tracking</h2>
          <p>Souvenir-IT uses essential cookies to authenticate sessions and maintain security. We also use analytics cookies to understand how users interact with our dashboard. You can manage cookie preferences in your browser settings.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>9. WhatsApp and Meta Platform Data</h2>
          <p>Souvenir-IT accesses WhatsApp Business data via the official Meta WhatsApp Cloud API. Use of this data is governed by Meta's Terms of Service and WhatsApp Business Terms. We only request the minimum permissions required to operate the platform. We do not share WhatsApp message content with third parties for advertising purposes.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>10. Children's Privacy</h2>
          <p>Souvenir-IT is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, contact us immediately at <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a>.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>11. International Data Transfers</h2>
          <p>Your data may be processed on servers located outside your country of residence, including in India and the United States. We ensure appropriate safeguards are in place for any cross-border data transfers in compliance with applicable data protection laws.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>12. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the Souvenir-IT dashboard or by sending an email. Continued use of Souvenir-IT after any change constitutes your acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>13. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or how we handle your data, contact us at:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li><strong>Email:</strong> <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a></li>
            <li><strong>Platform:</strong> Souvenir-IT — WhatsApp Business Platform</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
