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
    to: 'justin@jarintel.ai',
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

  // Upsert profile — insert on first request, update on re-submission.
  // Resets approved=false and stores a fresh temp_password each time.
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(
      { email, full_name, agency, role, approved: false, temp_password: password },
      { onConflict: 'email' }
    )

  if (profileError) {
    console.error('Access request profile error:', profileError)
    return res.status(500).json({ error: 'Failed to submit request. Please try again.' })
  }

  // Create the Supabase auth user with email pre-confirmed
  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    const isEmailExists =
      createError.code === 'email_exists' ||
      createError.message?.toLowerCase().includes('already been registered') ||
      createError.message?.toLowerCase().includes('already registered')

    if (isEmailExists) {
      // User exists in auth — find them by email and update their password.
      // supabase-js admin API has no getUserByEmail, so we list and filter.
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000,
      })
      if (listError) {
        console.error('Auth listUsers error:', listError)
      } else {
        const existing = listData?.users?.find(u => u.email === email)
        if (existing) {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existing.id,
            { password }
          )
          if (updateError) console.error('Auth user password update error:', updateError)
        } else {
          console.error('email_exists but user not found in listUsers for:', email)
        }
      }
    } else {
      // Non-email-exists error — log but don't fail. Profile is saved.
      console.error('Auth user creation error:', createError)
    }
  }

  // Non-blocking admin notification
  if (process.env.RESEND_API_KEY) {
    sendNotification({ full_name, agency, email, role }).catch(err =>
      console.error('Resend notification error:', err)
    )
  }

  res.status(200).json({ ok: true })
}
