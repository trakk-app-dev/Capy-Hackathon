'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackFormProps {
  onClose: () => void;
}

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 5;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FeedbackForm({ onClose }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
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

    try {
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
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error('Failed to send feedback:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center px-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="glass-strong rounded-2xl p-6 w-full max-w-md"
          style={{ boxShadow: 'var(--shadow-xl)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {sent ? (
            <div className="text-center py-4">
              <p className="text-3xl mb-2">✅</p>
              <h3 className="text-lg text-near-black">Thanks for the feedback!</h3>
              <p className="text-xs text-near-black/40 mt-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                We read every single one.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-near-black">Give Feedback</h3>
                <button onClick={onClose} className="text-near-black/30 hover:text-near-black/60 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Incentive pill */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-xs"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,126,95,0.08), rgba(255,179,71,0.1))',
                  border: '1px solid rgba(255,126,95,0.15)',
                  fontFamily: 'var(--font-body)', fontStyle: 'normal',
                }}
              >
                <span>🏆</span>
                <span className="text-near-black/55">Best feedback wins <strong className="text-coral">$100</strong> — anything helps!</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What could be better? What do you love? Bug reports welcome too..."
                  rows={4}
                  className="input-glow w-full bg-white rounded-xl px-4 py-3 text-sm text-near-black placeholder-near-black/25 resize-none"
                  style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email (optional)"
                  className="input-glow w-full bg-white rounded-xl px-4 py-3 text-sm text-near-black placeholder-near-black/25"
                  style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
                />

                {/* Image upload */}
                {previews.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {previews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`Screenshot ${i + 1}`} className="w-14 h-14 object-cover rounded-lg border border-near-black/10" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-near-black/70 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < MAX_IMAGES && (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleImageAdd(e.target.files)} className="hidden" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-xl border border-dashed border-near-black/10 hover:border-coral/30 bg-white/50 hover:bg-coral/[0.03] px-4 py-2.5 text-xs text-near-black/30 hover:text-coral/60 transition-all duration-200 flex items-center justify-center gap-1.5"
                      style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Add screenshots
                    </button>
                  </>
                )}

                <button
                  type="submit"
                  disabled={!feedback.trim() || sending}
                  className="btn-hover w-full bg-coral text-white rounded-xl py-3 text-sm font-bold disabled:opacity-40"
                >
                  {sending ? 'Sending...' : 'Send Feedback'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
