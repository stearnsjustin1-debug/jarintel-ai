import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { fullName, agency, email, role, useCase } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'JAR Intelligence <onboarding@resend.dev>',
        to: 'justin@jarintel.ai',
        subject: `Video Intelligence Demo Request — ${agency || email}`,
        html: `
          <div style="font-family: monospace; background: #000; color: #bbb; padding: 32px; max-width: 600px;">
            <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 4px;">JAR Intelligence</div>
            <div style="color: #666; font-size: 11px; margin-bottom: 24px;">Video Intelligence Demo Request — Powered by AIS</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #888; width: 120px; font-size: 12px; vertical-align: top;">Name</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${fullName || '—'}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 12px; vertical-align: top;">Agency</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${agency || '—'}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 12px; vertical-align: top;">Email</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 12px; vertical-align: top;">Role</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${role || '—'}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 12px; vertical-align: top;">Use Case</td><td style="padding: 8px 0; color: #fff; font-size: 12px; white-space: pre-wrap;">${useCase || '—'}</td></tr>
            </table>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #222; color: #444; font-size: 11px;">
              Sent from jarintel.ai · Video Intelligence page
            </div>
          </div>
        `,
      })
    } catch (err) {
      console.error('Resend error:', err)
      return res.status(500).json({ error: 'Failed to send request. Please try again.' })
    }
  }

  res.status(200).json({ ok: true })
}
