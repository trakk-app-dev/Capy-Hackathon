'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import CapyTeacher from '@/components/CapyTeacher';
import CapyPet from '@/components/CapyPet';

const STEPS = [
  {
    number: '01',
    title: 'Tell Capy what you need to finish',
    description: 'Type in your assignment, upload a rubric screenshot, or just describe the task. Capy Teacher will evaluate the difficulty and set XP stakes.',
    visual: () => (
      <div className="flex items-center gap-3">
        <CapyTeacher size={70} expression="thinking" animated />
        <div className="glass rounded-xl p-3 text-xs text-near-black/60 max-w-[200px]" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          &ldquo;Let me look at this... AP Bio lab report? I&apos;ll evaluate the scope.&rdquo;
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'Accept the challenge',
    description: 'Capy Teacher shows you the deal: how much XP you\'ll earn if you finish, and how much your pet loses if you don\'t. Accept when you\'re ready — a dramatic countdown starts.',
    visual: () => (
      <div className="flex gap-3">
        <div className="bg-success/10 rounded-xl p-3 text-center flex-1">
          <p className="text-xs text-success/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Complete</p>
          <p className="text-xl font-extrabold text-success" style={{ fontFamily: 'var(--font-mono)' }}>+85</p>
        </div>
        <div className="bg-failure/10 rounded-xl p-3 text-center flex-1">
          <p className="text-xs text-failure/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Don&apos;t</p>
          <p className="text-xl font-extrabold text-failure" style={{ fontFamily: 'var(--font-mono)' }}>-17</p>
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Race the clock',
    description: 'A glowing timer counts down while your pet watches. Under 5 minutes, the glow intensifies. Under 1 minute, it turns red and pulses urgently. Your pet reacts — going from curious to worried to panicking.',
    visual: () => (
      <div className="text-center">
        <div className="timer-warm inline-block rounded-2xl px-6 py-3 mb-2">
          <p className="text-3xl font-extrabold text-amber" style={{ fontFamily: 'var(--font-mono)' }}>24:37</p>
        </div>
        <div className="flex justify-center">
          <CapyPet size={60} expression="curious" animated />
        </div>
      </div>
    ),
  },
  {
    number: '04',
    title: 'Upload your proof',
    description: 'Take a screenshot of your finished work or describe what you did. The upload zone is right there on the timer screen — no navigating away. You can also upload from your phone.',
    visual: () => (
      <div className="upload-zone p-4 text-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-coral/40 mx-auto mb-1">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <p className="text-xs text-near-black/30" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Screenshot or photo of your work</p>
      </div>
    ),
  },
  {
    number: '05',
    title: 'Capy Teacher verifies your work',
    description: 'Using AI vision, Capy Teacher actually looks at your proof and determines whether you did the work. No faking it. The teacher references specific things from your submission in the feedback.',
    visual: () => (
      <div className="flex items-center gap-3">
        <div className="scanning-rock">
          <CapyTeacher size={60} expression="scanning" animated />
        </div>
        <motion.p
          className="text-xs text-near-black/40"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
        >
          Analyzing your work...
        </motion.p>
      </div>
    ),
  },
  {
    number: '06',
    title: 'Your pet earns (or loses) XP',
    description: 'If approved, your pet celebrates and gains XP. Level up and they get a full-screen golden celebration with sparkles. If rejected, your pet loses XP and looks sad. Levels never go down though — that\'s permanent.',
    visual: () => (
      <div className="text-center">
        <CapyPet size={60} expression="celebrating" animated />
        <p className="text-xl font-extrabold text-success mt-2" style={{ fontFamily: 'var(--font-mono)' }}>+85 XP</p>
        <p className="text-[10px] text-near-black/30" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Level up = golden takeover ✨</p>
      </div>
    ),
  },
];

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className="gradient-landing min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-near-black/40 hover:text-coral transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>

      <div className="px-6 pb-16 max-w-3xl mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl text-center mb-2 text-near-black">How Capy Works</h1>
          <p className="text-center text-near-black/40 text-sm mb-12" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            The accountability loop that actually works
          </p>
        </motion.div>

        <div className="space-y-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ y: 25, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass-strong rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className="flex-1">
                <span className="text-coral font-bold text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-body)' }}>Step {step.number}</span>
                <h3 className="text-lg mt-1 mb-2 text-near-black">{step.title}</h3>
                <p className="text-sm text-near-black/55 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{step.description}</p>
              </div>
              <div className="md:w-[200px] flex-shrink-0">
                {step.visual()}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            onClick={() => router.push('/signup')}
            className="btn-hover bg-coral text-white px-8 py-3.5 rounded-2xl text-base font-bold"
            style={{ boxShadow: 'var(--shadow-glow)' }}
          >
            Start your first session
          </button>
        </motion.div>
      </div>
    </div>
  );
}
