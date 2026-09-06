import { REVIEW_PROMPT, REVIEW_VERSION } from '@/lib/start-prompts';
import {
  askJson,
  cleanMessages,
  cleanProposal,
  cleanReview,
  cleanText,
  cleanUrls,
  errorResponse,
  fetchImageBlocks,
  hasApiKey,
  messagesForModel,
  requireUser,
} from '@/lib/start-server';
import {
  START_MAX_CONTEXT_IMAGES,
  START_MAX_PROOF_IMAGES,
  type ReviewResponse,
} from '@/lib/start-types';

// Reviews can carry images and a thinking model; allow the call to finish.
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const uid = await requireUser(request);
    const body = (await request.json()) as Record<string, unknown>;

    const agreement = cleanProposal(body.agreement);
    const taskContext = cleanText(body.contextSummary, 1500);
    const conversation = Array.isArray(body.messages) && body.messages.length > 0 ? cleanMessages(body.messages, uid) : [];
    const contextImageUrls = cleanUrls(body.contextImageUrls, START_MAX_CONTEXT_IMAGES, uid);
    const proofText = cleanText(body.proofText, 12000);
    const proofImageUrls = cleanUrls(body.proofImageUrls, START_MAX_PROOF_IMAGES, uid);

    // ── Nothing to look at → no model call, never a success ─────
    if (!proofText && proofImageUrls.length === 0) {
      const empty: ReviewResponse = {
        status: 'unable_to_assess',
        observation: 'There’s no work here for me to look at yet.',
        quote: '',
        next: agreement.evidenceInstructions,
        trace: null,
      };
      return Response.json(empty);
    }

    // ── No API key → honest "can't assess". Never auto-approve. ──
    if (!hasApiKey()) {
      const unavailable: ReviewResponse = {
        status: 'unable_to_assess',
        observation: 'Capy can’t look at your work until its AI connection is set up. Nothing you did is lost.',
        quote: '',
        next: agreement.evidenceInstructions,
        trace: { promptVersion: REVIEW_VERSION, model: 'none', milliseconds: 0, inputTokens: 0, outputTokens: 0 },
      };
      return Response.json(unavailable);
    }

    // ── Real Claude call ─────────────────────────────────────────
    const context = await fetchImageBlocks(contextImageUrls, 'Task material image');
    const proof = await fetchImageBlocks(proofImageUrls, 'Submitted work image');

    // The user attached photos but none could be read: say so, don't guess.
    if (proofImageUrls.length > 0 && proof.attached === 0 && !proofText) {
      const unreadable: ReviewResponse = {
        status: 'unable_to_assess',
        observation: 'I couldn’t open the photo you added. Try a PNG or JPEG, or paste the text instead.',
        quote: '',
        next: agreement.evidenceInstructions,
        trace: null,
      };
      return Response.json(unreadable);
    }

    const { parsed, meta } = await askJson(
      REVIEW_PROMPT,
      {
        agreement,
        taskContext,
        conversation: messagesForModel(conversation),
        submittedWorkText: proofText,
        imagesAvailableToYou: { taskMaterial: context.attached, submittedWork: proof.attached },
        imageOrder:
          'Images labelled "Task material image" are context supplied before work. Images labelled "Submitted work image" are the current evidence.',
      },
      [...context.blocks, ...proof.blocks],
      'low'
    );

    const review = cleanReview(parsed, proofText, proof.attached);
    const result: ReviewResponse = {
      ...review,
      trace: { promptVersion: REVIEW_VERSION, ...meta },
    };
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
