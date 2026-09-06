'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import CapyTeacher from '@/components/CapyTeacher';

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 5;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix to get raw base64
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageAdd = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
      return true;
    });
    const combined = [...images, ...newFiles].slice(0, MAX_IMAGES);
    setImages(combined);
    setPreviews(combined.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newImages.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSending(true);
    setError('');

    try {
      // Convert images to base64 for the API
      const imageData = await Promise.all(
        images.map(async (file) => ({
          name: file.name,
          data: await fileToBase64(file),
        }))
      );

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, email, images: imageData }),
      });

      if (!res.ok) {
        throw new Error('Failed to send feedback');
      }

      setSent(true);
    } catch {
      setError('Something went wrong — please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{
        background: 'radial-gradient(circle at 25% 35%, rgba(255,126,95,0.18), transparent 55%), radial-gradient(circle at 75% 65%, rgba(196,167,231,0.15), transparent 55%), radial-gradient(circle at 55% 25%, rgba(254,180,123,0.12), transparent 50%), linear-gradient(150deg, #FFF8F0 0%, #FFF2F8 50%, #F8F0FF 100%)',
      }}
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-center max-w-sm"
          >
            <div className="flex justify-center mb-6">
              <CapyTeacher size={120} expression="happy" animated />
            </div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl text-near-black mb-3">
                Thank you!
              </h2>
              <p className="text-near-black/50 text-sm leading-relaxed mb-8" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                We read every single piece of feedback. You&apos;re helping make Capy better.
              </p>
              <button
                onClick={() => router.back()}
                className="btn-hover bg-coral text-white px-8 py-3 rounded-xl text-sm font-semibold"
              >
                Back to Capy
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-5"
              >
                <CapyTeacher size={100} expression="happy" animated />
              </motion.div>
              <motion.h1
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl text-near-black mb-2"
              >
                Help us build Capy
              </motion.h1>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-near-black/45 text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
              >
                Capy is actively being built — your feedback directly shapes what we ship next.
              </motion.p>
            </div>

            {/* Incentive banner */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="rounded-2xl p-5 mb-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,126,95,0.12), rgba(255,179,71,0.15), rgba(196,167,231,0.1))',
                border: '1.5px solid rgba(255,126,95,0.2)',
                boxShadow: '0 4px 24px rgba(255,126,95,0.1)',
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.07]"
                style={{ background: 'radial-gradient(circle, #FFB347, transparent 70%)' }}
              />
              <div className="flex items-start gap-4 relative z-10">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber/15 flex items-center justify-center text-xl">
                  🏆
                </div>
                <div>
                  <p className="text-sm font-bold text-near-black mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                    Best feedback wins <span className="text-coral">$100</span>
                  </p>
                  <p className="text-xs text-near-black/45 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    Capy is early — we&apos;re building this in the open and every piece of feedback is gold.
                    Bug reports, feature ideas, things that confused you, brutally honest roasts — anything helps.
                    Leave your email so we can reach you if you win!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              onSubmit={handleSubmit}
              className="glass-strong rounded-3xl p-8 space-y-5"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <div>
                <label className="block text-xs font-semibold text-near-black/50 uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                  Your thoughts
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What could be better? What do you love? Bug reports welcome too..."
                  rows={5}
                  className="input-glow w-full bg-white rounded-2xl px-5 py-4 text-sm text-near-black placeholder-near-black/25 resize-none"
                  style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal', boxShadow: 'var(--shadow-sm)' }}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-near-black/50 uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                  Email <span className="normal-case font-normal text-near-black/30">(optional — so we can follow up)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-glow w-full bg-white rounded-2xl px-5 py-4 text-sm text-near-black placeholder-near-black/25"
                  style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal', boxShadow: 'var(--shadow-sm)' }}
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-semibold text-near-black/50 uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-body)' }}>
                  Screenshots <span className="normal-case font-normal text-near-black/30">(optional — up to 3)</span>
                </label>

                {/* Previews */}
                {previews.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {previews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={src}
                          alt={`Screenshot ${i + 1}`}
                          className="w-20 h-20 object-cover rounded-xl border border-near-black/10"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-near-black/70 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageAdd(e.target.files)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-2xl border-2 border-dashed border-near-black/10 hover:border-coral/30 bg-white/50 hover:bg-coral/[0.03] px-5 py-4 text-sm text-near-black/30 hover:text-coral/60 transition-all duration-200 flex items-center justify-center gap-2"
                      style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Add screenshots
                    </button>
                  </>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={!feedback.trim() || sending}
                className="btn-hover w-full bg-coral text-white rounded-2xl py-4 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ boxShadow: feedback.trim() ? 'var(--shadow-glow)' : 'none' }}
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </span>
                    Sending...
                  </span>
                ) : 'Send Feedback'}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full text-center text-xs text-near-black/35 hover:text-near-black/55 transition-colors pt-1"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                &larr; Back
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
