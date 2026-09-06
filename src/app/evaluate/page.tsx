'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged } from '@/lib/auth';
import { Timestamp } from 'firebase/firestore';
import { createSession } from '@/lib/db';
import CapyTeacher from '@/components/CapyTeacher';
import CriteriaRefineChat from '@/components/CriteriaRefineChat';
import { playSound } from '@/lib/sounds';

type SessionSetup = {
  taskTitle: string;
  contextText: string;
  contextImageUrls: string[];
  timeEstimate: number;
  commitmentId?: string;
  goalXpReward?: number;
  goalXpPenalty?: number;
  goalTitleSnapshot?: string;
};

type Phase = 'scanning' | 'context-question' | 'result' | 'countdown';

// Countdown background — intensifies from evaluation warmth → timer heat
const COUNTDOWN_BACKGROUNDS = [
  'radial-gradient(circle at 40% 40%, rgba(254,180,123,0.3), transparent 50%), radial-gradient(circle at 60% 60%, rgba(255,179,71,0.2), transparent 45%), linear-gradient(to bottom, #FFF5EB, #FFEDD8)', // 3 (warm peach/cream)
  'radial-gradient(circle at 35% 35%, rgba(254,160,105,0.4), transparent 50%), radial-gradient(circle at 65% 60%, rgba(255,150,60,0.3), transparent 45%), linear-gradient(to bottom, #FFF0E0, #FFE5CC)', // 2 (warming)
  'radial-gradient(circle at 30% 30%, rgba(255,140,85,0.5), transparent 50%), radial-gradient(circle at 70% 60%, rgba(255,120,50,0.4), transparent 45%), linear-gradient(to bottom, #FFE8D0, #FFDCB8)', // 1 (hot coral)
  'radial-gradient(ellipse at 20% 30%, rgba(255,107,61,0.45), transparent 45%), radial-gradient(ellipse at 80% 20%, rgba(255,140,66,0.5), transparent 40%), linear-gradient(160deg, rgb(255,107,61), rgb(255,140,66), rgb(255,179,71))', // GO! (timer start)
];

export default function EvaluatePage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('scanning');
  const [countdown, setCountdown] = useState(3);
  const [countdownIntensity, setCountdownIntensity] = useState(0);
  const [timeFlagCount, setTimeFlagCount] = useState(0);

  // Data from session setup
  const [sessionData, setSessionData] = useState<SessionSetup | null>(null);

  // AI result
  const [result, setResult] = useState<{
    xpReward: number;
    xpPenalty: number;
    taskDescription: string;
    proofGuidance: string;
    isScreenshottable: boolean;
    timeFlag: string | null;
    needsMoreContext: boolean;
    contextQuestion: string | null;
  } | null>(null);

  // Context follow-up
  const [contextAnswer, setContextAnswer] = useState('');
  const [reEvaluating, setReEvaluating] = useState(false);

  const [error, setError] = useState('');
  const scanStartRef = useRef<number>(0);

  /** Latest task wording / proof — starts from AI, updated by refine chat */
  const [refinedDeal, setRefinedDeal] = useState<{
    taskDescription: string;
    proofGuidance: string;
    isScreenshottable: boolean;
  } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged((user) => {
      if (!user) { router.push('/signup'); return; }
      setUid(user.uid);
    });
    return unsub;
  }, [router]);

  // Call evaluate API
  const callEvaluate = (data: typeof sessionData) => {
    if (!data) return;
    scanStartRef.current = Date.now();

    fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((aiResult) => {
        if (aiResult.error) {
          setError(aiResult.error);
          return;
        }
        // Minimum 3 second scan hold
        const elapsed = Date.now() - scanStartRef.current;
        const remaining = Math.max(0, 3000 - elapsed);
        setTimeout(() => {
          setResult(aiResult);
          setRefinedDeal({
            taskDescription: aiResult.taskDescription,
            proofGuidance: aiResult.proofGuidance,
            isScreenshottable: aiResult.isScreenshottable,
          });
          if (aiResult.needsMoreContext && aiResult.contextQuestion) {
            setPhase('context-question');
          } else {
            setPhase('result');
          }
        }, remaining);
      })
      .catch(() => setError('Failed to evaluate. Please try again.'));
  };

  // Load session data and start evaluation
  useEffect(() => {
    const raw = sessionStorage.getItem('capy_session_setup');
    if (!raw) {
      router.push('/home');
      return;
    }
    const data = JSON.parse(raw);
    setSessionData(data);
    callEvaluate(data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Re-evaluate with additional context
  const handleContextSubmit = () => {
    if (!contextAnswer.trim() || !sessionData) return;
    setReEvaluating(true);
    setPhase('scanning');

    const updatedData: SessionSetup = {
      ...sessionData,
      contextText: `${sessionData.contextText}\n\nAdditional context: ${contextAnswer.trim()}`,
    };
    setSessionData(updatedData);

    // Update sessionStorage too
    sessionStorage.setItem('capy_session_setup', JSON.stringify(updatedData));

    callEvaluate(updatedData);
  };

  const handleAcceptTimeFlag = () => {
    setTimeFlagCount((c) => c + 1);
    if (timeFlagCount >= 1 && result) {
      setResult({ ...result, timeFlag: null });
    }
  };

  const handleGoBackToModifyPlan = () => {
    if (sessionData) {
      sessionStorage.setItem(
        'capy_home_draft',
        JSON.stringify({
          taskTitle: sessionData.taskTitle,
          contextText: sessionData.contextText,
          timeEstimate: sessionData.timeEstimate,
          commitmentId: sessionData.commitmentId,
          goalXpReward: sessionData.goalXpReward,
          goalXpPenalty: sessionData.goalXpPenalty,
          goalTitleSnapshot: sessionData.goalTitleSnapshot,
        })
      );
    }
    router.push('/home');
  };

  const handleGo = async () => {
    if (!uid || !sessionData || !result || !refinedDeal) return;

    const linked = Boolean(sessionData.commitmentId);
    const xpReward = linked && sessionData.goalXpReward != null ? sessionData.goalXpReward : result.xpReward;
    const xpPenalty = linked && sessionData.goalXpPenalty != null ? sessionData.goalXpPenalty : result.xpPenalty;

    setPhase('countdown');

    let count = 3;
    setCountdown(count);
    setCountdownIntensity(0);
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      setCountdownIntensity(3 - count); // 0→1→2→3 as countdown goes 3→2→1→0
      if (count === 0) {
        clearInterval(interval);
        playSound('session-start');
        const startedMs = Date.now();
        const timerTs = Timestamp.fromMillis(startedMs);
        createSession(uid, {
          taskTitle: sessionData.taskTitle,
          contextText: sessionData.contextText,
          contextImageUrls: sessionData.contextImageUrls,
          proofImageUrl: null,
          proofText: '',
          aiTaskDescription: refinedDeal.taskDescription,
          xpReward,
          xpPenalty,
          xpChange: 0,
          approved: false,
          completionLevel: 'none',
          aiFeedback: '',
          timeEstimate: sessionData.timeEstimate,
          timeActual: 0,
          status: 'active',
          isScreenshottable: refinedDeal.isScreenshottable,
          timerStartedAt: timerTs,
          ...(sessionData.commitmentId ? { commitmentId: sessionData.commitmentId } : {}),
          ...(sessionData.goalTitleSnapshot ? { goalTitleSnapshot: sessionData.goalTitleSnapshot } : {}),
        }).then((sessionId) => {
          sessionStorage.setItem('capy_active_session', sessionId);
          sessionStorage.setItem('capy_session_time', String(sessionData.timeEstimate));
          sessionStorage.setItem('capy_proof_guidance', refinedDeal.proofGuidance || '');
          sessionStorage.setItem('capy_timer_started_at', String(startedMs));
          sessionStorage.removeItem('capy_timer_result');
          sessionStorage.removeItem('capy_proof_urls');
          router.push('/timer');
        }).catch((err) => {
          console.error('Failed to create session:', err);
          setPhase('result');
          setError('Failed to start session. Please try again.');
        });
      }
    }, 1000);
  };

  // ─── Scanning Phase ───
  if (phase === 'scanning') {
    return (
      <div className="gradient-evaluation min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="scanning-rock inline-block mb-6">
            <CapyTeacher size={120} expression="scanning" animated />
          </div>

          {error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-failure text-sm mb-4" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{error}</p>
              <button onClick={() => router.push('/home')} className="btn-hover bg-coral text-white px-6 py-2.5 rounded-xl text-sm font-semibold">Go back</button>
            </motion.div>
          ) : (
            <>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-near-black/60 text-sm"
                style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
              >
                {reEvaluating ? 'Re-evaluating with your details...' : 'Evaluating your assignment...'}
              </motion.p>
              <div className="flex justify-center gap-1.5 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-coral"
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── Context Question Phase (AI asks follow-up) ───
  if (phase === 'context-question') {
    return (
      <div className="gradient-evaluation min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <CapyTeacher size={90} expression="thinking" animated />
          <h2 className="text-xl mt-3 mb-2 text-near-black">I need a bit more info</h2>

          <div className="glass-strong rounded-2xl p-5 mb-4 text-left" style={{ boxShadow: 'var(--shadow-md)' }}>
            <p className="text-sm text-near-black/80 leading-relaxed mb-4" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              {result?.contextQuestion || 'Can you provide more details about this assignment?'}
            </p>
            <textarea
              value={contextAnswer}
              onChange={(e) => setContextAnswer(e.target.value)}
              placeholder="Type your answer..."
              rows={3}
              className="input-glow w-full bg-white rounded-xl px-4 py-3 text-sm text-near-black placeholder-near-black/30 resize-none"
              style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
              autoFocus
            />
          </div>

          <button
            onClick={handleContextSubmit}
            disabled={!contextAnswer.trim()}
            className="btn-hover w-full bg-coral text-white rounded-xl py-3 text-sm font-bold disabled:opacity-40"
          >
            Submit
          </button>

          <button
            onClick={() => setPhase('result')}
            className="text-xs text-near-black/35 mt-3 hover:text-near-black/60 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Skip — evaluate with what I gave you
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Countdown Phase ───
  if (phase === 'countdown') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: COUNTDOWN_BACKGROUNDS[countdownIntensity] || COUNTDOWN_BACKGROUNDS[0],
          transition: 'background 0.8s ease',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {countdown > 0 ? (
              <span className="text-8xl font-extrabold text-coral" style={{ fontFamily: 'var(--font-mono)' }}>
                {countdown}
              </span>
            ) : (
              <span className="text-6xl font-extrabold text-coral" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                GO!
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Result Phase ───
  return (
    <div className="gradient-evaluation min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full flex flex-col items-center"
      >
        <div className="text-center mb-6 w-full">
          <div className="flex justify-center">
            <CapyTeacher size={80} expression="stern" />
          </div>
          <h2 className="text-2xl mt-3 text-near-black">Here&apos;s the deal</h2>
        </div>

        {sessionData?.commitmentId && (
          <p className="text-xs text-coral font-semibold text-center mb-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            Linked goal{sessionData.goalTitleSnapshot ? `: ${sessionData.goalTitleSnapshot}` : ''} — XP stakes match your goal.
          </p>
        )}

        <div className="glass-strong rounded-2xl p-6 mb-4 w-full" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {/* Task description */}
          <p className="text-sm text-near-black/80 leading-relaxed mb-4" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            {refinedDeal?.taskDescription || result?.taskDescription || 'Complete this task and submit proof of your work.'}
          </p>

          {/* Proof guidance */}
          {(refinedDeal?.proofGuidance || result?.proofGuidance) && (
            <div className="bg-coral/5 rounded-xl p-3 mb-4">
              <p className="text-xs text-near-black/60 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                <strong>Proof tip:</strong> {refinedDeal?.proofGuidance || result?.proofGuidance || 'Submit a screenshot or photo of your completed work.'}
              </p>
            </div>
          )}

          {refinedDeal && sessionData && (
            <CriteriaRefineChat
              title="Adjust this plan with Capy"
              endpoint="/api/evaluate/refine"
              draft={{
                taskDescription: refinedDeal.taskDescription,
                proofGuidance: refinedDeal.proofGuidance,
                isScreenshottable: refinedDeal.isScreenshottable,
              }}
              onDraftUpdate={(d) => {
                setRefinedDeal({
                  taskDescription: String(d.taskDescription ?? ''),
                  proofGuidance: String(d.proofGuidance ?? ''),
                  isScreenshottable: Boolean(d.isScreenshottable),
                });
              }}
            />
          )}

          {/* XP stakes */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 bg-success/10 rounded-xl p-4 text-center">
              <p className="text-[10px] text-success/80 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>You finish</p>
              <p className="text-2xl font-extrabold text-success" style={{ fontFamily: 'var(--font-mono)' }}>
                +
                {sessionData?.commitmentId && sessionData.goalXpReward != null
                  ? sessionData.goalXpReward
                  : result?.xpReward ?? 0}
              </p>
              <p className="text-[10px] text-success/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>XP</p>
            </div>
            <div className="flex-1 bg-failure/10 rounded-xl p-4 text-center">
              <p className="text-[10px] text-failure/80 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>You don&apos;t</p>
              <p className="text-2xl font-extrabold text-failure" style={{ fontFamily: 'var(--font-mono)' }}>
                {sessionData?.commitmentId && sessionData.goalXpPenalty != null
                  ? sessionData.goalXpPenalty
                  : result?.xpPenalty ?? 0}
              </p>
              <p className="text-[10px] text-failure/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>XP</p>
            </div>
          </div>

          {/* Time */}
          <div className="bg-amber/10 rounded-xl p-3 text-center">
            <p className="text-xs text-near-black/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              ⏱️ {Math.floor((sessionData?.timeEstimate || 0) / 60)} minutes on the clock
            </p>
          </div>

          {/* Time flag warning */}
          {result?.timeFlag && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 bg-amber/15 rounded-xl p-3 text-center"
            >
              <p className="text-xs text-near-black/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                ⚠️ {result.timeFlag}
              </p>
              <button
                onClick={handleAcceptTimeFlag}
                className="text-xs text-coral font-semibold mt-1"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Keep my time anyway
              </button>
            </motion.div>
          )}

          {/* Not screenshottable notice */}
          {refinedDeal && !refinedDeal.isScreenshottable && (
            <p className="text-xs text-near-black/50 text-center mt-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              This task might not be screenshottable — you can describe what you did instead.
            </p>
          )}
        </div>

        {/* GO button */}
        <motion.button
          onClick={handleGo}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-coral text-white rounded-2xl py-4 text-lg font-bold"
          style={{ boxShadow: 'var(--shadow-glow-strong)', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
        >
          Let&apos;s go
        </motion.button>

        <button
          onClick={handleGoBackToModifyPlan}
          className="w-full text-center text-xs text-near-black/40 mt-3 hover:text-near-black/60 transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Go back and modify plan
        </button>
      </motion.div>
    </div>
  );
}
