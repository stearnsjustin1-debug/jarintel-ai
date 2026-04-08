import { supabaseAdmin } from '../../../lib/supabase-admin'
import { Resend } from 'resend'

async function sendApprovalEmail({ email, password }) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'JAR Intelligence <onboarding@resend.dev>',
    to: email,
    subject: 'Your JAR Intelligence Access is Approved',
    html: `
      <div style="font-family: monospace; background: #000; color: #bbb; padding: 32px; max-width: 560px;">
        <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 4px;">JAR Intelligence</div>
        <div style="color: #666; font-size: 11px; margin-bottom: 24px;">Performance Review Engine — Access Approved</div>
        <div style="color: #bbb; font-size: 13px; line-height: 1.8; margin-bottom: 24px;">
          Your access request has been approved. Use the credentials below to sign in at jarintel.ai.
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
          <tr>
            <td style="padding: 10px 0; color: #888; width: 100px; font-size: 12px; border-bottom: 1px solid #1a1a1a;">Email</td>
            <td style="padding: 10px 0; color: #fff; font-size: 12px; border-bottom: 1px solid #1a1a1a;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 12px;">Password</td>
            <td style="padding: 10px 0; color: #fff; font-size: 15px; letter-spacing: 0.12em; font-weight: bold;">${password}</td>
          </tr>
        </table>
        <a href="https://jarintel.ai/free-tools/performance-review"
           style="display: inline-block; color: #fff; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; border: 1px solid #555; padding: 12px 28px; margin-bottom: 28px;">
          Sign In →
        </a>
        <div style="color: #444; font-size: 11px; border-top: 1px solid #1a1a1a; padding-top: 16px;">
          JAR Intelligence · jarintel.ai
        </div>
      </div>
    `,
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!process.env.ADMIN_PASSWORD || req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  // Fetch temp_password before clearing it
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('temp_password')
    .eq('email', email)
    .single()

  if (fetchError) {
    console.error('Admin approve fetch error:', fetchError)
    return res.status(500).json({ error: 'Failed to fetch user profile.' })
  }

  // Approve user and clear the temp_password
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ approved: true, temp_password: null })
    .eq('email', email)

  if (updateError) {
    console.error('Admin approve update error:', updateError)
    return res.status(500).json({ error: 'Failed to approve user.' })
  }

  // Send credentials email non-blocking
  if (process.env.RESEND_API_KEY && profile?.temp_password) {
    sendApprovalEmail({ email, password: profile.temp_password }).catch(err =>
      console.error('Resend approval email error:', err)
    )
  }

  res.status(200).json({ ok: true })
}
