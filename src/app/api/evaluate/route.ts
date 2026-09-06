import Anthropic from '@anthropic-ai/sdk';
import { CAPY_MODEL, LEGACY_MODEL_OPTIONS } from '@/lib/model';

// ─── Mock fallback (used when no API key is set) ──────────────────
function mockEvaluate(taskTitle: string, timeEstimate: number) {
  // Scale XP based on time: short tasks get less, long tasks get more
  const minutes = Math.round(timeEstimate / 60);
  const xpReward = Math.min(150, Math.max(30, Math.round(minutes * 1.5 + 30)));
  const xpPenalty = -Math.round(xpReward * 0.2);

  return {
    xpReward,
    xpPenalty,
    taskDescription: `Complete "${taskTitle}" in full. Show clear, organized work that demonstrates you engaged with the material and met the task requirements.`,
    proofGuidance: `Take a screenshot or photo of your completed "${taskTitle}" — a final result, submission confirmation, or your finished work clearly visible.`,
    isScreenshottable: true,
    timeFlag: null,
    needsMoreContext: false,
    contextQuestion: null,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskTitle, contextText, contextImageUrls, timeEstimate } = body;

    // Helper: validate and fill defaults for AI response
    const sanitizeResult = (raw: Record<string, unknown>, fallbackTitle: string) => ({
      xpReward: typeof raw.xpReward === 'number' ? raw.xpReward : 50,
      xpPenalty: typeof raw.xpPenalty === 'number' ? raw.xpPenalty : -10,
      taskDescription: typeof raw.taskDescription === 'string' && raw.taskDescription ? raw.taskDescription : `Complete "${fallbackTitle}" and submit proof of your work.`,
      proofGuidance: typeof raw.proofGuidance === 'string' && raw.proofGuidance ? raw.proofGuidance : 'Submit a screenshot or photo of your completed work.',
      isScreenshottable: typeof raw.isScreenshottable === 'boolean' ? raw.isScreenshottable : true,
      timeFlag: typeof raw.timeFlag === 'string' ? raw.timeFlag : null,
      needsMoreContext: typeof raw.needsMoreContext === 'boolean' ? raw.needsMoreContext : false,
      contextQuestion: typeof raw.contextQuestion === 'string' ? raw.contextQuestion : null,
    });

    if (!taskTitle) {
      return Response.json({ error: 'Task title is required' }, { status: 400 });
    }

    // ── No API key → return dynamic mock ─────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      // Simulate a short processing delay so the scanning animation feels real
      await new Promise((r) => setTimeout(r, 800));
      return Response.json(mockEvaluate(taskTitle, timeEstimate || 1800));
    }

    // ── Real Claude API call ──────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

    contentBlocks.push({
      type: 'text',
      text: `Task title: ${taskTitle}\nContext: ${contextText || 'No additional context provided.'}\nTime estimate: ${Math.round(timeEstimate / 60)} minutes`,
    });

    if (contextImageUrls && contextImageUrls.length > 0) {
      for (const url of contextImageUrls) {
        try {
          const imageResponse = await fetch(url);
          const arrayBuffer = await imageResponse.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
          const mediaType = contentType.split(';')[0].trim() as
            | 'image/jpeg'
            | 'image/png'
            | 'image/gif'
            | 'image/webp';

          contentBlocks.push({
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          });
        } catch (imgError) {
          console.error('Failed to fetch context image:', imgError);
        }
      }
    }

    const message = await anthropic.messages.create({
      model: CAPY_MODEL,
      ...LEGACY_MODEL_OPTIONS,
      system: `You are the Capy Teacher — a strict but encouraging capybara tutor who holds students accountable.

CRITICAL RULES FOR EVALUATION:
1. You MUST understand the FULL SCOPE before setting XP. If a student says "AP Bio multiple choice" but you don't know how many questions, you cannot properly evaluate.
2. Look at ANY images provided CAREFULLY. If a student uploads a screenshot showing "0 of 9 questions answered", you know there are 9 questions. Extract every detail you can.
3. If the task is vague or you lack context, set "needsMoreContext" to true and write a specific follow-up question in "contextQuestion". Examples:
   - "AP Bio homework" → "How many questions? Is this a full chapter or a specific section?"
   - "Math assignment" → "What chapter/topic? How many problems?"
   - "Essay" → "How long does it need to be? What's the prompt?"
4. For DIGITAL assignments (online quizzes, computer-based tests, apps like AP Classroom, Khan Academy, Quizlet):
   - Set isScreenshottable to true BUT note in proofGuidance what would count as valid proof
   - Be FLEXIBLE about proof — completion screens, score pages, submission confirmations, even the app showing "completed" status ALL count
   - If the platform doesn't show scores immediately, say so in proofGuidance
5. Scale XP based on ACTUAL scope, not just topic difficulty. 9 multiple choice questions ≠ a full research paper.

Respond in JSON ONLY (no markdown, no backticks):
{
  "xpReward": number 30-150 based on actual task scope and difficulty,
  "xpPenalty": negative number roughly 20% of xpReward,
  "taskDescription": "Specific description of what they need to complete",
  "proofGuidance": "What counts as valid proof for THIS specific task (be generous for digital assignments)",
  "isScreenshottable": true/false,
  "timeFlag": null or string if time seems wrong,
  "needsMoreContext": true/false,
  "contextQuestion": null or "specific question to ask" if needsMoreContext is true
}`,
      messages: [{ role: 'user', content: contentBlocks }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return Response.json({ error: 'No text response from AI' }, { status: 500 });
    }

    try {
      const result = JSON.parse(textBlock.text);
      return Response.json(sanitizeResult(result, taskTitle));
    } catch {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return Response.json(sanitizeResult(JSON.parse(jsonMatch[0]), taskTitle));
      }
      return Response.json({ error: 'Failed to parse AI response', raw: textBlock.text }, { status: 500 });
    }
  } catch (error) {
    console.error('Evaluate API error:', error);
    return Response.json({ error: 'Failed to evaluate task. Please try again.' }, { status: 500 });
  }
}
