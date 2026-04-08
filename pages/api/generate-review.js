import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '../../lib/supabase-admin'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function logUsage(token, reportContent) {
  console.log('[logUsage] performance-review: starting')
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError) { console.error('[logUsage] getUser error:', userError); return }
  if (!user) { console.warn('[logUsage] no user for token'); return }
  console.log('[logUsage] user:', user.email)

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', user.email)
    .single()

  if (profileError) { console.error('[logUsage] profile fetch error:', profileError); return }
  if (!profile) { console.warn('[logUsage] no profile for email:', user.email); return }
  console.log('[logUsage] profile id:', profile.id)

  const { error: insertError } = await supabaseAdmin.from('usage_logs').insert({
    user_id: profile.id,
    tool: 'performance-review',
    report_type: 'performance-review',
    report_content: reportContent || null,
    created_at: new Date().toISOString(),
  })
  if (insertError) {
    console.error('[logUsage] insert error:', insertError)
  } else {
    console.log('[logUsage] performance-review: insert ok')
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { supervisorNotes, evalCategories, evalPeriod, nameMap } = req.body

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
      system: `You are an expert law enforcement HR specialist and performance review writer with 20 years of experience across municipal, county, and federal law enforcement agencies. Your role is to generate professional, thorough, and legally sound annual performance evaluations for sworn and civilian law enforcement personnel using Brian's PMP rating scale.

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

    // Log usage non-blocking — a logging failure must not affect the response
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      logUsage(authHeader.slice(7), message.content[0].text).catch(err => console.error('Usage log error:', err))
    }

    res.status(200).json({ review: message.content[0].text })
  } catch (err) {
    console.error('Anthropic API error:', err)
    res.status(500).json({ error: 'Failed to generate review. Check your API key configuration.' })
  }
}
