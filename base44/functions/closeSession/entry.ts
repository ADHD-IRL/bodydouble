import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { session_outcome, task_title, session_minutes, tiny_action } = await req.json();

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a warm companion helping someone with ADHD close a focus session with kindness and no shame.

Task: "${task_title}"
Session length: ${session_minutes} minutes
What happened: "${session_outcome}"
Last tiny action they were on: "${tiny_action || 'not specified'}"

Write a short, warm closing message (1–2 sentences) and suggest a next tiny step.
Use encouraging language. Never frame unfinished work as failure.

Outcome meanings:
- "finished" → Celebrate genuinely, warmly
- "made_progress" → Acknowledge progress as real and meaningful
- "started_counts" → Affirm that starting is the hardest part
- "learned_next_step" → Celebrate the clarity they gained
- "carry_forward" → Frame carrying forward as brave, not shameful
- "not_today" → Be gentle. Sometimes rest is the right choice.

Return ONLY valid JSON: { "message": "...", "next_step": "..." }
next_step should be a concrete tiny action for next time (or null if outcome is "not_today").`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          next_step: { type: "string" }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});