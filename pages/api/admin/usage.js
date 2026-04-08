import { supabaseAdmin } from '../../../lib/supabase-admin'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  if (!process.env.ADMIN_PASSWORD || req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Fetch all usage logs
  const { data: logs, error: logsError } = await supabaseAdmin
    .from('usage_logs')
    .select('user_id, tool, created_at')
    .order('created_at', { ascending: false })

  if (logsError) {
    console.error('Usage logs fetch error:', logsError)
    return res.status(500).json({ error: 'Failed to fetch usage logs.' })
  }

  // Fetch all profiles to join by id
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, agency')

  if (profilesError) {
    console.error('Profiles fetch error:', profilesError)
    return res.status(500).json({ error: 'Failed to fetch profiles.' })
  }

  const profileById = {}
  for (const p of profiles) profileById[p.id] = p

  // Aggregate per user
  const userMap = {}
  const toolTotals = {}

  for (const log of logs) {
    const profile = profileById[log.user_id]
    const email = profile?.email || log.user_id

    if (!userMap[email]) {
      userMap[email] = {
        email,
        full_name: profile?.full_name || null,
        agency: profile?.agency || null,
        total: 0,
        by_tool: {},
        last_active: null,
      }
    }

    userMap[email].total++
    userMap[email].by_tool[log.tool] = (userMap[email].by_tool[log.tool] || 0) + 1
    if (!userMap[email].last_active || log.created_at > userMap[email].last_active) {
      userMap[email].last_active = log.created_at
    }

    toolTotals[log.tool] = (toolTotals[log.tool] || 0) + 1
  }

  res.status(200).json({
    users: Object.values(userMap).sort((a, b) =>
      (b.last_active || '') > (a.last_active || '') ? 1 : -1
    ),
    tool_totals: toolTotals,
    total_generations: logs.length,
  })
}
