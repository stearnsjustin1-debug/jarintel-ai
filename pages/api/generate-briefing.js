import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '../../lib/supabase-admin'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const MAX_INCIDENTS = 500

// ── Usage logging ────────────────────────────────────────────────────────────

async function logUsage(token, reportContent, jurisdictionName) {
  console.log('[logUsage] crime-briefing: starting')
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError) { console.error('[logUsage] getUser error:', userError); return }
  if (!user) { console.warn('[logUsage] no user for token'); return }
  console.log('[logUsage] user:', user.email)

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', user.email)
    .single()

  if (profileError) { console.error('[logUsage] profile fetch error:', profileError); return }
  if (!profile) { console.warn('[logUsage] no profile for email:', user.email); return }
  console.log('[logUsage] profile id:', profile.id)

  const { error: insertError } = await supabaseAdmin.from('usage_logs').insert({
    user_id: profile.id,
    tool: 'crime-briefing',
    report_type: 'crime-briefing',
    report_content: reportContent || null,
    jurisdiction: jurisdictionName || null,
    created_at: new Date().toISOString(),
  })
  if (insertError) {
    console.error('[logUsage] insert error:', insertError)
  } else {
    console.log('[logUsage] crime-briefing: insert ok')
  }
}

// ── CSV parser (handles quoted fields) ──────────────────────────────────────

function parseLine(line) {
  const vals = []
  let cur = '', inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') { inQ = !inQ }
    else if (c === ',' && !inQ) { vals.push(cur.trim()); cur = '' }
    else cur += c
  }
  vals.push(cur.trim())
  return vals
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, '').trim())
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const vals = parseLine(line)
      const row = {}
      headers.forEach((h, i) => { row[h] = (vals[i] || '').replace(/^"|"$/g, '') })
      return row
    })
}

function extractField(row, ...candidates) {
  for (const c of candidates) {
    if (row[c] !== undefined && row[c] !== '') return row[c]
  }
  return ''
}

// ── Crime type normalizer ────────────────────────────────────────────────────

function categorize(type) {
  const t = (type || '').toLowerCase()
  if (/assault|battery|fight|homicide|murder|robbery|weapon|shoot|stab|attack|violence|aggravated/.test(t)) return 'assault'
  if (/larceny|theft|steal|burglary|shoplift|auto theft|vehicle theft|vandal|damage|break/.test(t)) return 'larceny'
  if (/domestic|family|dv|disturbance|disorderly/.test(t)) return 'domestic'
  if (/drug|narcotic|dui|dwi|ovi|alcohol|substance|possession/.test(t)) return 'drugs'
  return 'other'
}

// ── Geocoding ────────────────────────────────────────────────────────────────

async function geocodeOne(address, jurisdiction) {
  if (!address || !MAPBOX_TOKEN) return null
  const query = encodeURIComponent(`${address}, ${jurisdiction}`)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&limit=1&types=address,poi`
  try {
    const r = await fetch(url)
    if (!r.ok) return null
    const d = await r.json()
    if (d.features?.length) {
      const [lon, lat] = d.features[0].geometry.coordinates
      return { lat, lon }
    }
  } catch {}
  return null
}

async function geocodeBatch(items, batchSize = 10) {
  const out = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const results = await Promise.all(batch.map(({ address, jurisdiction }) => geocodeOne(address, jurisdiction)))
    out.push(...results)
  }
  return out
}

// ── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { csvContent, jurisdiction, startDate, endDate } = req.body
  if (!csvContent || !jurisdiction) {
    return res.status(400).json({ error: 'CSV content and jurisdiction are required.' })
  }

  const rows = parseCSV(csvContent).slice(0, MAX_INCIDENTS)
  if (rows.length === 0) {
    return res.status(400).json({ error: 'No incidents found in CSV. Verify column headers include: date, time, type, address.' })
  }

  // Normalize row fields
  const normalized = rows.map(row => ({
    date: extractField(row, 'date', 'incident date', 'call date', 'occurred date', 'rpt_date'),
    time: extractField(row, 'time', 'incident time', 'call time', 'occurred time', 'rpt_time'),
    type: extractField(row, 'type', 'incident type', 'call type', 'offense', 'crime', 'offense type', 'nature'),
    address: extractField(row, 'address', 'location', 'addr', 'street', 'block', 'incident address'),
    description: extractField(row, 'description', 'notes', 'narrative', 'comments', 'details', 'desc'),
  }))

  // Geocode
  const coords = await geocodeBatch(
    normalized.map(r => ({ address: r.address, jurisdiction }))
  )

  // Build incidents array — only keep geocoded rows
  const incidents = normalized
    .map((row, i) => ({
      ...row,
      lat: coords[i]?.lat ?? null,
      lon: coords[i]?.lon ?? null,
      category: categorize(row.type),
    }))
    .filter(inc => inc.lat !== null && inc.lon !== null)

  if (incidents.length === 0) {
    return res.status(400).json({ error: 'Could not geocode any addresses. Verify the address column contains valid street addresses and the jurisdiction name is correct.' })
  }

  // Build compact incident list for Claude (limit to 300 rows to stay within tokens)
  const incidentLines = normalized.slice(0, 300).map(r =>
    `${r.date} ${r.time} | ${r.type} | ${r.address}`
  ).join('\n')

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: `You are a senior law enforcement crime analyst specializing in pattern analysis and intelligence briefings. You analyze CAD and RMS data to identify crime trends, geographic hot spots, and temporal patterns for command staff and patrol supervisors. Your briefings are professional, data-driven, and operationally actionable.`,
      messages: [
        {
          role: 'user',
          content: `Analyze the following ${incidents.length} incidents from ${jurisdiction} (period: ${startDate || 'unknown'} to ${endDate || 'unknown'}) and produce a structured crime intelligence briefing.

INCIDENT DATA (date | time | type | address):
${incidentLines}

Return a JSON object with exactly this structure — no preamble, no markdown, just the JSON:
{
  "summary": "2-3 paragraph executive summary covering overall volume, dominant crime types, and the most significant trends. Separate paragraphs with \\n\\n.",
  "hotspots": [
    {"location": "Specific street name, intersection, or block", "description": "Incident density, types, and pattern at this location."}
  ],
  "timePatterns": "Temporal pattern analysis. Use shift labels: DAY SHIFT (0600-1400): observations. EVENING SHIFT (1400-2200): observations. OVERNIGHT (2200-0600): observations. Include peak days of week. Separate each shift block with \\n\\n.",
  "patrolRecommendations": [
    {"title": "Short action-oriented title", "detail": "Specific operational detail and the data pattern that supports it."}
  ],
  "notableIncidents": [
    {"date": "Date or date range", "description": "Description of the notable cluster, outlier, or escalating pattern."}
  ]
}
Provide 3-6 hotspots, 4-5 patrol recommendations, and 2-5 notable incidents.`
        }
      ]
    })

    let briefing
    try {
      let text = message.content[0].text.trim()
      // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
      const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/s)
      if (fenceMatch) text = fenceMatch[1].trim()
      // Extract outermost JSON object
      const start = text.indexOf('{')
      const end = text.lastIndexOf('}')
      if (start !== -1 && end !== -1) text = text.slice(start, end + 1)
      const parsed = JSON.parse(text)
      briefing = {
        summary: String(parsed.summary || ''),
        hotspots: Array.isArray(parsed.hotspots) ? parsed.hotspots : String(parsed.hotspots || ''),
        timePatterns: String(parsed.timePatterns || ''),
        patrolRecommendations: Array.isArray(parsed.patrolRecommendations) ? parsed.patrolRecommendations : String(parsed.patrolRecommendations || ''),
        notableIncidents: Array.isArray(parsed.notableIncidents) ? parsed.notableIncidents : String(parsed.notableIncidents || ''),
      }
    } catch {
      // JSON parse failed — try regex field extraction before falling back to raw dump
      const raw = message.content[0].text.trim()
      const extractField = key => {
        const m = raw.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"`, 's'))
        if (!m) return ''
        return m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
      }
      const s = extractField('summary')
      briefing = {
        summary: s || raw,
        hotspots: [],
        timePatterns: extractField('timePatterns'),
        patrolRecommendations: [],
        notableIncidents: [],
      }
    }

    // Log usage non-blocking — a logging failure must not affect the response
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      logUsage(authHeader.slice(7), JSON.stringify(briefing), jurisdiction).catch(err => console.error('Usage log error:', err))
    }

    res.status(200).json({ incidents, briefing })
  } catch (err) {
    console.error('Briefing generation error:', err)
    res.status(500).json({ error: 'Failed to generate briefing. Check API key configuration.' })
  }
}
