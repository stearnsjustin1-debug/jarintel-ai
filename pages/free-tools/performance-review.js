import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// ── Shared constants ────────────────────────────────────────────────────────

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
    result = result.replace(new RegExp(escaped, 'gi'), `Employee ${String.fromCharCode(65 + i)}`)
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
  color: '#888',
  marginBottom: '8px',
  display: 'block',
}

const sectionHeadStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.28em',
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: '20px',
}

const ghostBtn = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#888',
  background: 'transparent',
  border: '0.5px solid #333',
  padding: '13px 0',
  cursor: 'pointer',
  width: '100%',
}

// ── PDF watermark ────────────────────────────────────────────────────────────

// Full JAR logo SVG as a proper XML string for canvas rendering
const WATERMARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" style="fill-rule:evenodd;clip-rule:evenodd">
  <g transform="matrix(1,0,0,1,1.5,1.48917)" style="fill:#000;stroke:#000;stroke-width:0.42px">
    <path d="M286,71L11,71L11,74L286,74L286,71"/><path d="M125,47L132,40L150,40L156,47L125,47Z"/><path d="M92,63L130,7L154,7L191,63L171,63L142,18L109,63L92,63"/><rect x="193" y="28" width="19" height="35"/><path d="M193,8L193,21L248,21C248,21 252.966,20.964 253,26C253.034,31.036 249.822,32.016 248,32C246.178,31.984 220,32 220,32L254,63L279,63L254,43C254,43 272.271,44.746 272,26C271.729,7.254 255,8 255,8L193,8Z"/><path d="M24,80L27,80L27,90L24,90L24,80"/><path d="M39,80L39,90L42,90L42,83L49,90L52,90L52,80L49,80L49,87L42,80L39,80"/><path d="M70,90L67,90L67,82L62,82L62,80L75,80L75,82L70,82L70,90"/><path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/><path d="M109,90L109,80L112,80L112,88L120,88L120,90L109,90Z"/><path d="M131,90L131,80L134,80L134,88L142,88L142,90L131,90"/><path d="M154,80L157,80L157,90L154,90L154,80"/><path d="M171,83L171,87L172,88L179,88L180,87L180,86L175,86L175,84L182,84L182,87C182,87 181.446,89.951 179,90C176.554,90.049 172,90 172,90C172,90 169.042,89.884 169,87C168.958,84.116 169,83 169,83C169,83 168.81,79.925 172,80C175.19,80.075 179,80 179,80C179,80 181.981,79.938 182,83L180,83L179,82L172,82L171,83"/><path d="M29,50L68,50C68,50 74.945,50.27 75,45L75,7L95,7L95,45C95.003,64.931 75,63 75,63L18,63L29,50L18,63"/>
  </g>
  <g transform="matrix(1,0,0,1,72.587072,1.48917)" style="fill:#000;stroke:#000;stroke-width:0.42px">
    <path d="M171,83L171,86.991L172,87.991L178,87.991L179,86.991L181,86.991C180.981,90.053 179,89.991 179,89.991C179,89.991 175.19,89.917 172,89.991C168.81,90.066 169,86.991 169,86.991L168.984,83.993C168.989,83.3 169,83 169,83C169,83 168.81,79.925 172,80C175.19,80.075 179,80 179,80C179,80 180.981,79.938 181,83L179,83L178,82L172,82L171,83Z"/>
  </g>
  <g transform="matrix(1,0,0,1,178.392261,1.48917)" style="fill:#000;stroke:#000;stroke-width:0.42px">
    <path d="M39,80L39,90L42,90L42,83L49,90L52,90L52,80L49,80L49,87L42,80L39,80"/>
  </g>
  <g transform="matrix(1,0,0,1,108.444042,1.48917)" style="fill:#000;stroke:#000;stroke-width:0.42px">
    <path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/>
  </g>
  <g transform="matrix(1,0,0,1,178.929888,1.48917)" style="fill:#000;stroke:#000;stroke-width:0.42px">
    <path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/>
  </g>
</svg>`

// Render the logo SVG onto a full-page canvas at 5% opacity, rotated -45°.
// Returns a PNG data URL that jsPDF can stamp on each page via addImage.
function createWatermarkDataUrl() {
  return new Promise((resolve) => {
    const blob = new Blob([WATERMARK_SVG], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      // 2× letter-page resolution (612×792 pt at 72dpi) for crisp output
      const cw = 1224
      const ch = 1584
      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')
      // Logo at 70% of page width; SVG viewBox is 300:100 → 3:1 ratio
      const lw = Math.round(cw * 0.70)
      const lh = Math.round(lw / 3)
      ctx.save()
      ctx.translate(cw / 2, ch / 2)
      ctx.rotate(-Math.PI / 4)
      ctx.globalAlpha = 0.05
      ctx.drawImage(img, -lw / 2, -lh / 2, lw, lh)
      ctx.restore()
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

// ── PDF generation ──────────────────────────────────────────────────────────

async function generatePDF(reviewText, evalPeriod) {
  const { jsPDF } = await import('jspdf')
  const watermarkDataUrl = await createWatermarkDataUrl()

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  const footerY = pageHeight - 12

  function drawWatermark() {
    if (watermarkDataUrl) {
      // Cover the full page; PNG transparency preserved by jsPDF
      doc.addImage(watermarkDataUrl, 'PNG', 0, 0, pageWidth, pageHeight)
    }
  }

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
    doc.text('Performance Review Engine — jarintel.ai', margin, margin + 14)
    if (evalPeriod) {
      doc.setFontSize(8)
      doc.setTextColor(140, 140, 140)
      doc.text(`Evaluation Period: ${evalPeriod}`, margin, margin + 20)
    }
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.4)
    doc.line(margin, margin + 24, pageWidth - margin, margin + 24)
  }

  drawWatermark()
  drawHeader()
  drawFooter()
  let y = margin + 33

  for (const line of reviewText.split('\n')) {
    if (y > pageHeight - 22) {
      doc.addPage(); drawWatermark(); drawFooter(); y = margin + 12
    }
    if (line.trim() === '') { y += 3.5; continue }

    // Horizontal rule: --- becomes a thin line with spacing
    if (/^-{3,}\s*$/.test(line.trim())) {
      y += 3
      if (y > pageHeight - 22) { doc.addPage(); drawWatermark(); drawFooter(); y = margin + 12 }
      doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.25)
      doc.line(margin, y, pageWidth - margin, y)
      y += 5
      continue
    }

    // Markdown headings: ##, ###, # → section header style
    const headingMatch = line.match(/^#{1,3}\s+(.+)/)
    // ALL-CAPS section header fallback (original heuristic)
    const isSectionHead = headingMatch || /^[A-Z][A-Z\s]{3,}:?\s*$/.test(line.trim())

    if (isSectionHead) {
      const headText = headingMatch
        ? headingMatch[1].replace(/\*\*/g, '').replace(/\*/g, '').trim()
        : line.trim()
      y += 5
      if (y > pageHeight - 22) { doc.addPage(); drawWatermark(); drawFooter(); y = margin + 12 }
      doc.setFont('courier', 'bold'); doc.setFontSize(10); doc.setTextColor(0, 0, 0)
      doc.text(headText, margin, y)
      y += 1.5
      doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.25)
      doc.line(margin, y, margin + doc.getTextWidth(headText) + 1, y)
      y += 5.5
    } else {
      // Strip inline markdown: **bold**, *italic*, remaining * _ markers
      const cleaned = line.trim()
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/[*_`]/g, '')
      doc.setFont('courier', 'normal'); doc.setFontSize(9); doc.setTextColor(20, 20, 20)
      for (const wl of doc.splitTextToSize(cleaned, contentWidth)) {
        if (y > pageHeight - 22) { doc.addPage(); drawWatermark(); drawFooter(); y = margin + 12 }
        doc.text(wl, margin, y); y += 5
      }
    }
  }

  doc.save(`performance-review-${new Date().toISOString().split('T')[0]}.pdf`)
}

// ── Page component ──────────────────────────────────────────────────────────

export default function PerformanceReview() {
  const router = useRouter()

  // 'initial' | 'checking' | 'pending' | 'approved'
  const [menuOpen, setMenuOpen] = useState(false)
  const [authState, setAuthState] = useState('initial')
  const authStateRef = useRef('initial')
  const [session, setSession] = useState(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  // Request form
  const [reqName, setReqName] = useState('')
  const [reqAgency, setReqAgency] = useState('')
  const [reqEmail, setReqEmail] = useState('')
  const [reqRole, setReqRole] = useState('')
  const [reqSent, setReqSent] = useState(false)
  const [reqError, setReqError] = useState('')

  // Tool inputs
  const [employeeNames, setEmployeeNames] = useState('')
  const currentYear = new Date().getFullYear()
  const [evalStartDate, setEvalStartDate] = useState(`${currentYear}-01-01`)
  const [evalEndDate, setEvalEndDate] = useState(`${currentYear}-12-31`)
  const [evalCategories, setEvalCategories] = useState('')
  const [supervisorNotes, setSupervisorNotes] = useState('')

  // Output
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  async function checkApproval(userSession) {
    if (!userSession?.user?.email) {
      setAuthState('initial')
      return
    }
    setAuthState('checking')
    setSession(userSession)
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('approved')
        .eq('email', userSession.user.email)
        .single()

      if (error) {
        // PGRST116 = no rows matched (profile not found → pending)
        // Any other error → fall back to login so the user isn't stuck
        console.error('Profile check error:', error.code, error.message)
        setAuthState(error.code === 'PGRST116' ? 'pending' : 'initial')
        return
      }

      setAuthState(profile?.approved ? 'approved' : 'pending')
    } catch (err) {
      console.error('checkApproval threw:', err)
      setAuthState('initial')
    }
  }

  // Keep ref in sync so the visibility handler always reads the latest value
  // without needing to re-register the event listener on every state change.
  useEffect(() => { authStateRef.current = authState }, [authState])

  // Timeout fallback: if checking takes more than 5 s, drop back to the login
  // form so the user is never permanently stuck on "Verifying access..."
  useEffect(() => {
    if (authState !== 'checking') return
    const t = setTimeout(() => {
      console.warn('checkApproval timed out — falling back to initial')
      setAuthState('initial')
    }, 5000)
    return () => clearTimeout(t)
  }, [authState])

  // Auth listener: restore persisted session on page load, handle sign-in/out,
  // and recover from apparent logout when the tab regains visibility.
  useEffect(() => {
    // `initialResolved` prevents double-execution between getSession() and
    // INITIAL_SESSION — whichever resolves first wins, the other is a no-op.
    let initialResolved = false

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (initialResolved) return
      initialResolved = true
      if (s) checkApproval(s)
      else setAuthState('initial')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (event === 'INITIAL_SESSION') {
          if (initialResolved) return
          initialResolved = true
          if (s) await checkApproval(s)
          else setAuthState('initial')
        } else if (event === 'SIGNED_IN') {
          initialResolved = true
          // Guard against double-call when handleSignIn already invoked checkApproval
          const cur = authStateRef.current
          if (cur !== 'approved' && cur !== 'pending' && cur !== 'checking') {
            await checkApproval(s)
          }
        } else if (event === 'TOKEN_REFRESHED') {
          if (s) setSession(s)
        } else if (event === 'SIGNED_OUT') {
          initialResolved = false
          setAuthState('initial')
          setSession(null)
        }
      }
    )

    // Browsers suspend JS timers while a tab is hidden, which can cause
    // supabase-js to fire SIGNED_OUT even though the token is still valid in
    // localStorage. On visibility restore, re-read the session and recover.
    function handleVisibility() {
      if (document.visibilityState !== 'visible') return
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        const cur = authStateRef.current
        if (s && cur !== 'approved' && cur !== 'pending' && cur !== 'checking') {
          checkApproval(s)
        } else if (s && (cur === 'approved' || cur === 'pending')) {
          // Session refreshed in background — keep token current
          setSession(s)
        } else if (!s && (cur === 'approved' || cur === 'pending')) {
          setAuthState('initial')
          setSession(null)
        }
      })
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSignIn(e) {
    e.preventDefault()
    setAuthError('')
    setSigningIn(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    })
    setSigningIn(false)
    if (error) {
      setAuthError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message
      )
      return
    }
    // Call checkApproval immediately with the returned session rather than
    // waiting for onAuthStateChange SIGNED_IN, which can be delayed.
    if (data?.session) await checkApproval(data.session)
  }

  async function handleRequestAccess(e) {
    e.preventDefault()
    setReqError('')
    const res = await fetch('/api/access-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: reqEmail, full_name: reqName, agency: reqAgency, role: reqRole }),
    })
    if (res.ok) {
      setReqSent(true)
    } else {
      const data = await res.json().catch(() => ({}))
      setReqError(data.error || 'Failed to submit. Please try again.')
    }
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setLoading(true)
    setApiError('')
    setOutput('')

    const names = employeeNames.split('\n').map(n => n.trim()).filter(Boolean)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      const res = await fetch('/api/generate-review', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          supervisorNotes: anonymizeText(supervisorNotes, names),
          evalCategories: anonymizeText(evalCategories, names),
          evalPeriod,
          nameMap: names,
        }),
      })
      const data = await res.json()
      if (data.error) setApiError(data.error)
      else setOutput(data.review)
    } catch {
      setApiError('Request failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const evalPeriod = (() => {
    if (!evalStartDate || !evalEndDate) return ''
    const fmt = iso => {
      const [y, m, d] = iso.split('-').map(Number)
      return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
    return `${fmt(evalStartDate)} \u2013 ${fmt(evalEndDate)}`
  })()

  const names = employeeNames.split('\n').map(n => n.trim()).filter(Boolean)
  const canGenerate = supervisorNotes.trim() && evalStartDate && evalEndDate && !loading

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>Performance Review Engine — JAR Intelligence</title>
        <meta name="description" content="AI-generated law enforcement performance evaluations. Anonymized before processing." />
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
                {(authState === 'approved' || authState === 'pending') && (
                  <span onClick={() => supabase.auth.signOut()}
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', cursor: 'pointer' }}
                    onMouseEnter={e => e.target.style.color = '#888'}
                    onMouseLeave={e => e.target.style.color = '#555'}
                  >Sign Out</span>
                )}
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
              {(authState === 'approved' || authState === 'pending') && (
                <span
                  onClick={() => { setMenuOpen(false); supabase.auth.signOut() }}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', padding: '16px 20px', cursor: 'pointer', display: 'block' }}
                >Sign Out</span>
              )}
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
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>// Law Enforcement · HR</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Performance Review Engine</div>
          <div style={{ fontSize: '11px', color: '#bbb', letterSpacing: '0.06em', lineHeight: 1.8, marginBottom: '48px', maxWidth: '560px' }}>
            AI-generated evaluations built around your agency's template. Employee names are anonymized on your device before any data is transmitted.
          </div>
          <div style={{ width: '100%', height: '0.5px', background: '#1a1a1a', marginBottom: '56px' }} />
        </div>

        {/* ── AUTH STATES ──────────────────────────────────────────────────── */}

        {/* Loading */}
        {authState === 'loading' && (
          <div className="mob-pad" style={{ padding: '0 40px 80px', maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#444' }}>Initializing...</div>
          </div>
        )}

        {/* Checking approval */}
        {authState === 'checking' && (
          <div style={{ padding: '0 40px 80px', maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#666' }}>Verifying access...</div>
          </div>
        )}

        {/* Login + Request Access gate */}
        {authState === 'initial' && (
          <div style={{ padding: '0 40px 80px', maxWidth: '960px', margin: '0 auto' }}>
            <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a1a1a' }}>

              {/* Sign In */}
              <div style={{ background: '#000', padding: '36px' }}>
                <div style={sectionHeadStyle}>// Sign In</div>
                <div style={{ fontSize: '11px', color: '#bbb', lineHeight: 1.9, marginBottom: '24px' }}>
                  Enter your credentials below. Login details are sent to your email when access is approved.
                </div>
                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input
                      className="mob-input"
                      style={inputStyle}
                      type="email"
                      value={authEmail}
                      onChange={e => { setAuthEmail(e.target.value); setAuthError('') }}
                      placeholder="you@agency.gov"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <input
                      className="mob-input"
                      style={inputStyle}
                      type="password"
                      value={authPassword}
                      onChange={e => { setAuthPassword(e.target.value); setAuthError('') }}
                      placeholder="••••••••••••••••"
                      required
                    />
                  </div>
                  {authError && (
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', color: '#c44', textTransform: 'uppercase' }}>
                      {authError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="mob-touch"
                    disabled={signingIn}
                    style={{ ...ghostBtn, color: signingIn ? '#444' : '#888', cursor: signingIn ? 'default' : 'pointer' }}
                    onMouseEnter={e => { if (!signingIn) { e.target.style.color = '#fff'; e.target.style.borderColor = '#777' } }}
                    onMouseLeave={e => { e.target.style.color = signingIn ? '#444' : '#888'; e.target.style.borderColor = '#333' }}
                  >{signingIn ? 'Signing in...' : 'Sign In →'}</button>
                </form>
              </div>

              {/* Request Access */}
              <div style={{ background: '#000', padding: '36px' }}>
                <div style={sectionHeadStyle}>// Request Access</div>
                {reqSent ? (
                  <div style={{ fontSize: '11px', color: '#bbb', lineHeight: 1.9 }}>
                    <span style={{ color: '#fff' }}>Request received.</span><br />
                    We'll review your submission and send login instructions to the email provided. Typically same-day for verified agencies.
                  </div>
                ) : (
                  <form onSubmit={handleRequestAccess} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={labelStyle}>Full Name</label>
                      <input style={inputStyle} value={reqName} onChange={e => setReqName(e.target.value)} placeholder="Sgt. John Smith" required />
                    </div>
                    <div>
                      <label style={labelStyle}>Agency / Department</label>
                      <input style={inputStyle} value={reqAgency} onChange={e => setReqAgency(e.target.value)} placeholder="Metro Police Department" required />
                    </div>
                    <div>
                      <label style={labelStyle}>Work Email</label>
                      <input style={inputStyle} type="email" value={reqEmail} onChange={e => setReqEmail(e.target.value)} placeholder="j.smith@metropd.gov" required />
                    </div>
                    <div>
                      <label style={labelStyle}>Role / Rank</label>
                      <input style={inputStyle} value={reqRole} onChange={e => setReqRole(e.target.value)} placeholder="Patrol Sergeant, Shift Supervisor" required />
                    </div>
                    {reqError && (
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', color: '#c44', textTransform: 'uppercase' }}>{reqError}</div>
                    )}
                    <button type="submit" className="mob-touch" style={ghostBtn}
                      onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#777' }}
                      onMouseLeave={e => { e.target.style.color = '#888'; e.target.style.borderColor = '#333' }}
                    >Send Request →</button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}


        {/* Pending approval */}
        {authState === 'pending' && (
          <div style={{ padding: '0 40px 80px', maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '40px', maxWidth: '480px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888', marginBottom: '16px' }}>// Access Pending</div>
              <div style={{ fontSize: '11px', color: '#bbb', lineHeight: 1.9 }}>
                Your request is pending approval.<br />
                Signed in as <span style={{ color: '#fff' }}>{session?.user?.email}</span>.<br /><br />
                You'll receive a notification once access is granted. Typically same-day for verified agencies.
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEW TOOL (approved) ────────────────────────────────────────── */}

        {authState === 'approved' && (
          <div className="mob-pad" style={{ padding: '0 40px 100px', maxWidth: '960px', margin: '0 auto' }}>

            {/* Access badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2a6a2a' }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2a6a2a' }}>
                Access Granted — {session?.user?.email}
              </span>
            </div>

            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Anonymization */}
              <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '28px' }}>
                <div style={{ ...sectionHeadStyle, marginBottom: '6px' }}>// Anonymization</div>
                <div style={{ fontSize: '11px', color: '#bbb', lineHeight: 1.8, marginBottom: '20px' }}>
                  Enter employee names (one per line). They will be replaced with Employee A, B, C... before any data leaves your device.
                </div>
                <label style={labelStyle}>Employee Names</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '90px' }}
                  value={employeeNames}
                  onChange={e => setEmployeeNames(e.target.value)}
                  placeholder={'John Smith\nJane Doe\nOfficer Martinez'}
                />
                {names.length > 0 && (
                  <div style={{ marginTop: '14px', padding: '14px', background: '#050505', border: '0.5px solid #1a1a1a' }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888', marginBottom: '10px' }}>Anonymization Map</div>
                    {names.map((name, i) => (
                      <div key={i} style={{ fontSize: '10px', lineHeight: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                        <span style={{ color: '#bbb' }}>{name}</span>
                        <span style={{ color: '#666' }}> → </span>
                        <span style={{ color: '#999' }}>Employee {String.fromCharCode(65 + i)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Eval details */}
              <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a1a1a' }}>
                <div style={{ background: '#000', padding: '28px' }}>
                  <label style={labelStyle}>Evaluation Period</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="date"
                      className="mob-input"
                      value={evalStartDate}
                      onChange={e => setEvalStartDate(e.target.value)}
                      style={{ ...inputStyle, colorScheme: 'dark', flex: 1 }}
                    />
                    <span style={{ color: '#444', fontSize: '11px', flexShrink: 0 }}>–</span>
                    <input
                      type="date"
                      className="mob-input"
                      value={evalEndDate}
                      onChange={e => setEvalEndDate(e.target.value)}
                      style={{ ...inputStyle, colorScheme: 'dark', flex: 1 }}
                    />
                  </div>
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

              {/* Supervisor notes */}
              <div>
                <label style={labelStyle}>Supervisor Notes</label>
                <div style={{ fontSize: '11px', color: '#bbb', lineHeight: 1.8, marginBottom: '10px' }}>
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

              {/* Generate button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button type="submit" disabled={!canGenerate}
                  style={{
                    fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: canGenerate ? '#fff' : '#444', background: 'transparent',
                    border: `0.5px solid ${canGenerate ? '#666' : '#333'}`,
                    padding: '15px 40px', cursor: canGenerate ? 'pointer' : 'default',
                  }}
                  onMouseEnter={e => { if (canGenerate) e.target.style.borderColor = '#bbb' }}
                  onMouseLeave={e => { if (canGenerate) e.target.style.borderColor = '#666' }}
                >
                  {loading ? 'Generating...' : 'Generate Review →'}
                </button>
                {loading && (
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', color: '#888', textTransform: 'uppercase' }}>
                    Processing on JAR Intel secure servers...
                  </span>
                )}
              </div>

            </form>

            {/* Error */}
            {apiError && (
              <div style={{ marginTop: '32px', padding: '20px', background: '#0a0000', border: '0.5px solid #3a1a1a' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c44', marginBottom: '6px' }}>Error</div>
                <div style={{ fontSize: '11px', color: '#c44', lineHeight: 1.7 }}>{apiError}</div>
              </div>
            )}

            {/* Output */}
            {output && (
              <div style={{ marginTop: '48px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={sectionHeadStyle}>// Generated Review</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => generatePDF(output, evalPeriod)}
                      style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', background: 'transparent', border: '0.5px solid #333', padding: '8px 16px', cursor: 'pointer' }}
                      onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#777' }}
                      onMouseLeave={e => { e.target.style.color = '#888'; e.target.style.borderColor = '#333' }}
                    >Download PDF</button>
                  </div>
                </div>
                <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '32px' }}>
                  {output.split('\n').map((line, i) => (
                    <div key={i} style={{
                      fontSize: '11px', lineHeight: 1.9, fontFamily: "'JetBrains Mono', monospace",
                      color: line.trim() === '' ? 'transparent' : line.match(/^[A-Z\s]{4,}:?$/) ? '#fff' : '#bbb',
                      fontWeight: line.match(/^[A-Z\s]{4,}:?$/) ? 700 : 300,
                      letterSpacing: line.match(/^[A-Z\s]{4,}:?$/) ? '0.06em' : 'normal',
                      marginTop: line.match(/^[A-Z\s]{4,}:?$/) ? '24px' : 0,
                      marginBottom: line.trim() === '' ? '8px' : 0,
                      minHeight: line.trim() === '' ? '8px' : 'auto',
                    }}>
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '16px', fontSize: '9px', color: '#777', lineHeight: 1.8, fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em' }}>
                  Anonymization was applied before transmission. Review your map above to restore names in the final document.
                </div>
              </div>
            )}

          </div>
        )}

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
