import { Scale } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '12px',
          color: 'var(--accent-secondary, #a855f7)'
        }}>
          <Scale size={32} />
        </div>
        <div>
          <h1 className="title" style={{ marginBottom: '4px' }}>Terms of Service</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Last updated: March 24, 2026</p>
        </div>
      </div>

      <div className="glass-panel policy-content" style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>1. Description of Service</h2>
          <p>Souvenir-IT is a WhatsApp Business Platform that provides businesses with tools for WhatsApp analytics and tracking, marketing message broadcasts, automation messaging workflows, appointment booking management, and team inbox management — all powered by the official Meta WhatsApp Cloud API.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>2. Eligibility</h2>
          <p>To use Souvenir-IT you must:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li>Be at least 18 years of age.</li>
            <li>Have the legal capacity to enter into a binding contract.</li>
            <li>Operate a legitimate business entity and hold a valid WhatsApp Business Account.</li>
            <li>Comply with Meta's WhatsApp Business Terms of Service and all applicable laws in your jurisdiction.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>3. Account Registration</h2>
          <p>You must provide accurate and complete registration information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately at <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a> if you suspect unauthorised access.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>4. Acceptable Use</h2>
          <p>You agree to use Souvenir-IT only for lawful purposes. You must not:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li>Send spam, unsolicited messages, or messages that violate WhatsApp Business Policy or any applicable anti-spam law (including India's TRAI regulations).</li>
            <li>Transmit messages containing illegal content, hate speech, harassment, threats, or material that violates third-party rights.</li>
            <li>Use Souvenir-IT to engage in phishing, fraud, or any deceptive practice.</li>
            <li>Attempt to gain unauthorised access to Souvenir-IT systems, servers, or other users' accounts.</li>
            <li>Reverse engineer, disassemble, or create derivative works of the Souvenir-IT platform.</li>
            <li>Use the Service in a way that could damage, overload, or impair Souvenir-IT infrastructure.</li>
            <li>Violate any Meta Developer Policies, WhatsApp Business Terms, or third-party API terms.</li>
          </ul>
          <p style={{ marginTop: '16px' }}>Violation of acceptable use may result in immediate account suspension or termination without refund.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>5. WhatsApp Cloud API and Meta Policies</h2>
          <p>Souvenir-IT operates as a Meta Business Solution Provider using the official WhatsApp Cloud API. By using Souvenir-IT, you also agree to be bound by Meta's Terms of Service, WhatsApp Business Terms, and Meta's usage policies. We reserve the right to suspend your access if Meta restricts or revokes your WhatsApp Business Account.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>6. Subscriptions and Billing</h2>
          <p>Souvenir-IT offers Free, Growth, and Enterprise subscription plans. Paid subscriptions are billed on a monthly or annual basis. All fees are non-refundable except as required by applicable law. We reserve the right to modify pricing with 30 days' prior notice. Failure to pay may result in service suspension. WhatsApp conversation charges from Meta are separate from Souvenir-IT subscription fees and are your direct responsibility.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>7. Data and Privacy</h2>
          <p>Your use of Souvenir-IT is also governed by our Privacy Policy, which is incorporated into these Terms by reference. You retain ownership of your business data and customer contact data. You grant Souvenir-IT a limited licence to process your data solely to provide the Service to you.</p>
          <p style={{ marginTop: '12px' }}>You are responsible for obtaining all necessary consents from your customers before sending them messages through Souvenir-IT. You must comply with all applicable privacy laws including GDPR, India's DPDP Act 2023, and any other jurisdiction-specific regulations.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>8. Intellectual Property</h2>
          <p>Souvenir-IT and its technology, design, trademarks, and content are owned by us and are protected by intellectual property laws. You may not copy, reproduce, modify, or distribute any part of the Souvenir-IT platform without our prior written consent. Any feedback you provide may be used by us to improve the Service without obligation to you.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>9. Booking and Appointment Features</h2>
          <p>The appointment booking feature facilitates scheduling between you and your customers. Souvenir-IT is not a party to any appointment agreement and is not liable for missed appointments, no-shows, disputes between you and your customers, or service delivery failures. You are responsible for managing your availability and honouring booked appointments.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>10. Disclaimers</h2>
          <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>11. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, Souvenir-IT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR DATA, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF Souvenir-IT HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 3 MONTHS PRECEDING THE CLAIM.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>12. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless Souvenir-IT and its officers, directors, employees, and agents from any claims, damages, costs, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or violation of any third-party rights.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>13. Termination</h2>
          <p>You may cancel your account at any time from your dashboard settings. We may suspend or terminate your account immediately if you violate these Terms, if required by Meta or WhatsApp, or if required by law. Upon termination, your right to use the Service ends immediately. You can request export or deletion of your data by contacting <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a>.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>14. Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana, India.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>15. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by posting a notice in your dashboard or via email. Continued use of Souvenir-IT after any change constitutes your acceptance of the updated Terms.</p>
        </section>

        <section>
          <h2 style={{ color: 'var(--accent)', marginBottom: '16px' }}>16. Contact</h2>
          <p>For any questions regarding these Terms, contact us at:</p>
          <ul style={{ marginLeft: '20px', marginTop: '12px' }}>
            <li><strong>Email:</strong> <a href="mailto:charansaikondilla@gmail.com" style={{ color: 'var(--accent)' }}>charansaikondilla@gmail.com</a></li>
            <li><strong>Platform:</strong> Souvenir-IT — WhatsApp Business Platform</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
