import { supabaseAdmin } from '../../../lib/supabase-admin'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  if (!process.env.ADMIN_PASSWORD || req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Fetch logs that have report content
  const { data: logs, error: logsError } = await supabaseAdmin
    .from('usage_logs')
    .select('id, user_id, tool, report_type, report_content, jurisdiction, created_at')
    .not('report_content', 'is', null)
    .order('created_at', { ascending: false })
    .limit(200)

  if (logsError) {
    console.error('[reports] logs fetch error:', logsError)
    return res.status(500).json({ error: 'Failed to fetch reports.' })
  }

  // Fetch profiles for user_ids present in logs
  const userIds = [...new Set((logs || []).map(l => l.user_id).filter(Boolean))]
  let profileMap = {}

  if (userIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, agency')
      .in('id', userIds)
    if (profiles) {
      profiles.forEach(p => { profileMap[p.id] = p })
    }
  }

  const reports = (logs || []).map(log => {
    const profile = profileMap[log.user_id] || {}
    return {
      id: log.id,
      created_at: log.created_at,
      email: profile.email || '—',
      agency: profile.agency || '—',
      tool: log.tool || log.report_type || '—',
      jurisdiction: log.jurisdiction || null,
      preview: log.report_content ? log.report_content.slice(0, 200) : '',
      report_content: log.report_content || '',
    }
  })

  res.status(200).json({ reports })
}
