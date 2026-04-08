import crypto from 'crypto'
import { supabaseAdmin } from '../../lib/supabase-admin'
import { Resend } from 'resend'

function generatePassword() {
  // 16-char alphanumeric, no ambiguous chars (0/O, 1/I/l)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 16 }, () => chars[crypto.randomInt(chars.length)]).join('')
}

async function sendNotification({ full_name, agency, email, role }) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'JAR Intelligence <onboarding@resend.dev>',
    to: 'mason@jarintel.ai',
    subject: 'New Access Request — JAR Intel',
    html: `
      <div style="font-family: monospace; background: #000; color: #bbb; padding: 32px; max-width: 560px;">
        <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 4px;">JAR Intelligence</div>
        <div style="color: #666; font-size: 11px; margin-bottom: 24px;">New Access Request — Performance Review Engine</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #888; width: 100px; font-size: 12px;">Name</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${full_name || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 12px;">Agency</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${agency || '—'}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 12px;">Email</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${email}</td></tr>
          <tr><td style="padding: 8px 0; color: #888; font-size: 12px;">Role</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${role || '—'}</td></tr>
        </table>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #222; color: #444; font-size: 11px;">
          Approve this user at jarintel.ai/admin
        </div>
      </div>
    `,
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, full_name, agency, role } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  const password = generatePassword()

  // Insert profile with temp_password stored in plain text until admin approves
  const { error: insertError } = await supabaseAdmin
    .from('profiles')
    .insert({ email, full_name, agency, role, approved: false, temp_password: password })

  if (insertError) {
    if (insertError.code === '23505') {
      return res.status(200).json({ ok: true, existing: true })
    }
    console.error('Access request insert error:', insertError)
    return res.status(500).json({ error: 'Failed to submit request. Please try again.' })
  }

  // Create auth user immediately so they can sign in once approved
  const { error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    // Log but don't fail — profile is saved and admin can still approve
    console.error('Auth user creation error:', authError)
  }

  // Non-blocking admin notification
  if (process.env.RESEND_API_KEY) {
    sendNotification({ full_name, agency, email, role }).catch(err =>
      console.error('Resend notification error:', err)
    )
  }

  res.status(200).json({ ok: true })
}
