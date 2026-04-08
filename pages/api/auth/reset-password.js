import crypto from 'crypto'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { Resend } from 'resend'

function generatePassword() {
  // 16-char alphanumeric, no ambiguous chars (0/O, 1/I/l)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 16 }, () => chars[crypto.randomInt(chars.length)]).join('')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  // Look up profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, approved, full_name')
    .eq('email', email)
    .single()

  if (profileError || !profile) {
    return res.status(404).json({ error: 'Email not found — request access first.' })
  }

  if (!profile.approved) {
    return res.status(403).json({ error: 'Your account is pending approval.' })
  }

  // Find the Supabase auth user by email
  const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  if (listError) {
    console.error('[reset-password] listUsers error:', listError)
    return res.status(500).json({ error: 'Failed to reset password. Please try again.' })
  }

  const authUser = listData?.users?.find(u => u.email === email)
  if (!authUser) {
    console.error('[reset-password] auth user not found for email:', email)
    return res.status(404).json({ error: 'Email not found — request access first.' })
  }

  const password = generatePassword()

  // Update password in Supabase Auth
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, { password })
  if (updateError) {
    console.error('[reset-password] updateUserById error:', updateError)
    return res.status(500).json({ error: 'Failed to reset password. Please try again.' })
  }

  // Store new temp_password in profiles
  await supabaseAdmin
    .from('profiles')
    .update({ temp_password: password })
    .eq('email', email)

  // Send credentials email
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'JAR Intelligence <onboarding@resend.dev>',
        to: email,
        subject: 'Your New JAR Intelligence Login Credentials',
        html: `
          <div style="font-family: monospace; background: #000; color: #bbb; padding: 32px; max-width: 560px;">
            <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 4px;">JAR Intelligence</div>
            <div style="color: #666; font-size: 11px; margin-bottom: 24px;">Password Reset — New Credentials</div>
            <p style="color: #bbb; font-size: 12px; line-height: 1.8; margin-bottom: 20px;">
              Your password has been reset. Use the credentials below to sign in.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="padding: 8px 0; color: #888; width: 100px; font-size: 12px;">Email</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 12px;">Password</td><td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: bold; letter-spacing: 0.05em;">${password}</td></tr>
            </table>
            <p style="color: #666; font-size: 11px; line-height: 1.8;">
              Sign in at jarintel.ai/free-tools/performance-review
            </p>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #222; color: #444; font-size: 11px;">
              If you did not request this reset, contact us immediately.
            </div>
          </div>
        `,
      })
    } catch (err) {
      console.error('[reset-password] Resend error:', err)
      // Email failure is non-fatal — password was already reset
    }
  }

  // Clear temp_password after email is sent
  await supabaseAdmin
    .from('profiles')
    .update({ temp_password: null })
    .eq('email', email)

  res.status(200).json({ ok: true })
}
