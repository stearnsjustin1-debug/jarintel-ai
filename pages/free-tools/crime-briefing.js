import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '../../lib/supabase'

// ── Crime type color map ─────────────────────────────────────────────────────

const CRIME_COLORS = {
  assault: '#ef4444',
  larceny: '#f97316',
  domestic: '#eab308',
  drugs: '#3b82f6',
  other: '#6b7280',
}

const CRIME_LABELS = {
  assault: 'Assault / Violence',
  larceny: 'Larceny / Theft',
  domestic: 'Domestic',
  drugs: 'Drugs / DUI',
  other: 'Other',
}

function parseHour(timeStr) {
  if (!timeStr) return null
  const m = timeStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?/i)
  if (!m) return null
  let h = parseInt(m[1])
  if (m[3]?.toLowerCase() === 'pm' && h !== 12) h += 12
  if (m[3]?.toLowerCase() === 'am' && h === 12) h = 0
  return h >= 0 && h <= 23 ? h : null
}

function computeViewport(incidents) {
  if (!incidents.length) return { longitude: -98.5795, latitude: 39.8283, zoom: 4 }
  const lats = incidents.map(i => i.lat)
  const lons = incidents.map(i => i.lon)
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLon = Math.min(...lons), maxLon = Math.max(...lons)
  const spread = Math.max(maxLat - minLat, maxLon - minLon)
  const zoom = spread > 1 ? 9 : spread > 0.5 ? 10 : spread > 0.2 ? 11 : spread > 0.1 ? 12 : spread > 0.05 ? 13 : 14
  return { longitude: (minLon + maxLon) / 2, latitude: (minLat + maxLat) / 2, zoom }
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// ── Shared styles (match performance-review) ─────────────────────────────────

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
  fontSize: '13px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#bbbbbb',
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

// ── Map component (client-only, pure mapbox-gl, no react-map-gl) ─────────────

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildGeoJSON(incidents) {
  return {
    type: 'FeatureCollection',
    features: incidents.map(inc => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [inc.lon, inc.lat] },
    })),
  }
}

const CrimeMap = dynamic(
  async () => {
    const { default: mapboxgl } = await import('mapbox-gl')

    return function CrimeMapImpl({ incidents, viewState, onViewStateChange }) {
      const containerRef = useRef(null)
      const mapRef = useRef(null)
      const markersRef = useRef([])
      const [showHeatmap, setShowHeatmap] = useState(false)
      const [minHour, setMinHour] = useState(0)
      const [maxHour, setMaxHour] = useState(24)

      const fmtHour = h => {
        if (h === 0 || h === 24) return '12 AM'
        if (h === 12) return '12 PM'
        return h < 12 ? `${h} AM` : `${h - 12} PM`
      }

      // Initialize map once on mount
      useEffect(() => {
        if (!containerRef.current || mapRef.current) return
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

        const map = new mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [viewState.longitude, viewState.latitude],
          zoom: viewState.zoom,
        })
        mapRef.current = map

        map.on('move', () => {
          const c = map.getCenter()
          onViewStateChange({ longitude: c.lng, latitude: c.lat, zoom: map.getZoom() })
        })

        map.on('load', () => {
          map.addSource('heatmap-src', { type: 'geojson', data: buildGeoJSON(incidents) })
          map.addLayer({
            id: 'heatmap-layer',
            type: 'heatmap',
            source: 'heatmap-src',
            layout: { visibility: 'none' },
            paint: {
              'heatmap-weight': 1,
              'heatmap-intensity': 1.5,
              'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.2, 'rgba(59,130,246,0.4)',
                0.5, 'rgba(249,115,22,0.6)',
                0.8, 'rgba(239,68,68,0.8)',
                1, 'rgba(239,68,68,1)',
              ],
              'heatmap-radius': 30,
              'heatmap-opacity': 0.75,
            },
          })
        })

        return () => { map.remove(); mapRef.current = null }
      }, []) // eslint-disable-line react-hooks/exhaustive-deps

      // Rebuild markers when filter or incidents change
      useEffect(() => {
        const map = mapRef.current
        if (!map) return

        const rebuild = () => {
          markersRef.current.forEach(m => m.remove())
          markersRef.current = []

          const filtered = incidents.filter(inc => {
            const h = parseHour(inc.time)
            return h === null || (h >= minHour && h <= maxHour)
          })

          filtered.forEach(inc => {
            const color = CRIME_COLORS[inc.category] || CRIME_COLORS.other
            const el = document.createElement('div')
            el.style.cssText = `width:9px;height:9px;border-radius:50%;background:${color};border:1.5px solid rgba(0,0,0,0.6);cursor:pointer;box-shadow:0 0 4px ${color}88;display:${showHeatmap ? 'none' : 'block'}`

            const popup = new mapboxgl.Popup({ offset: 10, maxWidth: '280px', className: 'jar-popup' })
              .setHTML(`
                <div class="jar-popup-inner">
                  <div style="font-family:'Space Mono',monospace;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:${color};margin-bottom:6px">${escapeHtml(inc.type || inc.category)}</div>
                  <div style="color:#bbb">${escapeHtml(inc.address)}</div>
                  ${(inc.date || inc.time) ? `<div style="color:#666;font-size:10px;margin-top:4px">${escapeHtml(inc.date || '')}${inc.date && inc.time ? ' · ' : ''}${escapeHtml(inc.time || '')}</div>` : ''}
                  ${inc.description ? `<div style="color:#555;font-size:10px;margin-top:6px;border-top:0.5px solid #1a1a1a;padding-top:6px">${escapeHtml(inc.description.slice(0, 140))}${inc.description.length > 140 ? '…' : ''}</div>` : ''}
                </div>
              `)

            const marker = new mapboxgl.Marker({ element: el })
              .setLngLat([inc.lon, inc.lat])
              .setPopup(popup)
              .addTo(map)
            markersRef.current.push(marker)
          })

          // Update heatmap source
          const src = map.getSource('heatmap-src')
          if (src) src.setData(buildGeoJSON(filtered))

          // Fit map to the bounds of all plotted incidents
          if (filtered.length > 0) {
            const lons = filtered.map(i => i.lon)
            const lats = filtered.map(i => i.lat)
            map.fitBounds(
              [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
              { padding: 60, maxZoom: 14, duration: 800 }
            )
          }
        }

        if (map.isStyleLoaded()) rebuild()
        else map.once('load', rebuild)
      }, [incidents, minHour, maxHour]) // eslint-disable-line react-hooks/exhaustive-deps

      // Toggle heatmap layer + marker visibility
      useEffect(() => {
        const map = mapRef.current
        if (!map) return
        const toggle = () => {
          if (map.getLayer('heatmap-layer')) {
            map.setLayoutProperty('heatmap-layer', 'visibility', showHeatmap ? 'visible' : 'none')
          }
          markersRef.current.forEach(m => {
            m.getElement().style.display = showHeatmap ? 'none' : 'block'
          })
        }
        if (map.isStyleLoaded()) toggle()
        else map.once('load', toggle)
      }, [showHeatmap])

      // Count for display
      const shownCount = incidents.filter(inc => {
        const h = parseHour(inc.time)
        return h === null || (h >= minHour && h <= maxHour)
      }).length

      return (
        <div style={{ position: 'relative', width: '100%' }}>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 0', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555' }}>Heatmap</span>
              <button
                onClick={() => setShowHeatmap(v => !v)}
                style={{
                  fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: showHeatmap ? '#fff' : '#555', background: 'transparent',
                  border: `0.5px solid ${showHeatmap ? '#555' : '#222'}`,
                  padding: '5px 12px', cursor: 'pointer',
                }}
              >{showHeatmap ? 'On' : 'Off'}</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px', maxWidth: '400px' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#555', letterSpacing: '0.15em', whiteSpace: 'nowrap' }}>
                {fmtHour(minHour)} – {fmtHour(maxHour)}
              </span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input type="range" min={0} max={24} value={minHour}
                  onChange={e => setMinHour(Math.min(Number(e.target.value), maxHour - 1))}
                  style={{ width: '100%', accentColor: '#555' }} />
                <input type="range" min={0} max={24} value={maxHour}
                  onChange={e => setMaxHour(Math.max(Number(e.target.value), minHour + 1))}
                  style={{ width: '100%', accentColor: '#888' }} />
              </div>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#444', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                {shownCount} shown
              </span>
            </div>
          </div>

          {/* Map container — mapbox-gl mounts here */}
          <div ref={containerRef} style={{ width: '100%', height: '560px' }} />

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '10px' }}>
            {Object.entries(CRIME_LABELS).map(([cat, label]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CRIME_COLORS[cat], flexShrink: 0 }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#555', letterSpacing: '0.1em' }}>{label}</span>
              </div>
            ))}
          </div>

        </div>
      )
    }
  },
  {
    ssr: false,
    loading: () => (
      <div style={{ width: '100%', height: '600px', background: '#080808', border: '0.5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Loading map...</span>
      </div>
    ),
  }
)

// ── PDF generation ────────────────────────────────────────────────────────────

async function downloadPDF(output, jurisdiction, startDate, endDate) {
  const { jsPDF } = await import('jspdf')
  const vp = computeViewport(output.incidents)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const pageWidth = 215.9, pageHeight = 279.4
  const margin = 20

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  // Header
  doc.setFont('courier', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('JAR Intelligence', margin, margin + 7)
  doc.setFont('courier', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Crime Intelligence Briefing — jarintel.ai', margin, margin + 14)
  doc.setFontSize(8)
  doc.text(`${jurisdiction} · ${startDate || ''} – ${endDate || ''}`, margin, margin + 20)
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.4)
  doc.line(margin, margin + 25, pageWidth - margin, margin + 25)

  let y = margin + 34

  // Try to get static map image
  if (token) {
    try {
      const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${vp.longitude.toFixed(4)},${vp.latitude.toFixed(4)},${vp.zoom},0,0/900x400@2x?access_token=${token}&logo=false`
      const r = await fetch(mapUrl)
      if (r.ok) {
        const blob = await r.blob()
        const dataUrl = await blobToDataUrl(blob)
        const imgW = pageWidth - margin * 2
        const imgH = imgW * (400 / 900)
        doc.addImage(dataUrl, 'PNG', margin, y, imgW, imgH)
        y += imgH + 8

        // Incident count caption
        doc.setFont('courier', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(140, 140, 140)
        doc.text(`${output.incidents.length} geocoded incidents plotted`, margin, y)
        y += 8
      }
    } catch {}
  }

  // Normalize a briefing field to plain text for PDF — handles arrays and legacy strings
  const normField = (val, key) => {
    if (!val || (Array.isArray(val) && val.length === 0)) return ''
    if (Array.isArray(val)) {
      if (key === 'hotspots') return val.map(i => `• ${i.location}: ${i.description || ''}`).join('\n')
      if (key === 'patrolRecommendations') return val.map((i, n) => `${n + 1}. ${i.title}: ${i.detail || ''}`).join('\n')
      if (key === 'notableIncidents') return val.map(i => `• ${i.date}: ${i.description || ''}`).join('\n')
      return val.map(i => typeof i === 'string' ? i : JSON.stringify(i)).join('\n')
    }
    const s = typeof val === 'string' ? val : JSON.stringify(val)
    if (s.trimStart().startsWith('{')) {
      try {
        const parsed = JSON.parse(s)
        if (key && parsed[key]) return String(parsed[key])
        return Object.values(parsed).filter(v => typeof v === 'string').join('\n\n')
      } catch { /* fall through */ }
    }
    return s
  }

  // Briefing sections for PDF
  const sections = [
    { title: 'Executive Summary', text: normField(output.briefing.summary, 'summary') },
    { title: 'Geographic Hot Spots', text: normField(output.briefing.hotspots, 'hotspots') },
    { title: 'Temporal Patterns', text: normField(output.briefing.timePatterns, 'timePatterns') },
    { title: 'Patrol Recommendations', text: normField(output.briefing.patrolRecommendations, 'patrolRecommendations') },
    { title: 'Notable Incidents', text: normField(output.briefing.notableIncidents, 'notableIncidents') },
  ]

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

  drawFooter()

  for (const { title, text } of sections) {
    if (!text) continue
    if (y > pageHeight - 40) { doc.addPage(); drawFooter(); y = margin + 12 }

    // Section title
    y += 4
    doc.setFont('courier', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    doc.text(title.toUpperCase(), margin, y)
    y += 1.5
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.25)
    doc.line(margin, y, margin + doc.getTextWidth(title.toUpperCase()) + 1, y)
    y += 5

    // Body text
    doc.setFont('courier', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(20, 20, 20)
    const cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/[*_`]/g, '')
    for (const line of cleaned.split('\n')) {
      if (!line.trim()) { y += 3; continue }
      for (const wl of doc.splitTextToSize(line.trim(), contentWidth)) {
        if (y > pageHeight - 22) { doc.addPage(); drawFooter(); y = margin + 12 }
        doc.text(wl, margin, y)
        y += 5
      }
    }
    y += 6
  }

  doc.save(`crime-briefing-${jurisdiction.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
}

// ── Page component ────────────────────────────────────────────────────────────

export default function CrimeBriefing() {
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const [authState, setAuthState] = useState('initial')
  const authStateRef = useRef('initial')
  const [session, setSession] = useState(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  const [reqName, setReqName] = useState('')
  const [reqAgency, setReqAgency] = useState('')
  const [reqEmail, setReqEmail] = useState('')
  const [reqRole, setReqRole] = useState('')
  const [reqSent, setReqSent] = useState(false)
  const [reqError, setReqError] = useState('')

  // Tool state
  const [csvContent, setCsvContent] = useState('')
  const [csvFileName, setCsvFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [jurisdiction, setJurisdiction] = useState('')
  const currentYear = new Date().getFullYear()
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`)
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState(null) // {incidents, briefing}
  const [apiError, setApiError] = useState('')
  const [viewState, setViewState] = useState({ longitude: -98.5795, latitude: 39.8283, zoom: 4 })

  // ── Auth ────────────────────────────────────────────────────────────────────

  async function checkApproval(userSession) {
    if (!userSession?.user?.email) { setAuthState('initial'); return }
    setAuthState('checking')
    setSession(userSession)
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('approved')
        .eq('email', userSession.user.email)
        .single()
      if (error) {
        setAuthState(error.code === 'PGRST116' ? 'pending' : 'initial')
        return
      }
      setAuthState(profile?.approved ? 'approved' : 'pending')
    } catch {
      setAuthState('initial')
    }
  }

  useEffect(() => { authStateRef.current = authState }, [authState])

  useEffect(() => {
    if (authState !== 'checking') return
    const t = setTimeout(() => setAuthState('initial'), 5000)
    return () => clearTimeout(t)
  }, [authState])

  useEffect(() => {
    let initialResolved = false

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (initialResolved) return
      initialResolved = true
      if (s) checkApproval(s); else setAuthState('initial')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === 'INITIAL_SESSION') {
        if (initialResolved) return
        initialResolved = true
        if (s) await checkApproval(s); else setAuthState('initial')
      } else if (event === 'SIGNED_IN') {
        initialResolved = true
        const cur = authStateRef.current
        if (cur !== 'approved' && cur !== 'pending' && cur !== 'checking') await checkApproval(s)
      } else if (event === 'TOKEN_REFRESHED') {
        if (s) setSession(s)
      } else if (event === 'SIGNED_OUT') {
        initialResolved = false
        setAuthState('initial')
        setSession(null)
      }
    })

    function handleVisibility() {
      if (document.visibilityState !== 'visible') return
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        const cur = authStateRef.current
        if (s && cur !== 'approved' && cur !== 'pending' && cur !== 'checking') checkApproval(s)
        else if (s && (cur === 'approved' || cur === 'pending')) setSession(s)
        else if (!s && (cur === 'approved' || cur === 'pending')) { setAuthState('initial'); setSession(null) }
      })
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => { subscription.unsubscribe(); document.removeEventListener('visibilitychange', handleVisibility) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSignIn(e) {
    e.preventDefault()
    setAuthError('')
    setSigningIn(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
    setSigningIn(false)
    if (error) {
      setAuthError(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message)
      return
    }
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
    if (res.ok) { setReqSent(true) }
    else {
      const data = await res.json().catch(() => ({}))
      setReqError(data.error || 'Failed to submit. Please try again.')
    }
  }

  // ── CSV handling ────────────────────────────────────────────────────────────

  function readFile(file) {
    if (!file || !file.name.endsWith('.csv')) {
      setApiError('Please upload a .csv file.')
      return
    }
    const reader = new FileReader()
    reader.onload = e => { setCsvContent(e.target.result); setCsvFileName(file.name); setApiError('') }
    reader.readAsText(file)
  }

  function onDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) readFile(file)
  }

  // ── Generate ────────────────────────────────────────────────────────────────

  async function handleGenerate(e) {
    e.preventDefault()
    setLoading(true)
    setApiError('')
    setOutput(null)

    try {
      const headers = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`

      const res = await fetch('/api/generate-briefing', {
        method: 'POST',
        headers,
        body: JSON.stringify({ csvContent, jurisdiction, startDate, endDate }),
      })
      const data = await res.json()
      if (data.error) {
        setApiError(data.error)
      } else {
        // Repair: if API JSON.parse failed, the full Claude response may have landed in summary
        let briefing = data.briefing || {}
        if (briefing.summary && !briefing.hotspots && !briefing.timePatterns) {
          const s = String(briefing.summary).trim()
          if (s.startsWith('{')) {
            try {
              const reparsed = JSON.parse(s)
              if (reparsed.summary) briefing = {
                summary: String(reparsed.summary || ''),
                hotspots: Array.isArray(reparsed.hotspots) ? reparsed.hotspots : String(reparsed.hotspots || ''),
                timePatterns: String(reparsed.timePatterns || ''),
                patrolRecommendations: Array.isArray(reparsed.patrolRecommendations) ? reparsed.patrolRecommendations : String(reparsed.patrolRecommendations || ''),
                notableIncidents: Array.isArray(reparsed.notableIncidents) ? reparsed.notableIncidents : String(reparsed.notableIncidents || ''),
              }
            } catch {}
          }
        }
        setOutput({ incidents: data.incidents, briefing })
        setViewState(computeViewport(data.incidents))
      }
    } catch {
      setApiError('Request failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = csvContent && jurisdiction.trim() && startDate && endDate && !loading

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>Crime Intelligence Briefing — JAR Intelligence</title>
        <meta name="description" content="AI-powered crime pattern analysis and intelligence briefings from CAD/RMS exports." />
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
                <span onClick={() => { setMenuOpen(false); supabase.auth.signOut() }}
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', padding: '16px 20px', cursor: 'pointer', display: 'block' }}
                >Sign Out</span>
              )}
            </div>
          )}
        </nav>

        {/* PAGE HEADER */}
        <div className="mob-pad" style={{ padding: '100px 40px 0', maxWidth: '1200px', margin: '0 auto' }}>
          <button onClick={() => router.push('/free-tools')}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '28px', display: 'block' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#888'}
          >← Free Tools</button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.3em', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>// Law Enforcement · Intelligence</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Crime Intelligence Briefing</div>
          <div style={{ fontSize: '11px', color: '#bbb', letterSpacing: '0.06em', lineHeight: 1.8, marginBottom: '48px', maxWidth: '600px' }}>
            Upload a CAD or RMS export. AI analyzes patterns and generates an interactive map with geocoded incidents plus a command-ready intelligence briefing.
          </div>
          <div style={{ width: '100%', height: '0.5px', background: '#1a1a1a', marginBottom: '56px' }} />
        </div>

        {/* ── AUTH STATES ──────────────────────────────────────────────────────── */}

        {authState === 'checking' && (
          <div style={{ padding: '0 40px 80px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#666' }}>Verifying access...</div>
          </div>
        )}

        {authState === 'initial' && (
          <div className="mob-pad" style={{ padding: '0 40px 80px', maxWidth: '1200px', margin: '0 auto' }}>
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
                    <input className="mob-input" style={inputStyle} type="email" value={authEmail}
                      onChange={e => { setAuthEmail(e.target.value); setAuthError('') }}
                      placeholder="you@agency.gov" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <input className="mob-input" style={inputStyle} type="password" value={authPassword}
                      onChange={e => { setAuthPassword(e.target.value); setAuthError('') }}
                      placeholder="••••••••••••••••" required />
                  </div>
                  {authError && (
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.12em', color: '#c44', textTransform: 'uppercase' }}>{authError}</div>
                  )}
                  <button type="submit" className="mob-touch" disabled={signingIn}
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

        {authState === 'pending' && (
          <div className="mob-pad" style={{ padding: '0 40px 80px', maxWidth: '1200px', margin: '0 auto' }}>
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

        {/* ── TOOL (approved) ──────────────────────────────────────────────────── */}

        {authState === 'approved' && (
          <div className="mob-pad" style={{ padding: '0 40px 100px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Access badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2a6a2a' }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2a6a2a' }}>
                Access Granted — {session?.user?.email}
              </span>
            </div>

            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '48px' }}>

              {/* CSV Upload */}
              <div>
                <label style={labelStyle}>CAD / RMS Export (CSV)</label>
                <div style={{ fontSize: '13px', color: '#bbbbbb', lineHeight: 1.8, marginBottom: '14px' }}>
                  Required columns: <span style={{ color: '#bbbbbb' }}>date, time, type, address</span> — description is optional.<br />
                  Export your CAD or RMS data as CSV and drag it here.
                </div>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  style={{
                    border: `0.5px dashed ${isDragging ? '#666' : csvContent ? '#2a6a2a' : '#333'}`,
                    background: isDragging ? '#0a0a0a' : '#000',
                    padding: '40px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onClick={() => document.getElementById('csv-input').click()}
                >
                  <input
                    id="csv-input"
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={e => readFile(e.target.files[0])}
                  />
                  {csvContent ? (
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: '#2a6a2a', textTransform: 'uppercase', marginBottom: '6px' }}>✓ File loaded</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{csvFileName}</div>
                      <div style={{ fontSize: '13px', color: '#bbbbbb', marginTop: '4px' }}>Click to replace</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', letterSpacing: '0.2em', color: '#bbbbbb', textTransform: 'uppercase', marginBottom: '6px' }}>
                        {isDragging ? 'Drop to upload' : 'Drag & drop CSV or click to browse'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#bbbbbb' }}>CAD export · RMS export · Spreadsheet</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Jurisdiction + dates */}
              <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a1a1a' }}>
                <div style={{ background: '#000', padding: '28px' }}>
                  <label style={labelStyle}>Jurisdiction / City</label>
                  <input
                    className="mob-input"
                    style={inputStyle}
                    value={jurisdiction}
                    onChange={e => setJurisdiction(e.target.value)}
                    placeholder="Austin, TX"
                    required
                  />
                  <div style={{ fontSize: '13px', color: '#bbbbbb', marginTop: '8px', lineHeight: 1.6 }}>
                    Used to accurately geocode addresses. Include city and state.
                  </div>
                </div>
                <div style={{ background: '#000', padding: '28px' }}>
                  <label style={labelStyle}>Date Range</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="date" className="mob-input" value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      style={{ ...inputStyle, colorScheme: 'dark', flex: 1 }} />
                    <span style={{ color: '#444', fontSize: '11px', flexShrink: 0 }}>–</span>
                    <input type="date" className="mob-input" value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      style={{ ...inputStyle, colorScheme: 'dark', flex: 1 }} />
                  </div>
                </div>
              </div>

              {/* Generate */}
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
                  {loading ? 'Analyzing...' : 'Generate Briefing →'}
                </button>
                {loading && (
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', color: '#888', textTransform: 'uppercase' }}>
                    Geocoding incidents and analyzing patterns...
                  </span>
                )}
              </div>

            </form>

            {/* Error */}
            {apiError && (
              <div style={{ marginBottom: '32px', padding: '20px', background: '#0a0000', border: '0.5px solid #3a1a1a' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#c44', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>Error</div>
                <div style={{ fontSize: '11px', color: '#c44', lineHeight: 1.7 }}>{apiError}</div>
              </div>
            )}

            {/* ── OUTPUT ─────────────────────────────────────────────────────── */}

            {output && (
              <div>
                {/* Output header + PDF button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#888' }}>// Briefing Output</div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                      {output.incidents.length} incidents geocoded · {jurisdiction}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => downloadPDF(output, jurisdiction, startDate, endDate)}
                      style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', background: 'transparent', border: '0.5px solid #333', padding: '8px 16px', cursor: 'pointer' }}
                      onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#777' }}
                      onMouseLeave={e => { e.target.style.color = '#888'; e.target.style.borderColor = '#333' }}
                    >Download PDF</button>
                    <button
                      onClick={() => { setOutput(null); setCsvContent(''); setCsvFileName(''); setApiError('') }}
                      style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#555', background: 'transparent', border: '0.5px solid #222', padding: '8px 16px', cursor: 'pointer' }}
                      onMouseEnter={e => { e.target.style.color = '#888'; e.target.style.borderColor = '#333' }}
                      onMouseLeave={e => { e.target.style.color = '#555'; e.target.style.borderColor = '#222' }}
                    >Clear & Start Over</button>
                  </div>
                </div>

                {/* Two-panel layout */}
                <div className="mob-stack" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a1a1a', alignItems: 'start' }}>

                  {/* LEFT: Map */}
                  <div style={{ background: '#000', padding: '24px' }}>
                    <div style={sectionHeadStyle}>// Incident Map</div>
                    <CrimeMap
                      incidents={output.incidents}
                      viewState={viewState}
                      onViewStateChange={setViewState}
                    />
                  </div>

                  {/* RIGHT: Briefing text */}
                  <div style={{ background: '#000', padding: '24px', maxHeight: '780px', overflowY: 'auto' }}>
                    <div style={sectionHeadStyle}>// Intelligence Briefing</div>

                    {(() => {
                      const b = output.briefing
                      const secHead = title => (
                        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '12px', paddingBottom: '6px', borderBottom: '0.5px solid #222' }}>{title}</div>
                      )
                      const bullet = { display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '13px', color: '#dddddd', lineHeight: 1.85 }
                      const dot = { color: '#aaaaaa', flexShrink: 0 }
                      const bold = { color: '#fff', fontWeight: 600 }

                      return (
                        <>
                          {/* Executive Summary */}
                          {b.summary && (
                            <div style={{ marginBottom: '32px' }}>
                              {secHead('Executive Summary')}
                              {String(b.summary).split(/\n\n+/).filter(p => p.trim()).map((para, i) => (
                                <p key={i} style={{ fontSize: '13px', color: '#dddddd', lineHeight: 1.9, margin: '0 0 12px' }}>{para.trim()}</p>
                              ))}
                            </div>
                          )}

                          {/* Geographic Hot Spots */}
                          {b.hotspots && (Array.isArray(b.hotspots) ? b.hotspots.length > 0 : b.hotspots) && (
                            <div style={{ marginBottom: '32px' }}>
                              {secHead('Geographic Hot Spots')}
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {Array.isArray(b.hotspots)
                                  ? b.hotspots.map((item, i) => (
                                    <li key={i} style={bullet}>
                                      <span style={dot}>·</span>
                                      <span><span style={bold}>{item.location}</span>{item.description ? ` — ${item.description}` : ''}</span>
                                    </li>
                                  ))
                                  : String(b.hotspots).split(/\n/).filter(l => l.trim()).map((line, i) => (
                                    <li key={i} style={bullet}><span style={dot}>·</span><span>{line.replace(/^[-·•]\s*/, '')}</span></li>
                                  ))
                                }
                              </ul>
                            </div>
                          )}

                          {/* Temporal Patterns */}
                          {b.timePatterns && (
                            <div style={{ marginBottom: '32px' }}>
                              {secHead('Temporal Patterns')}
                              {String(b.timePatterns).split(/\n\n+/).filter(p => p.trim()).map((block, i) => {
                                const lines = block.trim().split('\n')
                                const first = lines[0].trim()
                                const isSubHead = first.endsWith(':') || /^[A-Z][A-Z\s\-\/()0-9]+$/.test(first)
                                if (isSubHead && lines.length > 1) return (
                                  <div key={i} style={{ marginBottom: '14px' }}>
                                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaaaaa', marginBottom: '6px' }}>{first.replace(/:$/, '')}</div>
                                    {lines.slice(1).filter(l => l.trim()).map((ln, j) => (
                                      <p key={j} style={{ fontSize: '13px', color: '#dddddd', lineHeight: 1.9, margin: '0 0 6px' }}>{ln.trim()}</p>
                                    ))}
                                  </div>
                                )
                                return <p key={i} style={{ fontSize: '13px', color: '#dddddd', lineHeight: 1.9, margin: '0 0 12px' }}>{block.trim()}</p>
                              })}
                            </div>
                          )}

                          {/* Patrol Recommendations */}
                          {b.patrolRecommendations && (Array.isArray(b.patrolRecommendations) ? b.patrolRecommendations.length > 0 : b.patrolRecommendations) && (
                            <div style={{ marginBottom: '32px' }}>
                              {secHead('Patrol Recommendations')}
                              <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {Array.isArray(b.patrolRecommendations)
                                  ? b.patrolRecommendations.map((item, i) => (
                                    <li key={i} style={bullet}>
                                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#aaaaaa', flexShrink: 0, minWidth: '16px' }}>{i + 1}.</span>
                                      <span><span style={bold}>{item.title}</span>{item.detail ? ` — ${item.detail}` : ''}</span>
                                    </li>
                                  ))
                                  : String(b.patrolRecommendations).split(/\n/).filter(l => l.trim()).map((line, i) => (
                                    <li key={i} style={bullet}>
                                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#aaaaaa', flexShrink: 0, minWidth: '16px' }}>{i + 1}.</span>
                                      <span>{line.replace(/^\d+\.\s*/, '')}</span>
                                    </li>
                                  ))
                                }
                              </ol>
                            </div>
                          )}

                          {/* Notable Incidents */}
                          {b.notableIncidents && (Array.isArray(b.notableIncidents) ? b.notableIncidents.length > 0 : b.notableIncidents) && (
                            <div style={{ marginBottom: '28px' }}>
                              {secHead('Notable Incidents')}
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {Array.isArray(b.notableIncidents)
                                  ? b.notableIncidents.map((item, i) => (
                                    <li key={i} style={bullet}>
                                      <span style={dot}>·</span>
                                      <span><span style={bold}>{item.date}</span>{item.description ? ` — ${item.description}` : ''}</span>
                                    </li>
                                  ))
                                  : String(b.notableIncidents).split(/\n/).filter(l => l.trim()).map((line, i) => (
                                    <li key={i} style={bullet}><span style={dot}>·</span><span>{line.replace(/^[-·•]\s*/, '')}</span></li>
                                  ))
                                }
                              </ul>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

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
