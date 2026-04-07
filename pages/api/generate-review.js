import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '../../lib/supabase-admin'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function logUsage(token) {
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', user.email)
    .single()

  if (profile) {
    await supabaseAdmin.from('usage_logs').insert({
      user_id: profile.id,
      tool: 'performance-review',
    })
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
      system: `You are an expert law enforcement HR specialist and performance review writer with 20 years of experience across municipal, county, and federal law enforcement agencies. Your role is to generate professional, thorough, and legally sound annual performance evaluations for sworn and civilian law enforcement personnel.

Core directives:
- Use formal, objective language appropriate for official HR documentation
- Structure the review with clearly labeled sections matching the provided evaluation categories
- Reference specific behaviors, incidents, and patterns from the supervisor notes without embellishment or invention
- Refer to employees only by their anonymized designation (Employee A, Employee B, etc.) — never infer, reconstruct, or reference real names
- Balance recognition of demonstrated strengths with constructive, specific areas for improvement
- Use language consistent with law enforcement HR standards: professional standards, use of force policy, community engagement, officer safety, chain of command, tactical proficiency, report writing quality, court preparedness, etc.
- Each category section should be 2–4 sentences: a performance assessment sentence, supporting evidence from notes, and a forward-looking statement
- Conclude with an overall summary paragraph and a recommended rating (Exceeds Expectations / Meets Expectations / Needs Improvement / Unsatisfactory)
- Output must be ready to paste directly into an official evaluation form — no preamble, no meta-commentary`,
      messages: [
        {
          role: 'user',
          content: `Generate a professional law enforcement performance evaluation using the following inputs.

EVALUATION PERIOD: ${evalPeriod}
${nameMapDisplay}
EVALUATION CATEGORIES:
${evalCategories || 'Use standard law enforcement categories: Job Knowledge, Officer Safety, Report Writing, Community Relations, Professionalism, Teamwork, Attendance & Reliability'}

SUPERVISOR NOTES (anonymized):
${supervisorNotes}

Write the full evaluation now, with a labeled section for each category followed by an Overall Summary and Recommended Rating.`
        }
      ]
    })

    // Log usage non-blocking — a logging failure must not affect the response
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      logUsage(authHeader.slice(7)).catch(err => console.error('Usage log error:', err))
    }

    res.status(200).json({ review: message.content[0].text })
  } catch (err) {
    console.error('Anthropic API error:', err)
    res.status(500).json({ error: 'Failed to generate review. Check your API key configuration.' })
  }
}
