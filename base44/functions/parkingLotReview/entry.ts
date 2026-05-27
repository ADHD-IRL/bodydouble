import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.list();

    for (const user of users) {
      const parked = await base44.asServiceRole.entities.ParkedThought.filter({
        created_by: user.email,
        reviewed: false,
      });

      if (parked.length === 0) continue;

      const count = parked.length;
      const previews = parked.slice(0, 3).map(p => `"${p.text}"`).join(", ");

      const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a gentle ADHD coach. Someone has ${count} unreviewed thought${count > 1 ? "s" : ""} in their Parking Lot: ${previews}${count > 3 ? ` and ${count - 3} more` : ""}.

Write a warm, brief reminder (2 sentences max) encouraging them to take 2 minutes to glance at their Parking Lot and decide: should any of these become a real task, or can they be let go? 
Sound like a caring friend. Keep it light — no pressure.`,
      });

      const message = typeof response === "string" ? response : response?.text ||
        `You've got ${count} thought${count > 1 ? "s" : ""} parked. Take 2 minutes to decide — task, keep, or clear?`;

      await base44.asServiceRole.entities.Notification.create({
        title: "Parking Lot check-in 🅿️",
        message,
        type: "reminder",
        read: false,
        created_by: user.email,
      });
    }

    return Response.json({ ok: true, users_notified: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});