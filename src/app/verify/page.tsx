'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged } from '@/lib/auth';
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore';
import {
  getSession,
  updateSession,
  applyXPChange,
  getPet,
  getCommitment,
  updateCommitment,
  type SessionData,
  type PetData,
  type Timestamp,
} from '@/lib/db';
import { ALL_ITEMS } from '@/lib/items';
import CapyTeacher from '@/components/CapyTeacher';
import CapyPet from '@/components/CapyPet';
import { playSound } from '@/lib/sounds';

type Phase = 'scanning' | 'verdict' | 'feedback' | 'reaction';

export default function VerifyPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [pet, setPet] = useState<PetData | null>(null);
  const [phase, setPhase] = useState<Phase>('scanning');

  // AI result
  const [approved, setApproved] = useState(false);
  const [completionLevel, setCompletionLevel] = useState<'full' | 'partial' | 'none'>('none');
  const [feedbackText, setFeedbackText] = useState('');
  const [displayedFeedback, setDisplayedFeedback] = useState('');

  // XP result
  const [xpChange, setXpChange] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [error, setError] = useState('');
  const [streamingDone, setStreamingDone] = useState(false);

  const scanStartRef = useRef(Date.now());
  const timerResult = useRef('submitted');

  useEffect(() => {
    const unsub = onAuthStateChanged(async (user) => {
      if (!user) { router.push('/signup'); return; }
      setUid(user.uid);

      const sid = sessionStorage.getItem('capy_active_session');
      timerResult.current = sessionStorage.getItem('capy_timer_result') || 'submitted';
      if (!sid) { router.push('/home'); return; }
      setSessionId(sid);

      const [sessionData, petData] = await Promise.all([
        getSession(user.uid, sid),
        getPet(user.uid),
      ]);
      setSession(sessionData);
      setPet(petData);

      // If timer expired, skip verification
      if (timerResult.current === 'expired') {
        handleTimerExpired(user.uid, sid, sessionData);
        return;
      }

      // Call AI verification
      if (sessionData) {
        scanStartRef.current = Date.now();
        // Get multiple proof URLs + proof guidance from sessionStorage
        const proofUrlsRaw = sessionStorage.getItem('capy_proof_urls');
        const proofImageUrls = proofUrlsRaw ? JSON.parse(proofUrlsRaw) : (sessionData.proofImageUrl ? [sessionData.proofImageUrl] : []);
        const proofGuidance = sessionStorage.getItem('capy_proof_guidance') || '';
        try {
          const res = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskDescription: sessionData.aiTaskDescription || sessionData.taskTitle,
              proofImageUrls,
              proofImageUrl: sessionData.proofImageUrl,
              proofText: sessionData.proofText,
              contextText: sessionData.contextText,
              contextImageUrls: sessionData.contextImageUrls,
              proofGuidance,
            }),
          });
          const result = await res.json();
          if (result.error) {
            setError(result.error);
            return;
          }

          // Minimum 3s scan
          const elapsed = Date.now() - scanStartRef.current;
          const delay = Math.max(0, 3000 - elapsed);
          setTimeout(() => {
            setApproved(result.approved ?? false);
            setCompletionLevel(result.completionLevel || (result.approved ? 'full' : 'none'));
            setFeedbackText((result.feedbackText || 'Capy Teacher reviewed your submission.').replace(/undefined/g, '').trim());
            setPhase('verdict');
            if (result.approved) {
              playSound('approved');
            } else {
              playSound('failure');
            }
          }, delay);
        } catch {
          setError('Verification failed. Please try again.');
        }
      }
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleTimerExpired = async (userId: string, sid: string, sessionData: SessionData | null) => {
    if (!sessionData) return;
    setApproved(false);
    setCompletionLevel('none');
    setFeedbackText('Time ran out before you could submit your proof. Your capybara is disappointed, but not giving up on you.');
    setXpChange(sessionData.xpPenalty ?? -10);

    setTimeout(() => {
      setPhase('verdict');
      playSound('failure');
    }, 1500);
  };

  // Verdict → Feedback transition
  useEffect(() => {
    if (phase === 'verdict') {
      const timer = setTimeout(() => setPhase('feedback'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Stream feedback text word by word
  useEffect(() => {
    if (phase !== 'feedback' || !feedbackText) return;
    const words = feedbackText.split(' ');
    let i = 0;
    setDisplayedFeedback('');
    setStreamingDone(false);
    const interval = setInterval(() => {
      if (i < words.length) {
        setDisplayedFeedback((prev) => prev + (i > 0 ? ' ' : '') + words[i]);
        i++;
      } else {
        clearInterval(interval);
        setStreamingDone(true);
      }
    }, 80);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, feedbackText]);

  const handleReaction = async () => {
    if (!uid || !sessionId || !session) return;

    // Calculate XP
    let xp = 0;
    if (timerResult.current === 'expired') {
      xp = session.xpPenalty ?? -10;
    } else if (approved) {
      xp = completionLevel === 'full' ? session.xpReward : Math.floor(session.xpReward * 0.5);
    } else {
      xp = session.xpPenalty ?? -10;
    }
    setXpChange(xp);

    // Apply to Firestore
    const result = await applyXPChange(uid, xp, ALL_ITEMS);
    setLeveledUp(result.leveledUp);
    setNewLevel(result.newLevel);
    setPet(result.pet);

    // Update session
    await updateSession(uid, sessionId, {
      status: approved ? 'completed' : 'failed',
      approved,
      completionLevel,
      aiFeedback: feedbackText,
      xpChange: xp,
    });

    if (session.commitmentId && timerResult.current !== 'expired') {
      const cid = session.commitmentId;
      const proofUrlsRaw = sessionStorage.getItem('capy_proof_urls');
      const proofImageUrls = proofUrlsRaw
        ? (JSON.parse(proofUrlsRaw) as string[])
        : session.proofImageUrl
          ? [session.proofImageUrl]
          : [];
      const fresh = await getSession(uid, sessionId);
      const proofTextSaved = fresh?.proofText ?? '';

      const prev = await getCommitment(uid, cid);
      const links = [...(prev?.linkedSessionIds ?? [])];
      if (!links.includes(sessionId)) links.push(sessionId);

      if (approved) {
        await updateCommitment(uid, cid, {
          status: 'completed',
          approved: true,
          aiFeedback: feedbackText,
          proofImageUrls,
          proofText: proofTextSaved,
          completedAt: FirestoreTimestamp.fromMillis(Date.now()) as unknown as Timestamp,
          linkedSessionIds: links,
        });
      } else {
        await updateCommitment(uid, cid, { linkedSessionIds: links });
      }
    }

    // Clean up session storage
    sessionStorage.removeItem('capy_active_session');
    sessionStorage.removeItem('capy_session_time');
    sessionStorage.removeItem('capy_timer_started_at');
    sessionStorage.removeItem('capy_session_setup');
    sessionStorage.removeItem('capy_timer_result');
    sessionStorage.removeItem('capy_proof_urls');
    sessionStorage.removeItem('capy_proof_guidance');

    setPhase('reaction');
    if (result.leveledUp) {
      playSound('level-up');
    }
  };

  // ─── Scanning Phase ───
  if (phase === 'scanning') {
    return (
      <div className="gradient-verification min-h-screen flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="scanning-rock inline-block mb-4">
            <CapyTeacher size={120} expression="scanning" animated />
          </div>
          {error ? (
            <div>
              <p className="text-failure text-sm mb-4" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{error}</p>
              <button onClick={() => router.push('/home')} className="btn-hover bg-coral text-white px-6 py-2.5 rounded-xl text-sm">Go home</button>
            </div>
          ) : (
            <>
              <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-near-black/60 text-sm" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                Checking your work...
              </motion.p>
              <div className="flex justify-center gap-1.5 mt-3">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-coral"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── Verdict Phase (1.5s flash) ───
  if (phase === 'verdict') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: approved
            ? 'radial-gradient(circle at 30% 30%, rgba(255,215,0,0.40), transparent 55%), radial-gradient(circle at 70% 70%, rgba(255,180,50,0.30), transparent 55%), linear-gradient(150deg, #FFF8D0 0%, #FFEFB0 100%)'
            : 'radial-gradient(circle at 40% 40%, rgba(200,190,185,0.30), transparent 55%), radial-gradient(circle at 65% 65%, rgba(180,170,165,0.20), transparent 55%), linear-gradient(150deg, #F5F0EC 0%, #F0EAE5 100%)',
          transition: 'background 1.5s ease',
        }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          {approved ? (
            <>
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
                className="text-7xl mb-4 inline-block"
              >
                ✅
              </motion.div>
              <h2 className="text-3xl text-near-black">Approved!</h2>
            </>
          ) : (
            <>
              <div className="text-7xl mb-4">😔</div>
              <h2 className="text-3xl text-near-black/60">Not quite</h2>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── Feedback Phase (streaming text) ───
  if (phase === 'feedback') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{
          background: approved
            ? 'radial-gradient(circle at 30% 40%, rgba(255,215,0,0.15), transparent 55%), radial-gradient(circle at 70% 60%, rgba(255,180,50,0.10), transparent 55%), linear-gradient(150deg, #FFF8E8 0%, #FFF3D8 100%)'
            : 'radial-gradient(circle at 40% 40%, rgba(200,190,185,0.30), transparent 55%), radial-gradient(circle at 65% 65%, rgba(180,170,165,0.20), transparent 55%), linear-gradient(150deg, #F5F0EC 0%, #F0EAE5 100%)',
          transition: 'background 1.5s ease',
        }}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="flex justify-center">
            <CapyTeacher size={80} expression={approved ? 'happy' : 'stern'} />
          </div>
          <div className="glass-strong rounded-2xl p-6 mt-4" style={{ boxShadow: 'var(--shadow-md)' }}>
            {/* Show proof image if available */}
            {session?.proofImageUrl && (
              <img
                src={session.proofImageUrl}
                alt="Your proof"
                className="w-full h-32 object-cover rounded-xl mb-4"
              />
            )}
            <p className="text-sm text-near-black/80 leading-relaxed text-left" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              {(displayedFeedback || '').replace(/undefined/g, '').trim()}
              {!streamingDone && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-coral ml-0.5 align-middle"
                />
              )}
            </p>
          </div>

          <AnimatePresence>
            {streamingDone && (
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.4 }}
                onClick={handleReaction}
                className="btn-hover mt-5 w-full bg-coral text-white rounded-xl py-3.5 text-sm font-bold"
                style={{ boxShadow: 'var(--shadow-glow)' }}
              >
                Continue →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // ─── Reaction Phase (XP + level-up celebration) ───
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: leveledUp
          ? 'radial-gradient(circle at 30% 30%, rgba(255,215,0,0.45), transparent 55%), radial-gradient(circle at 70% 70%, rgba(255,180,50,0.35), transparent 55%), radial-gradient(circle at 50% 50%, rgba(255,200,80,0.20), transparent 70%), linear-gradient(150deg, #FFF5D0 0%, #FFECB0 100%)'
          : approved
          ? 'radial-gradient(circle at 30% 40%, rgba(34,197,94,0.12), transparent 55%), radial-gradient(circle at 70% 60%, rgba(255,180,71,0.10), transparent 55%), linear-gradient(150deg, #F5FFF0 0%, #F0FAEB 100%)'
          : 'radial-gradient(circle at 40% 40%, rgba(200,190,185,0.25), transparent 55%), radial-gradient(circle at 60% 60%, rgba(180,170,165,0.15), transparent 55%), linear-gradient(150deg, #F5F0EC 0%, #EEE8E3 100%)',
        transition: 'background 1.5s ease',
      }}
    >
      {/* Level-up golden takeover */}
      {leveledUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 pointer-events-none z-40"
        >
          {/* Sparkles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], x: [0, (Math.random() - 0.5) * 100], y: [0, (Math.random() - 0.5) * 100] }}
              transition={{ duration: 2, delay: i * 0.15, repeat: 1 }}
              style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-50"
      >
        {/* Pet */}
        <div className={`flex justify-center ${leveledUp ? 'pet-celebrate' : approved ? 'pet-bounce' : ''}`}>
          <CapyPet
            size={130}
            color={pet?.color || 'tan'}
            expression={approved ? 'celebrating' : 'sad'}
            hat={pet?.equippedHat}
            clothes={pet?.equippedClothes}
            animated
          />
        </div>

        {/* Level up banner */}
        {leveledUp && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            className="mt-4 mb-2"
          >
            <h2 className="text-3xl text-golden" style={{ textShadow: '0 0 20px rgba(255,215,0,0.5)' }}>
              Level {newLevel}!
            </h2>
          </motion.div>
        )}

        {/* XP change */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: leveledUp ? 0.8 : 0.3 }}
          className="mt-3"
        >
          <p className={`text-4xl font-extrabold ${xpChange >= 0 ? 'text-success' : 'text-failure'}`}
            style={{ fontFamily: 'var(--font-mono)' }}>
            {xpChange >= 0 ? '+' : ''}{xpChange} XP
          </p>
          <p className="text-near-black/40 text-sm mt-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            {approved ? (completionLevel === 'full' ? 'Great work!' : 'Partial credit — keep going!') : 'Better luck next time.'}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: leveledUp ? 1.5 : 0.8 }}
          className="mt-8 space-y-3"
        >
          <button
            onClick={() => router.push('/home')}
            className="btn-hover w-48 bg-coral text-white rounded-xl py-3 text-sm font-semibold"
          >
            New session
          </button>
          <br />
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-near-black/35 hover:text-near-black/60 transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            View dashboard
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
