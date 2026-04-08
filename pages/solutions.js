import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useRef } from 'react'

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

const NAV_SVG_PATHS = (
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

const MAX_FILE_BYTES = 5 * 1024 * 1024

export default function Solutions() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const [problem, setProblem] = useState('')
  const [currentTools, setCurrentTools] = useState('')
  const [email, setEmail] = useState('')
  const [nameOrg, setNameOrg] = useState('')
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const fileRef = useRef(null)

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Free Tools', href: '/free-tools' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Contact', href: '/contact' },
  ]

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) { setFile(null); return }
    if (f.size > MAX_FILE_BYTES) {
      setFileError('File exceeds 5 MB limit.')
      setFile(null)
      e.target.value = ''
      return
    }
    setFileError('')
    setFile(f)
  }

  function resetForm() {
    setProblem('')
    setCurrentTools('')
    setEmail('')
    setNameOrg('')
    setFile(null)
    setFileError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      let fileData = null
      let fileName = null
      let fileType = null

      if (file) {
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        fileName = file.name
        fileType = file.type
      }

      const res = await fetch('/api/solutions-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, currentTools, email, nameOrg, fileName, fileData, fileType }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Request failed. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Custom Solutions — JAR Intelligence</title>
        <meta name="description" content="Tell us what's slowing you down. We'll build an AI solution around it." />
      </Head>

      <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(0,0,0,0.96)', borderBottom: '0.5px solid #1a1a1a' }}>
          <div className="mob-nav-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px' }}>
            <div onClick={() => router.push('/')} style={{ cursor: 'pointer', height: '28px' }}>
              <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" style={{ height: '28px', width: 'auto', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                {NAV_SVG_PATHS}
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="mob-nav-links" style={{ display: 'flex', gap: '36px' }}>
                {navItems.map(({ label, href }) => (
                  <span
                    key={label}
                    onClick={() => router.push(href)}
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: label === 'Solutions' ? '#fff' : '#888', cursor: 'pointer' }}
                    onMouseEnter={e => { if (label !== 'Solutions') e.target.style.color = '#fff' }}
                    onMouseLeave={e => { if (label !== 'Solutions') e.target.style.color = '#888' }}
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
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', color: label === 'Solutions' ? '#fff' : '#888', padding: '16px 20px', cursor: 'pointer', borderBottom: '0.5px solid #111', display: 'block' }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </nav>

        {/* CONTENT */}
        <div className="mob-pad" style={{ padding: '100px 40px 100px', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>// Custom Solutions</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>Let's Build Something</div>
          <div className="mob-body" style={{ fontSize: '14px', color: '#666', lineHeight: 1.8, marginBottom: '48px' }}>Tell us what's slowing you down. We'll build an AI solution around it.</div>

          {submitted ? (
            <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '40px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888', marginBottom: '16px' }}>// Received</div>
              <div className="mob-body" style={{ fontSize: '14px', color: '#bbb', lineHeight: 1.9, marginBottom: '28px' }}>
                <span style={{ color: '#fff' }}>Received.</span> Expect to hear from us within 24 hours.
              </div>
              <button
                className="mob-touch"
                onClick={() => { setSubmitted(false); resetForm() }}
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888', background: 'transparent', border: '0.5px solid #333', padding: '11px 20px', cursor: 'pointer' }}
                onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#777' }}
                onMouseLeave={e => { e.target.style.color = '#888'; e.target.style.borderColor = '#333' }}
              >
                Submit Another →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              <div>
                <label style={labelStyle}>What's the problem?</label>
                <textarea
                  className="mob-input"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '140px' }}
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  placeholder="Describe the process that wastes the most time or costs you the most money."
                />
              </div>

              <div>
                <label style={labelStyle}>What are you currently using?</label>
                <input
                  className="mob-input"
                  style={inputStyle}
                  value={currentTools}
                  onChange={e => setCurrentTools(e.target.value)}
                  placeholder="Excel, paper forms, a specific software, nothing..."
                />
              </div>

              <div>
                <label style={labelStyle}>Your email</label>
                <input
                  className="mob-input"
                  style={inputStyle}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@agency.com"
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Your name and organization</label>
                <input
                  className="mob-input"
                  style={inputStyle}
                  value={nameOrg}
                  onChange={e => setNameOrg(e.target.value)}
                  placeholder="Sgt. John Smith · Metro Police Department"
                />
              </div>

              <div>
                <label style={labelStyle}>Attach anything that helps explain it (optional)</label>
                <div
                  style={{ border: '0.5px solid #222', background: '#080808', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
                  onClick={() => fileRef.current?.click()}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', flexShrink: 0 }}>Choose file</span>
                  <span style={{ fontSize: '13px', color: file ? '#bbb' : '#333', lineHeight: 1.4, wordBreak: 'break-all' }}>
                    {file ? file.name : 'No file selected — images, PDF, Word, Excel, max 5 MB'}
                  </span>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {fileError && (
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#c44', textTransform: 'uppercase', marginTop: '8px' }}>
                    {fileError}
                  </div>
                )}
              </div>

              {error && (
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#c44', textTransform: 'uppercase' }}>
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="mob-touch"
                  disabled={submitting}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: submitting ? '#444' : '#fff', background: 'transparent', border: `0.5px solid ${submitting ? '#333' : '#666'}`, padding: '15px 36px', cursor: submitting ? 'default' : 'pointer' }}
                  onMouseEnter={e => { if (!submitting) e.target.style.borderColor = '#bbb' }}
                  onMouseLeave={e => { if (!submitting) e.target.style.borderColor = '#666' }}
                >
                  {submitting ? 'Sending...' : "Submit — We'll be in touch within 24 hours →"}
                </button>
              </div>

            </form>
          )}
        </div>

      </main>
    </>
  )
}
