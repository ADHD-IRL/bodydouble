import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users
    const users = await base44.asServiceRole.entities.User.list();

    for (const user of users) {
      // Get their active inbox/today tasks
      const tasks = await base44.asServiceRole.entities.Task.filter({
        created_by: user.email,
        status: ["inbox", "today", "paused"],
      });

      if (tasks.length === 0) continue;

      // Pick the smallest / most doable task using LLM
      const taskTitles = tasks.slice(0, 10).map((t, i) => {
        const tags = [
          t.energy_required && `energy:${t.energy_required}`,
          t.emotional_load && `load:${t.emotional_load}`,
        ].filter(Boolean).join(", ");
        return `${i + 1}. ${t.title}${tags ? ` (${tags})` : ""}`;
      }).join("\n");

      const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a gentle ADHD coach helping someone start their day without feeling overwhelmed.
Here are their pending tasks:
${taskTitles}

Pick the ONE task that feels most approachable right now — preferably low energy and low emotional load.
Write a short, warm morning message (2 sentences max) encouraging them to just start that one task.
Do NOT list all tasks. Just focus on the one. Sound like a caring friend, not a productivity app.`,
      });

      const message = typeof response === "string" ? response : response?.text || `Good morning! Pick one small thing from your list today — you don't have to do it all.`;

      // Save as a notification for the user
      await base44.asServiceRole.entities.Notification.create({
        title: "Good morning ☀️",
        message,
        type: "nudge",
        read: false,
        created_by: user.email,
      });
    }

    return Response.json({ ok: true, users_notified: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});