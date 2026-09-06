import Anthropic from '@anthropic-ai/sdk';

// ─── Mock fallback (used when no API key is set) ──────────────────
function mockVerify(taskDescription: string) {
  return {
    approved: true,
    completionLevel: 'full' as const,
    feedbackText: `Excellent work! Your proof clearly shows you completed "${taskDescription}". I can see you put in genuine effort and the result meets the requirements. You followed through exactly as expected — that's what builds the habit of accountability. Your capybara is proud of you. Keep this momentum going into your next session!`,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskDescription, proofImageUrls, proofImageUrl, proofText, contextText, contextImageUrls, proofGuidance } = body;

    // Helper: validate and fill defaults for AI response
    const sanitizeResult = (raw: Record<string, unknown>) => ({
      approved: typeof raw.approved === 'boolean' ? raw.approved : false,
      completionLevel: (raw.completionLevel === 'full' || raw.completionLevel === 'partial' || raw.completionLevel === 'none') ? raw.completionLevel : 'none',
      feedbackText: typeof raw.feedbackText === 'string' && raw.feedbackText ? raw.feedbackText : 'Capy Teacher reviewed your work.',
    });

    if (!taskDescription) {
      return Response.json({ error: 'Task description is required' }, { status: 400 });
    }

    if (!proofImageUrl && (!proofImageUrls || proofImageUrls.length === 0) && !proofText) {
      return Response.json({ error: 'Proof image or text is required' }, { status: 400 });
    }

    // ── No API key → return dynamic mock ─────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      await new Promise((r) => setTimeout(r, 1200));
      return Response.json(mockVerify(taskDescription));
    }

    // ── Real Claude API call ──────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

    if (contextImageUrls && contextImageUrls.length > 0) {
      contentBlocks.push({ type: 'text', text: 'ASSIGNMENT CONTEXT IMAGES:' });
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

    if (contextText) {
      contentBlocks.push({ type: 'text', text: `ASSIGNMENT CONTEXT TEXT: ${contextText}` });
    }

    const allProofUrls = proofImageUrls || (proofImageUrl ? [proofImageUrl] : []);
    if (allProofUrls.length > 0) {
      contentBlocks.push({
        type: 'text',
        text: `STUDENT PROOF IMAGES (${allProofUrls.length} photo${allProofUrls.length > 1 ? 's' : ''}):`,
      });
      for (const url of allProofUrls) {
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
          console.error('Failed to fetch proof image:', imgError);
        }
      }
    }

    if (proofText) {
      contentBlocks.push({ type: 'text', text: `STUDENT WRITTEN PROOF: ${proofText}` });
    }

    contentBlocks.push({
      type: 'text',
      text: `The student was supposed to: ${taskDescription}\n${proofGuidance ? `Proof guidance: ${proofGuidance}` : ''}\n\nNow verify their proof. Look carefully at what they submitted.`,
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `You are the Capy Teacher verifying a student's work. They were supposed to: ${taskDescription}.

CRITICAL VERIFICATION RULES:
1. For DIGITAL assignments (AP Classroom, Khan Academy, Google Classroom, etc.):
   - Completion screens, submission pages, "X of Y answered" screenshots ALL count as valid proof
   - If they show the app in a "completed" or "submitted" state, that IS proof
   - Do NOT require a score — many platforms don't show scores immediately
   - A screenshot showing they navigated to the assignment and it shows "submitted" is enough
2. Give PARTIAL credit generously. If they clearly attempted the work but proof is imperfect, give "partial" not "none"
3. Only give "none" if there's NO evidence they did ANY of the work
4. Reference SPECIFIC things you can see in their proof — be detailed
5. If they uploaded multiple photos, look at ALL of them together as combined evidence

Respond in JSON ONLY (no markdown, no backticks):
{
  "approved": true/false (true for full or strong partial, false for weak partial or none),
  "completionLevel": "full" or "partial" or "none",
  "feedbackText": "4-6 sentences. Reference SPECIFIC things in their proof. Be encouraging even when giving partial credit. If the proof is ambiguous, give benefit of the doubt."
}`,
      messages: [{ role: 'user', content: contentBlocks }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return Response.json({ error: 'No text response from AI' }, { status: 500 });
    }

    try {
      const result = JSON.parse(textBlock.text);
      return Response.json(sanitizeResult(result));
    } catch {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return Response.json(sanitizeResult(JSON.parse(jsonMatch[0])));
      }
      return Response.json({ error: 'Failed to parse AI response', raw: textBlock.text }, { status: 500 });
    }
  } catch (error) {
    console.error('Verify API error:', error);
    return Response.json({ error: 'Failed to verify work. Please try again.' }, { status: 500 });
  }
}
