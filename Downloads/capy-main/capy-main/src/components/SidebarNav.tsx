'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'Home', path: '/home', icon: '🏠' },
  { label: 'Closet', path: '/closet', icon: '👕' },
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Goals', path: '/goals', icon: '🎯' },
  { label: 'How Capy Works', path: '/how-it-works', icon: '📖' },
  { label: 'Give Feedback', path: '/feedback', icon: '💬' },
];

export default function SidebarNav({ isOpen, onClose }: SidebarNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-[100]"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 w-[260px] z-[101] glass-strong flex flex-col"
            style={{ boxShadow: 'var(--shadow-xl)' }}
          >
            {/* Header */}
            <div className="px-5 py-5 flex items-center justify-between border-b border-near-black/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-coral flex items-center justify-center">
                  <span className="text-white text-xs">🐹</span>
                </div>
                <span className="text-sm font-semibold text-near-black tracking-wide uppercase" style={{ fontFamily: 'var(--font-body)' }}>Capy</span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-near-black/30 hover:text-near-black/60 hover:bg-near-black/5 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.path;
                const isFeedback = item.path === '/feedback';
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-coral/10 text-coral font-semibold'
                        : isFeedback
                          ? 'text-coral hover:bg-coral/5'
                          : 'text-near-black/50 hover:text-near-black/80 hover:bg-near-black/3'
                    }`}
                    style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                  >
                    <span className="text-base">{item.icon}</span>
                    {isFeedback ? (
                      <span className="flex items-center gap-2">
                        <span className="font-bold" style={{
                          background: 'linear-gradient(135deg, #FF7E5F, #FEB47B)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>Give Feedback</span>
                        <span className="bg-coral text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">$100</span>
                      </span>
                    ) : item.label}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-3 pb-5 border-t border-near-black/5 pt-3">
              <button
                onClick={() => handleNavigate('/settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  pathname === '/settings'
                    ? 'bg-coral/10 text-coral font-semibold'
                    : 'text-near-black/35 hover:text-near-black/70 hover:bg-near-black/3'
                }`}
                style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
