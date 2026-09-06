import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { feedback, email, images } = await req.json();

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 });
    }

    const { EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error('Missing EMAIL_USER or EMAIL_PASS in environment variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Build attachments from base64 images
    const attachments = Array.isArray(images)
      ? images.map((img: { name: string; data: string }) => ({
          filename: img.name,
          content: Buffer.from(img.data, 'base64'),
        }))
      : [];

    const mailOptions = {
      from: EMAIL_USER,
      to: 'capy.app.dev@gmail.com',
      subject: `[Capy Feedback]${email ? ` from ${email}` : ''}${attachments.length ? ` (${attachments.length} screenshot${attachments.length > 1 ? 's' : ''})` : ''}`,
      text: `New feedback via Capy App\n\n${feedback}\n\nSender: ${email || 'Anonymous'}`,
      replyTo: email || undefined,
      attachments,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending feedback:', message);
    return NextResponse.json(
      { error: 'Failed to send feedback', details: message },
      { status: 500 }
    );
  }
}
