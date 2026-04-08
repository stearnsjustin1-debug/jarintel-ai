import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

const inputStyle = {
  background: '#080808',
  border: '0.5px solid #222',
  color: '#bbb',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '15px',
  lineHeight: 1.7,
  padding: '12px 14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '13px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: '8px',
  display: 'block',
}

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

const CAPABILITIES = [
  {
    title: 'Forensic Video Analysis',
    body: 'What would take investigators 60 days of manual review, done in under a week. Search any footage by describing what you\'re looking for in plain language.',
  },
  {
    title: 'Real-Time Monitoring',
    body: 'Live AI analysis of all camera feeds simultaneously. Detect aggressive behavior, unauthorized access, or items being passed between individuals the moment it happens.',
  },
  {
    title: 'Natural Language Search',
    body: 'Query your entire camera system like a conversation. Ask what happened during a specific time or location and get exactly what you need.',
  },
  {
    title: 'Universal Compatibility',
    body: 'No new hardware required. Works with your existing camera infrastructure, access control, badging systems, and intrusion detection.',
  },
]

export default function VideoIntelligence() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const [fullName, setFullName] = useState('')
  const [agency, setAgency] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [useCase, setUseCase] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Free Tools', href: '/free-tools' },
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/video-intel-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, agency, email, role, useCase }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setSubmitError(data.error || 'Failed to submit. Please try again.')
      }
    } catch {
      setSubmitError('Request failed. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Video Intelligence — JAR Intelligence</title>
        <meta name="description" content="Real-time AI analysis of surveillance footage with natural language search. Powered by AIS." />
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
              <div className="mob-nav-links" style={{ display: 'flex', gap: '36px' }}>
                {navItems.map(({ label, href }) => (
                  <span key={label} onClick={() => router.push(href)}
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', cursor: 'pointer' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = '#888'}
                  >{label}</span>
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
                <span key={label}
                  onClick={() => { setMenuOpen(false); router.push(href) }}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', padding: '16px 20px', cursor: 'pointer', borderBottom: '0.5px solid #111', display: 'block' }}
                >{label}</span>
              ))}
            </div>
          )}
        </nav>

        <div className="mob-pad" style={{ padding: '100px 40px 80px', maxWidth: '1100px', margin: '0 auto' }}>

          {/* BACK */}
          <div
            onClick={() => router.push('/free-tools')}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#444', cursor: 'pointer', marginBottom: '40px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#888'}
            onMouseLeave={e => e.currentTarget.style.color = '#444'}
          >← Free Tools</div>

          {/* PAGE HEADER */}
          <div style={{ marginBottom: '56px' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>// Video Intelligence · Powered by AIS</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Video Intelligence</div>
            <div style={{ fontSize: '14px', color: '#bbb', letterSpacing: '0.06em', lineHeight: 1.8, maxWidth: '560px' }}>
              Real-time AI analysis of surveillance footage with natural language search.
            </div>
            <div style={{ width: '100%', height: '0.5px', background: '#1a1a1a', marginTop: '40px' }} />
          </div>

          {/* TWO COLUMN */}
          <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>

            {/* LEFT — Capability Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#1a1a1a' }}>
              {CAPABILITIES.map(({ title, body }) => (
                <div key={title} style={{ background: '#000', padding: '28px 30px' }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.04em', marginBottom: '10px' }}>{title}</div>
                  <div style={{ fontSize: '14px', color: '#888', lineHeight: 1.85 }}>{body}</div>
                </div>
              ))}
            </div>

            {/* RIGHT — Request Demo Form */}
            <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '36px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888', marginBottom: '24px' }}>// Request a Demo</div>

              {submitted ? (
                <div style={{ fontSize: '14px', color: '#bbb', lineHeight: 1.9 }}>
                  <span style={{ color: '#fff' }}>Request received.</span><br /><br />
                  Your request has been received. A member of the JAR Intel team will be in touch within 24 hours to coordinate your demo.
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      className="mob-input"
                      style={inputStyle}
                      type="text"
                      value={fullName}
                      onChange={e => { setFullName(e.target.value); setSubmitError('') }}
                      placeholder="Sgt. Jane Smith"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Agency / Organization</label>
                    <input
                      className="mob-input"
                      style={inputStyle}
                      type="text"
                      value={agency}
                      onChange={e => { setAgency(e.target.value); setSubmitError('') }}
                      placeholder="Metro Police Department"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Work Email</label>
                    <input
                      className="mob-input"
                      style={inputStyle}
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setSubmitError('') }}
                      placeholder="you@agency.gov"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Role / Title</label>
                    <input
                      className="mob-input"
                      style={inputStyle}
                      type="text"
                      value={role}
                      onChange={e => { setRole(e.target.value); setSubmitError('') }}
                      placeholder="Investigations Commander"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Use Case</label>
                    <textarea
                      className="mob-input"
                      style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                      value={useCase}
                      onChange={e => { setUseCase(e.target.value); setSubmitError('') }}
                      placeholder="Describe what you're trying to solve. Example: We have 8,000 hours of footage from a child welfare investigation and need to identify incidents of concern."
                    />
                  </div>
                  {submitError && (
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', color: '#c44', textTransform: 'uppercase' }}>
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="mob-touch"
                    disabled={submitting}
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '9px',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: submitting ? '#444' : '#888',
                      background: 'transparent',
                      border: '0.5px solid #333',
                      padding: '13px 0',
                      cursor: submitting ? 'default' : 'pointer',
                      width: '100%',
                    }}
                    onMouseEnter={e => { if (!submitting) { e.target.style.color = '#fff'; e.target.style.borderColor = '#777' } }}
                    onMouseLeave={e => { e.target.style.color = submitting ? '#444' : '#888'; e.target.style.borderColor = '#333' }}
                  >{submitting ? 'Submitting...' : 'Request Demo →'}</button>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '0.5px solid #111', padding: '24px 40px', textAlign: 'center' }}>
          <span onClick={() => router.push('/terms')}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.color = '#666'}
            onMouseLeave={e => e.target.style.color = '#333'}
          >Terms of Service</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#222', margin: '0 12px' }}>·</span>
          <span onClick={() => router.push('/privacy')}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.color = '#666'}
            onMouseLeave={e => e.target.style.color = '#333'}
          >Privacy Policy</span>
        </div>

      </main>
    </>
  )
}
