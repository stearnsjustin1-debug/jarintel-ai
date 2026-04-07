import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

const VALID_CODES = ['ACCESS-BRIAN', 'ACCESS-DEMO']

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

function anonymizeText(text, names) {
  let result = text
  names.forEach((name, i) => {
    if (!name.trim()) return
    const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const label = `Employee ${String.fromCharCode(65 + i)}`
    result = result.replace(new RegExp(escaped, 'gi'), label)
  })
  return result
}

const inputStyle = {
  background: '#080808',
  border: '0.5px solid #222',
  color: '#bbb',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '11px',
  lineHeight: 1.7,
  padding: '12px 14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#444',
  marginBottom: '8px',
  display: 'block',
}

const sectionHeadStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: '#555',
  marginBottom: '20px',
}

export default function PerformanceReview() {
  const router = useRouter()

  // Gate state
  const [unlocked, setUnlocked] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)

  // Request form state
  const [reqName, setReqName] = useState('')
  const [reqAgency, setReqAgency] = useState('')
  const [reqEmail, setReqEmail] = useState('')
  const [reqRole, setReqRole] = useState('')
  const [reqSent, setReqSent] = useState(false)

  // Tool state
  const [employeeNames, setEmployeeNames] = useState('')
  const [evalPeriod, setEvalPeriod] = useState('')
  const [evalCategories, setEvalCategories] = useState('')
  const [supervisorNotes, setSupervisorNotes] = useState('')

  // Output state
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  function handleCodeSubmit(e) {
    e.preventDefault()
    if (VALID_CODES.includes(codeInput.trim().toUpperCase())) {
      setUnlocked(true)
      setCodeError(false)
    } else {
      setCodeError(true)
    }
  }

  function handleRequestAccess(e) {
    e.preventDefault()
    const subject = encodeURIComponent('JAR Intelligence — Performance Review Engine Access Request')
    const body = encodeURIComponent(
      `Name: ${reqName}\nAgency / Department: ${reqAgency}\nEmail: ${reqEmail}\nRole / Rank: ${reqRole}`
    )
    window.open(`mailto:mason@jarintel.ai?subject=${subject}&body=${body}`)
    setReqSent(true)
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setLoading(true)
    setApiError('')
    setOutput('')

    const names = employeeNames.split('\n').map(n => n.trim()).filter(Boolean)
    const anonNotes = anonymizeText(supervisorNotes, names)
    const anonCategories = anonymizeText(evalCategories, names)

    try {
      const res = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supervisorNotes: anonNotes,
          evalCategories: anonCategories,
          evalPeriod,
          nameMap: names,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setApiError(data.error)
      } else {
        setOutput(data.review)
      }
    } catch {
      setApiError('Request failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const names = employeeNames.split('\n').map(n => n.trim()).filter(Boolean)
  const canGenerate = supervisorNotes.trim() && evalPeriod.trim() && !loading

  return (
    <>
      <Head>
        <title>Performance Review Engine — JAR Intelligence</title>
        <meta name="description" content="AI-generated law enforcement performance evaluations. Anonymized before processing." />
      </Head>

      <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px', borderBottom: '0.5px solid #1a1a1a', background: 'rgba(0,0,0,0.96)' }}>
          <div onClick={() => router.push('/')} style={{ cursor: 'pointer', height: '28px' }}>
            <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" style={{ height: '28px', width: 'auto', fillRule: 'evenodd', clipRule: 'evenodd' }}>
              {NAV_LOGO_PATHS}
            </svg>
          </div>
          <div style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
            {['Home', 'Free Tools'].map((item) => (
              <span
                key={item}
                onClick={() => router.push(item === 'Home' ? '/' : '/free-tools')}
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.color = '#999'}
                onMouseLeave={e => e.target.style.color = '#555'}
              >
                {item}
              </span>
            ))}
          </div>
        </nav>

        {/* PAGE HEADER */}
        <div style={{ padding: '100px 40px 0', maxWidth: '960px', margin: '0 auto' }}>
          <button
            onClick={() => router.push('/free-tools')}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#444', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '28px', display: 'block' }}
            onMouseEnter={e => e.target.style.color = '#777'}
            onMouseLeave={e => e.target.style.color = '#444'}
          >
            ← Free Tools
          </button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#444', textTransform: 'uppercase', marginBottom: '10px' }}>// Law Enforcement · HR</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Performance Review Engine</div>
          <div style={{ fontSize: '11px', color: '#444', letterSpacing: '0.06em', lineHeight: 1.8, marginBottom: '48px', maxWidth: '560px' }}>
            AI-generated evaluations built around your agency's template. Employee names are anonymized on your device before any data is transmitted.
          </div>
          <div style={{ width: '100%', height: '0.5px', background: '#1a1a1a', marginBottom: '56px' }} />
        </div>

        {/* ACCESS GATE */}
        {!unlocked && (
          <div style={{ padding: '0 40px 80px', maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a1a1a' }}>

              {/* REQUEST ACCESS */}
              <div style={{ background: '#000', padding: '36px' }}>
                <div style={sectionHeadStyle}>// Request Access</div>
                {reqSent ? (
                  <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.9 }}>
                    <span style={{ color: '#fff' }}>Request sent.</span><br />
                    We'll review your submission and send an access code to the email provided. Typically same-day for verified agencies.
                  </div>
                ) : (
                  <form onSubmit={handleRequestAccess} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Full Name</label>
                      <input
                        style={inputStyle}
                        value={reqName}
                        onChange={e => setReqName(e.target.value)}
                        placeholder="Sgt. John Smith"
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Agency / Department</label>
                      <input
                        style={inputStyle}
                        value={reqAgency}
                        onChange={e => setReqAgency(e.target.value)}
                        placeholder="Metro Police Department"
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Work Email</label>
                      <input
                        style={inputStyle}
                        type="email"
                        value={reqEmail}
                        onChange={e => setReqEmail(e.target.value)}
                        placeholder="j.smith@metropd.gov"
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Role / Rank</label>
                      <input
                        style={inputStyle}
                        value={reqRole}
                        onChange={e => setReqRole(e.target.value)}
                        placeholder="Patrol Sergeant, Shift Supervisor"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#777', background: 'transparent', border: '0.5px solid #2a2a2a', padding: '13px 0', cursor: 'pointer', marginTop: '4px' }}
                      onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#555' }}
                      onMouseLeave={e => { e.target.style.color = '#777'; e.target.style.borderColor = '#2a2a2a' }}
                    >
                      Send Request →
                    </button>
                  </form>
                )}
              </div>

              {/* ACCESS CODE */}
              <div style={{ background: '#000', padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={sectionHeadStyle}>// Enter Access Code</div>
                <div style={{ fontSize: '11px', color: '#444', lineHeight: 1.9, marginBottom: '24px' }}>
                  Already have a code? Enter it below to unlock the tool.
                </div>
                <form onSubmit={handleCodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    style={{ ...inputStyle, letterSpacing: '0.12em', fontSize: '12px', borderColor: codeError ? '#4a1a1a' : '#222', color: codeError ? '#c44' : '#bbb' }}
                    value={codeInput}
                    onChange={e => { setCodeInput(e.target.value); setCodeError(false) }}
                    placeholder="ACCESS-XXXXX"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {codeError && (
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#c44', textTransform: 'uppercase' }}>
                      Invalid code — request access to receive one.
                    </div>
                  )}
                  <button
                    type="submit"
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#777', background: 'transparent', border: '0.5px solid #2a2a2a', padding: '13px 0', cursor: 'pointer' }}
                    onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#555' }}
                    onMouseLeave={e => { e.target.style.color = '#777'; e.target.style.borderColor = '#2a2a2a' }}
                  >
                    Unlock Tool →
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TOOL — shown after unlock */}
        {unlocked && (
          <div style={{ padding: '0 40px 100px', maxWidth: '960px', margin: '0 auto' }}>

            {/* UNLOCK BADGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2a6a2a' }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2a6a2a' }}>Access Granted</span>
            </div>

            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* ANONYMIZATION */}
              <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '28px' }}>
                <div style={{ ...sectionHeadStyle, marginBottom: '6px' }}>// Anonymization</div>
                <div style={{ fontSize: '10px', color: '#3a3a3a', lineHeight: 1.8, marginBottom: '20px' }}>
                  Enter employee names (one per line). They will be replaced with Employee A, B, C... before any data leaves your device.
                </div>
                <div>
                  <label style={labelStyle}>Employee Names</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }}
                    value={employeeNames}
                    onChange={e => setEmployeeNames(e.target.value)}
                    placeholder={'John Smith\nJane Doe\nOfficer Martinez'}
                  />
                </div>
                {names.length > 0 && (
                  <div style={{ marginTop: '14px', padding: '14px', background: '#050505', border: '0.5px solid #1a1a1a' }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2a2a2a', marginBottom: '10px' }}>Anonymization Map</div>
                    {names.map((name, i) => (
                      <div key={i} style={{ fontSize: '10px', color: '#3a3a3a', lineHeight: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                        <span style={{ color: '#555' }}>{name}</span>
                        <span style={{ color: '#2a2a2a' }}> → </span>
                        <span style={{ color: '#666' }}>Employee {String.fromCharCode(65 + i)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* EVAL DETAILS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a1a1a' }}>
                <div style={{ background: '#000', padding: '28px' }}>
                  <label style={labelStyle}>Evaluation Period</label>
                  <input
                    style={inputStyle}
                    value={evalPeriod}
                    onChange={e => setEvalPeriod(e.target.value)}
                    placeholder="Jan 1, 2024 – Dec 31, 2024"
                    required
                  />
                </div>
                <div style={{ background: '#000', padding: '28px' }}>
                  <label style={labelStyle}>Evaluation Categories</label>
                  <textarea
                    style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                    value={evalCategories}
                    onChange={e => setEvalCategories(e.target.value)}
                    placeholder={'Job Knowledge\nOfficer Safety\nReport Writing\nCommunity Relations\nProfessionalism\nTeamwork'}
                  />
                </div>
              </div>

              {/* SUPERVISOR NOTES */}
              <div>
                <label style={labelStyle}>Supervisor Notes</label>
                <div style={{ fontSize: '10px', color: '#333', lineHeight: 1.8, marginBottom: '10px' }}>
                  Paste or type your notes. Employee names listed above will be anonymized automatically.
                </div>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '200px' }}
                  value={supervisorNotes}
                  onChange={e => setSupervisorNotes(e.target.value)}
                  placeholder="Officer responded to 14 use-of-force incidents this year with no sustained complaints. Consistently submits reports within shift. Received two commendations from the public..."
                  required
                />
              </div>

              {/* GENERATE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button
                  type="submit"
                  disabled={!canGenerate}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: canGenerate ? '#fff' : '#333',
                    background: 'transparent',
                    border: `0.5px solid ${canGenerate ? '#555' : '#222'}`,
                    padding: '15px 40px',
                    cursor: canGenerate ? 'pointer' : 'default',
                  }}
                  onMouseEnter={e => { if (canGenerate) e.target.style.borderColor = '#999' }}
                  onMouseLeave={e => { if (canGenerate) e.target.style.borderColor = '#555' }}
                >
                  {loading ? 'Generating...' : 'Generate Review →'}
                </button>
                {loading && (
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', color: '#333', textTransform: 'uppercase' }}>
                    Calling Anthropic API...
                  </span>
                )}
              </div>

            </form>

            {/* ERROR */}
            {apiError && (
              <div style={{ marginTop: '32px', padding: '20px', background: '#0a0000', border: '0.5px solid #3a1a1a' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c44', marginBottom: '6px' }}>Error</div>
                <div style={{ fontSize: '11px', color: '#844', lineHeight: 1.7 }}>{apiError}</div>
              </div>
            )}

            {/* OUTPUT */}
            {output && (
              <div style={{ marginTop: '48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={sectionHeadStyle}>// Generated Review</div>
                  <button
                    onClick={() => navigator.clipboard.writeText(output)}
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#444', background: 'transparent', border: '0.5px solid #222', padding: '8px 16px', cursor: 'pointer' }}
                    onMouseEnter={e => { e.target.style.color = '#999'; e.target.style.borderColor = '#555' }}
                    onMouseLeave={e => { e.target.style.color = '#444'; e.target.style.borderColor = '#222' }}
                  >
                    Copy
                  </button>
                </div>
                <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '32px' }}>
                  {output.split('\n').map((line, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: '11px',
                        lineHeight: 1.9,
                        color: line.trim() === '' ? 'transparent' : line.match(/^[A-Z\s]{4,}:?$/) ? '#fff' : '#888',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: line.match(/^[A-Z\s]{4,}:?$/) ? 700 : 300,
                        letterSpacing: line.match(/^[A-Z\s]{4,}:?$/) ? '0.06em' : 'normal',
                        marginTop: line.match(/^[A-Z\s]{4,}:?$/) ? '24px' : 0,
                        marginBottom: line.trim() === '' ? '8px' : 0,
                        minHeight: line.trim() === '' ? '8px' : 'auto',
                      }}
                    >
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '16px', fontSize: '9px', color: '#2a2a2a', lineHeight: 1.8, fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em' }}>
                  Anonymization was applied before transmission. Review your map above to restore names in the final document.
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </>
  )
}
