import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { task_title, category } = await req.json();
    if (!task_title) return Response.json({ error: 'task_title is required' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You help people with ADHD and executive-function challenges break large tasks into tiny, concrete first actions.

Task: "${task_title}"
Category: ${category || 'general'}

Break this task into 4–6 very small, specific, physical next actions. Each step should take 1–5 minutes max.
Make each step feel easy and non-threatening. Use simple, direct language.

Examples of good tiny actions:
- "Open the dishwasher door"
- "Pick up one dish from the sink"
- "Click the link to the tax portal"
- "Open a new email draft"

Return ONLY valid JSON: { "tiny_actions": ["step 1", "step 2", ...] }`,
      response_json_schema: {
        type: "object",
        properties: {
          tiny_actions: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json({ tiny_actions: result.tiny_actions || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});