'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from '@/lib/auth';
import {
  getUserProfile,
  getPet,
  getAllCommitments,
  createCommitment,
  updateCommitment,
  failOverdueCommitments,
  applyXPChange,
  type CommitmentData,
  type PetData,
  type Timestamp,
} from '@/lib/db';
import { uploadMultipleImages } from '@/lib/storage';
import { ALL_ITEMS } from '@/lib/items';
import CapyTeacher from '@/components/CapyTeacher';
import CapyPet from '@/components/CapyPet';
import CriteriaRefineChat from '@/components/CriteriaRefineChat';
import { playSound } from '@/lib/sounds';

type CreatePhase = 'idle' | 'scanning' | 'rejected' | 'preview' | 'saved';
type ProofPhase = 'upload' | 'scanning' | 'result';

interface CommitmentWithId extends CommitmentData {
  id: string;
}

function getDeadlineMs(c: CommitmentWithId): number {
  if (c.deadline?.toDate) return c.deadline.toDate().getTime();
  const s = (c.deadline as unknown as { seconds: number })?.seconds;
  if (s) return s * 1000;
  return 0;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Overdue';
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (hours >= 48) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours >= 1) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function getUrgency(ms: number): 'safe' | 'warning' | 'danger' {
  if (ms > 48 * 3600000) return 'safe';
  if (ms > 12 * 3600000) return 'warning';
  return 'danger';
}

const URGENCY_STYLES = {
  safe: 'border-l-4 border-l-success/60',
  warning: 'border-l-4 border-l-amber/80',
  danger: 'border-l-4 border-l-failure/70',
};

function getProofLabel(method: 'photo' | 'text' | 'both') {
  if (method === 'both') return 'Photo + text proof';
  if (method === 'text') return 'Photo + text proof';
  return 'Photo proof required';
}

export default function GoalsPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);

  // All commitments from DB
  const [commitments, setCommitments] = useState<CommitmentWithId[]>([]);

  // ─── Create commitment state ──────────────────────────────────
  const [userInput, setUserInput] = useState('');
  const [userDescription, setUserDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [createPhase, setCreatePhase] = useState<CreatePhase>('idle');
  const [createError, setCreateError] = useState('');
  const [createSaving, setCreateSaving] = useState(false);
  const [rejectedReason, setRejectedReason] = useState('');
  const [aiResult, setAiResult] = useState<{
    title: string;
    description: string;
    verificationMethod: 'photo' | 'text' | 'both';
    xpReward: number;
    xpPenalty: number;
  } | null>(null);
  const scanStartRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Proof submission state ───────────────────────────────────
  const [provingId, setProvingId] = useState<string | null>(null);
  const [proofPhase, setProofPhase] = useState<ProofPhase>('upload');
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [proofText, setProofText] = useState('');
  const [proofSubmitting, setProofSubmitting] = useState(false);
  const [proofResult, setProofResult] = useState<{
    approved: boolean;
    completionLevel: string;
    feedbackText: string;
    xpChange: number;
  } | null>(null);
  const proofScanRef = useRef(0);

  // ─── History toggle ───────────────────────────────────────────
  const [showHistory, setShowHistory] = useState(false);

  // ─── Countdown tick ───────────────────────────────────────────
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // ─── Auth + data load ─────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(async (user) => {
      if (!user) { router.push('/signup'); return; }
      setUid(user.uid);
      try {
        const [prof, petData] = await Promise.all([
          getUserProfile(user.uid),
          getPet(user.uid),
        ]);
        if (!prof?.onboardingComplete) { router.push('/onboarding'); return; }
        setPet(petData);

        const failed = await failOverdueCommitments(user.uid, ALL_ITEMS);
        if (failed.length > 0) {
          // Pet data may have changed from XP penalties
          const refreshedPet = await getPet(user.uid);
          setPet(refreshedPet);
        }

        const all = await getAllCommitments(user.uid);
        setCommitments(all);
      } catch (err) {
        console.error('Failed to load goals data:', err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [router]);

  // ─── Create commitment flow ───────────────────────────────────
  const handleLockIn = async () => {
    if (!userInput.trim() || !deadline) return;
    setCreatePhase('scanning');
    setCreateError('');
    scanStartRef.current = Date.now();

    try {
      const res = await fetch('/api/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: userInput.trim(),
          userDescription: userDescription.trim() || undefined,
          deadline,
        }),
      });
      const data = await res.json();

      const elapsed = Date.now() - scanStartRef.current;
      const remaining = Math.max(0, 3000 - elapsed);

      await new Promise((r) => setTimeout(r, remaining));

      if (data.error) {
        setCreateError(data.error);
        setCreatePhase('idle');
        return;
      }

      if (data.rejected) {
        setRejectedReason(data.reason);
        setCreatePhase('rejected');
        return;
      }

      setAiResult({
        title: data.title,
        description: data.description,
        verificationMethod: data.verificationMethod,
        xpReward: data.xpReward,
        xpPenalty: data.xpPenalty,
      });
      setCreatePhase('preview');
    } catch {
      setCreateError('Failed to evaluate. Please try again.');
      setCreatePhase('idle');
    }
  };

  const handleConfirmCommitment = async () => {
    if (!uid || !aiResult) return;
    setCreateSaving(true);
    setCreateError('');

    try {
      const deadlineDate = new Date(deadline);
      const ts = FirestoreTimestamp.fromDate(deadlineDate) as unknown as Timestamp;

      await createCommitment(uid, {
        title: aiResult.title,
        originalInput: userInput.trim(),
        userDescription: userDescription.trim(),
        description: aiResult.description,
        verificationMethod: aiResult.verificationMethod,
        deadline: ts,
        status: 'active',
        xpReward: aiResult.xpReward,
        xpPenalty: aiResult.xpPenalty,
        proofImageUrls: [],
        proofText: '',
        aiFeedback: '',
        approved: false,
        linkedSessionIds: [],
      });

      playSound('session-start');
      setCreatePhase('saved');

      const all = await getAllCommitments(uid);
      setCommitments(all);

      setTimeout(() => {
        setCreatePhase('idle');
        setUserInput('');
        setUserDescription('');
        setDeadline('');
        setAiResult(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to save commitment:', err);
      setCreateError('Could not save this goal. Please try again.');
      setCreatePhase('preview');
    } finally {
      setCreateSaving(false);
    }
  };

  const handleTryAgain = () => {
    setCreatePhase('idle');
    setRejectedReason('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ─── Proof submission flow ────────────────────────────────────
  const openProof = (commitmentId: string) => {
    setProvingId(commitmentId);
    setProofPhase('upload');
    setProofFiles([]);
    setProofText('');
    setProofResult(null);
  };

  const closeProof = () => {
    setProvingId(null);
    setProofFiles([]);
    setProofText('');
    setProofResult(null);
  };

  const onDrop = useCallback((files: File[]) => {
    setProofFiles((prev) => [...prev, ...files].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  });

  const removeProofFile = (index: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitProof = async () => {
    if (!uid || !provingId) return;
    const commitment = commitments.find((c) => c.id === provingId);
    if (!commitment) return;
    const needPhoto = commitment.verificationMethod === 'photo' || commitment.verificationMethod === 'both';
    const needText = commitment.verificationMethod === 'text' || commitment.verificationMethod === 'both';
    if (needPhoto && proofFiles.length === 0) return;
    if (needText && !proofText.trim()) return;

    setProofSubmitting(true);
    setProofPhase('scanning');
    proofScanRef.current = Date.now();

    try {
      let proofImageUrls: string[] = [];
      if (proofFiles.length > 0) {
        proofImageUrls = await uploadMultipleImages(uid, proofFiles, 'proof');
      }

      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskDescription: commitment.description,
          proofImageUrls,
          proofText: proofText.trim(),
          contextText: commitment.originalInput,
          contextImageUrls: [] as string[],
        }),
      });
      const data = await res.json();

      const elapsed = Date.now() - proofScanRef.current;
      await new Promise((r) => setTimeout(r, Math.max(0, 3000 - elapsed)));

      if (data.error) {
        setProofPhase('upload');
        setProofSubmitting(false);
        return;
      }

      const xp = data.approved ? commitment.xpReward : commitment.xpPenalty;
      const now = Date.now();

      await updateCommitment(uid, provingId, {
        status: data.approved ? 'completed' : 'failed',
        approved: data.approved,
        aiFeedback: data.feedbackText,
        proofImageUrls,
        proofText: proofText.trim(),
        completedAt: FirestoreTimestamp.fromMillis(now) as unknown as Timestamp,
      });

      await applyXPChange(uid, xp, ALL_ITEMS);
      const refreshedPet = await getPet(uid);
      setPet(refreshedPet);

      if (data.approved) playSound('level-up');

      setProofResult({
        approved: data.approved,
        completionLevel: data.completionLevel,
        feedbackText: data.feedbackText,
        xpChange: xp,
      });
      setProofPhase('result');

      const all = await getAllCommitments(uid);
      setCommitments(all);
    } catch (err) {
      console.error('Proof submission failed:', err);
      setProofPhase('upload');
    } finally {
      setProofSubmitting(false);
    }
  };

  // ─── Derived data ─────────────────────────────────────────────
  const activeCommitments = commitments.filter((c) => c.status === 'active');
  const pastCommitments = commitments.filter((c) => c.status !== 'active');
  const now = Date.now();

  // ─── Loading skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="gradient-goals min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <CapyTeacher size={80} expression="scanning" animated />
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-near-black/50 text-sm mt-4"
            style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
          >Loading goals...</motion.p>
        </motion.div>
      </div>
    );
  }

  // ─── Min deadline: 1 hour from now ────────────────────────────
  const minDeadline = new Date(Date.now() + 3600000).toISOString().slice(0, 16);

  return (
    <div className="gradient-goals min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ═══ Page Header ═══ */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1
            className="text-2xl sm:text-3xl text-near-black mb-1"
            style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}
          >
            Goals
          </h1>
          <p className="text-near-black/50 text-sm" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            Long-term commitments with real stakes
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          <div className="min-w-0">
        {/* ═══ Section 1: Create Commitment ═══ */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-strong rounded-2xl p-5 sm:p-6 mb-6"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <AnimatePresence mode="wait">

            {/* ── Idle: input form ── */}
            {createPhase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
                <h2
                  className="text-lg text-near-black mb-4"
                  style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}
                >
                  What do you want to get done?
                </h2>

                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Short goal name (e.g. Email my teacher about the late assignment)"
                  className="w-full bg-cream/80 border border-near-black/10 rounded-xl px-4 py-3 text-sm text-near-black placeholder:text-near-black/30 input-glow mb-3"
                  style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && userInput.trim() && deadline) handleLockIn(); }}
                />

                <label className="text-xs text-near-black/50 mb-1 block" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  More context (optional)
                </label>
                <textarea
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  placeholder="Why it matters, what “done” looks like to you, constraints…"
                  rows={3}
                  className="w-full bg-cream/80 border border-near-black/10 rounded-xl px-4 py-3 text-sm text-near-black placeholder:text-near-black/30 input-glow mb-3 resize-none"
                  style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                />

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1">
                    <label className="text-xs text-near-black/50 mb-1 block" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                      Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={deadline}
                      min={minDeadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-cream/80 border border-near-black/10 rounded-xl px-4 py-2.5 text-sm text-near-black input-glow"
                      style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                    />
                  </div>
                </div>

                {createError && (
                  <p className="text-failure text-xs mb-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{createError}</p>
                )}

                <button
                  onClick={handleLockIn}
                  disabled={!userInput.trim() || !deadline}
                  className="btn-hover w-full bg-coral text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Lock it in
                </button>
              </motion.div>
            )}

            {/* ── Scanning ── */}
            {createPhase === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                <div className="scanning-rock inline-block mb-4">
                  <CapyTeacher size={100} expression="scanning" animated />
                </div>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-near-black/60 text-sm"
                  style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                >
                  Evaluating your commitment...
                </motion.p>
                <div className="flex justify-center gap-1.5 mt-3">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-coral"
                      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Rejected ── */}
            {createPhase === 'rejected' && (
              <motion.div key="rejected" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
                <CapyTeacher size={80} expression="stern" animated={false} />
                <h3
                  className="text-lg text-near-black mt-3 mb-2"
                  style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}
                >
                  Not specific enough
                </h3>
                <p className="text-sm text-near-black/70 leading-relaxed mb-5 max-w-md mx-auto" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  {rejectedReason}
                </p>
                <button
                  onClick={handleTryAgain}
                  className="btn-hover bg-coral text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Try again
                </button>
              </motion.div>
            )}

            {/* ── Preview AI-refined commitment ── */}
            {createPhase === 'preview' && aiResult && (
              <motion.div key="preview" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-start gap-3 mb-4">
                  <CapyTeacher size={50} expression="happy" animated={false} />
                  <div>
                    <h3
                      className="text-lg text-near-black"
                      style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}
                    >
                      {aiResult.title}
                    </h3>
                    <p className="text-xs text-near-black/50 mt-0.5" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                      Due {new Date(deadline).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="bg-cream/60 rounded-xl p-4 mb-4">
                  <p className="text-sm text-near-black/80 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    {aiResult.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-success font-bold text-lg">+{aiResult.xpReward}</span>
                    <span className="text-xs text-near-black/40" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>XP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-failure font-bold text-lg">{aiResult.xpPenalty}</span>
                    <span className="text-xs text-near-black/40" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>XP risk</span>
                  </div>
                  <div className="ml-auto text-xs text-near-black/40 uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    {getProofLabel(aiResult.verificationMethod)}
                  </div>
                </div>

                <CriteriaRefineChat
                  title="Tell Capy what to tweak"
                  endpoint="/api/commitments/refine"
                  draft={{
                    title: aiResult.title,
                    description: aiResult.description,
                    verificationMethod: aiResult.verificationMethod,
                  }}
                  onDraftUpdate={(d) => {
                    setAiResult((prev) => {
                      if (!prev) return prev;
                      const vm = d.verificationMethod;
                      return {
                        ...prev,
                        title: String(d.title ?? prev.title),
                        description: String(d.description ?? prev.description),
                        verificationMethod:
                          vm === 'photo' || vm === 'text' || vm === 'both' ? vm : prev.verificationMethod,
                      };
                    });
                  }}
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => { setCreatePhase('idle'); setAiResult(null); }}
                    disabled={createSaving}
                    className="btn-hover flex-1 border border-near-black/15 text-near-black/70 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleConfirmCommitment}
                    disabled={createSaving}
                    className="btn-hover flex-1 bg-coral text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {createSaving ? 'Saving...' : 'Confirm'}
                  </button>
                </div>
                {createError && (
                  <p className="text-failure text-xs mt-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    {createError}
                  </p>
                )}
              </motion.div>
            )}

            {/* ── Saved confirmation ── */}
            {createPhase === 'saved' && (
              <motion.div key="saved" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto text-success">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
                <p className="text-near-black/70 text-sm mt-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  Commitment locked in. No backing out now.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
          </div>

          <div className="min-w-0 space-y-6">
        {/* ═══ Section 2: Active Commitments ═══ */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <h2
            className="text-lg text-near-black mb-3"
            style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}
          >
            Active
          </h2>

          {activeCommitments.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
              {pet && <CapyPet size={80} color={pet.color} expression="curious" hat={pet.equippedHat} clothes={pet.equippedClothes} animated />}
              <p className="text-near-black/40 text-sm mt-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                No active goals yet. Set one above.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeCommitments.map((c) => {
                const deadlineMs = getDeadlineMs(c);
                const remaining = deadlineMs - now;
                const urgency = getUrgency(remaining);
                const isProving = provingId === c.id;

                return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`glass-strong rounded-2xl overflow-hidden ${URGENCY_STYLES[urgency]} ${urgency === 'danger' ? 'animate-pulse' : ''}`}
                    style={{ boxShadow: 'var(--shadow-sm)', animationDuration: urgency === 'danger' ? '3s' : undefined }}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-sm font-semibold text-near-black leading-snug" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                          {c.title}
                        </h3>
                        <div className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                          urgency === 'safe' ? 'bg-success/10 text-success' :
                          urgency === 'warning' ? 'bg-amber/15 text-amber' :
                          'bg-failure/10 text-failure'
                        }`} style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                          {formatCountdown(remaining)}
                        </div>
                      </div>

                      <p className="text-xs text-near-black/55 leading-relaxed mb-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                        {c.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                        <span className="text-success font-semibold">+{c.xpReward} XP</span>
                        <span className="text-failure/70">{c.xpPenalty} XP</span>
                        <span className="text-near-black/30 uppercase tracking-wider text-[10px] font-semibold ml-auto">{getProofLabel(c.verificationMethod)}</span>
                      </div>

                      {!isProving && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              sessionStorage.setItem(
                                'capy_goal_prefill',
                                JSON.stringify({
                                  commitmentId: c.id,
                                  taskTitle: c.title,
                                  contextText: [c.userDescription, c.description].filter(Boolean).join('\n\n'),
                                  goalXpReward: c.xpReward,
                                  goalXpPenalty: c.xpPenalty,
                                  goalTitleSnapshot: c.title,
                                })
                              );
                              router.push('/home');
                            }}
                            className="btn-hover w-full mt-3 bg-coral/15 text-coral border border-coral/25 rounded-xl py-2.5 text-sm font-semibold"
                          >
                            Start focus session
                          </button>
                          <button
                            onClick={() => openProof(c.id)}
                            className="btn-hover w-full mt-2 bg-near-black text-white rounded-xl py-2.5 text-sm font-semibold"
                          >
                            Submit Proof
                          </button>
                        </>
                      )}
                    </div>

                    {/* ── Proof panel ── */}
                    <AnimatePresence>
                      {isProving && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-near-black/5"
                        >
                          <div className="p-4 sm:p-5">
                            <AnimatePresence mode="wait">

                              {/* Upload phase */}
                              {proofPhase === 'upload' && (
                                <motion.div key="proof-upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                  <div
                                    {...getRootProps()}
                                    className={`upload-zone cursor-pointer p-4 text-center mb-3 ${isDragActive ? 'upload-zone-active' : ''}`}
                                  >
                                    <input {...getInputProps()} />
                                    <div className="flex flex-col items-center gap-1.5">
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-coral/50">
                                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                      </svg>
                                      <p className="text-xs text-near-black/40" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                                        {isDragActive ? 'Drop photos here' : 'Upload up to 5 photos as proof'}
                                      </p>
                                    </div>
                                  </div>

                                  {proofFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {proofFiles.map((f, i) => (
                                        <div key={i} className="relative group">
                                          <img
                                            src={URL.createObjectURL(f)}
                                            alt=""
                                            className="w-14 h-14 object-cover rounded-lg border border-near-black/10"
                                          />
                                          <button
                                            onClick={() => removeProofFile(i)}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-failure text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            x
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {(c.verificationMethod === 'text' || c.verificationMethod === 'both') && (
                                    <textarea
                                      value={proofText}
                                      onChange={(e) => setProofText(e.target.value)}
                                      placeholder="Describe what you did..."
                                      rows={3}
                                      className="w-full bg-cream/80 border border-near-black/10 rounded-xl px-4 py-3 text-sm text-near-black placeholder:text-near-black/30 input-glow mb-3 resize-none"
                                      style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                                    />
                                  )}

                                  <div className="flex gap-2">
                                    <button
                                      onClick={closeProof}
                                      className="btn-hover flex-1 border border-near-black/15 text-near-black/60 rounded-xl py-2.5 text-sm font-semibold"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleSubmitProof}
                                      disabled={
                                        ((c.verificationMethod === 'photo' || c.verificationMethod === 'both') &&
                                          proofFiles.length === 0) ||
                                        ((c.verificationMethod === 'text' || c.verificationMethod === 'both') &&
                                          !proofText.trim())
                                      }
                                      className="btn-hover flex-1 bg-coral text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      {proofSubmitting ? 'Submitting...' : 'Submit for Verification'}
                                    </button>
                                  </div>
                                </motion.div>
                              )}

                              {/* Scanning phase */}
                              {proofPhase === 'scanning' && (
                                <motion.div key="proof-scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
                                  <div className="scanning-rock inline-block mb-3">
                                    <CapyTeacher size={70} expression="scanning" animated />
                                  </div>
                                  <motion.p
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-near-black/60 text-xs"
                                    style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                                  >
                                    Checking your proof...
                                  </motion.p>
                                </motion.div>
                              )}

                              {/* Result phase */}
                              {proofPhase === 'result' && proofResult && (
                                <motion.div key="proof-result" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>
                                  <div className="flex items-center gap-3 mb-3">
                                    <CapyTeacher size={45} expression={proofResult.approved ? 'happy' : 'stern'} animated={false} />
                                    <div>
                                      <p className={`text-sm font-bold ${proofResult.approved ? 'text-success' : 'text-failure'}`}>
                                        {proofResult.approved ? 'Approved' : 'Not approved'}
                                      </p>
                                      <p className={`text-lg font-bold ${proofResult.xpChange >= 0 ? 'text-success' : 'text-failure'}`}>
                                        {proofResult.xpChange >= 0 ? '+' : ''}{proofResult.xpChange} XP
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-xs text-near-black/70 leading-relaxed mb-4" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                                    {proofResult.feedbackText}
                                  </p>
                                  <button
                                    onClick={closeProof}
                                    className="btn-hover w-full bg-near-black text-white rounded-xl py-2.5 text-sm font-semibold"
                                  >
                                    Done
                                  </button>
                                </motion.div>
                              )}

                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ═══ Section 3: History ═══ */}
        {pastCommitments.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 mb-3 group"
            >
              <h2
                className="text-lg text-near-black/60 group-hover:text-near-black transition-colors"
                style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}
              >
                Past Goals
              </h2>
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-near-black/40"
                animate={{ rotate: showHistory ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <polyline points="6 9 12 15 18 9" />
              </motion.svg>
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-2 overflow-hidden"
                >
                  {pastCommitments.map((c) => (
                    <HistoryCard key={c.id} commitment={c} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

          </div>
        </div>

      </div>
    </div>
  );
}

function HistoryCard({ commitment: c }: { commitment: CommitmentWithId }) {
  const [expanded, setExpanded] = useState(false);
  const isApproved = c.status === 'completed' && c.approved;

  return (
    <motion.div
      layout
      className={`glass rounded-xl overflow-hidden cursor-pointer ${isApproved ? 'border-l-4 border-l-success/40' : 'border-l-4 border-l-failure/40'}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={isApproved ? 'text-success shrink-0' : 'text-failure shrink-0'}>
              {isApproved ? (
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></>
              )}
            </svg>
            <span className="text-sm text-near-black/80 truncate" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              {c.title}
            </span>
          </div>
          <span className={`shrink-0 text-xs font-bold ${isApproved ? 'text-success' : 'text-failure'}`}>
            {isApproved ? `+${c.xpReward}` : c.xpPenalty} XP
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-near-black/5 overflow-hidden"
          >
            <div className="p-4 pt-3">
              {c.aiFeedback && (
                <p className="text-xs text-near-black/60 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  {c.aiFeedback}
                </p>
              )}
              {c.completedAt && (
                <p className="text-[10px] text-near-black/30 mt-2" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  {c.completedAt?.toDate ? c.completedAt.toDate().toLocaleString() : ''}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
