import { supabaseAdmin } from '../../lib/supabase-admin'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, full_name, agency, role } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  const { error } = await supabaseAdmin
    .from('profiles')
    .insert({ email, full_name, agency, role, approved: false })

  if (error) {
    // Unique constraint violation — email already exists in the system
    if (error.code === '23505') {
      return res.status(200).json({ ok: true, existing: true })
    }
    console.error('Access request insert error:', error)
    return res.status(500).json({ error: 'Failed to submit request. Please try again.' })
  }

  res.status(200).json({ ok: true })
}
