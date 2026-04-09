import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Shared styles ─────────────────────────────────────────────────────────────

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

const ghostBtn = (disabled) => ({
  fontFamily: "'Space Mono', monospace",
  fontSize: '12px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: disabled ? '#444' : '#fff',
  background: 'transparent',
  border: `0.5px solid ${disabled ? '#333' : '#666'}`,
  padding: '14px 36px',
  cursor: disabled ? 'default' : 'pointer',
  width: '100%',
})

const dimBtn = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#555',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0',
}

// ── Views ─────────────────────────────────────────────────────────────────────

// SIGN IN
function SignInView({ onSwitchToRequest }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError('Invalid email or password.')
      }
      // On success, onAuthStateChange in parent will pick up the new session
    } catch {
      setError('Sign in failed. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) { setError('Enter your email above, then click Forgot Password.'); return }
    setForgotLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setForgotSent(true)
    } catch {
      setError('Request failed. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>// Sign In</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '32px' }}>Welcome back.</div>

      {forgotSent ? (
        <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '28px' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#888', marginBottom: '12px' }}>// Check your email</div>
          <div style={{ fontSize: '14px', color: '#bbb', lineHeight: 1.8 }}>New credentials sent to <span style={{ color: '#fff' }}>{email}</span>. Check your inbox and sign in with the new password.</div>
        </div>
      ) : (
        <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@agency.gov" required />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••••••" required />
          </div>

          {error && (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#c44', textTransform: 'uppercase' }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={ghostBtn(loading)}
            onMouseEnter={e => { if (!loading) e.target.style.borderColor = '#bbb' }}
            onMouseLeave={e => { if (!loading) e.target.style.borderColor = '#666' }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" style={dimBtn} disabled={forgotLoading}
              onClick={handleForgotPassword}
              onMouseEnter={e => e.target.style.color = '#888'}
              onMouseLeave={e => e.target.style.color = '#555'}
            >
              {forgotLoading ? 'Sending...' : 'Forgot password →'}
            </button>
            <button type="button" style={dimBtn}
              onClick={onSwitchToRequest}
              onMouseEnter={e => e.target.style.color = '#888'}
              onMouseLeave={e => e.target.style.color = '#555'}
            >
              Request access →
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// ACCESS REQUEST
function AccessRequestView({ onSwitchToSignIn }) {
  const [fullName, setFullName] = useState('')
  const [agency, setAgency] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, agency, role }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setSubmitted(true)
    } catch {
      setError('Request failed. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '32px' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888', marginBottom: '14px' }}>// Request Received</div>
          <div style={{ fontSize: '14px', color: '#bbb', lineHeight: 1.9, marginBottom: '24px' }}>
            <span style={{ color: '#fff' }}>We received your request.</span><br />
            You'll receive login credentials once approved — usually within 24 hours.
          </div>
          <button style={{ ...dimBtn, fontSize: '11px' }}
            onClick={onSwitchToSignIn}
            onMouseEnter={e => e.target.style.color = '#888'}
            onMouseLeave={e => e.target.style.color = '#555'}
          >Already have credentials? Sign in →</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>// Access Request</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '32px' }}>Request Access</div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Sgt. John Smith" required />
        </div>
        <div>
          <label style={labelStyle}>Agency</label>
          <input style={inputStyle} value={agency} onChange={e => setAgency(e.target.value)} placeholder="Metro Police Department" required />
        </div>
        <div>
          <label style={labelStyle}>Work Email</label>
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="j.smith@agency.gov" required />
        </div>
        <div>
          <label style={labelStyle}>Role</label>
          <input style={inputStyle} value={role} onChange={e => setRole(e.target.value)} placeholder="Patrol Supervisor" />
        </div>

        {error && (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#c44', textTransform: 'uppercase' }}>{error}</div>
        )}

        <button type="submit" disabled={loading} style={ghostBtn(loading)}
          onMouseEnter={e => { if (!loading) e.target.style.borderColor = '#bbb' }}
          onMouseLeave={e => { if (!loading) e.target.style.borderColor = '#666' }}
        >
          {loading ? 'Submitting...' : 'Submit Request →'}
        </button>

        <div style={{ textAlign: 'right' }}>
          <button type="button" style={dimBtn}
            onClick={onSwitchToSignIn}
            onMouseEnter={e => e.target.style.color = '#888'}
            onMouseLeave={e => e.target.style.color = '#555'}
          >Already have access? Sign in →</button>
        </div>
      </form>
    </div>
  )
}

// APPROVED — logged in content
function ApprovedView({ userEmail, onSignOut }) {
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '32px', marginBottom: '16px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#5a9', marginBottom: '14px' }}>// Authenticated</div>
        <div style={{ fontSize: '14px', color: '#bbb', lineHeight: 1.9, marginBottom: '6px' }}>
          You are logged in as
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '16px', color: '#fff', fontWeight: 700, marginBottom: '28px', wordBreak: 'break-all' }}>{userEmail}</div>
        <div style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, marginBottom: '28px' }}>
          This is a test page for verifying the authentication flow. No tool content is accessible here.
        </div>
        <button
          onClick={onSignOut}
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888', background: 'transparent', border: '0.5px solid #333', padding: '11px 20px', cursor: 'pointer' }}
          onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#777' }}
          onMouseLeave={e => { e.target.style.color = '#888'; e.target.style.borderColor = '#333' }}
        >Sign Out →</button>
      </div>
    </div>
  )
}

// NOT APPROVED — account pending
function PendingView({ userEmail, onSignOut }) {
  return (
    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
      <div style={{ background: '#080808', border: '0.5px solid #1a1a1a', padding: '32px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888', marginBottom: '14px' }}>// Pending Approval</div>
        <div style={{ fontSize: '14px', color: '#bbb', lineHeight: 1.9, marginBottom: '24px' }}>
          <span style={{ color: '#fff' }}>{userEmail}</span><br />
          Your account is pending approval. You'll receive credentials once approved.
        </div>
        <button
          onClick={onSignOut}
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#555', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => e.target.style.color = '#888'}
          onMouseLeave={e => e.target.style.color = '#555'}
        >Sign out →</button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TestAuth() {
  const router = useRouter()

  // 'loading' | 'unauthenticated' | 'pending' | 'approved'
  const [authState, setAuthState] = useState('loading')
  const [userEmail, setUserEmail] = useState('')
  const [view, setView] = useState('signin') // 'signin' | 'request'

  async function checkApproval(session) {
    if (!session?.user) { setAuthState('unauthenticated'); return }
    const email = session.user.email
    setUserEmail(email)
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('approved')
        .eq('email', email)
        .single()
      if (error || !profile) { setAuthState('pending'); return }
      setAuthState(profile.approved ? 'approved' : 'pending')
    } catch {
      setAuthState('pending')
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) checkApproval(session)
      else setAuthState('unauthenticated')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) checkApproval(session)
      else { setAuthState('unauthenticated'); setUserEmail('') }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <Head>
        <title>Auth Test — JAR Intelligence</title>
      </Head>

      <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>

        {/* MINIMAL NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(0,0,0,0.96)', borderBottom: '0.5px solid #1a1a1a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px' }}>
            <div onClick={() => router.push('/')} style={{ cursor: 'pointer', height: '28px' }}>
              <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" style={{ height: '28px', width: 'auto', fillRule: 'evenodd', clipRule: 'evenodd' }}>
                <g transform="matrix(1,0,0,1,1.5,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}>
                  <path d="M286,71L11,71L11,74L286,74L286,71"/><path d="M125,47L132,40L150,40L156,47L125,47Z"/><path d="M92,63L130,7L154,7L191,63L171,63L142,18L109,63L92,63"/><rect x="193" y="28" width="19" height="35"/><path d="M193,8L193,21L248,21C248,21 252.966,20.964 253,26C253.034,31.036 249.822,32.016 248,32C246.178,31.984 220,32 220,32L254,63L279,63L254,43C254,43 272.271,44.746 272,26C271.729,7.254 255,8 255,8L193,8Z"/><path d="M24,80L27,80L27,90L24,90L24,80"/><path d="M39,80L39,90L42,90L42,83L49,90L52,90L52,80L49,80L49,87L42,80L39,80"/><path d="M70,90L67,90L67,82L62,82L62,80L75,80L75,82L70,82L70,90"/><path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/><path d="M109,90L109,80L112,80L112,88L120,88L120,90L109,90Z"/><path d="M131,90L131,80L134,80L134,88L142,88L142,90L131,90"/><path d="M154,80L157,80L157,90L154,90L154,80"/><path d="M171,83L171,87L172,88L179,88L180,87L180,86L175,86L175,84L182,84L182,87C182,87 181.446,89.951 179,90C176.554,90.049 172,90 172,90C172,90 169.042,89.884 169,87C168.958,84.116 169,83 169,83C169,83 168.81,79.925 172,80C175.19,80.075 179,80 179,80C179,80 181.981,79.938 182,83L180,83L179,82L172,82L171,83"/><path d="M29,50L68,50C68,50 74.945,50.27 75,45L75,7L95,7L95,45C95.003,64.931 75,63 75,63L18,63L29,50L18,63"/>
                </g>
                <g transform="matrix(1,0,0,1,72.587072,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}><path d="M171,83L171,86.991L172,87.991L178,87.991L179,86.991L181,86.991C180.981,90.053 179,89.991 179,89.991C179,89.991 175.19,89.917 172,89.991C168.81,90.066 169,86.991 169,86.991L168.984,83.993C168.989,83.3 169,83 169,83C169,83 168.81,79.925 172,80C175.19,80.075 179,80 179,80C179,80 180.981,79.938 181,83L179,83L178,82L172,82L171,83Z"/></g>
                <g transform="matrix(1,0,0,1,178.392261,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}><path d="M39,80L39,90L42,90L42,83L49,90L52,90L52,80L49,80L49,87L42,80L39,80"/></g>
                <g transform="matrix(1,0,0,1,108.444042,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}><path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/></g>
                <g transform="matrix(1,0,0,1,178.929888,1.48917)" style={{fill:'#fff',stroke:'#fff',strokeWidth:'0.42px'}}><path d="M86,80L86,90L97,90L97,88L89,88L89,86L97,86L97,84L89,84L89,82L97,82L97,80L86,80"/></g>
              </svg>
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.25em', color: '#333', textTransform: 'uppercase' }}>// Auth Test</div>
          </div>
        </nav>

        {/* CONTENT */}
        <div style={{ padding: '100px 40px 100px', maxWidth: '560px', margin: '0 auto' }}>

          {authState === 'loading' && (
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', color: '#444', textTransform: 'uppercase' }}>Checking session...</div>
          )}

          {authState === 'unauthenticated' && (
            view === 'signin'
              ? <SignInView onSwitchToRequest={() => setView('request')} />
              : <AccessRequestView onSwitchToSignIn={() => setView('signin')} />
          )}

          {authState === 'approved' && (
            <ApprovedView userEmail={userEmail} onSignOut={handleSignOut} />
          )}

          {authState === 'pending' && (
            <PendingView userEmail={userEmail} onSignOut={handleSignOut} />
          )}

        </div>
      </main>
    </>
  )
}
