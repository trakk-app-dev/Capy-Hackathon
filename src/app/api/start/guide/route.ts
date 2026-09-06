import { GUIDANCE_PROMPT, GUIDANCE_VERSION } from '@/lib/start-prompts';
import {
  askJson,
  cleanMessages,
  cleanProposal,
  cleanText,
  cleanUrls,
  errorResponse,
  fetchImageBlocks,
  hasApiKey,
  messagesForModel,
  modelText,
  requireUser,
  StartError,
} from '@/lib/start-server';
import {
  START_DEFAULT_MINUTES,
  START_MAX_CONTEXT_IMAGES,
  START_MAX_CONVERSATION_CHARS,
  conversationChars,
  type FirstAction,
  type GuideResponse,
  type StartMessage,
} from '@/lib/start-types';

// Guidance turns can carry images and a thinking model; allow the call to finish.
export const maxDuration = 120;

// ─── Mock fallback (used when no API key is set) ──────────────────
// Keeps the flow walkable in dev. The step is built from the user's FIRST
// message (the task), never from a reply chip, and it never invents task
// specifics — no question numbers, documents, pages, or places. It labels
// itself so nobody mistakes it for guidance.
const ACTION_WORDS = /\b(open|write|answer|email|send|read|type|draft|list|fill|finish|text|call|reply|submit|outline)\b/i;

function mockGuide(messages: StartMessage[], hasImages: boolean): GuideResponse {
  const task = (messages.find((m) => m.role === 'user')?.text ?? '').trim();
  const askedBefore = messages.some((m) => m.role === 'assistant');
  const knownAction = ACTION_WORDS.test(task) || task.length >= 160;

  if (!askedBefore && !hasImages && !knownAction) {
    return {
      kind: 'ask',
      message: '(Mock mode) Is it open in front of you right now, or do we need to find it first?',
      contextSummary: task,
      options: ['It’s open', 'I need to find it', 'I know exactly what to do'],
      proposal: null,
      trace: null,
    };
  }

  const title = task.length > 60 ? `${task.slice(0, 60).trimEnd()}…` : task || 'Your first step';
  return {
    kind: 'propose',
    message: '(Mock mode) Let’s take one real attempt at exactly what you named, then check in.',
    contextSummary: task,
    options: [],
    proposal: {
      title,
      action: task || 'Make one real attempt at the task you described.',
      where: 'The Your work area in Capy, or wherever this task lives for you',
      enough: 'One real attempt at exactly what you named. It does not need to be right or finished.',
      evidenceInstructions: 'Paste the text you produced into the Your work area, or add a photo of it. I will check that it is an attempt at what you named.',
      minutes: START_DEFAULT_MINUTES,
    },
    trace: null,
  };
}

export async function POST(request: Request) {
  try {
    const uid = await requireUser(request);
    const body = (await request.json()) as Record<string, unknown>;

    const messages = cleanMessages(body.messages, uid);
    if (messages[messages.length - 1].role !== 'user') throw new StartError('INVALID_INPUT');
    if (conversationChars(messages) > START_MAX_CONVERSATION_CHARS) throw new StartError('CONVERSATION_TOO_LONG');
    const lastUser = messages[messages.length - 1];
    const contextImageUrls = cleanUrls(body.contextImageUrls, START_MAX_CONTEXT_IMAGES, uid);
    const taskContext = cleanText(body.contextSummary, 1500);
    const currentProposal: FirstAction | null =
      body.currentProposal && typeof body.currentProposal === 'object'
        ? cleanProposal(body.currentProposal)
        : null;

    const newImages = lastUser.imageUrls?.length ?? 0;
    const hasImages = contextImageUrls.length > 0 || newImages > 0;
    if (!lastUser.text && !hasImages) throw new StartError('INVALID_INPUT');

    // ── No API key → labelled mock ───────────────────────────────
    if (!hasApiKey()) {
      await new Promise((r) => setTimeout(r, 600));
      return Response.json(mockGuide(messages, hasImages));
    }

    // ── Real Claude call ─────────────────────────────────────────
    const { blocks, attached } = await fetchImageBlocks(contextImageUrls, 'Task material image');
    // The user just attached photos and said nothing else, but none could be
    // read: say so instead of letting the model guess at an image it never saw.
    if (newImages > 0 && attached === 0 && !lastUser.text) throw new StartError('IMAGE_UNREADABLE');

    const { parsed, meta } = await askJson(
      GUIDANCE_PROMPT,
      { messages: messagesForModel(messages), taskContext, currentProposal, imagesAvailableToYou: attached },
      blocks,
      'medium'
    );

    const kind = parsed.kind;
    if (kind !== 'ask' && kind !== 'propose') throw new StartError('INVALID_MODEL_OUTPUT');
    const message = modelText(parsed.message, 1600);
    if (!message) throw new StartError('INVALID_MODEL_OUTPUT');
    const contextSummary = modelText(parsed.contextSummary, 1500) || taskContext;

    const proposal = kind === 'propose' ? cleanProposal(parsed.proposal) : null;
    const options =
      kind === 'ask' && Array.isArray(parsed.options)
        ? parsed.options
            .filter((o): o is string => typeof o === 'string' && o.trim().length > 0 && o.length < 140)
            .map((o) => o.trim())
            .slice(0, 3)
        : [];

    const result: GuideResponse = {
      kind,
      message,
      contextSummary,
      options,
      proposal,
      trace: { promptVersion: GUIDANCE_VERSION, ...meta },
    };
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
