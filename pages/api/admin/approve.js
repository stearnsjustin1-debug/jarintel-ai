import { supabaseAdmin } from '../../../lib/supabase-admin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!process.env.ADMIN_PASSWORD || req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ approved: true })
    .eq('email', email)

  if (error) {
    console.error('Admin approve error:', error)
    return res.status(500).json({ error: 'Failed to approve user.' })
  }

  res.status(200).json({ ok: true })
}
