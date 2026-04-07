import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

const inputStyle = {
  background: '#080808',
  border: '0.5px solid #222',
  color: '#bbb',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '11px',
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

const thStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '8px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#666',
  textAlign: 'left',
  padding: '10px 16px',
  borderBottom: '0.5px solid #222',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '11px',
  color: '#bbb',
  padding: '12px 16px',
  borderBottom: '0.5px solid #111',
  verticalAlign: 'middle',
}

export default function Admin() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [profiles, setProfiles] = useState([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [approving, setApproving] = useState(new Set())
  const [approveErrors, setApproveErrors] = useState({})

  async function fetchProfiles(pw) {
    setLoadingProfiles(true)
    setFetchError('')
    try {
      const res = await fetch('/api/admin/profiles', {
        headers: { 'x-admin-password': pw },
      })
      if (res.status === 401) {
        setAuthError('Incorrect password.')
        setAuthed(false)
        return
      }
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setProfiles(data.profiles)
    } catch (err) {
      setFetchError(err.message || 'Failed to load profiles.')
    } finally {
      setLoadingProfiles(false)
    }
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    // Validate by attempting a real fetch — if 401 it's wrong, if 200 it's right
    const res = await fetch('/api/admin/profiles', {
      headers: { 'x-admin-password': password },
    }).catch(() => null)
    setAuthLoading(false)

    if (!res || res.status === 401) {
      setAuthError('Incorrect password.')
      return
    }
    const data = await res.json()
    setProfiles(data.profiles ?? [])
    setAuthed(true)
  }

  async function handleApprove(email) {
    setApproving(prev => new Set([...prev, email]))
    setApproveErrors(prev => { const n = { ...prev }; delete n[email]; return n })

    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setProfiles(prev => prev.map(p => p.email === email ? { ...p, approved: true } : p))
    } else {
      const data = await res.json().catch(() => ({}))
      setApproveErrors(prev => ({ ...prev, [email]: data.error || 'Failed.' }))
    }
    setApproving(prev => { const n = new Set(prev); n.delete(email); return n })
  }

  const pending = profiles.filter(p => !p.approved)
  const approved = profiles.filter(p => p.approved)

  return (
    <>
      <Head>
        <title>Admin — JAR Intelligence</title>
      </Head>

      <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" }}>

        {/* NAV */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px', borderBottom: '0.5px solid #1a1a1a', background: 'rgba(0,0,0,0.96)' }}>
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
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#444' }}>
            // Admin
          </div>
        </nav>

        {/* PAGE HEADER */}
        <div style={{ padding: '100px 40px 0', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>// Internal</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Access Management</div>
          <div style={{ fontSize: '11px', color: '#bbb', letterSpacing: '0.06em', lineHeight: 1.8, marginBottom: '48px' }}>
            Review and approve access requests for JAR Intelligence tools.
          </div>
          <div style={{ width: '100%', height: '0.5px', background: '#1a1a1a', marginBottom: '56px' }} />
        </div>

        {/* PASSWORD GATE */}
        {!authed && (
          <div style={{ padding: '0 40px 80px', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ maxWidth: '360px' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888', marginBottom: '20px' }}>// Sign In</div>
              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Admin Password</label>
                  <input
                    style={inputStyle}
                    type="password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setAuthError('') }}
                    placeholder="••••••••"
                    autoFocus
                    required
                  />
                </div>
                {authError && (
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#c44', textTransform: 'uppercase' }}>
                    {authError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={authLoading}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: authLoading ? '#444' : '#888', background: 'transparent', border: '0.5px solid #333', padding: '13px 0', cursor: authLoading ? 'default' : 'pointer' }}
                  onMouseEnter={e => { if (!authLoading) { e.target.style.color = '#fff'; e.target.style.borderColor = '#777' } }}
                  onMouseLeave={e => { e.target.style.color = authLoading ? '#444' : '#888'; e.target.style.borderColor = '#333' }}
                >
                  {authLoading ? 'Verifying...' : 'Sign In →'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {authed && (
          <div style={{ padding: '0 40px 100px', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2a6a2a' }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2a6a2a' }}>Authenticated</span>
              </div>
              <button
                onClick={() => fetchProfiles(password)}
                disabled={loadingProfiles}
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', background: 'transparent', border: '0.5px solid #333', padding: '8px 16px', cursor: 'pointer' }}
                onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#777' }}
                onMouseLeave={e => { e.target.style.color = '#888'; e.target.style.borderColor = '#333' }}
              >
                {loadingProfiles ? 'Refreshing...' : 'Refresh'}
              </button>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#444', textTransform: 'uppercase' }}>
                {pending.length} pending · {approved.length} approved · {profiles.length} total
              </span>
            </div>

            {fetchError && (
              <div style={{ marginBottom: '24px', padding: '16px', background: '#0a0000', border: '0.5px solid #3a1a1a' }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#c44', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{fetchError}</span>
              </div>
            )}

            {/* Pending section */}
            {pending.length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888', marginBottom: '16px' }}>
                  // Pending Approval ({pending.length})
                </div>
                <ProfileTable
                  rows={pending}
                  approving={approving}
                  approveErrors={approveErrors}
                  onApprove={handleApprove}
                  thStyle={thStyle}
                  tdStyle={tdStyle}
                />
              </div>
            )}

            {/* Approved section */}
            {approved.length > 0 && (
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888', marginBottom: '16px' }}>
                  // Approved ({approved.length})
                </div>
                <ProfileTable
                  rows={approved}
                  approving={approving}
                  approveErrors={approveErrors}
                  onApprove={handleApprove}
                  thStyle={thStyle}
                  tdStyle={tdStyle}
                />
              </div>
            )}

            {profiles.length === 0 && !loadingProfiles && (
              <div style={{ fontSize: '11px', color: '#444', lineHeight: 1.8 }}>No access requests yet.</div>
            )}

          </div>
        )}

      </main>
    </>
  )
}

function ProfileTable({ rows, approving, approveErrors, onApprove, thStyle, tdStyle }) {
  return (
    <div style={{ overflowX: 'auto', border: '0.5px solid #1a1a1a' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
        <thead>
          <tr style={{ background: '#080808' }}>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Agency</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Joined</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(p => (
            <tr key={p.id} style={{ background: '#000' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0a0a0a'}
              onMouseLeave={e => e.currentTarget.style.background = '#000'}
            >
              <td style={tdStyle}>{p.email}</td>
              <td style={{ ...tdStyle, color: p.full_name ? '#bbb' : '#444' }}>{p.full_name || '—'}</td>
              <td style={{ ...tdStyle, color: p.agency ? '#bbb' : '#444' }}>{p.agency || '—'}</td>
              <td style={{ ...tdStyle, color: p.role ? '#bbb' : '#444' }}>{p.role || '—'}</td>
              <td style={tdStyle}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: p.approved ? '#2a6a2a' : '#666' }}>
                  {p.approved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td style={{ ...tdStyle, color: '#666', fontSize: '10px' }}>
                {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td style={tdStyle}>
                {!p.approved && (
                  <div>
                    <button
                      onClick={() => onApprove(p.email)}
                      disabled={approving.has(p.email)}
                      style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: approving.has(p.email) ? '#444' : '#888', background: 'transparent', border: '0.5px solid #333', padding: '6px 14px', cursor: approving.has(p.email) ? 'default' : 'pointer', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { if (!approving.has(p.email)) { e.target.style.color = '#fff'; e.target.style.borderColor = '#666' } }}
                      onMouseLeave={e => { e.target.style.color = approving.has(p.email) ? '#444' : '#888'; e.target.style.borderColor = '#333' }}
                    >
                      {approving.has(p.email) ? 'Approving...' : 'Approve →'}
                    </button>
                    {approveErrors[p.email] && (
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#c44', marginTop: '4px' }}>
                        {approveErrors[p.email]}
                      </div>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
