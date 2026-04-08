import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, organization, email, location, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' })
  }

  try {
    await resend.emails.send({
      from: 'JAR Intelligence <noreply@jarintel.com>',
      to: 'justin@jarintel.ai',
      subject: 'New Contact — JAR Intel',
      html: `
        <div style="font-family: monospace; background: #000; color: #bbb; padding: 32px; max-width: 560px;">
          <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 4px;">JAR Intelligence</div>
          <div style="color: #666; font-size: 11px; margin-bottom: 24px;">New Contact Form Submission</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; width: 120px; font-size: 12px; vertical-align: top;">Name</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 12px; vertical-align: top;">Organization</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${organization || '—'}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 12px; vertical-align: top;">Email</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 12px; vertical-align: top;">Location</td><td style="padding: 8px 0; color: #fff; font-size: 12px;">${location || '—'}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 12px; vertical-align: top;">Message</td><td style="padding: 8px 0; color: #fff; font-size: 12px; white-space: pre-wrap;">${message}</td></tr>
          </table>
        </div>
      `,
    })
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Resend contact error:', err)
    res.status(500).json({ error: 'Failed to send message. Please try again.' })
  }
}
