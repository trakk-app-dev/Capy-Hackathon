import Anthropic from '@anthropic-ai/sdk';

export type CommitmentDraft = {
  title: string;
  description: string;
  verificationMethod: 'photo' | 'text' | 'both';
};

type ChatMsg = { role: 'user' | 'assistant'; content: string };

function mockRefine(draft: CommitmentDraft, lastUser: string) {
  const note = lastUser.slice(0, 120);
  return {
    assistantMessage: `Got it — I nudged the criteria so it fits what you said. (${note ? 'You mentioned: ' + note : 'Thanks for the feedback!'})`,
    draft: {
      ...draft,
      description:
        draft.description +
        (note ? ` Refinement: address "${note.slice(0, 80)}${note.length > 80 ? '…' : ''}"` : ''),
    },
  };
}

function sanitizeDraft(raw: Record<string, unknown>, fallback: CommitmentDraft): CommitmentDraft {
  const vm = raw.verificationMethod;
  return {
    title: typeof raw.title === 'string' && raw.title ? raw.title : fallback.title,
    description:
      typeof raw.description === 'string' && raw.description ? raw.description : fallback.description,
    verificationMethod:
      vm === 'photo' || vm === 'text' || vm === 'both' ? vm : fallback.verificationMethod,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const draft = body.draft as CommitmentDraft | undefined;
    const messages = body.messages as ChatMsg[] | undefined;

    if (!draft || typeof draft.title !== 'string' || typeof draft.description !== 'string') {
      return Response.json({ error: 'Invalid draft' }, { status: 400 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages required' }, { status: 400 });
    }
    if (messages.length > 20) {
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
      system: `You are the Capy Teacher — a nerdy, encouraging capybara. The student is refining their LONG-TERM GOAL criteria (title + what counts as done + proof type).

CURRENT DRAFT (JSON):
${JSON.stringify(draft, null, 2)}

CONVERSATION:
${convo}

Update the draft based ONLY on the student's feedback. Keep stakes (XP) unchanged — do not invent xpReward/xpPenalty.

Respond in JSON ONLY (no markdown):
{
  "assistantMessage": "1-3 sentences, warm, specific to what they asked",
  "title": "string",
  "description": "verifiable criteria 2-4 sentences",
  "verificationMethod": "photo" | "text" | "both"
}`,
      messages: [{ role: 'user', content: 'Apply the latest student message and return JSON.' }],
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
          : 'Updated the plan — take a look.';
      const next = sanitizeDraft(parsed, draft);
      return Response.json({ assistantMessage, draft: next });
    } catch {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        const assistantMessage =
          typeof parsed.assistantMessage === 'string' ? parsed.assistantMessage : 'Here’s an update.';
        return Response.json({
          assistantMessage,
          draft: sanitizeDraft(parsed, draft),
        });
      }
      return Response.json({ error: 'Parse error' }, { status: 500 });
    }
  } catch (e) {
    console.error('commitments/refine', e);
    return Response.json({ error: 'Refine failed' }, { status: 500 });
  }
}
