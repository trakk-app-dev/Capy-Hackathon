'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { onAuthStateChanged } from '@/lib/auth';
import {
  getUserProfile,
  getPet,
  getAllCommitments,
  failOverdueCommitments,
  type PetData,
  type UserProfile,
  type CommitmentData,
} from '@/lib/db';
import { uploadMultipleImages } from '@/lib/storage';
import { ALL_ITEMS } from '@/lib/items';
import CapyTeacher from '@/components/CapyTeacher';
import CapyPet from '@/components/CapyPet';
import { getXPProgress, getXPForNextLevel } from '@/lib/db';

export default function HomePage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);

  // Session setup
  const [taskTitle, setTaskTitle] = useState('');
  const [contextText, setContextText] = useState('');
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [timeEstimate, setTimeEstimate] = useState(1800); // 30 min default
  const [submitting, setSubmitting] = useState(false);
  const [activeGoals, setActiveGoals] = useState<(CommitmentData & { id: string })[]>([]);
  const [linkedCommitmentId, setLinkedCommitmentId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const draftRaw = sessionStorage.getItem('capy_home_draft');
    if (draftRaw) {
      try {
        const draft = JSON.parse(draftRaw) as {
          taskTitle?: string;
          contextText?: string;
          timeEstimate?: number;
          commitmentId?: string;
        };
        if (draft.taskTitle) setTaskTitle(draft.taskTitle);
        if (draft.contextText) setContextText(draft.contextText);
        if (typeof draft.timeEstimate === 'number' && !Number.isNaN(draft.timeEstimate)) {
          setTimeEstimate(draft.timeEstimate);
        }
        if (draft.commitmentId) setLinkedCommitmentId(draft.commitmentId);
      } catch {
        sessionStorage.removeItem('capy_home_draft');
      }
    } else {
      const goalPref = sessionStorage.getItem('capy_goal_prefill');
      if (goalPref) {
        try {
          const g = JSON.parse(goalPref) as {
            commitmentId?: string;
            taskTitle?: string;
            contextText?: string;
          };
          if (g.taskTitle) setTaskTitle(g.taskTitle);
          if (g.contextText) setContextText(g.contextText);
          if (g.commitmentId) setLinkedCommitmentId(g.commitmentId);
          sessionStorage.removeItem('capy_goal_prefill');
        } catch {
          sessionStorage.removeItem('capy_goal_prefill');
        }
      }
    }

    const unsub = onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/signup');
        return;
      }
      setUid(user.uid);
      try {
        const [prof, petData] = await Promise.all([
          getUserProfile(user.uid),
          getPet(user.uid),
        ]);
        setProfile(prof);
        setPet(petData);

        if (!prof?.onboardingComplete) {
          router.push('/onboarding');
          return;
        }

        // A task typed on the landing page goes straight into the first-step
        // flow. Consumed only after onboarding so it survives that detour.
        const pendingTask = sessionStorage.getItem('capy_pending_task');
        if (pendingTask) {
          sessionStorage.removeItem('capy_pending_task');
          sessionStorage.setItem('capy_start_prefill', pendingTask);
          router.replace('/start');
          return;
        }

        // Check for overdue commitments and apply penalties
        const failedGoals = await failOverdueCommitments(user.uid, ALL_ITEMS);
        if (failedGoals.length > 0) {
          const refreshedPet = await getPet(user.uid);
          setPet(refreshedPet);
        }

        const allGoals = await getAllCommitments(user.uid);
        setActiveGoals(allGoals.filter((c) => c.status === 'active'));
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [router]);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setContextFiles((prev) => [...prev, ...acceptedFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setContextFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  const goToStart = () => {
    if (taskTitle.trim()) sessionStorage.setItem('capy_start_prefill', taskTitle.trim());
    router.push('/start');
  };

  const handleStartSession = async () => {
    if (!uid || !taskTitle.trim()) return;
    setSubmitting(true);

    try {
      // Upload context images to Firebase Storage
      let contextImageUrls: string[] = [];
      if (contextFiles.length > 0) {
        contextImageUrls = await uploadMultipleImages(uid, contextFiles, 'context');
      }

      const linked = linkedCommitmentId
        ? activeGoals.find((c) => c.id === linkedCommitmentId)
        : undefined;

      sessionStorage.setItem(
        'capy_session_setup',
        JSON.stringify({
          taskTitle: taskTitle.trim(),
          contextText: contextText.trim(),
          contextImageUrls,
          timeEstimate,
          ...(linked
            ? {
                commitmentId: linked.id,
                goalXpReward: linked.xpReward,
                goalXpPenalty: linked.xpPenalty,
                goalTitleSnapshot: linked.title,
              }
            : {}),
        })
      );
      sessionStorage.removeItem('capy_home_draft');

      router.push('/evaluate');
    } catch (err) {
      console.error('Failed to start session:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="gradient-home min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="scanning-rock inline-block">
            <CapyTeacher size={80} expression="scanning" animated />
          </div>
          <p className="text-near-black/40 text-sm mt-4" style={{ fontFamily: 'var(--font-body)' }}>
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  const xpProgress = pet ? getXPProgress(pet.xp, pet.level) : null;

  return (
    <div className="gradient-home min-h-screen">

      <div className="px-4 sm:px-5 lg:px-6 py-6 lg:py-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* ═══ LEFT: Teacher + Pet ═══ */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Teacher greeting */}
            <div className="glass-strong rounded-2xl p-6 mb-4" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="flex items-center gap-4">
                <CapyTeacher size={60} expression="happy" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-near-black/80 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    <strong className="text-near-black">Welcome back{profile?.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}.</strong>{' '}
                    What are we working on today?
                  </p>
                </div>
              </div>
            </div>

            {/* Pet card */}
            {pet && (
              <div className="glass-strong rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-near-black" style={{ fontStyle: 'italic' }}>{pet.name}</h3>
                    <p className="text-xs text-near-black/55" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                      Level {pet.level} · {pet.xp} XP
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/closet')}
                    className="btn-hover text-xs bg-coral/10 text-coral px-3 py-1.5 rounded-lg font-medium"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Closet
                  </button>
                </div>

                <div className="flex justify-center mb-4">
                  <CapyPet
                    size={140}
                    color={pet.color}
                    expression="happy"
                    hat={pet.equippedHat}
                    clothes={pet.equippedClothes}
                    animated
                  />
                </div>

                {/* XP progress bar */}
                {xpProgress && (
                  <div>
                    <div className="flex justify-between text-[10px] text-near-black/50 mb-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                      <span>Level {pet.level}</span>
                      <span>{xpProgress.current}/{xpProgress.needed} XP</span>
                      <span>Level {pet.level + 1}</span>
                    </div>
                    <div className="h-2 bg-near-black/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-coral rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ═══ RIGHT: Session Setup ═══ */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* Stuck on starting? → first-step flow (/start) */}
            <div className="glass-strong rounded-2xl p-5 mb-4 flex items-center gap-4" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg text-near-black">Stuck on starting?</h3>
                <p className="text-xs text-near-black/55 mt-0.5 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  Capy finds one small first step with you, then checks it. No stakes.
                </p>
              </div>
              <button
                onClick={goToStart}
                className="btn-hover flex-shrink-0 bg-coral text-white px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ boxShadow: 'var(--shadow-glow)' }}
              >
                Help me start
              </button>
            </div>

            <div className="glass-strong rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
              <h2 className="text-xl mb-4 text-near-black">New session</h2>

              {activeGoals.length > 0 && (
                <div className="mb-4">
                  <label className="text-xs text-near-black/60 mb-1.5 block font-medium" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    Link to a goal (optional)
                  </label>
                  <select
                    value={linkedCommitmentId ?? ''}
                    onChange={(e) => setLinkedCommitmentId(e.target.value || null)}
                    className="input-glow w-full bg-white rounded-xl px-4 py-2.5 text-sm text-near-black"
                    style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                  >
                    <option value="">None — regular focus session</option>
                    {activeGoals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-near-black/40 mt-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    Stakes and proof follow that goal when linked.
                  </p>
                </div>
              )}

              {/* Task title */}
              <div className="mb-4">
                <label className="text-xs text-near-black/60 mb-1.5 block font-medium" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  What do you need to finish?
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="AP Bio lab report, chapter 3 homework..."
                  className="input-glow w-full bg-white rounded-xl px-4 py-3 text-sm text-near-black placeholder-near-black/25"
                  style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
                />
              </div>

              {/* Context text */}
              <div className="mb-4">
                <label className="text-xs text-near-black/60 mb-1.5 block font-medium" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  Any extra context? (optional)
                </label>
                <textarea
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  placeholder="The rubric says I need 3 paragraphs..."
                  rows={2}
                  className="input-glow w-full bg-white rounded-xl px-4 py-3 text-sm text-near-black placeholder-near-black/25 resize-none"
                  style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
                />
              </div>

              {/* Image upload zone */}
              <div className="mb-4">
                <label className="text-xs text-near-black/60 mb-1.5 block font-medium" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  Upload rubric / instructions (optional)
                </label>
                <div
                  {...getRootProps()}
                  className={`upload-zone cursor-pointer p-4 text-center ${isDragActive ? 'upload-zone-active' : ''}`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-coral/40">
                      <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-xs text-near-black/35" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                      {isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}
                    </p>
                  </div>
                </div>

                {/* File previews */}
                {contextFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contextFiles.map((file, i) => (
                      <div key={i} className="relative group w-14 h-14 rounded-lg overflow-hidden bg-near-black/5">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeFile(i)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Time slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-near-black/60 font-medium" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    How long will this take?
                  </label>
                  <span className="text-sm font-bold text-coral" style={{ fontFamily: 'var(--font-mono)' }}>
                    {formatTime(timeEstimate)}
                  </span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={7200}
                  step={300}
                  value={timeEstimate}
                  onChange={(e) => setTimeEstimate(parseInt(e.target.value))}
                  className="w-full accent-coral"
                  style={{ height: '6px' }}
                />
                <div className="flex justify-between text-[10px] text-near-black/40 mt-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  <span>5 min</span>
                  <span>2 hours</span>
                </div>
              </div>

              {/* Start button */}
              <button
                onClick={handleStartSession}
                disabled={!taskTitle.trim() || submitting}
                className="btn-hover w-full bg-coral text-white rounded-xl py-3.5 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ boxShadow: taskTitle.trim() ? 'var(--shadow-glow)' : 'none' }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </span>
                    Uploading images...
                  </span>
                ) : 'Start Session'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
