'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import CapyPet from '@/components/CapyPet';

// ─── Dev reset helper (only active in development) ───────────────
function resetMockData() {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith('capy_'))
    .forEach((k) => localStorage.removeItem(k));
  window.location.reload();
}

export default function LandingPage() {
  const [taskInput, setTaskInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches);
  }, []);

  const handleSubmit = () => {
    if (!taskInput.trim()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    router.push(`/signup?task=${encodeURIComponent(taskInput.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="gradient-landing min-h-screen flex flex-col">
      {/* ═══ FROSTED NAV BAR ═══ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl"
      >
        <div className="glass rounded-full px-6 py-3 flex items-center justify-between"
          style={{ boxShadow: 'var(--shadow-md)' }}>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-coral flex items-center justify-center">
              <span className="text-white text-xs font-bold">🐹</span>
            </div>
            <span className="text-near-black font-semibold tracking-wider text-sm uppercase">Capy</span>
          </div>

          {/* Center link */}
          <a href="#how-it-works" className="text-sm text-near-black/60 hover:text-coral transition-colors duration-150 hidden sm:block">
            How it works
          </a>

          {/* CTA */}
          <button
            onClick={() => router.push('/signup')}
            className="btn-hover bg-coral text-white px-5 py-2 rounded-full text-sm font-semibold"
          >
            Get Started
          </button>
        </div>
      </motion.nav>

      {/* ═══ HERO SECTION ═══ */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16 min-h-screen">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col items-center text-center max-w-2xl"
        >
          {/* Teacher illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <CapyPet size={isMobile ? 110 : 170} expression="happy" animated />
          </motion.div>

          {/* Headline — Georgia italic */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-3xl sm:text-4xl md:text-[3.5rem] leading-tight mb-4 text-near-black"
          >
            Meet the pet that helps you take the first step.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-base sm:text-lg text-near-black/60 mb-6 sm:mb-8"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            What are you trying to start?
          </motion.p>

          {/* Frosted glass input */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className={`w-full max-w-lg ${isShaking ? 'animate-[pet-shake_0.5s_ease-in-out]' : ''}`}
          >
            <div
              className="glass-strong rounded-2xl p-2 flex items-end gap-2"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="I need to start my bio worksheet, but…"
                rows={isMobile ? 1 : 2}
                className="flex-1 bg-transparent px-4 py-3 text-near-black placeholder-near-black/30 resize-none outline-none text-base"
                style={{
                  fontFamily: 'var(--font-body)',
                  minHeight: isMobile ? '48px' : '64px',
                  maxHeight: isMobile ? '96px' : '120px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={handleSubmit}
                className={`btn-hover flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  taskInput.trim()
                    ? 'bg-coral text-white'
                    : 'bg-near-black/10 text-near-black/30 cursor-not-allowed'
                }`}
                disabled={false}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Suggestions */}
            <p className="mt-3 text-xs text-near-black/35" style={{ fontFamily: 'var(--font-body)' }}>
              Try: <span className="text-near-black/45">&ldquo;Open my essay doc and write one sentence&rdquo;</span> · <span className="text-near-black/45">&ldquo;Answer question 1 of my worksheet&rdquo;</span> · <span className="text-near-black/45">&ldquo;Email my professor&rdquo;</span>
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* ═══ HOW IT WORKS ═══ */}
      <div className="gradient-how-it-works w-full py-2">
      <section id="how-it-works" className="px-6 py-20 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl text-center mb-4 text-near-black">
            How Capy works
          </h2>
          <div className="w-16 h-1 bg-coral rounded-full mx-auto mb-16" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Tell Capy what you\'re stuck on',
              desc: 'Paste the instructions or a screenshot. If you already know the step, Capy takes it as is. If not, it asks one question at a time until a first step fits your actual task.',
              icon: '📎',
            },
            {
              step: '02',
              title: 'Agree on one small step',
              desc: 'What to do, where to do it, and what counts as enough. Then a short check-in — three minutes is plenty.',
              icon: '⏱️',
            },
            {
              step: '03',
              title: 'Show Capy your work',
              desc: 'Capy checks what you did against the step you agreed to. Saying "done" doesn\'t count. Your pet earns XP when the step checks out.',
              icon: '✅',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="card-hover glass-strong rounded-2xl p-8 text-center relative overflow-hidden"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <span className="text-coral font-bold text-sm tracking-widest uppercase mb-2 block" style={{ fontFamily: 'var(--font-body)' }}>
                Step {item.step}
              </span>
              <h3 className="text-xl mb-3 text-near-black" style={{ fontStyle: 'italic' }}>
                {item.title}
              </h3>
              <p className="text-near-black/55 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      </div>

      {/* ═══ PULL QUOTE ═══ */}
      <section className="px-6 py-16">
        <motion.blockquote
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-2xl sm:text-3xl text-near-black/40 leading-relaxed">
            {"“Other apps trust you. Capy doesn't.”"}
          </p>
        </motion.blockquote>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <div className="gradient-testimonials w-full py-2">
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl text-center mb-4 text-near-black"
        >
          Students love Capy
        </motion.h2>
        <div className="w-12 h-1 bg-coral rounded-full mx-auto mb-12" />

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "I typed 'open my essay doc and write the first sentence' and Capy didn't interview me. It just said what it would check and gave me three minutes. I had a sentence down before the check-in.",
              name: 'Sarah K.',
              detail: 'High school junior',
            },
            {
              quote: "Saying 'done' doesn't work on Capy. It asks to see the actual line I wrote. That's the whole reason I actually write it.",
              name: 'Marcus T.',
              detail: 'College freshman',
            },
            {
              quote: "When I said 'I need to start my essay,' Capy asked what the prompt was instead of guessing. The first step was about my real essay, not some generic 'write an outline.' Mochi is level 5 now.",
              name: 'Aisha M.',
              detail: 'High school senior',
            },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ y: 25, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-hover glass rounded-2xl p-6"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <p className="text-near-black/65 text-sm leading-relaxed mb-4" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-coral/15 flex items-center justify-center text-coral text-xs font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{t.name}</p>
                  <p className="text-xs text-near-black/40" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{t.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      </div>

      {/* ═══ CTA SECTION ═══ */}
      <section className="px-6 py-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FF7E5F, #FEB47B)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Soft overlay pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2), transparent 40%)'
            }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl text-white mb-3">
              Ready to take the first step?
            </h2>
            <p className="text-white/70 mb-8 text-base" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              Your capybara is waiting.
            </p>
            <button
              onClick={() => router.push('/signup')}
              className="btn-hover bg-white text-coral px-8 py-3.5 rounded-2xl text-base font-bold"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              Get Started — it&apos;s free
            </button>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 py-8 text-center border-t border-coral/5">
        <p className="text-xs text-near-black/30" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          © 2026 Capy · <a href="/privacy" className="hover:text-coral transition-colors">Privacy</a> · <a href="/terms" className="hover:text-coral transition-colors">Terms</a>
        </p>
      </footer>

      {/* ═══ DEV RESET BUTTON (development only) ═══ */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={resetMockData}
          title="Reset all mock data and auth — simulates a brand new user"
          className="fixed bottom-4 right-4 z-50 bg-near-black/80 text-white text-xs px-3 py-1.5 rounded-full font-mono hover:bg-near-black transition-colors"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          🔄 reset mock
        </button>
      )}
    </div>
  );
}
