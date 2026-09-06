'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, signUpWithEmail, signInWithEmail, signInAnonymously, routeAfterAuth } from '@/lib/auth';
import CapyTeacher from '@/components/CapyTeacher';

type AuthMode = 'signup' | 'signin';

// Map raw Firebase errors to friendly copy. permission-denied / "Missing or
// insufficient permissions" means Firestore security rules rejected the write
// (see firestore.rules) — never show that raw string to a user.
function friendlyAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes('email-already-in-use')) return 'Account already exists. Try signing in instead.';
  if (message.includes('wrong-password') || message.includes('invalid-credential')) return 'Invalid email or password.';
  if (message.includes('user-not-found')) return 'No account found. Try signing up instead.';
  if (message.includes('invalid-email')) return 'That email address looks invalid.';
  if (message.includes('weak-password')) return 'Password is too weak — use at least 6 characters.';
  if (message.includes('too-many-requests')) return 'Too many attempts. Please wait a moment and try again.';
  if (message.includes('popup-closed') || message.includes('cancelled-popup') || message.includes('popup-blocked')) return 'Sign-in was cancelled. Please try again.';
  if (message.includes('permission') || message.includes('insufficient')) return "We couldn't finish setting up your account. Please try again in a moment.";
  if (message.includes('network')) return 'Network error. Check your connection and try again.';
  // Never surface a raw Firebase error string to the user — details go to the console.
  return 'Something went wrong. Please try again.';
}

function SignUpPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskFromLanding = searchParams.get('task') || '';

  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Store task for after auth
  const storeTask = () => {
    if (taskFromLanding) {
      sessionStorage.setItem('capy_pending_task', taskFromLanding);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      storeTask();
      const user = await signInWithGoogle();
      router.push(await routeAfterAuth(user.uid));
    } catch (err: unknown) {
      console.error('Google sign-in failed:', err);
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      storeTask();
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
        router.push('/onboarding');
      } else {
        const user = await signInWithEmail(email, password);
        router.push(await routeAfterAuth(user.uid));
      }
    } catch (err: unknown) {
      console.error('Email auth failed:', err);
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    setError('');
    try {
      storeTask();
      const user = await signInAnonymously();
      router.push(await routeAfterAuth(user.uid));
    } catch (err: unknown) {
      console.error('Guest sign-in failed:', err);
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ═══ LEFT: Auth Forms ═══ */}
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-cream"
      >
        <div className="w-full max-w-sm">
          {/* Back link */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm text-near-black/40 hover:text-coral transition-colors mb-8"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Heading */}
          <h1 className="text-3xl mb-2 text-near-black">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-near-black/50 text-sm mb-8" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
            {mode === 'signup'
              ? 'Your capybara is waiting to meet you.'
              : 'Your capybara missed you.'}
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="btn-hover w-full flex items-center justify-center gap-3 bg-white rounded-xl px-4 py-3.5 text-sm font-medium text-near-black border border-near-black/8 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: 'var(--shadow-sm)', fontFamily: 'var(--font-body)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-near-black/8" />
            <span className="text-xs text-near-black/30 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>or</span>
            <div className="flex-1 h-px bg-near-black/8" />
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleEmail} className="space-y-3">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="input-glow w-full bg-white rounded-xl px-4 py-3 text-sm text-near-black placeholder-near-black/30"
                style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-glow w-full bg-white rounded-xl px-4 py-3 text-sm text-near-black placeholder-near-black/30"
                style={{ fontFamily: 'var(--font-body)', boxShadow: 'var(--shadow-sm)' }}
                disabled={loading}
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="text-failure text-xs overflow-hidden"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="btn-hover w-full bg-coral text-white rounded-xl px-4 py-3.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                mode === 'signup' ? 'Create account' : 'Sign in'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-xs text-near-black/40 mt-4" style={{ fontFamily: 'var(--font-body)' }}>
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError(''); }} className="text-coral font-semibold hover:underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); }} className="text-coral font-semibold hover:underline">
                  Sign up
                </button>
              </>
            )}
          </p>

          {/* Guest mode divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-near-black/8" />
            <span className="text-xs text-near-black/20 uppercase tracking-wider" style={{ fontFamily: 'var(--font-body)' }}>or</span>
            <div className="flex-1 h-px bg-near-black/8" />
          </div>

          {/* Guest button */}
          <button
            onClick={handleGuest}
            disabled={loading}
            className="btn-hover w-full rounded-xl px-4 py-3 text-sm text-near-black/50 font-medium border border-near-black/8 hover:border-coral/20 disabled:opacity-50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Continue as guest
          </button>
          <p className="text-center text-[10px] text-near-black/25 mt-2" style={{ fontFamily: 'var(--font-body)' }}>
            Limited features. You can upgrade to a full account later.
          </p>
        </div>
      </motion.div>

      {/* ═══ RIGHT: Illustration ═══ */}
      <motion.div
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hidden lg:flex flex-1 gradient-signup items-center justify-center relative overflow-hidden"
      >
        {/* Floating decorative shapes */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[15%] left-[20%] w-20 h-20 rounded-full bg-white/10"
          />
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute top-[45%] right-[15%] w-14 h-14 rounded-2xl bg-white/10 rotate-12"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-[25%] left-[30%] w-10 h-10 rounded-full bg-white/8"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex justify-center"
          >
            <CapyTeacher size={180} expression="happy" animated />
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 px-8"
          >
            <p className="text-white/80 text-lg text-center max-w-xs mx-auto" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              &ldquo;I&apos;ve been grading papers all morning. Let&apos;s see what you&apos;ve got.&rdquo;
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpPageInner />
    </Suspense>
  );
}
