import { supabaseAdmin } from '../../../lib/supabase-admin'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  if (!process.env.ADMIN_PASSWORD || req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, agency, role, approved, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Admin profiles fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch profiles.' })
  }

  res.status(200).json({ profiles: data })
}
