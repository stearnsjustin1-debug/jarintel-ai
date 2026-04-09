import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

// ── Shared styles ────────────────────────────────────────────────────────────

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

const sectionHeadStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '16px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#fff',
  marginBottom: '0',
}

// ── DOR structure ────────────────────────────────────────────────────────────

const DOR_SECTIONS = [
  {
    section: 'Attitude and Appearance',
    categories: [
      'Acceptance of Feedback',
      'Attitude toward Police Work',
      'Integrity/Ethics',
      'Leadership',
      'General Appearance',
    ],
  },
  {
    section: 'Relationships',
    categories: [
      'With Citizens/Community',
      'With Other Department Members',
    ],
  },
  {
    section: 'Performance',
    categories: [
      'Use of Map/GPS: Orientation/Response Time',
      'Driving Skill: Normal Conditions',
      'Driving Skill: Moderate/High Stress Conditions',
      'Routine Forms: Accuracy/Completeness',
      'Report Writing: Organization/Details/Use of Time',
      'Report Writing: Grammar/Spelling/Neatness',
      'Field Performance: Non-Stress Conditions',
      'Field Performance: Stress Conditions',
      'Investigative Skills',
      'Interview/Interrogation Skills',
      'Self-initiated Field Activity',
      'Officer Safety: General',
      'Officer Safety: Suspicious Persons/Suspects/Prisoners',
      'Control of Conflict: Voice Command',
      'Control of Conflict: Physical Skill',
      'Problem-solving Techniques/Decision-making',
      'Communications: Use of Codes/Procedures',
      'Radio: Listens and Comprehends',
      'Radio: Articulation of Transmissions',
      'Mobile Computer Terminal',
      'Time Management',
    ],
  },
  {
    section: 'Knowledge',
    categories: [
      'Department Policies and Procedures: Reflected in Field Performance',
      'Criminal Statutes: Reflected in Field Performance',
      'Criminal Procedure: Reflected in Field Performance',
    ],
  },
]

const SCORE_LABELS = {
  1: 'Unacceptable',
  2: 'Needs Improvement',
  3: 'Acceptable',
  4: 'Above Average',
  5: 'Superior',
}

const SCORE_COLORS = {
  1: '#c44',
  2: '#b87333',
  3: '#888',
  4: '#5a9',
  5: '#4a9',
}

// ── Nav logo paths ────────────────────────────────────────────────────────────

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

// ── PDF generation ────────────────────────────────────────────────────────────

async function generateDORPdf(dorData, meta) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  const footerY = pageHeight - 12

  function drawFooter() {
    doc.setFont('courier', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(160, 160, 160)
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.2)
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4)
    doc.text('Generated by JAR Intelligence · jarintel.ai · Confidential', pageWidth / 2, footerY, { align: 'center' })
  }

  function drawHeader() {
    doc.setFont('courier', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(0, 0, 0)
    doc.text('JAR Intelligence', margin, margin + 7)
    doc.setFont('courier', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('FTO Daily Observation Report — jarintel.ai', margin, margin + 14)
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.4)
    doc.line(margin, margin + 18, pageWidth - margin, margin + 18)
  }

  function checkPage(y) {
    if (y > pageHeight - 22) {
      doc.addPage()
      drawFooter()
      return margin + 12
    }
    return y
  }

  drawHeader()
  drawFooter()
  let y = margin + 28

  // Meta block
  doc.setFont('courier', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(20, 20, 20)
  const metaLines = [
    `Trainee: ${meta.traineeName || 'Trainee A'}`,
    `FTO: ${meta.ftoName || 'FTO A'}`,
    `Shift Date: ${meta.shiftDate || '—'}`,
    `Phase: ${meta.phase || '—'}`,
    `Recommendation: ${dorData.recommendContinuation ? 'Continue Training' : 'Review Required'}`,
  ]
  for (const line of metaLines) {
    y = checkPage(y)
    doc.text(line, margin, y)
    y += 5.5
  }
  y += 3

  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  y = checkPage(y)
  doc.line(margin, y, pageWidth - margin, y)
  y += 7

  // Overall summary
  doc.setFont('courier', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  y = checkPage(y)
  doc.text('OVERALL SUMMARY', margin, y)
  y += 6
  doc.setFont('courier', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(20, 20, 20)
  for (const wl of doc.splitTextToSize(dorData.overallSummary || '', contentWidth)) {
    y = checkPage(y)
    doc.text(wl, margin, y)
    y += 5
  }
  y += 5

  // Sections
  for (const { section, categories } of DOR_SECTIONS) {
    y = checkPage(y + 3)
    doc.setFont('courier', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(section.toUpperCase(), margin, y)
    y += 1.5
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.25)
    doc.line(margin, y, margin + doc.getTextWidth(section.toUpperCase()) + 1, y)
    y += 6

    for (const cat of categories) {
      const entry = dorData.categories?.[cat]
      const score = entry?.score ?? 3
      const narrative = entry?.narrative ?? 'No significant observations noted during this evaluation period.'
      const label = SCORE_LABELS[score] || ''

      y = checkPage(y)
      doc.setFont('courier', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(20, 20, 20)
      doc.text(cat, margin, y)

      const scoreText = `${score} — ${label}`
      doc.setFont('courier', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(score <= 2 ? 160 : score >= 4 ? 40 : 80, score <= 2 ? 40 : score >= 4 ? 120 : 80, 40)
      doc.text(scoreText, pageWidth - margin, y, { align: 'right' })
      y += 5

      doc.setFont('courier', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(60, 60, 60)
      for (const wl of doc.splitTextToSize(narrative, contentWidth)) {
        y = checkPage(y)
        doc.text(wl, margin, y)
        y += 4.8
      }
      y += 3.5
    }
    y += 2
  }

  const dateStr = meta.shiftDate ? meta.shiftDate.replace(/\//g, '-') : new Date().toISOString().split('T')[0]
  doc.save(`dor-${dateStr}.pdf`)
}

// ── Page component ────────────────────────────────────────────────────────────

export default function FtoDebrief() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  // Form inputs
  const [userEmail, setUserEmail] = useState('')
  const [agency, setAgency] = useState('')
  const [traineeName, setTraineeName] = useState('')
  const [ftoName, setFtoName] = useState('')
  const [shiftDate, setShiftDate] = useState('')
  const [phase, setPhase] = useState('Phase 1')
  const [notes, setNotes] = useState('')

  // Output
  const [dorData, setDorData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const canGenerate = userEmail.trim() && notes.trim() && !loading

  async function handleGenerate(e) {
    e.preventDefault()
    setLoading(true)
    setApiError('')
    setDorData(null)

    try {
      const res = await fetch('/api/generate-dor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          agency,
          traineeName: 'Trainee A',
          ftoName: 'FTO A',
          shiftDate,
          phase,
          notes: notes
            .replace(new RegExp(traineeName.trim(), 'gi'), 'Trainee A')
            .replace(new RegExp(ftoName.trim(), 'gi'), 'FTO A'),
        }),
      })
      const data = await res.json()
      if (data.error) {
        setApiError(data.error)
      } else {
        setDorData(data.dor)
      }
    } catch {
      setApiError('Request failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function updateScore(cat, val) {
    setDorData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [cat]: { ...prev.categories[cat], score: Number(val) },
      },
    }))
  }

  function updateNarrative(cat, val) {
    setDorData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [cat]: { ...prev.categories[cat], narrative: val },
      },
    }))
  }

  function updateOverallSummary(val) {
    setDorData(prev => ({ ...prev, overallSummary: val }))
  }

  async function handleDownloadPdf() {
    setDownloadingPdf(true)
    try {
      await generateDORPdf(dorData, { traineeName: 'Trainee A', ftoName: 'FTO A', shiftDate, phase })
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <>
      <Head>
        <title>FTO Debrief Assistant — JAR Intelligence</title>
        <meta name="description" content="Turn end-of-shift FTO debrief into a completed Daily Observation Report in minutes." />
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
                  <span key={item}
                    onClick={() => router.push(item === 'Home' ? '/' : '/free-tools')}
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', cursor: 'pointer' }}
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

        {/* PAGE HEADER */}
        <div className="mob-pad" style={{ padding: '100px 40px 0', maxWidth: '960px', margin: '0 auto' }}>
          <button onClick={() => router.push('/free-tools')}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '28px', display: 'block' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#888'}
          >← Free Tools</button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>// FTO Debrief Assistant</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Daily Observation Report Generator</div>
          <div style={{ fontSize: '14px', color: '#bbb', letterSpacing: '0.06em', lineHeight: 1.8, marginBottom: '48px', maxWidth: '560px' }}>
            Turn your end-of-shift debrief into a completed DOR in minutes.
          </div>
          <div style={{ width: '100%', height: '0.5px', background: '#1a1a1a', marginBottom: '56px' }} />
        </div>

        {/* TOOL */}
        <div className="mob-pad" style={{ padding: '0 40px 100px', maxWidth: '960px', margin: '0 auto' }}>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Email */}
            <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '28px' }}>
              <div style={{ ...sectionHeadStyle, marginBottom: '16px' }}>// Your Information</div>
              <label style={labelStyle}>Your Work Email</label>
              <input
                className="mob-input"
                style={inputStyle}
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                placeholder="you@agency.gov"
                required
              />
              <label style={{ ...labelStyle, marginTop: '16px' }}>Agency / Department</label>
              <input
                className="mob-input"
                style={inputStyle}
                type="text"
                value={agency}
                onChange={e => setAgency(e.target.value)}
                placeholder="Hernando County Sheriff's Office"
              />
            </div>

            {/* Shift Details */}
            <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '28px' }}>
              <div style={{ ...sectionHeadStyle, marginBottom: '6px' }}>// Shift Details</div>
              <div style={{ fontSize: '14px', color: '#bbb', lineHeight: 1.8, marginBottom: '24px' }}>
                Trainee and FTO names are replaced with "Trainee A" / "FTO A" before any data is transmitted.
              </div>

              <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={labelStyle}>Trainee Name</label>
                  <input
                    className="mob-input"
                    style={inputStyle}
                    value={traineeName}
                    onChange={e => setTraineeName(e.target.value)}
                    placeholder="Officer Johnson"
                  />
                </div>
                <div>
                  <label style={labelStyle}>FTO Name</label>
                  <input
                    className="mob-input"
                    style={inputStyle}
                    value={ftoName}
                    onChange={e => setFtoName(e.target.value)}
                    placeholder="Sgt. Williams"
                  />
                </div>
              </div>

              <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={labelStyle}>Shift Date</label>
                  <input
                    className="mob-input"
                    style={inputStyle}
                    type="date"
                    value={shiftDate}
                    onChange={e => setShiftDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phase of Training</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={phase}
                    onChange={e => setPhase(e.target.value)}
                  >
                    <option>Phase 1</option>
                    <option>Phase 2</option>
                    <option>Phase 3</option>
                    <option>Phase 4</option>
                    <option>Final Evaluation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '28px' }}>
              <div style={{ ...sectionHeadStyle, marginBottom: '16px' }}>// Shift Notes</div>
              <label style={labelStyle}>Describe how the shift went. Cover any categories where performance stood out — good or bad. Be as specific as possible.</label>
              <textarea
                className="mob-input"
                style={{ ...inputStyle, resize: 'vertical', minHeight: '200px' }}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Trainee handled the traffic stop well but struggled with report writing. Good radio communication throughout the shift. Had difficulty with the domestic disturbance call..."
                required
              />
            </div>

            {apiError && (
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#c44', textTransform: 'uppercase' }}>
                {apiError}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={!canGenerate}
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '0.22em', textTransform: 'uppercase', color: !canGenerate ? '#444' : '#fff', background: 'transparent', border: `0.5px solid ${!canGenerate ? '#333' : '#666'}`, padding: '15px 48px', cursor: !canGenerate ? 'default' : 'pointer' }}
                onMouseEnter={e => { if (canGenerate) e.target.style.borderColor = '#bbb' }}
                onMouseLeave={e => { if (canGenerate) e.target.style.borderColor = '#666' }}
              >
                {loading ? 'Generating DOR...' : 'Generate DOR →'}
              </button>
            </div>

          </form>

          {/* ── OUTPUT ── */}
          {dorData && (
            <div style={{ marginTop: '56px' }}>
              <div style={{ width: '100%', height: '0.5px', background: '#1a1a1a', marginBottom: '40px' }} />

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>// DOR Output — All fields editable before download</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, color: '#fff' }}>Daily Observation Report</div>
                  <div style={{ fontSize: '13px', color: '#555', marginTop: '6px' }}>
                    {shiftDate && <span>{shiftDate} · </span>}
                    <span>{phase}</span>
                    {' · '}
                    <span style={{ color: dorData.recommendContinuation ? '#5a9' : '#c44' }}>
                      {dorData.recommendContinuation ? 'Continue Training' : 'Review Required'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: downloadingPdf ? '#444' : '#fff', background: 'transparent', border: `0.5px solid ${downloadingPdf ? '#333' : '#666'}`, padding: '12px 24px', cursor: downloadingPdf ? 'default' : 'pointer', flexShrink: 0 }}
                  onMouseEnter={e => { if (!downloadingPdf) e.target.style.borderColor = '#bbb' }}
                  onMouseLeave={e => { if (!downloadingPdf) e.target.style.borderColor = '#666' }}
                >
                  {downloadingPdf ? 'Generating PDF...' : 'Download PDF →'}
                </button>
              </div>

              {/* Overall Summary */}
              <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '24px', marginBottom: '2px' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#888', marginBottom: '12px' }}>// Overall Summary</div>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', fontSize: '14px' }}
                  value={dorData.overallSummary || ''}
                  onChange={e => updateOverallSummary(e.target.value)}
                />
              </div>

              {/* Category sections */}
              {DOR_SECTIONS.map(({ section, categories }) => (
                <div key={section} style={{ marginTop: '32px' }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888', marginBottom: '2px', paddingTop: '8px', borderTop: '0.5px solid #1a1a1a' }}>
                    // {section}
                  </div>

                  {categories.map(cat => {
                    const entry = dorData.categories?.[cat] || { score: 3, narrative: '' }
                    const score = entry.score
                    return (
                      <div key={cat} style={{ background: '#050505', border: '0.5px solid #111', marginTop: '1px', padding: '20px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', color: '#ccc', letterSpacing: '0.04em', flex: 1 }}>{cat}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', color: SCORE_COLORS[score] || '#888', textTransform: 'uppercase' }}>
                              {SCORE_LABELS[score] || ''}
                            </span>
                            <select
                              value={score}
                              onChange={e => updateScore(cat, e.target.value)}
                              style={{ background: '#080808', border: '0.5px solid #333', color: SCORE_COLORS[score] || '#888', fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 700, padding: '4px 8px', cursor: 'pointer', outline: 'none', width: '56px' }}
                            >
                              {[1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <textarea
                          style={{ ...inputStyle, resize: 'vertical', minHeight: '60px', fontSize: '13px', background: '#000', border: '0.5px solid #1a1a1a' }}
                          value={entry.narrative || ''}
                          onChange={e => updateNarrative(cat, e.target.value)}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* Download PDF bottom */}
              <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '0.5px solid #1a1a1a' }}>
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '0.22em', textTransform: 'uppercase', color: downloadingPdf ? '#444' : '#fff', background: 'transparent', border: `0.5px solid ${downloadingPdf ? '#333' : '#666'}`, padding: '15px 48px', cursor: downloadingPdf ? 'default' : 'pointer' }}
                  onMouseEnter={e => { if (!downloadingPdf) e.target.style.borderColor = '#bbb' }}
                  onMouseLeave={e => { if (!downloadingPdf) e.target.style.borderColor = '#666' }}
                >
                  {downloadingPdf ? 'Generating PDF...' : 'Download PDF →'}
                </button>
              </div>
            </div>
          )}

          {/* PRO VERSION */}
          <div style={{ borderTop: '0.5px solid #1a1a1a', marginTop: '80px', paddingTop: '60px' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#555', textTransform: 'uppercase', marginBottom: '12px' }}>// Pro Version</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '32px' }}>Unlock the full FTO Platform</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: '#1a1a1a', marginBottom: '32px' }}>
              {[
                'Voice conversational debrief — speak naturally, AI asks follow-up questions',
                'Trainee progress dashboard — trend analysis across all DORs',
                'FTO sergeant notifications — automatic alerts for declining categories',
                'Weekly summary report — auto-generated from daily DORs',
                'Multi-trainee management — handle your full caseload in one place',
              ].map((feature, i) => (
                <div key={i} style={{ background: '#000', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ color: '#444', fontSize: '14px', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>→</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#555', lineHeight: 1.6 }}>{feature}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/contact')}
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888', background: 'transparent', border: '0.5px solid #333', padding: '13px 28px', cursor: 'pointer' }}
              onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#777' }}
              onMouseLeave={e => { e.target.style.color = '#888'; e.target.style.borderColor = '#333' }}
            >Request Pro Access →</button>
          </div>

        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '0.5px solid #111', padding: '24px 40px', textAlign: 'center' }}>
          <span
            onClick={() => router.push('/terms')}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.color = '#666'}
            onMouseLeave={e => e.target.style.color = '#333'}
          >Terms of Service</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#222', margin: '0 12px' }}>·</span>
          <span
            onClick={() => router.push('/privacy')}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.color = '#666'}
            onMouseLeave={e => e.target.style.color = '#333'}
          >Privacy Policy</span>
        </div>

      </main>
    </>
  )
}
