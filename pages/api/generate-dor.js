import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '../../lib/supabase-admin'
import { Resend } from 'resend'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ALL_CATEGORIES = [
  'Acceptance of Feedback',
  'Attitude toward Police Work',
  'Integrity/Ethics',
  'Leadership',
  'General Appearance',
  'With Citizens/Community',
  'With Other Department Members',
  'Use of Map/GPS: Orientation/Response Time',
  'Driving Skill: Normal Conditions',
  'Driving Skill: Moderate/High Stress Conditions',
  'Routine Forms: Accuracy/Completeness',
  'Report Writing: Organization/Details/Use of Time',
  'Report Writing: Grammar/Spelling/Neatness',
  'Field Performance: Non-Stress Conditions',
  'Field Performance: Stress Conditions',
  'Investigative Skills',
  'Interview/Interrogation Skills',
  'Self-initiated Field Activity',
  'Officer Safety: General',
  'Officer Safety: Suspicious Persons/Suspects/Prisoners',
  'Control of Conflict: Voice Command',
  'Control of Conflict: Physical Skill',
  'Problem-solving Techniques/Decision-making',
  'Communications: Use of Codes/Procedures',
  'Radio: Listens and Comprehends',
  'Radio: Articulation of Transmissions',
  'Mobile Computer Terminal',
  'Time Management',
  'Department Policies and Procedures: Reflected in Field Performance',
  'Criminal Statutes: Reflected in Field Performance',
  'Criminal Procedure: Reflected in Field Performance',
]

// SQL to run in Supabase:
// ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS input_data text;
// ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS agency text;
// ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS tool_version text;

async function logAndNotify(userEmail, agency, shiftDate, phase, notes, dorJson) {
  const inputData = JSON.stringify({ shiftDate, phase, notes, agency })

  const { error } = await supabaseAdmin.from('usage_logs').insert({
    tool: 'fto-debrief',
    report_type: 'fto-debrief',
    user_email: userEmail || null,
    agency: agency || null,
    input_data: inputData,
    report_content: JSON.stringify(dorJson) || null,
    created_at: new Date().toISOString(),
  })
  if (error) console.error('[generate-dor] insert error:', error)

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const ts = new Date().toISOString()
      const dateLabel = ts.split('T')[0]

      const summaryPreview = (dorJson?.overallSummary || '').slice(0, 300).replace(/</g, '&lt;')

      await resend.emails.send({
        from: 'JAR Intelligence <noreply@jarintel.com>',
        to: 'justin@jarintel.ai',
        subject: `DOR Generated — ${userEmail || 'unknown'} — ${shiftDate || dateLabel}`,
        html: `
          <div style="font-family:monospace;background:#000;color:#bbb;padding:32px;max-width:600px;">
            <div style="color:#fff;font-size:15px;font-weight:bold;margin-bottom:4px;">JAR Intelligence</div>
            <div style="color:#666;font-size:11px;margin-bottom:20px;">FTO Debrief Assistant</div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:6px 0;color:#888;width:140px;font-size:12px;">User Email</td><td style="padding:6px 0;color:#fff;font-size:12px;">${userEmail || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888;font-size:12px;">Agency</td><td style="padding:6px 0;color:#fff;font-size:12px;">${agency || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888;font-size:12px;">Shift Date</td><td style="padding:6px 0;color:#fff;font-size:12px;">${shiftDate || '—'}</td></tr>
              <tr><td style="padding:6px 0;color:#888;font-size:12px;">Phase</td><td style="padding:6px 0;color:#fff;font-size:12px;">${phase || '—'}</td></tr>
            </table>
            <div style="margin-bottom:16px;">
              <div style="color:#888;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">Summary Preview</div>
              <pre style="font-size:11px;color:#bbb;white-space:pre-wrap;word-break:break-word;margin:0;background:#080808;padding:14px;">${summaryPreview}${dorJson?.overallSummary && dorJson.overallSummary.length > 300 ? '\n...' : ''}</pre>
            </div>
            <div style="color:#555;font-size:11px;font-style:italic;">Full report saved in Supabase usage_logs.</div>
            <div style="margin-top:20px;padding-top:14px;border-top:1px solid #1a1a1a;color:#444;font-size:10px;">JAR Intelligence · jarintel.ai</div>
          </div>
        `,
      })
    } catch (err) {
      console.error('[generate-dor] Resend error:', err)
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userEmail, traineeName, ftoName, shiftDate, phase, notes, agency } = req.body
  if (!notes) return res.status(400).json({ error: 'Shift notes are required.' })

  const categoriesJson = ALL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = { score: 3, narrative: 'No significant observations noted during this evaluation period.' }
    return acc
  }, {})

  const systemPrompt = `You are an expert Field Training Officer evaluator with 15 years of law enforcement training experience. Your job is to score a trainee's Daily Observation Report (DOR) based on FTO shift notes.

RATING SCALE:
1 = Unacceptable — Performance fails to meet minimum standards; immediate improvement required.
2 = Needs Improvement — Performance partially meets expectations; significant development needed.
3 = Acceptable — Performance meets basic expectations for this phase of training.
4 = Above Average — Performance exceeds expectations; trainee demonstrates strong initiative.
5 = Superior — Performance significantly exceeds all expectations; model behavior for the phase.

INSTRUCTIONS:
- Score each of the ${ALL_CATEGORIES.length} categories on a 1-5 scale based ONLY on the FTO notes provided.
- Write 1-2 sentences of specific, professional narrative for each category referencing the trainee's actual behavior.
- If a category is NOT mentioned in the notes, assign score 3 with narrative "No significant observations noted during this evaluation period."
- Refer to the trainee only as "Trainee A" and the FTO only as "FTO A" — never use real names.
- Write an overallSummary (2-3 sentences) and set recommendContinuation (true/false).
- Return ONLY valid JSON — no markdown, no code fences, no explanation.

REQUIRED JSON SHAPE:
{
  "categories": {
    "Acceptance of Feedback": { "score": 4, "narrative": "..." },
    ... (all ${ALL_CATEGORIES.length} categories)
  },
  "overallSummary": "...",
  "recommendContinuation": true
}

Category list you must include:
${ALL_CATEGORIES.join('\n')}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a complete DOR evaluation using these FTO shift notes.

SHIFT DATE: ${shiftDate || 'Not provided'}
TRAINING PHASE: ${phase || 'Not specified'}
TRAINEE: ${traineeName || 'Trainee A'}
FTO: ${ftoName || 'FTO A'}

FTO SHIFT NOTES:
${notes}

Return the JSON evaluation now.`,
        },
      ],
    })

    let raw = message.content[0].text.trim()
    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    let dorJson
    try {
      dorJson = JSON.parse(raw)
    } catch {
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' })
    }

    // Fill any missing categories with defaults
    for (const cat of ALL_CATEGORIES) {
      if (!dorJson.categories[cat]) {
        dorJson.categories[cat] = { score: 3, narrative: 'No significant observations noted during this evaluation period.' }
      }
    }

    logAndNotify(userEmail, agency, shiftDate, phase, notes, dorJson).catch(err =>
      console.error('[generate-dor] logAndNotify error:', err)
    )

    res.status(200).json({ dor: dorJson })
  } catch (err) {
    console.error('[generate-dor] Anthropic error:', err)
    res.status(500).json({ error: 'Failed to generate DOR. Please try again.' })
  }
}
