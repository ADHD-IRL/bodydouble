import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { stuck_type, task_title, current_tiny_action } = await req.json();

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a warm, calm companion helping someone with ADHD who is stuck on a task. Never be judgmental. Be brief and kind.

Task: "${task_title}"
Current step they were on: "${current_tiny_action || 'not specified'}"
How they are stuck: "${stuck_type}"

Based on their stuck type, give one gentle, specific suggestion to help them move forward.
Keep it to 1–2 short sentences. Do not lecture. Do not list multiple options.

Stuck type meanings:
- "no_next_step" → Help them identify the tiniest possible physical action
- "too_big" → Suggest making the current step even smaller
- "bored" → Suggest a 2-minute version or switching the approach
- "anxious" → Offer grounding ("You don't have to finish, just begin")
- "distracted" → Acknowledge it kindly, suggest restarting the timer
- "tired" → Suggest a 2-minute break or the easiest possible action
- "need_reset" → Suggest stepping away briefly and coming back

Return ONLY valid JSON: { "suggestion": "...", "action_label": "..." }
action_label should be one of: "Restart timer", "Take a break", "Make it smaller", "Try 2 minutes", "Just begin"`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestion: { type: "string" },
          action_label: { type: "string" }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});