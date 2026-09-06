'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';
import { onAuthStateChanged } from '@/lib/auth';
import { getSession, updateSession, type SessionData } from '@/lib/db';
import { uploadMultipleImages } from '@/lib/storage';
import CapyPet from '@/components/CapyPet';
import { getPet, type PetData } from '@/lib/db';
import type { PetExpression } from '@/components/CapyPet';
import { playSound } from '@/lib/sounds';

export default function TimerPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [pet, setPet] = useState<PetData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);
  const [overtimeSeconds, setOvertimeSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [proofText, setProofText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimeRef = useRef(0);

  // Auth + load data — sessionStorage only, no Firestore recovery
  useEffect(() => {
    const unsub = onAuthStateChanged(async (user) => {
      if (!user) { router.push('/signup'); return; }
      setUid(user.uid);

      const sid = sessionStorage.getItem('capy_active_session');
      const time = sessionStorage.getItem('capy_session_time');
      if (!sid || !time) { router.push('/home'); return; }

      setSessionId(sid);
      const totalSecs = parseInt(time);
      if (isNaN(totalSecs) || totalSecs <= 0) { router.push('/home'); return; }
      totalTimeRef.current = totalSecs;

      // Handle page refresh by calculating elapsed time from start timestamp
      const startedAtRaw = sessionStorage.getItem('capy_timer_started_at');
      if (startedAtRaw) {
        const startedAt = parseInt(startedAtRaw);
        const elapsedSecs = Math.floor((Date.now() - startedAt) / 1000);

        if (elapsedSecs >= totalSecs + 60) {
          // Overtime expired while away
          sessionStorage.setItem('capy_timer_result', 'expired');
          router.push('/verify');
          return;
        } else if (elapsedSecs >= totalSecs) {
          // In overtime
          setTimeRemaining(0);
          setIsOvertime(true);
          setOvertimeSeconds(Math.min(60, elapsedSecs - totalSecs));
        } else {
          setTimeRemaining(totalSecs - elapsedSecs);
        }
      } else {
        // First load — record start time
        sessionStorage.setItem('capy_timer_started_at', Date.now().toString());
        setTimeRemaining(totalSecs);
      }

      const [sessionData, petData] = await Promise.all([
        getSession(user.uid, sid),
        getPet(user.uid),
      ]);
      setSession(sessionData);
      setPet(petData);
    });
    return unsub;
  }, [router]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 && !isFinished) return;
    if (isFinished) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 30 && prev > 1) {
          playSound('tick');
        }
        if (prev <= 1) {
          setIsOvertime(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isFinished, timeRemaining]);

  // Overtime counter
  useEffect(() => {
    if (!isOvertime || isFinished) return;
    const interval = setInterval(() => {
      setOvertimeSeconds((prev) => {
        if (prev >= 60) {
          clearInterval(interval);
          handleTimerExpired();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOvertime, isFinished]);

  const handleTimerExpired = useCallback(async () => {
    if (!uid || !sessionId) return;
    setIsFinished(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    await updateSession(uid, sessionId, {
      status: 'failed',
      timeActual: totalTimeRef.current + 60,
    });

    sessionStorage.setItem('capy_timer_result', 'expired');
    router.push('/verify');
  }, [uid, sessionId, router]);

  // Multi-photo dropzone
  const onDrop = useCallback((files: File[]) => {
    setProofFiles((prev) => [...prev, ...files].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    setProofFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const linkedGoal = Boolean(session?.commitmentId);
  const proofValid = proofFiles.length > 0 || proofText.trim().length > 0;

  const handleSubmitProof = async () => {
    if (!uid || !sessionId) return;
    if (!proofValid) return;

    setSubmitting(true);
    setIsFinished(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      let proofImageUrls: string[] = [];
      if (proofFiles.length > 0) {
        proofImageUrls = await uploadMultipleImages(uid, proofFiles, 'proof');
      }

      const elapsed = totalTimeRef.current - timeRemaining;
      await updateSession(uid, sessionId, {
        proofImageUrl: proofImageUrls[0] || null,
        proofText: proofText.trim(),
        timeActual: elapsed,
      });

      // Store all proof URLs for verify
      sessionStorage.setItem('capy_proof_urls', JSON.stringify(proofImageUrls));
      sessionStorage.setItem('capy_timer_result', 'submitted');
      router.push('/verify');
    } catch (err) {
      console.error('Failed to submit proof:', err);
      setSubmitting(false);
      setIsFinished(false);
    }
  };

  // Format time display
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ═══ Continuous Gradient System ═══
  const lerpColor = (a: [number,number,number], b: [number,number,number], t: number): [number,number,number] => {
    const ct = Math.max(0, Math.min(1, t));
    return [
      Math.round(a[0] + (b[0] - a[0]) * ct),
      Math.round(a[1] + (b[1] - a[1]) * ct),
      Math.round(a[2] + (b[2] - a[2]) * ct),
    ];
  };
  const rgb = (c: [number,number,number]) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const rgba = (c: [number,number,number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  const GRADIENT_STOPS: { at: number; primary: [number,number,number]; secondary: [number,number,number]; bg1: [number,number,number]; bg2: [number,number,number]; bg3: [number,number,number] }[] = [
    { at: 1.00, primary: [255,126,95],  secondary: [254,180,123], bg1: [255,107,61],  bg2: [255,140,66],  bg3: [255,179,71] },
    { at: 0.75, primary: [232,93,58],   secondary: [107,63,160],  bg1: [220,90,55],   bg2: [160,70,120],  bg3: [180,100,140] },
    { at: 0.50, primary: [107,63,160],  secondary: [74,45,122],   bg1: [130,60,140],  bg2: [90,50,130],   bg3: [100,55,135] },
    { at: 0.25, primary: [45,27,105],   secondary: [30,18,82],    bg1: [60,30,110],   bg2: [40,22,90],    bg3: [50,25,100] },
    { at: 0.00, primary: [180,40,60],   secondary: [239,68,68],   bg1: [100,20,50],   bg2: [60,15,40],    bg3: [80,18,45] },
  ];

  const getGradientColors = () => {
    if (isOvertime) {
      return {
        primary: [239,68,68] as [number,number,number],
        secondary: [200,40,40] as [number,number,number],
        bg1: [80,15,15] as [number,number,number],
        bg2: [50,10,10] as [number,number,number],
        bg3: [65,12,12] as [number,number,number],
      };
    }
    const progress = totalTimeRef.current > 0 ? timeRemaining / totalTimeRef.current : 1;
    for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
      const upper = GRADIENT_STOPS[i];
      const lower = GRADIENT_STOPS[i + 1];
      if (progress <= upper.at && progress >= lower.at) {
        const t = (upper.at - progress) / (upper.at - lower.at);
        return {
          primary: lerpColor(upper.primary, lower.primary, t),
          secondary: lerpColor(upper.secondary, lower.secondary, t),
          bg1: lerpColor(upper.bg1, lower.bg1, t),
          bg2: lerpColor(upper.bg2, lower.bg2, t),
          bg3: lerpColor(upper.bg3, lower.bg3, t),
        };
      }
    }
    const s = GRADIENT_STOPS[0];
    return { primary: s.primary, secondary: s.secondary, bg1: s.bg1, bg2: s.bg2, bg3: s.bg3 };
  };

  const gradientColors = getGradientColors();

  const getTimerColor = () => {
    if (isOvertime) return '#EF4444';
    return '#FFFFFF';
  };

  const getTimerGlow = () => {
    const c = gradientColors.primary;
    if (isOvertime) return `0 0 60px ${rgba(c,0.4)}, 0 0 120px ${rgba(c,0.15)}`;
    const progress = totalTimeRef.current > 0 ? timeRemaining / totalTimeRef.current : 1;
    const intensity = 0.15 + (1 - progress) * 0.25;
    return `0 0 ${30 + (1 - progress) * 30}px ${rgba(c, intensity)}, 0 0 ${60 + (1 - progress) * 60}px ${rgba(c, intensity * 0.4)}`;
  };

  const getTimerNeonStyle = (): React.CSSProperties => {
    const c = gradientColors.primary;
    const progress = totalTimeRef.current > 0 ? timeRemaining / totalTimeRef.current : 1;
    if (isOvertime) {
      return { animation: 'neon-digits-critical 0.7s ease-in-out infinite' };
    }
    const glowSize = 8 + (1 - progress) * 14;
    const outerSize = 20 + (1 - progress) * 35;
    const speed = 2 - (1 - progress) * 1.3;
    return {
      filter: `drop-shadow(0 0 ${glowSize}px ${rgba(c,0.8)}) drop-shadow(0 0 ${outerSize}px ${rgba(c,0.4)})`,
      animation: progress < 0.1 ? `digit-breathe ${speed}s ease-in-out infinite` : undefined,
    };
  };

  const getPetExpression = (): PetExpression => {
    if (isOvertime) return 'panicking';
    const ratio = timeRemaining / totalTimeRef.current;
    if (ratio > 0.5) return 'curious';
    if (ratio > 0.2) return 'worried';
    return 'panicking';
  };

  const getBgStyle = (): React.CSSProperties => {
    const { bg1, bg2, bg3 } = gradientColors;
    return {
      background: `
        radial-gradient(ellipse at 20% 30%, ${rgba(bg1,0.45)}, transparent 45%),
        radial-gradient(ellipse at 80% 20%, ${rgba(bg2,0.5)}, transparent 40%),
        radial-gradient(ellipse at 50% 80%, ${rgba(bg3,0.4)}, transparent 50%),
        radial-gradient(ellipse at 60% 50%, ${rgba(bg1,0.3)}, transparent 55%),
        linear-gradient(160deg, ${rgb(bg1)}, ${rgb(bg2)}, ${rgb(bg3)})
      `,
    };
  };

  if (!session || !pet) return (
    <div className="gradient-timer min-h-screen flex items-center justify-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-coral animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="gradient-timer min-h-screen flex flex-col relative overflow-hidden"
      style={{ ...getBgStyle(), transition: 'background 2s ease' }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, -30, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${getTimerColor()}40, transparent)` }}
        />
        <motion.div
          animate={{ x: [0, -40, 30, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[15%] right-[10%] w-[250px] h-[250px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${getTimerColor()}30, transparent)` }}
        />
        <motion.div
          animate={{ x: [0, 20, -40, 0], y: [0, -50, 10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[50%] left-[50%] w-[200px] h-[200px] rounded-full opacity-5"
          style={{ background: `radial-gradient(circle, ${getTimerColor()}50, transparent)` }}
        />
      </div>

      {/* Overtime flash */}
      {isOvertime && overtimeSeconds < 2 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-white z-50"
        />
      )}

      {/* ═══ MAIN CONTENT — Two-panel on desktop, stacked on mobile ═══ */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch relative z-10 px-4 sm:px-5 lg:px-8 py-6 lg:py-8 gap-6 lg:gap-8 max-w-7xl mx-auto w-full">

        {/* ═══ LEFT PANEL (mobile: second, desktop: first) — Proof Upload ═══ */}
        <div className="order-2 lg:order-1 lg:w-[42%] flex flex-col justify-center">
          <div className="glass-strong rounded-2xl p-5 lg:p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h3 className="text-sm font-semibold text-near-black mb-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              Upload your proof {proofFiles.length > 0 && <span className="text-coral">({proofFiles.length}/5)</span>}
            </h3>

            {/* Multi-photo upload */}
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
                  {isDragActive ? 'Drop photos here' : 'Upload up to 5 screenshots of your work'}
                </p>
              </div>
            </div>

            {/* Photo previews grid */}
            {proofFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {proofFiles.map((file, i) => (
                  <div key={i} className="relative group w-14 h-14 rounded-lg overflow-hidden bg-near-black/5">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Proof ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Text proof */}
            <textarea
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              placeholder={linkedGoal ? 'Short note to go with your photo(s)…' : 'Or describe what you did...'}
              rows={2}
              className="input-glow w-full bg-white rounded-xl px-4 py-3 text-xs text-near-black placeholder-near-black/30 resize-none mb-3"
              style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
            />

            {linkedGoal && (
              <p className="text-[10px] text-coral/90 mb-2 font-medium" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                Linked to a goal — your proof counts toward it.
              </p>
            )}

            <button
              onClick={handleSubmitProof}
              disabled={!proofValid || submitting}
              className="btn-hover w-full bg-coral text-white rounded-xl py-3 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </span>
                  Uploading proof...
                </span>
              ) : 'Submit proof'}
            </button>
          </div>
        </div>

        {/* ═══ RIGHT PANEL (mobile: first, desktop: second) — Timer + Pet + Task ═══ */}
        <div className="order-1 lg:order-2 lg:w-[58%] flex flex-col items-center justify-center">
          {/* Overtime label */}
          {isOvertime && (
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-failure text-sm font-bold uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              ⚠️ OVERTIME — {60 - overtimeSeconds}s left
            </motion.p>
          )}

          {/* BIG Timer with pulsing glow */}
          <motion.div
            className="rounded-3xl px-10 py-6 lg:px-12 lg:py-8"
            animate={isOvertime ? { scale: [1, 1.02, 1] } : {}}
            transition={isOvertime ? { duration: 0.8, repeat: Infinity } : {}}
            style={{
              boxShadow: getTimerGlow(),
              transition: 'box-shadow 1s ease',
            }}
          >
            <p
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tabular-nums tracking-tight"
              style={{
                fontFamily: 'var(--font-mono)',
                color: getTimerColor(),
                transition: 'color 1s ease',
                ...getTimerNeonStyle(),
              }}
            >
              {isOvertime ? `-${formatTimer(overtimeSeconds)}` : formatTimer(timeRemaining)}
            </p>
          </motion.div>

          {/* Task description — in a glass box for visibility */}
          <div className="glass-strong rounded-xl px-5 py-3 mt-5 max-w-md text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-sm text-near-black/70 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              {session.aiTaskDescription || session.taskTitle}
            </p>
          </div>

          {/* Pet */}
          <motion.div
            className="mt-5"
            animate={isOvertime ? { x: [-2, 2, -2] } : {}}
            transition={isOvertime ? { duration: 0.3, repeat: Infinity } : {}}
          >
            <CapyPet
              size={110}
              color={pet.color}
              expression={getPetExpression()}
              hat={pet.equippedHat}
              clothes={pet.equippedClothes}
              animated
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
