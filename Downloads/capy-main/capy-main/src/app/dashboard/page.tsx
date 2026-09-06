'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged } from '@/lib/auth';
import { getAllSessions, getAllCommitments, getPet, getXPProgress, type SessionData, type PetData, type CommitmentData } from '@/lib/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CapyPet from '@/components/CapyPet';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

type TimeFilter = 'all' | 'week' | 'month';
type GoalFilter = 'all' | 'active' | 'completed' | 'failed';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState<PetData | null>(null);
  const [sessions, setSessions] = useState<(SessionData & { id: string })[]>([]);
  const [commitments, setCommitments] = useState<(CommitmentData & { id: string })[]>([]);
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(async (user) => {
      if (!user) { router.push('/signup'); return; }
      try {
        const [petData, sessionData, commitmentData] = await Promise.all([
          getPet(user.uid),
          getAllSessions(user.uid),
          getAllCommitments(user.uid),
        ]);
        setPet(petData);
        setSessions(sessionData);
        setCommitments(commitmentData);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [router]);

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'all') return true;
    const ts = s.timestamp?.toDate?.();
    if (!ts) return true;
    const now = new Date();
    if (filter === 'week') return now.getTime() - ts.getTime() < 7 * 24 * 60 * 60 * 1000;
    if (filter === 'month') return now.getTime() - ts.getTime() < 30 * 24 * 60 * 60 * 1000;
    return true;
  });

  const completedSessions = filteredSessions.filter((s) => s.status === 'completed');
  const totalXP = filteredSessions.reduce((sum, s) => sum + (s.xpChange || 0), 0);
  const successRate = filteredSessions.length > 0
    ? Math.round((completedSessions.length / filteredSessions.length) * 100)
    : 0;

  // ─── Streak ────────────────────────────────────────────────────
  const calculateStreak = () => {
    let streak = 0;
    const sorted = [...sessions].sort((a, b) => {
      const aDate = a.timestamp?.toDate?.()?.getTime() || 0;
      const bDate = b.timestamp?.toDate?.()?.getTime() || 0;
      return bDate - aDate;
    });
    const today = new Date();
    let currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (const s of sorted) {
      const sDate = s.timestamp?.toDate?.();
      if (!sDate) continue;
      const sessionDay = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
      const diff = Math.floor((currentDay.getTime() - sessionDay.getTime()) / (24 * 60 * 60 * 1000));
      if (diff <= 1 && s.status === 'completed') {
        if (diff === 1) currentDay = sessionDay;
        streak++;
      } else if (diff > 1) break;
    }
    return streak;
  };

  // ─── Total Focus Minutes ────────────────────────────────────────
  const totalFocusSeconds = useMemo(() =>
    sessions.reduce((sum, s) => sum + (s.timeActual || 0), 0),
    [sessions]
  );
  const focusHours = Math.floor(totalFocusSeconds / 3600);
  const focusMinutes = Math.floor((totalFocusSeconds % 3600) / 60);

  // ─── Best Day ──────────────────────────────────────────────────
  const bestDay = useMemo(() => {
    const dayCounts: Record<string, { count: number; date: Date }> = {};
    for (const s of sessions) {
      if (s.status !== 'completed') continue;
      const d = s.timestamp?.toDate?.();
      if (!d) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!dayCounts[key]) dayCounts[key] = { count: 0, date: d };
      dayCounts[key].count++;
    }
    let best: { count: number; date: Date } | null = null;
    for (const v of Object.values(dayCounts)) {
      if (!best || v.count > best.count) best = v;
    }
    if (!best) return null;

    const now = new Date();
    const diffDays = Math.floor((now.getTime() - best.date.getTime()) / (24 * 60 * 60 * 1000));
    let label: string;
    if (diffDays === 0) label = 'Today';
    else if (diffDays === 1) label = 'Yesterday';
    else if (diffDays < 7) label = `Last ${best.date.toLocaleDateString('en-US', { weekday: 'long' })}`;
    else label = best.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return { label, count: best.count };
  }, [sessions]);

  // ─── Current Trend ──────────────────────────────────────────────
  const trend = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = now.getTime() - 14 * 24 * 60 * 60 * 1000;
    const thisWeek = sessions.filter((s) => {
      const t = s.timestamp?.toDate?.()?.getTime();
      return t && t >= oneWeekAgo && s.status === 'completed';
    }).length;
    const lastWeek = sessions.filter((s) => {
      const t = s.timestamp?.toDate?.()?.getTime();
      return t && t >= twoWeeksAgo && t < oneWeekAgo && s.status === 'completed';
    }).length;
    const diff = thisWeek - lastWeek;
    if (diff > 0) return { icon: '↑', text: `${diff} more session${diff > 1 ? 's' : ''} than last week`, color: 'text-success' };
    if (diff < 0) return { icon: '↓', text: `${Math.abs(diff)} fewer session${Math.abs(diff) > 1 ? 's' : ''} than last week`, color: 'text-failure' };
    return { icon: '→', text: 'Same as last week', color: 'text-amber' };
  }, [sessions]);

  // ─── Categories (best-effort parse from titles) ─────────────────
  const categories = useMemo(() => {
    const SUBJECTS = ['bio', 'biology', 'chem', 'chemistry', 'physics', 'math', 'calc', 'calculus', 'algebra', 'geometry', 'stats', 'statistics',
      'english', 'lit', 'literature', 'writing', 'essay', 'history', 'gov', 'government', 'econ', 'economics', 'psych', 'psychology',
      'spanish', 'french', 'latin', 'art', 'music', 'cs', 'computer science', 'apush', 'ap bio', 'ap chem', 'ap physics', 'ap lang', 'ap lit',
      'ap calc', 'ap stats', 'ap psych', 'ap gov', 'ap euro', 'ap world'];
    const NORMALIZE: Record<string, string> = {
      bio: 'Bio', biology: 'Bio', 'ap bio': 'AP Bio',
      chem: 'Chem', chemistry: 'Chem', 'ap chem': 'AP Chem',
      physics: 'Physics', 'ap physics': 'AP Physics',
      math: 'Math', calc: 'Calc', calculus: 'Calc', 'ap calc': 'AP Calc',
      algebra: 'Math', geometry: 'Math',
      stats: 'Stats', statistics: 'Stats', 'ap stats': 'AP Stats',
      english: 'English', lit: 'English', literature: 'English', writing: 'English', essay: 'English',
      'ap lang': 'AP Lang', 'ap lit': 'AP Lit',
      history: 'History', apush: 'APUSH', 'ap euro': 'AP Euro', 'ap world': 'AP World',
      gov: 'Gov', government: 'Gov', 'ap gov': 'AP Gov',
      econ: 'Econ', economics: 'Econ',
      psych: 'Psych', psychology: 'Psych', 'ap psych': 'AP Psych',
      spanish: 'Spanish', french: 'French', latin: 'Latin',
      art: 'Art', music: 'Music',
      cs: 'CS', 'computer science': 'CS',
    };

    const counts: Record<string, number> = {};
    for (const s of sessions) {
      const title = s.taskTitle.toLowerCase();
      // Try longer phrases first
      const sortedSubjects = [...SUBJECTS].sort((a, b) => b.length - a.length);
      let matched = false;
      for (const subj of sortedSubjects) {
        if (title.includes(subj)) {
          const label = NORMALIZE[subj] || subj;
          counts[label] = (counts[label] || 0) + 1;
          matched = true;
          break;
        }
      }
      if (!matched) {
        counts['Other'] = (counts['Other'] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [sessions]);

  // ─── XP Over Time chart data ────────────────────────────────────
  const chartData = useMemo(() => {
    if (sessions.length === 0) return [];
    // Sort chronologically
    const sorted = [...sessions]
      .filter((s) => s.timestamp?.toDate)
      .sort((a, b) => {
        const aT = a.timestamp?.toDate?.()?.getTime() || 0;
        const bT = b.timestamp?.toDate?.()?.getTime() || 0;
        return aT - bT;
      });

    let cumulativeXP = 0;
    const points: { date: string; xp: number; rawDate: Date }[] = [];
    for (const s of sorted) {
      cumulativeXP += s.xpChange || 0;
      const d = s.timestamp?.toDate?.();
      if (d) {
        points.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          xp: Math.max(0, cumulativeXP),
          rawDate: d,
        });
      }
    }
    // Deduplicate by date (keep last entry per day)
    const byDate = new Map<string, typeof points[0]>();
    for (const p of points) byDate.set(p.date, p);
    return Array.from(byDate.values());
  }, [sessions]);

  const xpProgress = pet ? getXPProgress(pet.xp, pet.level) : null;

  const filteredCommitments = useMemo(() => {
    return commitments.filter((c) => {
      if (goalFilter === 'all') return true;
      return c.status === goalFilter;
    });
  }, [commitments, goalFilter]);

  if (loading) {
    return (
      <div className="gradient-dashboard min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="skeleton w-48 h-8 mx-auto" />
          <div className="skeleton w-32 h-4 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-dashboard min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 lg:px-6 pt-6 lg:pt-8 pb-4">
        <button onClick={() => router.push('/home')} className="flex items-center gap-1.5 text-sm text-near-black/40 hover:text-coral transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Home
        </button>
        <h1 className="text-2xl text-near-black">Dashboard</h1>
        <div className="w-16" />
      </div>

      <div className="px-4 sm:px-5 lg:px-6 pb-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-10 gap-5 lg:gap-6">
          {/* ═══ LEFT: Stats Overview (~30%) ═══ */}
          <div className="lg:col-span-3 space-y-4">
            {/* Pet card */}
            {pet && (
              <motion.div initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="glass-strong rounded-2xl p-5 text-center" style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="flex justify-center">
                  <CapyPet size={80} color={pet.color} expression="happy" hat={pet.equippedHat} clothes={pet.equippedClothes} animated />
                </div>
                <h3 className="text-base mt-2 text-near-black">{pet.name}</h3>
                <p className="text-xs text-near-black/40 mb-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Level {pet.level} · {pet.xp} XP</p>
                {xpProgress && (
                  <div className="h-2 bg-near-black/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-coral rounded-full" animate={{ width: `${xpProgress.percentage}%` }} transition={{ duration: 0.8 }} />
                  </div>
                )}
              </motion.div>
            )}

            {/* Stats grid */}
            <motion.div initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-2xl font-extrabold text-coral" style={{ fontFamily: 'var(--font-mono)' }}>{filteredSessions.length}</p>
                <p className="text-[10px] text-near-black/35 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Sessions</p>
              </div>
              <div className="glass rounded-xl p-4 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-2xl font-extrabold text-success" style={{ fontFamily: 'var(--font-mono)' }}>{successRate}%</p>
                <p className="text-[10px] text-near-black/35 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Success</p>
              </div>
              <div className="glass rounded-xl p-4 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-2xl font-extrabold text-amber" style={{ fontFamily: 'var(--font-mono)' }}>{calculateStreak()}</p>
                <p className="text-[10px] text-near-black/35 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Streak</p>
              </div>
              <div className="glass rounded-xl p-4 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <p className={`text-2xl font-extrabold ${totalXP >= 0 ? 'text-success' : 'text-failure'}`} style={{ fontFamily: 'var(--font-mono)' }}>{totalXP >= 0 ? '+' : ''}{totalXP}</p>
                <p className="text-[10px] text-near-black/35 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>XP</p>
              </div>
            </motion.div>

            {/* Total Focus Time */}
            <motion.div initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }}
              className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-[10px] text-near-black/35 uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Total Focus Time</p>
              <p className="text-xl font-extrabold text-near-black" style={{ fontFamily: 'var(--font-mono)' }}>
                {focusHours > 0 ? `${focusHours}h ` : ''}{focusMinutes}m
              </p>
              <p className="text-xs text-near-black/40 mt-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                {focusHours > 0 ? `You've focused for ${focusHours} hour${focusHours > 1 ? 's' : ''}, ${focusMinutes} minute${focusMinutes !== 1 ? 's' : ''} total.`
                  : `You've focused for ${focusMinutes} minute${focusMinutes !== 1 ? 's' : ''} total.`}
              </p>
            </motion.div>

            {/* Best Day + Trend */}
            <motion.div initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="glass-strong rounded-2xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
              {bestDay && (
                <div>
                  <p className="text-[10px] text-near-black/35 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Strongest Day</p>
                  <p className="text-xs text-near-black/70" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    🏆 {bestDay.label} ({bestDay.count} session{bestDay.count > 1 ? 's' : ''})
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-near-black/35 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>This Week</p>
                <p className={`text-xs font-semibold ${trend.color}`} style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  {trend.icon} {trend.text}
                </p>
              </div>
            </motion.div>

            {/* Categories */}
            {categories.length > 0 && categories[0][0] !== 'Other' && (
              <motion.div initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}
                className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-[10px] text-near-black/35 uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Subjects</p>
                <div className="space-y-2">
                  {categories.filter(([name]) => name !== 'Other').map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-xs text-near-black/70" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{name}</span>
                      <span className="text-xs font-bold text-coral" style={{ fontFamily: 'var(--font-mono)' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ═══ RIGHT: Tabs — Sessions | Goals ═══ */}
          <div className="lg:col-span-7">
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList variant="line" className="mb-4 w-full max-w-sm justify-start bg-white/50 p-1 rounded-xl">
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="goals">Goals</TabsTrigger>
              </TabsList>

              <TabsContent value="sessions" className="flex flex-col gap-4 outline-none mt-0">
            {/* XP Over Time Chart */}
            {chartData.length > 1 && (
              <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="glass-strong rounded-2xl p-5 mb-5" style={{ boxShadow: 'var(--shadow-md)' }}>
                <p className="text-[10px] text-near-black/35 uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>XP Over Time</p>
                <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF7E5F" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#FF7E5F" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(30,30,46,0.3)' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'rgba(30,30,46,0.3)' }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,248,240,0.95)',
                          border: '1px solid rgba(255,126,95,0.15)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(255,126,95,0.1)',
                        }}
                        labelStyle={{ fontFamily: 'var(--font-body)', color: 'rgba(30,30,46,0.5)' }}
                      />
                      <Area type="monotone" dataKey="xp" stroke="#FF7E5F" strokeWidth={2.5} fill="url(#xpGradient)" dot={false} activeDot={{ r: 4, fill: '#FF7E5F', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
              {(['all', 'week', 'month'] as TimeFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === f ? 'bg-coral text-white' : 'bg-white/50 text-near-black/40 hover:text-near-black/60'
                  }`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {f === 'all' ? 'All time' : f === 'week' ? 'This week' : 'This month'}
                </button>
              ))}
            </div>

            {/* Sessions list */}
            <div className="space-y-3">
              {filteredSessions.length === 0 ? (
                <div className="glass-strong rounded-2xl p-8 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex justify-center mb-3">
                    <CapyPet size={80} color={pet?.color || 'tan'} expression="curious" hat={pet?.equippedHat} clothes={pet?.equippedClothes} animated />
                  </div>
                  <p className="text-near-black/50 text-sm mb-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    No sessions yet.
                  </p>
                  <p className="text-near-black/30 text-xs mb-4" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                    {pet?.name || 'Your capybara'} is waiting for your first commitment. Start a session to see your progress here.
                  </p>
                  <button onClick={() => router.push('/home')} className="btn-hover bg-coral text-white px-6 py-2.5 rounded-xl text-sm font-semibold">Start session</button>
                </div>
              ) : (
                filteredSessions.map((s, i) => {
                  const isFailed = s.status === 'failed';
                  const focusMins = Math.floor((s.timeActual || 0) / 60);
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={`card-hover rounded-2xl overflow-hidden cursor-pointer border-l-4 ${
                        isFailed
                          ? 'border-failure bg-failure/[0.03]'
                          : 'border-success glass-strong'
                      }`}
                      style={{ boxShadow: 'var(--shadow-sm)', ...(isFailed ? { background: 'rgba(239,68,68,0.03)', backdropFilter: 'blur(24px) saturate(200%)', border: '1px solid rgba(239,68,68,0.08)', borderLeft: '4px solid var(--color-failure)' } : {}) }}
                      onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
                    >
                      {/* Header */}
                      <div className="px-5 py-4 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-medium truncate ${isFailed ? 'text-near-black/50' : 'text-near-black'}`} style={{ fontFamily: 'var(--font-body)', fontStyle: isFailed ? 'italic' : 'normal' }}>{s.taskTitle}</p>
                            {s.commitmentId && (
                              <span
                                className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-lavender/35 text-near-black/70 shrink-0"
                                style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                                title={s.goalTitleSnapshot || 'Linked goal'}
                              >
                                Goal
                              </span>
                            )}
                            {isFailed && (
                              <span className="text-[9px] text-failure/60 uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-failure/5" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>incomplete</span>
                            )}
                          </div>
                          <p className="text-[10px] text-near-black/30 mt-0.5" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                            {s.timestamp?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Unknown date'}
                            {focusMins > 0 && <> · Focused for {focusMins} min</>}
                          </p>
                        </div>
                        <span className={`text-sm font-extrabold shrink-0 ${(s.xpChange || 0) >= 0 ? 'text-success' : 'text-failure'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                          {(s.xpChange || 0) >= 0 ? '+' : ''}{s.xpChange || 0}
                        </span>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {expandedSession === s.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4 pt-0 border-t border-near-black/5">
                              {s.contextText && (
                                <p className="text-xs text-near-black/40 mt-3 leading-relaxed italic" style={{ fontFamily: 'var(--font-body)' }}>
                                  {s.contextText.length > 200 ? s.contextText.slice(0, 200) + '…' : s.contextText}
                                </p>
                              )}
                              {s.contextImageUrls && s.contextImageUrls.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {s.contextImageUrls.slice(0, 3).map((url, idx) => (
                                    <img
                                      key={idx}
                                      src={url}
                                      alt={`Context ${idx + 1}`}
                                      className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={(e) => { e.stopPropagation(); window.open(url, '_blank'); }}
                                    />
                                  ))}
                                </div>
                              )}
                              {s.aiFeedback && (
                                <p className="text-xs text-near-black/50 mt-3 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                                  {s.aiFeedback}
                                </p>
                              )}
                              {s.proofImageUrl && (
                                <img src={s.proofImageUrl} alt="Proof" className="mt-3 w-full h-32 object-cover rounded-xl" />
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
              </TabsContent>

              <TabsContent value="goals" className="outline-none mt-0">
                <div className="flex gap-2 mb-4 flex-wrap">
                  {(['all', 'active', 'completed', 'failed'] as GoalFilter[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setGoalFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        goalFilter === f ? 'bg-coral text-white' : 'bg-white/50 text-near-black/40 hover:text-near-black/60'
                      }`}
                      style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                    >
                      {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {filteredCommitments.length === 0 ? (
                    <div className="glass-strong rounded-2xl p-8 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
                      <p className="text-near-black/45 text-sm" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                        No goals in this view.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push('/goals')}
                        className="btn-hover mt-4 bg-coral text-white px-5 py-2 rounded-xl text-sm font-semibold"
                      >
                        Create a goal
                      </button>
                    </div>
                  ) : (
                    filteredCommitments.map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className={`glass-strong rounded-2xl p-4 border-l-4 ${
                          c.status === 'completed' ? 'border-success/50' : c.status === 'failed' ? 'border-failure/50' : 'border-amber/50'
                        }`}
                        style={{ boxShadow: 'var(--shadow-sm)' }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                            {c.title}
                          </p>
                          <span
                            className={`text-[10px] uppercase font-bold shrink-0 ${
                              c.status === 'active' ? 'text-amber' : c.status === 'completed' ? 'text-success' : 'text-failure'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-near-black/50 mt-2 line-clamp-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                          {c.description}
                        </p>
                        <p className="text-[10px] text-near-black/35 mt-2" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                          {c.status === 'active'
                            ? `Due ${c.deadline?.toDate?.()?.toLocaleString?.() ?? '—'}`
                            : c.completedAt?.toDate?.()?.toLocaleString?.() ?? ''}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
