'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged } from '@/lib/auth';
import { updateUserProfile, createPet } from '@/lib/db';
import { DEFAULT_UNLOCKED_ITEMS, COLORS } from '@/lib/items';
import CapyTeacher from '@/components/CapyTeacher';
import CapyPet from '@/components/CapyPet';
import { playSound } from '@/lib/sounds';
import { Monitor } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    question: "What's your biggest study struggle?",
    options: ['Starting is the hardest part', 'I get distracted halfway', 'I run out of motivation', 'I forget what I need to do'],
  },
  {
    question: 'What motivates you most?',
    options: ['Visual progress / streaks', 'Competition / ranking', 'Rewards / unlocking things', 'Not letting someone down'],
  },
];

const AVAILABLE_COLORS = COLORS.filter((c) => c.unlockLevel <= 1);
const LOCKED_COLORS = COLORS.filter((c) => c.unlockLevel > 1).slice(0, 3);

// Step layout (desktop): 0=welcome, 1-2=quiz, 3=how-it-works, 4=rule, 5=color, 6=hatch, 7=final
// Step layout (mobile):  0=welcome, 1=best-on-pc, 2-3=quiz, 4=how-it-works, 5=rule, 6=color, 7=hatch, 8=final

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('tan');
  const [petName, setPetName] = useState('');
  const [eggPhase, setEggPhase] = useState<'idle' | 'wobble' | 'crack' | 'hatch'>('idle');
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches);
  }, []);

  const mobileOffset = isMobile ? 1 : 0;
  const TOTAL_SLIDES = 8 + mobileOffset;

  useEffect(() => {
    const unsub = onAuthStateChanged((user) => {
      if (!user) router.push('/signup');
      else setUid(user.uid);
    });
    return unsub;
  }, [router]);

  // Clear selected answer when step changes
  useEffect(() => {
    setSelectedAnswer(null);
  }, [step]);

  const startHatch = useCallback(() => {
    setEggPhase('wobble');
    setTimeout(() => setEggPhase('crack'), 1000);
    setTimeout(() => {
      setEggPhase('hatch');
      playSound('hatch');
    }, 2500);
  }, []);

  useEffect(() => {
    if (step === 6 + mobileOffset) startHatch();
  }, [step, startHatch, mobileOffset]);

  const handleFinish = async () => {
    if (!uid || !petName.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile(uid, { onboardingAnswers: answers, onboardingComplete: true });
      await createPet(uid, {
        name: petName.trim(),
        color: selectedColor,
        level: 1,
        xp: 0,
        equippedHat: null,
        equippedClothes: null,
        unlockedItems: DEFAULT_UNLOCKED_ITEMS,
      });
      router.push('/home');
    } catch (err) {
      console.error('Failed to save onboarding:', err);
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const progressPercent = (step / (TOTAL_SLIDES - 1)) * 100;

  const renderSlide = () => {
    // ─── STEP 0: Welcome ───────────────────────────────────────────
    if (step === 0) {
      return (
        <motion.div
          key="welcome"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm mx-auto flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 180 }}
            className="mb-8"
          >
            <CapyTeacher size={140} expression="happy" animated />
          </motion.div>

          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl mb-3 text-near-black leading-tight"
          >
            Let&apos;s get you started.
          </motion.h1>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-near-black/50 text-base mb-10 leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
          >
            A few quick questions, then you&apos;ll meet your capybara. Takes 60 seconds.
          </motion.p>

          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            onClick={() => setStep(1)}
            className="btn-hover bg-coral text-white px-10 py-4 rounded-2xl text-base font-bold tracking-wide"
            style={{ boxShadow: '0 8px 32px rgba(255,126,95,0.35), 0 2px 8px rgba(255,126,95,0.2)', fontFamily: 'var(--font-body)' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Let&apos;s go →
          </motion.button>
        </motion.div>
      );
    }

    // ─── STEP 1 (MOBILE ONLY): Best on PC ──────────────────────────
    if (step === 1 && isMobile) {
      return (
        <motion.div
          key="mobile-warning"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm mx-auto flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 180 }}
            className="mb-8 w-20 h-20 rounded-2xl bg-coral/10 flex items-center justify-center"
          >
            <Monitor className="w-10 h-10 text-coral" />
          </motion.div>

          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl mb-3 text-near-black leading-tight"
          >
            Capy is best on PC / laptop
          </motion.h1>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-near-black/50 text-base mb-10 leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
          >
            Capy is still in its prototype stages — mobile will have bugs
          </motion.p>

          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            onClick={() => setStep(2)}
            className="btn-hover bg-coral text-white px-10 py-4 rounded-2xl text-base font-bold tracking-wide"
            style={{ boxShadow: '0 8px 32px rgba(255,126,95,0.35), 0 2px 8px rgba(255,126,95,0.2)', fontFamily: 'var(--font-body)' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Got it →
          </motion.button>
        </motion.div>
      );
    }

    // ─── QUIZ ──────────────────────────────────────────────────────
    if (step >= 1 + mobileOffset && step <= 2 + mobileOffset) {
      const q = QUIZ_QUESTIONS[step - 1 - mobileOffset];
      return (
        <motion.div
          key={`quiz-${step}`}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6 flex justify-center"
          >
            <CapyTeacher size={90} expression="thinking" animated />
          </motion.div>

          <h2 className="text-3xl mb-1.5 text-near-black leading-tight">{q.question}</h2>
          <p className="text-near-black/35 text-sm mb-7 tracking-wide uppercase" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal', letterSpacing: '0.1em' }}>
            Question {step - mobileOffset} of 2
          </p>

          <div className="w-full space-y-3 mb-8">
            {q.options.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              return (
                <motion.button
                  key={opt}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
                  onClick={() => setSelectedAnswer(opt)}
                  className="w-full text-left rounded-xl px-5 py-4 text-sm transition-all duration-200"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontStyle: 'normal',
                    background: isSelected
                      ? 'rgba(255,126,95,0.1)'
                      : 'rgba(255,248,240,0.85)',
                    border: isSelected
                      ? '2px solid #FF7E5F'
                      : '2px solid rgba(255,126,95,0.1)',
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(255,126,95,0.2)'
                      : 'var(--shadow-sm)',
                    color: isSelected ? '#FF7E5F' : '#1E1E2E',
                    fontWeight: isSelected ? 600 : 400,
                    backdropFilter: 'blur(12px)',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                      style={{
                        borderColor: isSelected ? '#FF7E5F' : 'rgba(30,30,46,0.2)',
                        background: isSelected ? '#FF7E5F' : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedAnswer && (
              <motion.button
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  setAnswers([...answers, selectedAnswer]);
                  setStep(step + 1);
                }}
                className="btn-hover w-full bg-coral text-white py-4 rounded-xl text-base font-bold"
                style={{ boxShadow: '0 6px 24px rgba(255,126,95,0.3)', fontFamily: 'var(--font-body)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Continue →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      );
    }

    // ─── How Capy works ─────────────────────────────────────────────
    if (step === 3 + mobileOffset) {
      return (
        <motion.div
          key="edu1"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md mx-auto flex flex-col items-center text-center"
        >
          <div className="mb-5 flex justify-center">
            <CapyTeacher size={110} expression="happy" animated />
          </div>
          <h2 className="text-3xl mb-2 text-near-black">Here&apos;s how Capy works</h2>
          <p className="text-near-black/40 text-sm mb-7" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Four steps. Zero excuses.</p>
          <div className="w-full space-y-3 mb-8 text-left">
            {[
              { emoji: '📎', title: 'Upload your task', text: 'Describe what you need to finish. I evaluate difficulty and set the stakes.' },
              { emoji: '⏱️', title: 'Race the clock', text: 'A countdown timer creates the urgency your brain needs to focus.' },
              { emoji: '📸', title: 'Prove you did it', text: 'Upload a photo of your work. I\'ll verify it actually happened.' },
              { emoji: '⭐', title: 'Earn XP', text: 'Your pet grows stronger when you deliver. Fails cost XP. No cheating.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-4 rounded-xl px-4 py-3.5"
                style={{
                  background: 'rgba(255,248,240,0.85)',
                  border: '1.5px solid rgba(255,126,95,0.1)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: 'var(--shadow-sm)',
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'normal',
                }}
              >
                <span className="text-2xl mt-0.5 flex-shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-near-black mb-0.5">{item.title}</p>
                  <p className="text-xs text-near-black/55 leading-relaxed">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => setStep(4 + mobileOffset)}
            className="btn-hover w-full bg-coral text-white py-4 rounded-xl text-base font-bold"
            style={{ boxShadow: '0 6px 24px rgba(255,126,95,0.3)', fontFamily: 'var(--font-body)' }}
          >
            Got it →
          </button>
        </motion.div>
      );
    }

    // ─── The rule ──────────────────────────────────────────────────
    if (step === 4 + mobileOffset) {
      return (
        <motion.div
          key="edu2"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md mx-auto flex flex-col items-center text-center"
        >
          <div className="mb-5 flex justify-center">
            <CapyTeacher size={110} expression="stern" animated />
          </div>
          <h2 className="text-3xl mb-4 text-near-black">One important rule</h2>
          <div
            className="w-full rounded-2xl p-6 mb-8"
            style={{
              background: 'rgba(255,248,240,0.9)',
              border: '1.5px solid rgba(255,126,95,0.15)',
              boxShadow: 'var(--shadow-md)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <p className="text-near-black/75 text-base leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              I&apos;m not a reward-you-for-nothing teacher. If you don&apos;t finish,{' '}
              <strong className="text-coral">your pet loses XP.</strong> So only start a session when you&apos;re actually ready to work.
            </p>
            <p className="text-near-black/40 text-sm mt-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              Think of it as a commitment contract. With a very cute capybara on the line.
            </p>
          </div>
          <button
            onClick={() => setStep(5 + mobileOffset)}
            className="btn-hover w-full bg-near-black text-white py-4 rounded-xl text-base font-bold"
            style={{ fontFamily: 'var(--font-body)', boxShadow: '0 4px 20px rgba(30,30,46,0.2)' }}
          >
            Deal. Let&apos;s go.
          </button>
        </motion.div>
      );
    }

    // ─── Color picker + name ────────────────────────────────────────
    if (step === 5 + mobileOffset) {
      return (
        <motion.div
          key="color-picker"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md mx-auto flex flex-col items-center text-center"
        >
          <h2 className="text-3xl mb-1 text-near-black">Design your capybara</h2>
          <p className="text-near-black/40 text-sm mb-6" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            Pick a color, give them a name
          </p>

          {/* Live preview — centered */}
          <motion.div
            className="mb-6 flex justify-center"
            key={selectedColor}
            animate={{ scale: [0.95, 1.05, 1] }}
            transition={{ duration: 0.35 }}
          >
            <CapyPet size={140} color={selectedColor} expression="happy" animated />
          </motion.div>

          {/* Color swatches */}
          <div className="flex items-center justify-center gap-2.5 mb-6 flex-wrap max-w-xs">
            {AVAILABLE_COLORS.map((c) => (
              <motion.button
                key={c.id}
                onClick={() => setSelectedColor(c.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.93 }}
                className="w-10 h-10 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: c.hex,
                  boxShadow: selectedColor === c.id
                    ? `0 0 0 3px white, 0 0 0 5px #FF7E5F, 0 4px 12px rgba(255,126,95,0.3)`
                    : 'var(--shadow-sm)',
                  transform: selectedColor === c.id ? 'scale(1.15)' : 'scale(1)',
                }}
                title={c.name}
              />
            ))}
            {LOCKED_COLORS.map((c) => (
              <div
                key={c.id}
                className="w-10 h-10 rounded-full relative opacity-35 cursor-not-allowed"
                style={{ backgroundColor: c.hex === 'pattern' ? '#C4A7E7' : c.hex, boxShadow: 'var(--shadow-sm)' }}
                title={`Unlock at Level ${c.unlockLevel}`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white bg-black/30 rounded-full">
                  Lv{c.unlockLevel}
                </span>
              </div>
            ))}
          </div>

          {/* Name input */}
          <div className="w-full max-w-xs mx-auto mb-8">
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value.slice(0, 20))}
              placeholder="Name your capybara..."
              className="input-glow w-full rounded-xl px-4 py-3.5 text-center text-sm text-near-black placeholder-near-black/30"
              style={{
                fontFamily: 'var(--font-body)',
                boxShadow: 'var(--shadow-sm)',
                background: 'rgba(255,255,255,0.8)',
                border: '1.5px solid rgba(255,126,95,0.15)',
              }}
              maxLength={20}
            />
            <p className="text-[10px] text-near-black/25 mt-1.5" style={{ fontFamily: 'var(--font-body)' }}>
              {petName.length}/20
            </p>
          </div>

          <button
            onClick={() => { if (petName.trim()) setStep(6 + mobileOffset); }}
            disabled={!petName.trim()}
            className="btn-hover w-full bg-coral text-white py-4 rounded-xl text-base font-bold disabled:opacity-35 disabled:cursor-not-allowed"
            style={{ boxShadow: petName.trim() ? '0 6px 24px rgba(255,126,95,0.3)' : 'none', fontFamily: 'var(--font-body)' }}
          >
            Hatch my egg! 🥚
          </button>
        </motion.div>
      );
    }

    // ─── Egg hatch ────────────────────────────────────────────────
    if (step === 6 + mobileOffset) {
      return (
        <motion.div
          key="egg-hatch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center"
          style={{ minHeight: '420px' }}
        >
          <AnimatePresence mode="wait">
            {eggPhase !== 'hatch' ? (
              <motion.div
                key="egg"
                exit={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`flex flex-col items-center ${eggPhase === 'wobble' ? 'egg-wobble' : eggPhase === 'crack' ? 'egg-crack' : ''}`}
              >
                <svg width="130" height="170" viewBox="0 0 120 160">
                  <defs>
                    <linearGradient id="eggGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFF8F0" />
                      <stop offset="50%" stopColor="#FFEDD8" />
                      <stop offset="100%" stopColor="#FFE4CC" />
                    </linearGradient>
                    <radialGradient id="eggShine" cx="35%" cy="35%" r="45%">
                      <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="60" cy="90" rx="42" ry="55" fill="url(#eggGrad)" stroke="#FFB347" strokeWidth="2" />
                  <ellipse cx="60" cy="90" rx="42" ry="55" fill="url(#eggShine)" />
                  <circle cx="45" cy="75" r="4" fill="#FEB47B" opacity="0.3" />
                  <circle cx="72" cy="85" r="3" fill="#C4A7E7" opacity="0.3" />
                  <circle cx="55" cy="100" r="3.5" fill="#FF7E5F" opacity="0.2" />
                  {eggPhase === 'crack' && (
                    <>
                      <path d="M 45 60 L 55 75 L 42 85" stroke="#D4A574" strokeWidth="2" fill="none" />
                      <path d="M 75 65 L 65 80 L 78 90" stroke="#D4A574" strokeWidth="1.5" fill="none" />
                      <path d="M 58 55 L 60 72" stroke="#D4A574" strokeWidth="1" fill="none" />
                    </>
                  )}
                </svg>
                <motion.p
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-near-black/50 text-sm mt-5"
                  style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                >
                  {eggPhase === 'idle' && 'Something is happening...'}
                  {eggPhase === 'wobble' && "It's moving! 👀"}
                  {eggPhase === 'crack' && 'Almost there...!'}
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="hatched"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                className="flex flex-col items-center"
              >
                {/* Sparkle burst */}
                <motion.div className="relative flex justify-center mb-2">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0, x: Math.cos((i / 6) * Math.PI * 2) * 60, y: Math.sin((i / 6) * Math.PI * 2) * 60 }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                      className="absolute w-3 h-3 rounded-full"
                      style={{ background: ['#FF7E5F','#FEB47B','#FFD700','#C4A7E7','#FF7E5F','#FEB47B'][i] }}
                    />
                  ))}
                  <CapyPet size={160} color={selectedColor} expression="celebrating" animated />
                </motion.div>

                <motion.h2
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl mt-2 text-near-black"
                >
                  {petName} is here!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.75 }}
                  className="text-near-black/45 text-sm mt-2 mb-8"
                  style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                >
                  Your capybara is ready to hold you accountable.
                </motion.p>
                <motion.button
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  onClick={() => setStep(7 + mobileOffset)}
                  className="btn-hover bg-coral text-white px-10 py-4 rounded-2xl text-base font-bold"
                  style={{ boxShadow: '0 8px 32px rgba(255,126,95,0.35)', fontFamily: 'var(--font-body)' }}
                >
                  Let&apos;s go! 🎉
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    }

    // ─── Final ──────────────────────────────────────────────────────
    if (step === 7 + mobileOffset) {
      return (
        <motion.div
          key="final"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto flex flex-col items-center text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6 flex justify-center"
          >
            <CapyPet size={130} color={selectedColor} expression="happy" animated />
          </motion.div>
          <h2 className="text-3xl mb-2 text-near-black">{petName} is counting on you</h2>
          <p className="text-near-black/40 text-sm mb-10 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            Time to show your capybara what you&apos;re made of.
          </p>
          <button
            onClick={handleFinish}
            disabled={saving}
            className="btn-hover w-full bg-coral text-white py-4 rounded-2xl text-base font-bold disabled:opacity-50"
            style={{ boxShadow: '0 8px 32px rgba(255,126,95,0.35), 0 2px 8px rgba(255,126,95,0.2)', fontFamily: 'var(--font-body)' }}
          >
            {saving ? 'Saving...' : 'Start my first session →'}
          </button>
        </motion.div>
      );
    }
  };

  return (
    <div className="gradient-onboarding min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-near-black/5 z-50">
        <motion.div
          className="h-full rounded-r-full"
          style={{ background: 'linear-gradient(90deg, #FF7E5F, #FEB47B)' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>

      {/* Back button — hidden on step 0 */}
      <AnimatePresence>
        {step > 0 && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            onClick={goBack}
            className="fixed top-6 left-6 z-50 flex items-center gap-1.5 text-near-black/40 hover:text-coral transition-colors text-sm"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        {renderSlide()}
      </AnimatePresence>
    </div>
  );
}
