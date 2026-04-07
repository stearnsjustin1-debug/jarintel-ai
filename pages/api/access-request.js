import { supabaseAdmin } from '../../lib/supabase-admin'
import { Resend } from 'resend'

async function sendNotification({ full_name, agency, email, role }) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    // Requires jarintel.ai to be a verified sending domain in your Resend dashboard.
    // Until then, swap this for your Resend onboarding address or a verified domain.
    from: 'JAR Intelligence <noreply@jarintel.ai>',
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

  const { error } = await supabaseAdmin
    .from('profiles')
    .insert({ email, full_name, agency, role, approved: false })

  if (error) {
    if (error.code === '23505') {
      return res.status(200).json({ ok: true, existing: true })
    }
    console.error('Access request insert error:', error)
    return res.status(500).json({ error: 'Failed to submit request. Please try again.' })
  }

  // Send notification email non-blocking — a mail failure must not affect the response
  if (process.env.RESEND_API_KEY) {
    sendNotification({ full_name, agency, email, role }).catch(err =>
      console.error('Resend notification error:', err)
    )
  }

  res.status(200).json({ ok: true })
}
