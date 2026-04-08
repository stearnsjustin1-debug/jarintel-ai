import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

const NAV_LOGO_PATHS = (
  <>
    <g transform="matrix(1,0,0,1,1.5,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
      <path d="M286,71L11,71L11,74L286,74L286,71"/><path d="M125,47L132,40L150,40L156,47L125,47Z"/><path d="M92,63L130,7L154,7L191,63L171,63L142,18L109,63L92,63"/><rect x="193" y="28" width="19" height="35"/><path d="M193,8L193,21L248,21C248,21 252.966,20.964 253,26C253.034,31.036 249.822,32.016 248,32C246.178,31.984 220,32 220,32L254,63L279,63L254,43C254,43 272.271,44.746 272,26C271.729,7.254 255,8 255,8L193,8Z"/><path d="M24,80L27,80L27,90L24,90L24,80"/><path d="M39,80L39,90L42,90L42,83L49,90L52,90L52,80L49,80L49,87L42,80L39,80"/><path d="M70,90L67,90L67,82L62,82L62,80L75,80L75,82L70,82L70,90"/><path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/><path d="M109,90L109,80L112,80L112,88L120,88L120,90L109,90Z"/><path d="M131,90L131,80L134,80L134,88L142,88L142,90L131,90"/><path d="M154,80L157,80L157,90L154,90L154,80"/><path d="M171,83L171,87L172,88L179,88L180,87L180,86L175,86L175,84L182,84L182,87C182,87 181.446,89.951 179,90C176.554,90.049 172,90 172,90C172,90 169.042,89.884 169,87C168.958,84.116 169,83 169,83C169,83 168.81,79.925 172,80C175.19,80.075 179,80 179,80C179,80 181.981,79.938 182,83L180,83L179,82L172,82L171,83"/><path d="M29,50L68,50C68,50 74.945,50.27 75,45L75,7L95,7L95,45C95.003,64.931 75,63 75,63L18,63L29,50L18,63"/>
    </g>
    <g transform="matrix(1,0,0,1,72.587072,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
      <path d="M171,83L171,86.991L172,87.991L178,87.991L179,86.991L181,86.991C180.981,90.053 179,89.991 179,89.991C179,89.991 175.19,89.917 172,89.991C168.81,90.066 169,86.991 169,86.991L168.984,83.993C168.989,83.3 169,83 169,83C169,83 168.81,79.925 172,80C175.19,80.075 179,80 179,80C179,80 180.981,79.938 181,83L179,83L178,82L172,82L171,83Z"/>
    </g>
    <g transform="matrix(1,0,0,1,178.392261,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
      <path d="M39,80L39,90L42,90L42,83L49,90L52,90L52,80L49,80L49,87L42,80L39,80"/>
    </g>
    <g transform="matrix(1,0,0,1,108.444042,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
      <path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/>
    </g>
    <g transform="matrix(1,0,0,1,178.929888,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
      <path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/>
    </g>
  </>
)

const SECTIONS = [
  {
    id: 'collect',
    title: 'Information We Collect',
    body: [
      'JAR Intelligence collects the minimum information necessary to provide and secure the Service. When you submit an access request, we collect your name, agency affiliation, job title, and email address. This information is used solely to verify eligibility and provision your account.',
      'When you use the Performance Review Engine, the supervisor notes and evaluation categories you enter are processed to generate review drafts. See the Data Anonymization section below for how employee-identifying information is handled before any data leaves your device.',
      'We collect standard server logs including IP addresses, browser type, and pages accessed for security monitoring and service reliability purposes. We do not use this data for advertising or behavioral profiling.',
    ],
  },
  {
    id: 'use',
    title: 'How We Use Information',
    body: [
      'Account information (name, agency, email) is used to manage access, communicate service updates, and respond to support requests. We do not sell, rent, or share your account information with third parties except as required by law or as described in the Third Party Services section below.',
      'Anonymized input content is transmitted to AI processing services for the sole purpose of generating performance review drafts. This content is not associated with identifiable individuals and is not retained by JAR Intelligence after your session ends.',
      'We may use aggregate, de-identified usage statistics to improve the Service. These statistics cannot be traced back to individual users or agencies.',
    ],
  },
  {
    id: 'anonymization',
    title: 'Data Anonymization',
    body: [
      'Anonymization is the most important privacy protection in the Performance Review Engine, and it happens entirely on your device before any data is transmitted.',
      'When you enter employee names into the tool, those names are replaced with coded placeholders (e.g., "Employee A", "Employee B") using client-side JavaScript running in your browser. The substitution occurs locally — the original names are never included in any network request sent to JAR Intelligence servers or any third-party AI provider.',
      'A name-to-placeholder mapping is displayed to you in the interface so you can restore names in the final document. This mapping exists only in your browser session and is not stored or transmitted. JAR Intelligence has no ability to associate AI-generated review content with specific individuals at your agency.',
      'While this architecture provides strong privacy protections, it does not substitute for your agency\'s legal obligations regarding personnel records. You remain responsible for ensuring your use of the Service complies with applicable privacy laws and agency policy.',
    ],
  },
  {
    id: 'security',
    title: 'Data Security',
    body: [
      'All data transmitted between your browser and JAR Intelligence services is encrypted in transit using TLS 1.2 or higher. Account credentials are stored using industry-standard hashing practices via our authentication provider.',
      'Access to the Service is restricted to approved users. Account provisioning requires manual review and approval by JAR Intelligence administrators. Temporary credentials are transmitted only to the verified email address associated with the request.',
      'We employ reasonable administrative, technical, and physical safeguards to protect information against unauthorized access, alteration, disclosure, or destruction. However, no security measure is perfect, and we cannot guarantee absolute security.',
    ],
  },
  {
    id: 'retention',
    title: 'Data Retention',
    body: [
      'Account information (name, agency, email) is retained for the duration of your active account. If you request account deletion, your profile information will be removed within 30 days.',
      'Anonymized content processed through the AI generation pipeline is not persistently stored by JAR Intelligence. Generated review drafts exist only in your browser session and in the downloaded PDF you produce — they are not retained on our servers.',
      'Server logs are retained for up to 90 days for security and operational purposes, after which they are deleted or aggregated into statistical summaries that cannot identify individual users.',
    ],
  },
  {
    id: 'third-party',
    title: 'Third Party Services',
    body: [
      'JAR Intelligence uses the following third-party services to operate the platform:',
      'Anthropic API — AI text generation is powered by Anthropic\'s Claude API. Anonymized (name-stripped) content is transmitted to Anthropic for processing. Anthropic\'s data handling practices are governed by their API usage policies. Anthropic does not receive employee names or other identifying information due to the client-side anonymization described above.',
      'Supabase — User authentication and account profiles are managed through Supabase, a cloud database and authentication platform. Your account information (name, agency, email, approval status) is stored in Supabase. Supabase\'s privacy practices are governed by their privacy policy.',
      'Resend — Transactional emails (access approval notifications, credential delivery) are sent through Resend. Your email address is shared with Resend solely for the purpose of delivering these messages.',
      'Each of these providers has been selected for their security posture and data handling practices. JAR Intelligence does not authorize any of these providers to use your information for their own commercial purposes.',
    ],
  },
  {
    id: 'rights',
    title: 'Your Rights',
    body: [
      'You have the right to access, correct, or request deletion of your account information at any time. To exercise these rights, contact us at privacy@jarintel.ai. We will respond to verified requests within 30 days.',
      'If you are located in a jurisdiction with applicable data protection laws (such as certain U.S. state privacy laws), you may have additional rights including the right to opt out of certain processing activities. Contact us to discuss your specific situation.',
      'You may request that your account be deactivated and your profile data deleted by contacting privacy@jarintel.ai. Note that server logs may be retained for up to 90 days as described in the Data Retention section.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    body: [
      'For questions, concerns, or requests related to this Privacy Policy or your data, contact us at:',
      'Privacy inquiries: privacy@jarintel.ai\nGeneral inquiries: justin@jarintel.ai\nWebsite: jarintel.ai',
      'JAR Intelligence is committed to working with you to resolve any privacy concerns. If you believe your privacy rights have been violated, you have the right to lodge a complaint with the appropriate regulatory authority in your jurisdiction.',
    ],
  },
]

export default function Privacy() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <Head>
        <title>Privacy Policy — JAR Intelligence</title>
        <meta name="description" content="Privacy Policy for JAR Intelligence law enforcement AI tools. Learn how we protect your data and anonymize employee information." />
      </Head>

      <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(0,0,0,0.96)', borderBottom: '0.5px solid #1a1a1a' }}>
          <div className="mob-nav-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px' }}>
            <div onClick={() => router.push('/')} style={{ cursor: 'pointer', height: '28px' }}>
              <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" style={{ height: '28px', width: 'auto', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                {NAV_LOGO_PATHS}
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="mob-nav-links" style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
                {['Home', 'Free Tools'].map(item => (
                  <span key={item} onClick={() => router.push(item === 'Home' ? '/' : '/free-tools')}
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', cursor: 'pointer' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = '#888'}
                  >{item}</span>
                ))}
              </div>
              <button
                className="mob-hamburger"
                onClick={() => setMenuOpen(o => !o)}
                style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', flexDirection: 'column', gap: '5px' }}
                aria-label="Toggle navigation"
              >
                <span style={{ display: 'block', width: '22px', height: '1.5px', background: '#888' }} />
                <span style={{ display: 'block', width: '22px', height: '1.5px', background: '#888' }} />
                <span style={{ display: 'block', width: '22px', height: '1.5px', background: '#888' }} />
              </button>
            </div>
          </div>
          {menuOpen && (
            <div style={{ borderTop: '0.5px solid #111', display: 'flex', flexDirection: 'column' }}>
              {['Home', 'Free Tools'].map(item => (
                <span key={item}
                  onClick={() => { setMenuOpen(false); router.push(item === 'Home' ? '/' : '/free-tools') }}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', padding: '16px 20px', cursor: 'pointer', borderBottom: '0.5px solid #111', display: 'block' }}
                >{item}</span>
              ))}
            </div>
          )}
        </nav>

        {/* CONTENT */}
        <div className="mob-pad" style={{ padding: '100px 40px 80px', maxWidth: '760px', margin: '0 auto' }}>

          {/* Page header */}
          <div style={{ borderBottom: '0.5px solid #1a1a1a', paddingBottom: '40px', marginBottom: '60px' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#444', marginBottom: '16px' }}>
              Legal
            </div>
            <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.04em' }}>
              Privacy Policy
            </h1>
            <div style={{ marginTop: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#444' }}>
              Last updated: April 2025 · Effective for all JAR Intelligence services
            </div>
            {/* Anonymization callout */}
            <div style={{ marginTop: '28px', background: '#080808', border: '0.5px solid #1a1a1a', borderLeft: '2px solid #333', padding: '16px 20px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: '8px' }}>
                Core Privacy Guarantee
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#bbb', lineHeight: 1.8, margin: 0 }}>
                Employee names are anonymized on your device before any data leaves your browser. No identifying information is ever transmitted to JAR Intelligence servers or any AI provider.
              </p>
            </div>
          </div>

          {/* Sections */}
          {SECTIONS.map((section, idx) => (
            <div key={section.id} style={{ marginBottom: '52px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '20px' }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#333', letterSpacing: '0.1em', minWidth: '20px' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  {section.title}
                </h2>
              </div>
              {section.body.map((para, i) => (
                <p key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#888', lineHeight: 1.9, margin: 0, marginBottom: i < section.body.length - 1 ? '16px' : 0, whiteSpace: 'pre-line' }}>
                  {para}
                </p>
              ))}
              {idx < SECTIONS.length - 1 && (
                <div style={{ marginTop: '48px', borderBottom: '0.5px solid #111' }} />
              )}
            </div>
          ))}

          {/* Footer */}
          <div style={{ marginTop: '80px', borderTop: '0.5px solid #1a1a1a', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#333', letterSpacing: '0.12em' }}>
              © {new Date().getFullYear()} JAR Intelligence · jarintel.ai
            </span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span onClick={() => router.push('/terms')} style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#444', letterSpacing: '0.12em', cursor: 'pointer', textTransform: 'uppercase' }}
                onMouseEnter={e => e.target.style.color = '#888'}
                onMouseLeave={e => e.target.style.color = '#444'}
              >Terms of Service</span>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
