import Anthropic from '@anthropic-ai/sdk';
import { CAPY_MODEL, LEGACY_MODEL_OPTIONS } from '@/lib/model';

const VAGUE_PATTERNS = [
  /^(be|get|become|stay)\s+(more\s+)?(productive|better|healthy|fit|organized|focused)/i,
  /^(study|work|try)\s*(more|harder|better)?$/i,
  /^(do|finish)\s+(stuff|things|work|homework)$/i,
];

function mockRefine(userInput: string) {
  const trimmed = userInput.trim();

  if (trimmed.length < 10 || VAGUE_PATTERNS.some((p) => p.test(trimmed))) {
    return {
      rejected: true,
      reason: `"${trimmed}" is too vague for Capy to verify. Try being specific — what exactly will you finish, and what would the proof look like? For example: "Read chapter 5 of APUSH textbook and take notes" or "Clean my desk and organize all papers into folders."`,
    };
  }

  const words = trimmed.split(/\s+/).length;
  const xpReward = Math.min(150, Math.max(30, words * 8 + 20));
  const xpPenalty = -Math.round(xpReward * 0.2);

  return {
    rejected: false,
    title: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
    description: `Complete the following and submit photo proof: ${trimmed}. The proof should clearly show the finished result.`,
    verificationMethod: 'photo' as const,
    xpReward,
    xpPenalty,
  };
}

function sanitizeResult(raw: Record<string, unknown>, fallbackInput: string) {
  if (raw.rejected === true) {
    return {
      rejected: true,
      reason: typeof raw.reason === 'string' && raw.reason
        ? raw.reason
        : 'This commitment is too vague. Try adding specific details about what you will finish and how you can prove it.',
    };
  }

  return {
    rejected: false,
    title: typeof raw.title === 'string' && raw.title ? raw.title : fallbackInput,
    description: typeof raw.description === 'string' && raw.description
      ? raw.description
      : `Complete "${fallbackInput}" and submit proof.`,
    verificationMethod:
      raw.verificationMethod === 'photo'
        ? 'photo'
        : raw.verificationMethod === 'both' || raw.verificationMethod === 'text'
          ? 'both'
          : 'photo',
    xpReward: typeof raw.xpReward === 'number' ? raw.xpReward : 50,
    xpPenalty: typeof raw.xpPenalty === 'number' ? raw.xpPenalty : -10,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userInput, userDescription, deadline } = body;
    const extraContext =
      typeof userDescription === 'string' && userDescription.trim()
        ? `\n\nAdditional detail from the student:\n"${userDescription.trim()}"`
        : '';

    if (!userInput || typeof userInput !== 'string' || !userInput.trim()) {
      return Response.json({ error: 'Commitment description is required' }, { status: 400 });
    }

    if (!deadline) {
      return Response.json({ error: 'Deadline is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      await new Promise((r) => setTimeout(r, 800));
      return Response.json(mockRefine(userInput));
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: CAPY_MODEL,
      ...LEGACY_MODEL_OPTIONS,
      system: `You are the Capy Teacher — a strict but encouraging capybara tutor who holds students accountable with long-term commitments.

A student wants to set a goal with a deadline of: ${deadline}

YOUR JOB: Decide if this commitment is specific and verifiable. Then either REJECT it or REFINE it.

HARD REJECT if:
- The task is vague, unmeasurable, or unverifiable ("be productive", "study more", "work on stuff", "be healthier")
- There is no concrete deliverable or end state that can be proven
- The task is so broad it could mean anything ("do homework", "catch up on school")

When rejecting, suggest a SPECIFIC alternative they could commit to instead.

ACCEPT AND REFINE if:
- The task has a clear end state ("read chapter 5", "finish math problems 1-20", "clean my room", "write 500 words of my essay")
- You can describe what proof of completion would look like
- Prefer photo-verifiable commitments whenever possible. Use "photo" or "both" for verificationMethod.
- Do not use "text" alone unless a photo is genuinely impossible.

Respond in JSON ONLY (no markdown, no backticks):

If rejecting:
{
  "rejected": true,
  "reason": "Why this is too vague + a specific suggestion for what they could commit to instead"
}

If accepting:
{
  "rejected": false,
  "title": "Clear, concise title (max 60 chars)",
  "description": "Exact verifiable criteria — what must be done and what proof the AI will look for (2-3 sentences)",
  "verificationMethod": "photo" or "text" or "both",
  "xpReward": number 30-150 based on scope and difficulty,
  "xpPenalty": negative number roughly 20% of xpReward
}`,
      messages: [
        {
          role: 'user',
          content: `The student says: "${userInput.trim()}"${extraContext}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return Response.json({ error: 'No text response from AI' }, { status: 500 });
    }

    try {
      const result = JSON.parse(textBlock.text);
      return Response.json(sanitizeResult(result, userInput.trim()));
    } catch {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return Response.json(sanitizeResult(JSON.parse(jsonMatch[0]), userInput.trim()));
      }
      return Response.json({ error: 'Failed to parse AI response', raw: textBlock.text }, { status: 500 });
    }
  } catch (error) {
    console.error('Commitments API error:', error);
    return Response.json({ error: 'Failed to evaluate commitment. Please try again.' }, { status: 500 });
  }
}
