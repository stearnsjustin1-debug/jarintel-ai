import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { problem, currentTools, email, nameOrg, fileName, fileData, fileType } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  const orgName = nameOrg ? nameOrg.split('·').pop()?.trim() || nameOrg : 'Unknown'

  const attachments = []
  if (fileData && fileName) {
    const base64 = fileData.replace(/^data:[^;]+;base64,/, '')
    attachments.push({
      filename: fileName,
      content: base64,
    })
  }

  try {
    await resend.emails.send({
      from: 'JAR Intelligence <noreply@jarintel.com>',
      to: 'justin@jarintel.ai',
      subject: `New Solution Request — ${orgName}`,
      attachments,
      html: `
        <div style="font-family: monospace; background: #000; color: #bbb; padding: 32px; max-width: 600px;">
          <div style="color: #fff; font-size: 16px; font-weight: bold; margin-bottom: 4px;">JAR Intelligence</div>
          <div style="color: #666; font-size: 11px; margin-bottom: 24px;">New Custom Solution Request</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; color: #888; width: 160px; font-size: 12px; vertical-align: top; border-top: 0.5px solid #1a1a1a;">Name / Org</td><td style="padding: 10px 0; color: #fff; font-size: 12px; border-top: 0.5px solid #1a1a1a;">${nameOrg || '—'}</td></tr>
            <tr><td style="padding: 10px 0; color: #888; font-size: 12px; vertical-align: top; border-top: 0.5px solid #1a1a1a;">Email</td><td style="padding: 10px 0; color: #fff; font-size: 12px; border-top: 0.5px solid #1a1a1a;">${email}</td></tr>
            <tr><td style="padding: 10px 0; color: #888; font-size: 12px; vertical-align: top; border-top: 0.5px solid #1a1a1a;">Currently Using</td><td style="padding: 10px 0; color: #fff; font-size: 12px; border-top: 0.5px solid #1a1a1a;">${currentTools || '—'}</td></tr>
            <tr><td style="padding: 10px 0; color: #888; font-size: 12px; vertical-align: top; border-top: 0.5px solid #1a1a1a;">Attachment</td><td style="padding: 10px 0; color: #fff; font-size: 12px; border-top: 0.5px solid #1a1a1a;">${fileName || 'None'}</td></tr>
            <tr><td style="padding: 10px 0; color: #888; font-size: 12px; vertical-align: top; border-top: 0.5px solid #1a1a1a;">Problem</td><td style="padding: 10px 0; color: #fff; font-size: 12px; border-top: 0.5px solid #1a1a1a; white-space: pre-wrap;">${problem || '—'}</td></tr>
          </table>
        </div>
      `,
    })
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Resend solutions error:', err)
    res.status(500).json({ error: 'Failed to send request. Please try again.' })
  }
}
