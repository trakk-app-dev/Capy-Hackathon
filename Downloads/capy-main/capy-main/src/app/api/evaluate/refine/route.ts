import Anthropic from '@anthropic-ai/sdk';

export type EvaluateDraft = {
  taskDescription: string;
  proofGuidance: string;
  isScreenshottable: boolean;
};

type ChatMsg = { role: 'user' | 'assistant'; content: string };

function mockRefine(draft: EvaluateDraft, lastUser: string) {
  const note = lastUser.slice(0, 100);
  return {
    assistantMessage: note
      ? `Adjusted — I tuned the task line and proof tip around: "${note.slice(0, 60)}…"`
      : 'Sure — I tweaked the wording so it matches better.',
    draft: {
      ...draft,
      taskDescription: draft.taskDescription + (note ? ` (Per your note: ${note.slice(0, 60)})` : ''),
    },
  };
}

function sanitizeDraft(raw: Record<string, unknown>, fallback: EvaluateDraft): EvaluateDraft {
  return {
    taskDescription:
      typeof raw.taskDescription === 'string' && raw.taskDescription
        ? raw.taskDescription
        : fallback.taskDescription,
    proofGuidance:
      typeof raw.proofGuidance === 'string' && raw.proofGuidance
        ? raw.proofGuidance
        : fallback.proofGuidance,
    isScreenshottable:
      typeof raw.isScreenshottable === 'boolean' ? raw.isScreenshottable : fallback.isScreenshottable,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const draft = body.draft as EvaluateDraft | undefined;
    const messages = body.messages as ChatMsg[] | undefined;

    if (!draft || typeof draft.taskDescription !== 'string') {
      return Response.json({ error: 'Invalid draft' }, { status: 400 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages required' }, { status: 400 });
    }
    if (messages.length > 24) {
      return Response.json({ error: 'Too many messages' }, { status: 400 });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser?.content?.trim()) {
      return Response.json({ error: 'Last user message required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      await new Promise((r) => setTimeout(r, 400));
      return Response.json(mockRefine(draft, lastUser.content.trim()));
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const convo = messages
      .map((m) => `${m.role === 'user' ? 'Student' : 'Capy'}: ${m.content}`)
      .join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: `You are the Capy Teacher. The student is refining their FOCUS SESSION plan before they start the timer.

CURRENT DRAFT:
${JSON.stringify(draft, null, 2)}

CONVERSATION:
${convo}

Update ONLY what they need for this sprint: taskDescription (what they must complete), proofGuidance (what to submit), isScreenshottable.

Respond JSON ONLY:
{
  "assistantMessage": "1-3 sentences",
  "taskDescription": "string",
  "proofGuidance": "string",
  "isScreenshottable": true/false
}`,
      messages: [{ role: 'user', content: 'Apply the latest student message. Return JSON only.' }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return Response.json({ error: 'No response' }, { status: 500 });
    }

    try {
      const parsed = JSON.parse(textBlock.text) as Record<string, unknown>;
      const assistantMessage =
        typeof parsed.assistantMessage === 'string' && parsed.assistantMessage
          ? parsed.assistantMessage
          : 'Updated your plan.';
      return Response.json({
        assistantMessage,
        draft: sanitizeDraft(parsed, draft),
      });
    } catch {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        return Response.json({
          assistantMessage:
            typeof parsed.assistantMessage === 'string' ? parsed.assistantMessage : 'Here you go.',
          draft: sanitizeDraft(parsed, draft),
        });
      }
      return Response.json({ error: 'Parse error' }, { status: 500 });
    }
  } catch (e) {
    console.error('evaluate/refine', e);
    return Response.json({ error: 'Refine failed' }, { status: 500 });
  }
}
