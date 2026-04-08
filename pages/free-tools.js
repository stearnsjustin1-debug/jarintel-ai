import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function FreeTools() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Free Tools', href: '/free-tools' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <>
      <Head>
        <title>Free Tools — JAR Intelligence</title>
      </Head>

      <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(0,0,0,0.96)', borderBottom: '0.5px solid #1a1a1a' }}>
          <div className="mob-nav-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px' }}>
            <div onClick={() => router.push('/')} style={{ cursor: 'pointer', height: '28px' }}>
              <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" style={{ height: '28px', width: 'auto', fillRule:'evenodd', clipRule:'evenodd' }}>
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
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="mob-nav-links" style={{ display: 'flex', gap: '36px' }}>
                {navItems.map(({ label, href }) => (
                  <span
                    key={label}
                    onClick={() => router.push(href)}
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: label === 'Free Tools' ? '#fff' : '#888', cursor: 'pointer' }}
                    onMouseEnter={e => { if (label !== 'Free Tools') e.target.style.color = '#fff' }}
                    onMouseLeave={e => { if (label !== 'Free Tools') e.target.style.color = '#888' }}
                  >
                    {label}
                  </span>
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
              {navItems.map(({ label, href }) => (
                <span
                  key={label}
                  onClick={() => { setMenuOpen(false); router.push(href) }}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', color: label === 'Free Tools' ? '#fff' : '#888', padding: '16px 20px', cursor: 'pointer', borderBottom: '0.5px solid #111', display: 'block' }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </nav>

        {/* CONTENT */}
        <div className="mob-pad" style={{ padding: '100px 40px 60px' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>// Free Tools</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>AI Tools</div>
          <div className="mob-body" style={{ fontSize: '14px', color: '#bbb', letterSpacing: '0.08em', marginBottom: '40px' }}>Access requires verification — request access on each tool.</div>

          {/* GRID */}
          <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: '#1a1a1a' }}>

            {/* ACTIVE CARD */}
            <div
              onClick={() => router.push('/free-tools/performance-review')}
              style={{ background: '#000', padding: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0f0f0f'}
              onMouseLeave={e => e.currentTarget.style.background = '#000'}
            >
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', color: '#888', textTransform: 'uppercase' }}>// Law Enforcement · HR</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>Performance Review Engine</div>
              <div className="mob-body" style={{ fontSize: '11px', color: '#bbb', lineHeight: 1.7, flex: 1 }}>AI-generated performance reviews built around your agency's eval template. Anonymized before processing — no PII leaves your device unprotected.</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase', marginTop: '12px', paddingTop: '14px', borderTop: '0.5px solid #1a1a1a' }}>Request Access →</div>
            </div>

            {/* ACTIVE CARD — Crime Intelligence Briefing */}
            <div
              onClick={() => router.push('/free-tools/crime-briefing')}
              style={{ background: '#000', padding: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0f0f0f'}
              onMouseLeave={e => e.currentTarget.style.background = '#000'}
            >
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', color: '#888', textTransform: 'uppercase' }}>// Law Enforcement · Intelligence</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>Crime Intelligence Briefing</div>
              <div className="mob-body" style={{ fontSize: '11px', color: '#bbb', lineHeight: 1.7, flex: 1 }}>Upload a CAD or RMS export. AI geocodes incidents onto an interactive dark map, identifies hot spots and time patterns, and generates a command-ready intelligence briefing.</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase', marginTop: '12px', paddingTop: '14px', borderTop: '0.5px solid #1a1a1a' }}>Request Access →</div>
            </div>

            {/* ACTIVE CARD — FTO Debrief */}
            <div
              onClick={() => router.push('/free-tools/fto-debrief')}
              style={{ background: '#000', padding: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0f0f0f'}
              onMouseLeave={e => e.currentTarget.style.background = '#000'}
            >
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', color: '#888', textTransform: 'uppercase' }}>// Law Enforcement · FTO</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>FTO Debrief Assistant</div>
              <div className="mob-body" style={{ fontSize: '11px', color: '#bbb', lineHeight: 1.7, flex: 1 }}>Turn end-of-shift observations into a completed Daily Observation Report in minutes. AI scores all 27 categories and writes the narrative — FTOs spend time training, not on paperwork.</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase', marginTop: '12px', paddingTop: '14px', borderTop: '0.5px solid #1a1a1a' }}>Generate DOR →</div>
            </div>

            {/* ACTIVE CARD — Video Intelligence */}
            <div
              onClick={() => router.push('/free-tools/video-intelligence')}
              style={{ background: '#000', padding: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0f0f0f'}
              onMouseLeave={e => e.currentTarget.style.background = '#000'}
            >
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', color: '#888', textTransform: 'uppercase' }}>// Law Enforcement · Intelligence</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>Video Intelligence</div>
              <div className="mob-body" style={{ fontSize: '11px', color: '#bbb', lineHeight: 1.7, flex: 1 }}>Real-time AI analysis of surveillance footage with natural language search. Powered by AIS — reduce 60 days of manual footage review to under a week.</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase', marginTop: '12px', paddingTop: '14px', borderTop: '0.5px solid #1a1a1a' }}>Request Demo →</div>
            </div>

          </div>

          {/* SOLUTIONS CTA */}
          <div style={{ borderTop: '0.5px solid #1a1a1a', marginTop: '48px', paddingTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div className="mob-body" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#555' }}>
              Need something built for your specific workflow?
            </div>
            <span
              onClick={() => router.push('/solutions')}
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', cursor: 'pointer', whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#888'}
            >
              Let's Build Something →
            </span>
          </div>

        </div>
      </main>
    </>
  )
}
