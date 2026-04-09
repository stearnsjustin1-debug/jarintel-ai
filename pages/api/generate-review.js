import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '../../lib/supabase-admin'
import { Resend } from 'resend'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// SQL to run in Supabase:
// ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS input_data text;
// ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS agency text;
// ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS tool_version text;

async function logAndNotify(userEmail, agency, evalPeriod, supervisorNotes, nameMap, evalCategories, reportContent) {
  const inputData = JSON.stringify({ evalPeriod, nameMap, evalCategories, supervisorNotes, agency })

  const { error: insertError } = await supabaseAdmin.from('usage_logs').insert({
    tool: 'performance-review',
    report_type: 'performance-review',
    user_email: userEmail || null,
    agency: agency || null,
    input_data: inputData,
    report_content: reportContent || null,
    created_at: new Date().toISOString(),
  })
  if (insertError) console.error('[logAndNotify] insert error:', insertError)
  else console.log('[logAndNotify] performance-review: insert ok')

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const dateLabel = new Date().toISOString().split('T')[0]
      const outputPreview = (reportContent || '').slice(0, 300).replace(/</g, '&lt;')
      const employeeCount = nameMap?.length ?? 0
      const categoryList = (evalCategories || '').split('\n').filter(Boolean).map(c => `<li style="font-size:11px;color:#bbb;padding:2px 0;">${c.replace(/</g, '&lt;')}</li>`).join('')

      await resend.emails.send({
        from: 'JAR Intelligence <noreply@jarintel.com>',
        to: 'justin@jarintel.ai',
        subject: `Review Generated — ${userEmail || 'unknown'} — ${dateLabel}`,
        html: `
          <div style="font-family:monospace;background:#000;color:#bbb;padding:32px;max-width:600px;">
            <div style="color:#fff;font-size:15px;font-weight:bold;margin-bottom:4px;">JAR Intelligence</div>
            <div style="color:#666;font-size:11px;margin-bottom:20px;">Performance Review Engine</div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:6px 0;color:#888;width:140px;font-size:12px;">User Email</td><td style="padding:6px 0;color:#fff;font-size:12px;">${userEmail || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888;font-size:12px;">Agency</td><td style="padding:6px 0;color:#fff;font-size:12px;">${agency || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888;font-size:12px;">Eval Period</td><td style="padding:6px 0;color:#fff;font-size:12px;">${evalPeriod || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888;font-size:12px;">Employees</td><td style="padding:6px 0;color:#fff;font-size:12px;">${employeeCount}</td></tr>
            </table>
            <div style="margin-bottom:16px;">
              <div style="color:#888;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">Categories Selected</div>
              <ul style="margin:0;padding-left:16px;">${categoryList || '<li style="color:#666;font-size:11px;">None</li>'}</ul>
            </div>
            <div style="margin-bottom:16px;">
              <div style="color:#888;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">Output Preview</div>
              <pre style="font-size:11px;color:#bbb;white-space:pre-wrap;word-break:break-word;margin:0;background:#080808;padding:14px;">${outputPreview}${reportContent && reportContent.length > 300 ? '\n...' : ''}</pre>
            </div>
            <div style="color:#555;font-size:11px;font-style:italic;">Full report saved in Supabase usage_logs.</div>
            <div style="margin-top:20px;padding-top:14px;border-top:1px solid #1a1a1a;color:#444;font-size:10px;">JAR Intelligence · jarintel.ai</div>
          </div>
        `,
      })
    } catch (err) {
      console.error('[logAndNotify] Resend error:', err)
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { supervisorNotes, evalCategories, evalPeriod, nameMap, userEmail, agency } = req.body

  if (!supervisorNotes || !evalPeriod) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  const nameMapDisplay = nameMap && nameMap.length > 0
    ? `\nANONYMIZATION MAP (for your reference — use these designations only):\n${nameMap.map((entry, i) => `  ${entry} → Employee ${String.fromCharCode(65 + i)}`).join('\n')}\n`
    : ''

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: `You are an expert law enforcement HR specialist and performance review writer with 20 years of experience across municipal, county, and federal law enforcement agencies. Your role is to generate professional, thorough, and legally sound annual performance evaluations for sworn and civilian law enforcement personnel using the PMP rating scale.

RATING SCALE:
1 = Unacceptable — Performance fails to meet minimum standards; immediate improvement required.
2 = Approaching Standard — Performance partially meets expectations; development needed.
3 = Meets Standard — Performance consistently meets all established expectations.
4 = Above Standard — Performance frequently exceeds expectations; demonstrates initiative and strong skill.
5 = Exemplary — Performance consistently and significantly exceeds all expectations; serves as a model for peers.

Core directives:
- Use formal, objective language appropriate for official HR documentation
- For EACH evaluation category, output a section formatted exactly as:
    [CATEGORY NAME IN ALL CAPS]
    Rating: [number] — [label]
    [2–3 sentences of narrative supporting the rating, referencing specific behaviors or patterns from the supervisor notes]
- Reference specific behaviors, incidents, and patterns from the supervisor notes without embellishment or invention
- Refer to employees only by their anonymized designation (Employee A, Employee B, etc.) — never infer, reconstruct, or reference real names
- Use language consistent with law enforcement HR standards: professional standards, use of force policy, community engagement, officer safety, chain of command, tactical proficiency, report writing quality, court preparedness, etc.
- After all category sections, output these three additional sections:

    OVERALL RATING
    Rating: [1–5] — [label]
    [2–3 sentence overall performance summary]

    GROWTH OPPORTUNITIES
    [2–4 specific, constructive areas for improvement tied to evidence from the notes]

    PROFESSIONAL DEVELOPMENT GOALS
    [2–4 specific, actionable development goals for the upcoming evaluation period]

- Output must be ready to paste directly into an official evaluation form — no preamble, no meta-commentary, no markdown formatting other than ALL CAPS section headers`,
      messages: [
        {
          role: 'user',
          content: `Generate a professional law enforcement performance evaluation using the following inputs.

EVALUATION PERIOD: ${evalPeriod}
${nameMapDisplay}
EVALUATION CATEGORIES (generate a rated section for each):
${evalCategories || 'Professional Knowledge and Knowledge Application\nAccepts Supervision and Direction\nProfessional Growth and Development\nWork Quality\nSelf-Motivation\nWritten Communications\nInterpersonal Communication with Agency Personnel\nInterpersonal Communication with the Public'}

SUPERVISOR NOTES (anonymized):
${supervisorNotes}

Write the full evaluation now. For each category produce the rating number, rating label, and 2–3 sentences of narrative. End with Overall Rating, Growth Opportunities, and Professional Development Goals sections.`
        }
      ]
    })

    // Log and notify non-blocking — failures must not affect the response
    logAndNotify(userEmail, agency, evalPeriod, supervisorNotes, nameMap, evalCategories, message.content[0].text)
      .catch(err => console.error('logAndNotify error:', err))

    res.status(200).json({ review: message.content[0].text })
  } catch (err) {
    console.error('Anthropic API error:', err)
    res.status(500).json({ error: 'Failed to generate review. Check your API key configuration.' })
  }
}
