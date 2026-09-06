'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut, getCurrentUser, type User } from '@/lib/auth';
import {
  getUserProfile,
  getPet,
  getAllSessions,
  updateUserProfile,
  updatePet,
  deleteAccount,
  resetPet,
  deleteAllSessions,
  exportUserData,
  type UserProfile,
  type PetData,
  type SessionData,
} from '@/lib/db';
import { DEFAULT_UNLOCKED_ITEMS } from '@/lib/items';
import CapyPet from '@/components/CapyPet';

// ─── Types ───────────────────────────────────────────────────────

type SettingsTab = 'account' | 'preferences' | 'subscription' | 'data' | 'about';

interface Preferences {
  soundEffects: boolean;
  timerTick: boolean;
  showXPAnimations: boolean;
  reduceAnimations: boolean;
  defaultTimerMinutes: number;
}

const DEFAULT_PREFS: Preferences = {
  soundEffects: true,
  timerTick: true,
  showXPAnimations: true,
  reduceAnimations: false,
  defaultTimerMinutes: 30,
};

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'subscription', label: 'Subscription', icon: '⭐' },
  { id: 'data', label: 'Data & Privacy', icon: '🔒' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

// ─── Helpers ─────────────────────────────────────────────────────

function loadPrefs(): Preferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem('capy_preferences');
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: Preferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('capy_preferences', JSON.stringify(prefs));
}

// ─── Toggle Component ────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`toggle-switch ${on ? 'active' : ''}`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
    >
      <div className="toggle-dot" />
    </button>
  );
}

// ─── Confirm Modal ───────────────────────────────────────────────

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  confirmColor = 'coral',
  requireType,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor?: 'coral' | 'red';
  requireType?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState('');
  const canConfirm = requireType ? typed.toLowerCase() === requireType.toLowerCase() : true;

  useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/25 z-[200] flex items-center justify-center px-6"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-sm"
            style={{ boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg text-near-black mb-2">{title}</h3>
            <p className="text-sm text-near-black/60 leading-relaxed mb-4" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              {description}
            </p>

            {requireType && (
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={`Type "${requireType}" to confirm`}
                className="input-glow w-full bg-white rounded-xl px-4 py-3 text-sm text-near-black placeholder-near-black/30 mb-4"
                style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
                autoFocus
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-sm text-near-black/50 hover:bg-near-black/5 transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!canConfirm}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all ${
                  confirmColor === 'red' ? 'bg-failure hover:bg-failure/90' : 'bg-coral hover:bg-coral/90'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ───────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pet, setPet] = useState<PetData | null>(null);
  const [sessions, setSessions] = useState<(SessionData & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  // Account
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  // Preferences
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [petNameInput, setPetNameInput] = useState('');
  const [savingPetName, setSavingPetName] = useState(false);
  const [petNameSaved, setPetNameSaved] = useState(false);

  // Modals
  const [signOutModal, setSignOutModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [resetPetModal, setResetPetModal] = useState(false);
  const [deleteSessionsModal, setDeleteSessionsModal] = useState(false);

  // Expandable sections
  const [aiexpanded, setAiExpanded] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Load data
  useEffect(() => {
    const unsub = onAuthStateChanged(async (u) => {
      if (!u) { router.push('/'); return; }
      setUid(u.uid);
      setUser(u);
      try {
        const [prof, petData, sessionData] = await Promise.all([
          getUserProfile(u.uid),
          getPet(u.uid),
          getAllSessions(u.uid),
        ]);
        setProfile(prof);
        setPet(petData);
        setSessions(sessionData);
        setDisplayName(prof?.displayName || u.displayName || '');
        setPetNameInput(petData?.name || '');
        setPrefs(loadPrefs());
      } catch (err) {
        console.error('Failed to load settings data:', err);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, [router]);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches && !prefs.reduceAnimations) {
      const updated = { ...prefs, reduceAnimations: true };
      setPrefs(updated);
      savePrefs(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handlers ────────────────────────────────────────────────

  const handleSaveDisplayName = async () => {
    if (!uid || !displayName.trim()) return;
    setSavingName(true);
    try {
      await updateUserProfile(uid, { displayName: displayName.trim() });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save name:', err);
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePetName = async () => {
    if (!uid || !petNameInput.trim()) return;
    setSavingPetName(true);
    try {
      await updatePet(uid, { name: petNameInput.trim() });
      setPet((prev) => prev ? { ...prev, name: petNameInput.trim() } : prev);
      setPetNameSaved(true);
      setTimeout(() => setPetNameSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save pet name:', err);
    } finally {
      setSavingPetName(false);
    }
  };

  const handleTogglePref = (key: keyof Preferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    savePrefs(updated);
  };

  const handleSignOut = async () => {
    setSignOutModal(false);
    await signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!uid) return;
    setDeleteModal(false);
    await deleteAccount(uid);
    await signOut();
    router.push('/');
  };

  const handleResetPet = async () => {
    if (!uid) return;
    setResetPetModal(false);
    await resetPet(uid, DEFAULT_UNLOCKED_ITEMS.map((i) => i));
    router.push('/onboarding');
  };

  const handleDeleteSessions = async () => {
    if (!uid) return;
    setDeleteSessionsModal(false);
    await deleteAllSessions(uid);
    setSessions([]);
    showToast('Session history deleted');
  };

  const handleExportData = async () => {
    if (!uid) return;
    try {
      const data = await exportUserData(uid);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `capy-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data exported successfully');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // ─── Stagger animation helper ────────────────────────────────

  const itemAnim = (i: number) => ({
    initial: { y: 12, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: i * 0.06, duration: 0.35 },
  });

  // ─── Loading ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="gradient-settings min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="skeleton w-48 h-8 mx-auto" />
          <div className="skeleton w-32 h-4 mx-auto" />
        </div>
      </div>
    );
  }

  // ─── Section Renderers ───────────────────────────────────────

  const renderAccount = () => (
    <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
      <motion.h2 {...itemAnim(0)} className="text-2xl text-near-black mb-1">Account</motion.h2>

      {/* Profile photo */}
      <motion.div {...itemAnim(1)} className="glass-strong rounded-2xl p-5 flex items-center gap-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {pet ? (
            <CapyPet size={56} color={pet.color} expression="happy" hat={pet.equippedHat} clothes={pet.equippedClothes} />
          ) : (
            <span className="text-2xl">🐹</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            {profile?.displayName || 'User'}
          </p>
          <p className="text-xs text-near-black/40" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            {user?.email || 'Guest account'}
          </p>
          <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            user?.isAnonymous ? 'bg-near-black/5 text-near-black/40' : 'bg-coral/10 text-coral'
          }`} style={{ fontFamily: 'var(--font-body)' }}>
            {user?.isAnonymous ? 'Guest' : user?.email ? 'Email' : 'Google'}
          </span>
        </div>
      </motion.div>

      {/* Display name */}
      <motion.div {...itemAnim(2)} className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <label className="text-xs text-near-black/60 mb-1.5 block font-medium" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          Display Name
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setNameSaved(false); }}
            className="input-glow flex-1 bg-white rounded-xl px-4 py-2.5 text-sm text-near-black"
            style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
            maxLength={40}
          />
          <button
            onClick={handleSaveDisplayName}
            disabled={savingName || !displayName.trim()}
            className="btn-hover bg-coral text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {nameSaved ? '✓ Saved' : savingName ? '...' : 'Save'}
          </button>
        </div>
      </motion.div>

      {/* Email display */}
      <motion.div {...itemAnim(3)} className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <label className="text-xs text-near-black/60 mb-1.5 block font-medium" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          Email
        </label>
        {user?.email ? (
          <p className="text-sm text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{user.email}</p>
        ) : (
          <div className="bg-coral/5 rounded-xl p-3">
            <p className="text-xs text-near-black/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
              No email — upgrade to keep your data
            </p>
          </div>
        )}
      </motion.div>

      {/* Upgrade (guest only) */}
      {user?.isAnonymous && (
        <motion.div {...itemAnim(4)} className="rounded-2xl p-5" style={{
          background: 'linear-gradient(135deg, rgba(255,126,95,0.08), rgba(254,180,123,0.12))',
          border: '1.5px solid rgba(255,126,95,0.15)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h4 className="text-sm font-semibold text-near-black mb-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            Upgrade Your Account
          </h4>
          <p className="text-xs text-near-black/50 mb-3 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            Your data is saved temporarily. Create a full account to keep your pet forever.
          </p>
          <button
            onClick={() => showToast('Account upgrade coming soon!')}
            className="btn-hover bg-coral text-white px-6 py-2.5 rounded-xl text-sm font-bold"
            style={{ boxShadow: 'var(--shadow-glow)' }}
          >
            Create Full Account
          </button>
        </motion.div>
      )}

      {/* Sign Out */}
      <motion.div {...itemAnim(5)}>
        <button
          onClick={() => setSignOutModal(true)}
          className="btn-hover w-full border-2 border-coral/20 text-coral rounded-xl py-3 text-sm font-semibold hover:bg-coral/5 transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Sign Out
        </button>
      </motion.div>

      {/* Danger Zone */}
      <motion.div {...itemAnim(6)} className="pt-4 border-t border-near-black/5">
        <p className="text-[10px] text-near-black/25 uppercase tracking-wider mb-3" style={{ fontFamily: 'var(--font-body)' }}>
          Danger Zone
        </p>
        <button
          onClick={() => setDeleteModal(true)}
          className="text-sm text-failure hover:text-failure/80 transition-colors font-medium mb-3 block"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Delete Account
        </button>
        <button
          onClick={() => setResetPetModal(true)}
          className="text-xs text-near-black/30 hover:text-near-black/50 transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Reset Pet (start over with new egg)
        </button>
      </motion.div>
    </motion.div>
  );

  const handleTimerDefault = (minutes: number) => {
    const updated = { ...prefs, defaultTimerMinutes: minutes };
    setPrefs(updated);
    savePrefs(updated);
  };

  const renderPreferences = () => (
    <motion.div key="preferences" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
      <motion.h2 {...itemAnim(0)} className="text-2xl text-near-black mb-1">Preferences</motion.h2>

      {/* Pet name */}
      <motion.div {...itemAnim(1)} className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <label className="text-xs text-near-black/60 mb-1.5 block font-medium" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          Pet Name
        </label>
        <p className="text-[10px] text-near-black/35 mb-2" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          Rename your pet anytime
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={petNameInput}
            onChange={(e) => { setPetNameInput(e.target.value.slice(0, 20)); setPetNameSaved(false); }}
            className="input-glow flex-1 bg-white rounded-xl px-4 py-2.5 text-sm text-near-black"
            style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
            maxLength={20}
          />
          <button
            onClick={handleSavePetName}
            disabled={savingPetName || !petNameInput.trim()}
            className="btn-hover bg-coral text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {petNameSaved ? '✓ Saved' : savingPetName ? '...' : 'Save'}
          </button>
        </div>
      </motion.div>

      {/* Default Timer Duration */}
      <motion.div {...itemAnim(2)} className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="text-sm font-medium text-near-black mb-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Default Timer Duration</p>
        <p className="text-xs text-near-black/40 mb-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Pre-selects this duration when you start a new session</p>
        <div className="flex gap-2 flex-wrap">
          {[15, 25, 30, 45, 60, 90].map((m) => (
            <button
              key={m}
              onClick={() => handleTimerDefault(m)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                prefs.defaultTimerMinutes === m
                  ? 'bg-coral text-white'
                  : 'bg-near-black/5 text-near-black/50 hover:text-near-black/70'
              }`}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {m} min
            </button>
          ))}
        </div>
      </motion.div>

      {/* Sound & Animation toggles */}
      <motion.div {...itemAnim(3)} className="space-y-0">
        <p className="text-[10px] text-near-black/25 uppercase tracking-wider mb-3 ml-1" style={{ fontFamily: 'var(--font-body)' }}>Sound & Feedback</p>
        {[
          { key: 'soundEffects' as const, label: 'Sound Effects', sub: 'Completion sounds, level-up chimes, and UI feedback' },
          { key: 'timerTick' as const, label: 'Countdown Sounds', sub: 'Ticking sound during the last 60 seconds' },
        ].map((item, i) => (
          <div
            key={item.key}
            className={`glass-strong p-5 flex items-center justify-between gap-4 ${i === 0 ? 'rounded-t-2xl' : 'rounded-b-2xl border-t border-near-black/5'}`}
            style={{ boxShadow: i === 0 ? 'var(--shadow-sm)' : undefined }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{item.label}</p>
              <p className="text-xs text-near-black/40 mt-0.5" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{item.sub}</p>
            </div>
            <Toggle on={prefs[item.key]} onChange={() => handleTogglePref(item.key)} />
          </div>
        ))}
      </motion.div>

      <motion.div {...itemAnim(4)} className="space-y-0">
        <p className="text-[10px] text-near-black/25 uppercase tracking-wider mb-3 ml-1" style={{ fontFamily: 'var(--font-body)' }}>Display</p>
        {[
          { key: 'showXPAnimations' as const, label: 'XP Animations', sub: 'Show flying XP numbers and celebration effects' },
          { key: 'reduceAnimations' as const, label: 'Reduce Motion', sub: 'Simplifies animations for accessibility' },
        ].map((item, i) => (
          <div
            key={item.key}
            className={`glass-strong p-5 flex items-center justify-between gap-4 ${i === 0 ? 'rounded-t-2xl' : 'rounded-b-2xl border-t border-near-black/5'}`}
            style={{ boxShadow: i === 0 ? 'var(--shadow-sm)' : undefined }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{item.label}</p>
              <p className="text-xs text-near-black/40 mt-0.5" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{item.sub}</p>
            </div>
            <Toggle on={prefs[item.key]} onChange={() => handleTogglePref(item.key)} />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );

  const renderSubscription = () => (
    <motion.div key="subscription" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
      <motion.h2 {...itemAnim(0)} className="text-2xl text-near-black mb-1">Subscription</motion.h2>

      {/* Current plan */}
      <motion.div {...itemAnim(1)} className="glass-strong rounded-2xl p-5 flex items-center gap-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-near-black/5 text-near-black/50" style={{ fontFamily: 'var(--font-body)' }}>
          Free
        </span>
        <p className="text-sm text-near-black/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Current plan</p>
      </motion.div>

      {/* Upgrade card */}
      <motion.div
        {...itemAnim(2)}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 50%, #FFD700 100%)',
          boxShadow: '0 8px 32px rgba(255,126,95,0.25)',
        }}
      >
        <div className="relative z-10">
          <h3 className="text-lg text-white font-bold mb-1" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            Upgrade to Premium
          </h3>
          <p className="text-sm text-white/80 mb-4 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            Unlock unlimited sessions, exclusive accessories, and priority AI verification.
          </p>
          <div className="flex items-baseline gap-3 mb-4">
            <div>
              <span className="text-2xl font-extrabold text-white">$4.99</span>
              <span className="text-xs text-white/70">/month</span>
            </div>
            <div className="text-white/50 text-xs">or</div>
            <div>
              <span className="text-2xl font-extrabold text-white">$29.99</span>
              <span className="text-xs text-white/70">/year</span>
              <span className="ml-1 text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full text-white">SAVE 50%</span>
            </div>
          </div>
          <button
            onClick={() => showToast('Payments coming soon! Enjoy free access for now.')}
            className="btn-hover bg-white text-coral px-8 py-3 rounded-xl text-sm font-bold"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
          >
            Upgrade to Premium
          </button>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute bottom-[-10px] left-[-10px] w-24 h-24 rounded-full bg-white/5" />
      </motion.div>

      {/* Promo code */}
      <motion.div {...itemAnim(3)} className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <label className="text-xs text-near-black/60 mb-1.5 block font-medium" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          Have a promo code?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            className="input-glow flex-1 bg-white rounded-xl px-4 py-2.5 text-sm text-near-black placeholder-near-black/25"
            style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
          />
          <button
            onClick={() => showToast('Promo codes coming soon!')}
            className="btn-hover bg-coral text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Apply
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderDataPrivacy = () => {
    const completedSessions = sessions.filter((s) => s.status === 'completed' || s.status === 'failed');
    const imageCount = sessions.reduce((sum, s) => {
      return sum + (s.contextImageUrls?.length || 0) + (s.proofImageUrl ? 1 : 0);
    }, 0);
    const createdAt = profile?.createdAt?.toDate?.();

    return (
      <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
        <motion.h2 {...itemAnim(0)} className="text-2xl text-near-black mb-1">Data & Privacy</motion.h2>

        {/* Data summary */}
        <motion.div {...itemAnim(1)} className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h4 className="text-sm font-semibold text-near-black mb-3" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            Your Data
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Sessions', value: completedSessions.length.toString() },
              { label: 'Images uploaded', value: imageCount.toString() },
              { label: 'Account created', value: createdAt ? createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown' },
              { label: 'Storage', value: 'Local (browser)' },
            ].map((item) => (
              <div key={item.label} className="bg-near-black/3 rounded-xl p-3">
                <p className="text-lg font-extrabold text-near-black" style={{ fontFamily: 'var(--font-mono)' }}>{item.value}</p>
                <p className="text-[10px] text-near-black/40 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Export */}
        <motion.div {...itemAnim(2)} className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Export My Data</p>
              <p className="text-xs text-near-black/40 mt-0.5" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Download all your data as JSON</p>
            </div>
            <button
              onClick={handleExportData}
              className="btn-hover bg-coral/10 text-coral px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Download
            </button>
          </div>
        </motion.div>

        {/* Delete sessions */}
        <motion.div {...itemAnim(3)} className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Delete Session History</p>
              <p className="text-xs text-near-black/40 mt-0.5" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Keeps your pet and account. Wipes all sessions.</p>
            </div>
            <button
              onClick={() => setDeleteSessionsModal(true)}
              disabled={sessions.length === 0}
              className="text-xs text-failure hover:text-failure/80 font-semibold disabled:opacity-30"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Delete All
            </button>
          </div>
        </motion.div>

        {/* AI disclosure */}
        <motion.div {...itemAnim(4)} className="glass-strong rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <button
            onClick={() => setAiExpanded(!aiexpanded)}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <p className="text-sm font-medium text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>How Capy Uses AI</p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-near-black/30 transition-transform ${aiexpanded ? 'rotate-180' : ''}`}>
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <AnimatePresence>
            {aiexpanded && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <p className="px-5 pb-5 text-xs text-near-black/55 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  Capy uses Claude by Anthropic to evaluate your assignments and verify your work. When you upload an image, it&apos;s sent to our AI for analysis. Your images are processed in real-time and are <strong>NOT</strong> used to train AI models.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Image handling */}
        <motion.div {...itemAnim(5)} className="glass-strong rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <button
            onClick={() => setImageExpanded(!imageExpanded)}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <p className="text-sm font-medium text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>How Your Images Are Handled</p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-near-black/30 transition-transform ${imageExpanded ? 'rotate-180' : ''}`}>
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <AnimatePresence>
            {imageExpanded && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <p className="px-5 pb-5 text-xs text-near-black/55 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                  Images you upload are stored securely and used only for verifying your work. They are not shared with third parties except our AI provider for verification purposes. You can delete your images anytime via session history or account deletion.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Links */}
        <motion.div {...itemAnim(6)} className="flex gap-4">
          <a href="/privacy" className="text-xs text-coral hover:underline" style={{ fontFamily: 'var(--font-body)' }}>Privacy Policy</a>
          <a href="/terms" className="text-xs text-coral hover:underline" style={{ fontFamily: 'var(--font-body)' }}>Terms of Service</a>
        </motion.div>
      </motion.div>
    );
  };

  const renderAbout = () => (
    <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
      <motion.h2 {...itemAnim(0)} className="text-2xl text-near-black mb-1">About</motion.h2>

      {/* Version */}
      <motion.div {...itemAnim(1)} className="glass-strong rounded-2xl p-5 flex items-center gap-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="w-10 h-10 rounded-xl bg-coral flex items-center justify-center flex-shrink-0">
          <span className="text-white text-lg">🐹</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Capy</p>
          <p className="text-xs text-near-black/40" style={{ fontFamily: 'var(--font-mono)' }}>v1.0.0</p>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div {...itemAnim(2)} className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="text-sm text-near-black/70 leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          Capy is an AI-powered accountability partner that helps students stop procrastinating. Upload your assignment, race the clock, and let Capy Teacher verify your work. Your pet capybara grows when you deliver.
        </p>
      </motion.div>

      {/* Contact & Bug report */}
      <motion.div {...itemAnim(3)} className="glass-strong rounded-2xl p-5 space-y-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <a
          href="mailto:capy.app.dev@gmail.com?subject=Capy%20Support"
          className="flex items-center gap-3 text-sm text-near-black/70 hover:text-coral transition-colors"
          style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" />
            <path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Contact Support
        </a>
        <a
          href={`mailto:capy.app.dev@gmail.com?subject=Bug%20Report&body=${encodeURIComponent(`Bug Report\n\nBrowser: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}\nTime: ${new Date().toISOString()}\n\nDescribe the bug:\n\n`)}`}
          className="flex items-center gap-3 text-sm text-near-black/70 hover:text-coral transition-colors"
          style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
          Report a Bug
        </a>
      </motion.div>

      {/* Credits */}
      <motion.div {...itemAnim(4)} className="glass-strong rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="text-xs text-near-black/50 mb-2" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Made with 🐹 by</p>
        <p className="text-sm font-semibold text-near-black" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          Duykha Vu & Subha Karki
        </p>
      </motion.div>

      {/* Social */}
      <motion.div {...itemAnim(5)} className="flex items-center gap-3">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-near-black/40 hover:text-coral transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          Instagram
        </a>
      </motion.div>

      {/* Licenses */}
      <motion.div {...itemAnim(6)}>
        <p className="text-[10px] text-near-black/25" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          Open-source licenses: This app uses Next.js, Motion, React Dropzone, Anthropic SDK, and other open-source packages. See package.json for the full list.
        </p>
      </motion.div>
    </motion.div>
  );

  const renderSection = () => {
    switch (activeTab) {
      case 'account': return renderAccount();
      case 'preferences': return renderPreferences();
      case 'subscription': return renderSubscription();
      case 'data': return renderDataPrivacy();
      case 'about': return renderAbout();
    }
  };

  return (
    <div className="gradient-settings min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-1.5 text-sm text-near-black/40 hover:text-coral transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Home
        </button>
        <h1 className="text-2xl text-near-black">Settings</h1>
        <div className="w-16" />
      </div>

      <div className="px-6 pb-12 max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ═══ LEFT: Tab Navigation ═══ */}
          <motion.nav
            initial={{ x: -15, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-52 flex-shrink-0"
          >
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 lg:sticky lg:top-20">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-coral/10 text-coral font-semibold'
                      : 'text-near-black/40 hover:text-near-black/65 hover:bg-near-black/3'
                  }`}
                  style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.nav>

          {/* ═══ RIGHT: Content ═══ */}
          <motion.div
            initial={{ x: 15, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 min-w-0"
          >
            <AnimatePresence mode="wait">
              {renderSection()}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ═══ Modals ═══ */}
      <ConfirmModal
        open={signOutModal}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        onConfirm={handleSignOut}
        onCancel={() => setSignOutModal(false)}
      />
      <ConfirmModal
        open={deleteModal}
        title="Delete Account"
        description={`This will permanently delete ${pet?.name || 'your pet'}, all ${sessions.length} session${sessions.length !== 1 ? 's' : ''}, and your entire history. This CANNOT be undone.`}
        confirmLabel="Delete Forever"
        confirmColor="red"
        requireType="delete"
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteModal(false)}
      />
      <ConfirmModal
        open={resetPetModal}
        title="Reset Pet"
        description="Start over with a new pet. Your session history stays, but your pet will go back to level 1 with 0 XP and you'll re-hatch a new egg."
        confirmLabel="Reset Pet"
        confirmColor="red"
        onConfirm={handleResetPet}
        onCancel={() => setResetPetModal(false)}
      />
      <ConfirmModal
        open={deleteSessionsModal}
        title="Delete All Sessions"
        description={`Delete all ${sessions.length} session${sessions.length !== 1 ? 's' : ''} from your history? Your pet and account will stay. This cannot be undone.`}
        confirmLabel="Delete Sessions"
        confirmColor="red"
        onConfirm={handleDeleteSessions}
        onCancel={() => setDeleteSessionsModal(false)}
      />

      {/* ═══ Toast ═══ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] glass-strong rounded-xl px-5 py-3 text-sm text-near-black font-medium"
            style={{ boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
