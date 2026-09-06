// Server-side helpers for the /start API routes. Import ONLY from route
// handlers — this module reads process.env.ANTHROPIC_API_KEY and must never
// reach the client bundle. (The `server-only` package is not installed here.)
import Anthropic from '@anthropic-ai/sdk';
import {
  START_IMAGE_TYPES,
  START_MAX_IMAGES_PER_TURN,
  START_MAX_MINUTES,
  START_MIN_MINUTES,
  START_MODEL_WINDOW,
  type FirstAction,
  type ImageMediaType,
  type StartMessage,
  type StartReview,
} from './start-types';

export type StartErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_INPUT'
  | 'CONVERSATION_TOO_LONG'
  | 'IMAGE_UNREADABLE'
  | 'INVALID_MODEL_OUTPUT'
  | 'AI_UNAVAILABLE'
  | 'REFUSED';

export class StartError extends Error {
  constructor(
    public code: StartErrorCode,
    message?: string
  ) {
    super(message ?? code);
  }
}

export function getStartModel(): string {
  return process.env.CAPY_MODEL || 'claude-opus-5';
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// ─── Auth ────────────────────────────────────────────────────────

/**
 * Resolve the caller's Firebase uid from `Authorization: Bearer <idToken>`
 * without the Admin SDK: the Identity Toolkit lookup endpoint validates the
 * token against this project using the public web API key. Rejects with
 * UNAUTHORIZED on any failure.
 */
export async function requireUser(request: Request): Promise<string> {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!token || !key) throw new StartError('UNAUTHORIZED');
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });
    if (!res.ok) throw new StartError('UNAUTHORIZED');
    const data = (await res.json()) as { users?: { localId?: string }[] };
    const uid = data.users?.[0]?.localId;
    if (!uid) throw new StartError('UNAUTHORIZED');
    return uid;
  } catch (err) {
    if (err instanceof StartError) throw err;
    throw new StartError('UNAUTHORIZED');
  }
}

/** Only tokenized download URLs from this project's bucket under the caller's own folder. */
export function isOwnedStorageUrl(url: string, uid: string): boolean {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucket) return false;
  // Mirrors @firebase/storage's downloadUrlFromResourceString: /v0/b/{encode(bucket)}/o/{encode(fullPath)}
  const prefix = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/users%2F${encodeURIComponent(uid)}%2F`;
  return url.startsWith(prefix);
}

// ─── Input cleaning ──────────────────────────────────────────────

/** Client-supplied text: wrong shape is the caller's fault (400). */
export function cleanText(value: unknown, max: number): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new StartError('INVALID_INPUT');
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/** Model-supplied text: wrong shape is a bad model reply (502), never a 400 aimed at the user. */
export function modelText(value: unknown, max: number): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new StartError('INVALID_MODEL_OUTPUT');
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function cleanUrls(value: unknown, max: number, uid: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new StartError('INVALID_INPUT');
  const urls = value.filter((u): u is string => typeof u === 'string');
  if (urls.some((u) => !isOwnedStorageUrl(u, uid))) throw new StartError('INVALID_INPUT');
  return urls.slice(0, max);
}

export function cleanMessages(value: unknown, uid: string): StartMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) throw new StartError('INVALID_INPUT');
  return value.map((m) => {
    if (!m || typeof m !== 'object') throw new StartError('INVALID_INPUT');
    const msg = m as Record<string, unknown>;
    if (msg.role !== 'user' && msg.role !== 'assistant') throw new StartError('INVALID_INPUT');
    const text = cleanText(msg.text, 10000);
    const imageUrls = cleanUrls(msg.imageUrls, START_MAX_IMAGES_PER_TURN, uid);
    return imageUrls.length ? { role: msg.role, text, imageUrls } : { role: msg.role, text };
  });
}

/**
 * The recent window the model sees. Storage URLs are never sent to the model;
 * a message only notes how many images the user shared with it. Whether those
 * images actually reached the model is reported separately by the route.
 */
export function messagesForModel(messages: StartMessage[]): { role: 'user' | 'assistant'; text: string; imagesSharedWithThisMessage?: number }[] {
  return messages.slice(-START_MODEL_WINDOW).map((m) =>
    m.imageUrls?.length ? { role: m.role, text: m.text, imagesSharedWithThisMessage: m.imageUrls.length } : { role: m.role, text: m.text }
  );
}

export function cleanProposal(value: unknown): FirstAction {
  if (!value || typeof value !== 'object') throw new StartError('INVALID_MODEL_OUTPUT');
  const p = value as Record<string, unknown>;
  const fields = ['title', 'action', 'where', 'enough', 'evidenceInstructions'] as const;
  const result = {} as FirstAction;
  for (const field of fields) {
    const v = p[field];
    if (typeof v !== 'string' || !v.trim()) throw new StartError('INVALID_MODEL_OUTPUT');
    result[field] = v.trim().slice(0, 900);
  }
  const minutes = Number(p.minutes);
  if (!Number.isInteger(minutes) || minutes < START_MIN_MINUTES || minutes > START_MAX_MINUTES) {
    throw new StartError('INVALID_MODEL_OUTPUT');
  }
  result.minutes = minutes;
  return result;
}

// ─── Quote recovery ──────────────────────────────────────────────

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * The model must quote the user's work verbatim, but it routinely normalises
 * whitespace or curly quotes. Recover the user's own characters when the
 * quote matches modulo whitespace/quote style; otherwise return ''.
 */
export function recoverQuote(proofText: string, quote: string): string {
  const q = quote.trim();
  if (!q) return '';
  if (proofText.includes(q)) return q;
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';
  const pattern = tokens
    .map((t) =>
      escapeRegExp(t)
        .replace(/[‘’']/g, "[‘’']")
        .replace(/[“”"]/g, '[“”"]')
    )
    .join('\\s+');
  try {
    const match = proofText.match(new RegExp(pattern, 'i'));
    return match ? match[0] : '';
  } catch {
    return '';
  }
}

export function cleanReview(value: Record<string, unknown>, proofText: string, attachedImages: number): StartReview {
  const status = value.status;
  if (status !== 'supported' && status !== 'not_yet_supported' && status !== 'unable_to_assess') {
    throw new StartError('INVALID_MODEL_OUTPUT');
  }
  const observation = modelText(value.observation, 1600);
  const next = modelText(value.next, 900);
  if (!observation || !next) throw new StartError('INVALID_MODEL_OUTPUT');
  const quote = recoverQuote(proofText, modelText(value.quote, 1200));
  // A "supported" result must rest on something we can show: the user's own
  // words, or a photo the model actually received.
  if (status === 'supported' && attachedImages === 0 && !quote) throw new StartError('INVALID_MODEL_OUTPUT');
  return { status, observation, quote, next };
}

// ─── Images ──────────────────────────────────────────────────────

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // matches storage.rules

/**
 * Fetch image URLs server-side and convert to base64 content blocks — the
 * same approach the existing evaluate/verify routes use for Firebase Storage
 * download URLs. Unsupported types and failures are skipped; `attached`
 * reports how many the model will actually see.
 */
export async function fetchImageBlocks(
  urls: string[],
  label: string
): Promise<{ blocks: Anthropic.Messages.ContentBlockParam[]; attached: number }> {
  const blocks: Anthropic.Messages.ContentBlockParam[] = [];
  let attached = 0;
  for (const [i, url] of urls.entries()) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const declared = Number(res.headers.get('content-length') || 0);
      if (declared > MAX_IMAGE_BYTES) continue;
      const mediaType = (res.headers.get('content-type') || '').split(';')[0].trim() as ImageMediaType;
      if (!START_IMAGE_TYPES.includes(mediaType)) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_IMAGE_BYTES) continue;
      blocks.push({ type: 'text', text: `${label} ${i + 1}:` });
      blocks.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: Buffer.from(buf).toString('base64') } });
      attached++;
    } catch (err) {
      console.error('start: failed to fetch image', err);
    }
  }
  return { blocks, attached };
}

// ─── Model call ──────────────────────────────────────────────────

export interface ModelMeta {
  model: string;
  milliseconds: number;
  inputTokens: number;
  outputTokens: number;
}

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new StartError('INVALID_MODEL_OUTPUT');
  return value as Record<string, unknown>;
}

function parseJsonObject(text: string): Record<string, unknown> {
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return asObject(JSON.parse(stripped));
  } catch (err) {
    if (err instanceof StartError) throw err;
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) throw new StartError('INVALID_MODEL_OUTPUT');
    try {
      return asObject(JSON.parse(match[0]));
    } catch {
      throw new StartError('INVALID_MODEL_OUTPUT');
    }
  }
}

/** Models that accept output_config.effort. Anything else gets the plain request. */
const EFFORT_MODELS = /claude-(fable-5|opus-5|opus-4-[678]|sonnet-5|sonnet-4-6)/;

/**
 * One JSON-returning model call. `input` is serialised as the first text block
 * so user content stays outside the system prompt. Thinking is left at the
 * model's default (adaptive on current models) and shares max_tokens with the
 * answer, hence the generous cap; effort is lowered where supported because
 * these are short structured decisions.
 */
export async function askJson(
  system: string,
  input: unknown,
  imageBlocks: Anthropic.Messages.ContentBlockParam[] = [],
  effort: 'low' | 'medium' = 'medium'
): Promise<{ parsed: Record<string, unknown>; meta: ModelMeta }> {
  if (!hasApiKey()) throw new StartError('AI_UNAVAILABLE');
  // One attempt + one retry must fit inside the routes' maxDuration (120s)
  // together with the token lookup and image fetches.
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 50_000, maxRetries: 1 });
  const model = getStartModel();
  const started = Date.now();

  const content: Anthropic.Messages.ContentBlockParam[] = [
    { type: 'text', text: JSON.stringify(input) },
    ...imageBlocks,
  ];

  const response = await client.messages.create({
    model,
    max_tokens: 8000,
    system,
    messages: [{ role: 'user', content }],
    ...(EFFORT_MODELS.test(model) ? { output_config: { effort } } : {}),
  });

  if (response.stop_reason === 'refusal') throw new StartError('REFUSED');
  if (response.stop_reason === 'max_tokens') throw new StartError('INVALID_MODEL_OUTPUT');

  const text = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  if (!text.trim()) throw new StartError('INVALID_MODEL_OUTPUT');

  return {
    parsed: parseJsonObject(text),
    meta: {
      model: response.model,
      milliseconds: Date.now() - started,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

// ─── Error → HTTP ────────────────────────────────────────────────

export function errorResponse(error: unknown): Response {
  if (error instanceof StartError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        return Response.json({ error: 'Please sign in again to keep going.' }, { status: 401 });
      case 'INVALID_INPUT':
        return Response.json({ error: 'Tell Capy a little about the task, or share its instructions.' }, { status: 400 });
      case 'CONVERSATION_TOO_LONG':
        return Response.json({ error: 'This conversation is getting long. Start something else to keep going.' }, { status: 400 });
      case 'IMAGE_UNREADABLE':
        return Response.json({ error: 'I couldn’t open the photo you added. Try a PNG or JPEG, or paste the text instead.' }, { status: 400 });
      case 'INVALID_MODEL_OUTPUT':
        return Response.json({ error: 'I couldn’t get a clear response. Your step is safe. Please try again.' }, { status: 502 });
      case 'REFUSED':
        return Response.json({ error: 'Capy couldn’t respond to that. Your work is still here. Try rewording it.' }, { status: 503 });
      case 'AI_UNAVAILABLE':
        return Response.json({ error: 'Capy couldn’t connect to its AI. Your work is still here. Please try again shortly.' }, { status: 503 });
    }
  }
  if (error instanceof SyntaxError) {
    return Response.json({ error: 'I couldn’t get a clear response. Your step is safe. Please try again.' }, { status: 502 });
  }
  console.error('start route failed', { name: error instanceof Error ? error.name : 'unknown', status: (error as { status?: number })?.status });
  return Response.json({ error: 'Capy couldn’t connect to its AI. Your work is still here. Please try again shortly.' }, { status: 503 });
}
