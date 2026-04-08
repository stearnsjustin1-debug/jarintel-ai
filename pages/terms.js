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
    id: 'acceptance',
    title: 'Acceptance of Terms',
    body: [
      'By accessing or using any JAR Intelligence service, platform, or tool ("Service"), you ("User" or "Agency") agree to be bound by these Terms of Service ("Terms"). If you are accessing the Service on behalf of a law enforcement agency or government entity, you represent that you have the authority to bind that organization to these Terms.',
      'If you do not agree to these Terms, you must not access or use the Service. JAR Intelligence reserves the right to update these Terms at any time. Continued use of the Service following notice of any changes constitutes acceptance of the updated Terms.',
    ],
  },
  {
    id: 'use',
    title: 'Use of Service',
    body: [
      'The Service is made available exclusively to authorized law enforcement agencies, government entities, and their designated personnel. Access is granted following a review and approval process. Users are prohibited from sharing credentials or granting unauthorized access to any third party.',
      'You agree to use the Service only for lawful purposes and in accordance with all applicable federal, state, and local laws, regulations, and department policies. You must not use the Service to generate, transmit, or store any content that is unlawful, defamatory, harassing, or that violates the rights of any individual.',
      'JAR Intelligence reserves the right to suspend or terminate access to the Service at any time, with or without notice, for conduct that violates these Terms or that we determine, in our sole discretion, to be harmful to the Service, other users, or third parties.',
    ],
  },
  {
    id: 'privacy',
    title: 'Data Privacy and Anonymization',
    body: [
      'JAR Intelligence is designed with privacy as a core architectural principle. Employee names and identifying information entered into the Performance Review Engine are anonymized on the user\'s device before any data is transmitted to external AI processing services. Plaintext names are never sent to JAR Intelligence servers or any third-party AI provider.',
      'Users are solely responsible for ensuring that their use of the Service complies with their agency\'s data governance policies, applicable privacy laws (including but not limited to state employee privacy statutes), and any applicable collective bargaining agreements or civil service regulations governing performance evaluation records.',
      'By using the Service, you acknowledge that you have obtained any required authorizations to process the personnel information you submit, and that anonymization does not substitute for compliance with applicable legal obligations.',
    ],
  },
  {
    id: 'ip',
    title: 'Intellectual Property',
    body: [
      'All content, software, algorithms, designs, and materials comprising the Service are the exclusive property of JAR Intelligence or its licensors and are protected by applicable intellectual property laws. Nothing in these Terms grants you any right, title, or interest in the Service beyond a limited, non-exclusive, non-transferable right to use the Service as expressly permitted herein.',
      'You retain ownership of any data, notes, or information you input into the Service. By submitting content to the Service, you grant JAR Intelligence a limited license to process that content solely for the purpose of delivering the Service to you. JAR Intelligence will not use your agency\'s data to train AI models without your explicit written consent.',
      'The output generated by the Service (performance review drafts and related content) is provided for your use as a starting point for official documentation. Final evaluation documents remain the responsibility of the supervising officer and the agency.',
    ],
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    body: [
      'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. JAR INTELLIGENCE DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
      'AI-generated performance review drafts are intended as a drafting aid only. They do not constitute official personnel records, legal determinations, or binding evaluations. All generated content must be reviewed, edited, and approved by a qualified supervisor before inclusion in any official personnel file or administrative proceeding.',
      'JAR Intelligence does not guarantee that the Service will be uninterrupted, error-free, or free of harmful components. The Service should not be used as the sole basis for any employment action, disciplinary proceeding, promotion decision, or other personnel matter.',
    ],
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    body: [
      'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, JAR INTELLIGENCE AND ITS OFFICERS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF JAR INTELLIGENCE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
      'IN NO EVENT SHALL JAR INTELLIGENCE\'S TOTAL CUMULATIVE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID FOR THE SERVICE IN THE TWELVE MONTHS PRECEDING THE CLAIM OR (B) ONE HUNDRED DOLLARS ($100).',
      'Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities. In such jurisdictions, the above limitations apply to the fullest extent permitted by law.',
    ],
  },
  {
    id: 'law',
    title: 'Governing Law',
    body: [
      'These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions. Any dispute arising from or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the state and federal courts located in Travis County, Texas.',
      'If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect. The failure of JAR Intelligence to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.',
      'These Terms constitute the entire agreement between you and JAR Intelligence with respect to the Service and supersede all prior agreements, representations, and understandings. For questions regarding these Terms, contact legal@jarintel.ai.',
    ],
  },
]

export default function Terms() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <Head>
        <title>Terms of Service — JAR Intelligence</title>
        <meta name="description" content="Terms of Service for JAR Intelligence law enforcement AI tools." />
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
              Terms of Service
            </h1>
            <div style={{ marginTop: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#444' }}>
              Last updated: April 2025 · Effective for all JAR Intelligence services
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
                <p key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#888', lineHeight: 1.9, margin: 0, marginBottom: i < section.body.length - 1 ? '16px' : 0 }}>
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
              <span onClick={() => router.push('/privacy')} style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#444', letterSpacing: '0.12em', cursor: 'pointer', textTransform: 'uppercase' }}
                onMouseEnter={e => e.target.style.color = '#888'}
                onMouseLeave={e => e.target.style.color = '#444'}
              >Privacy Policy</span>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
