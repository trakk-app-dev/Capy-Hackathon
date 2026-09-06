'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

const NAV_ITEMS = [
  { label: 'Start', path: '/start', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="M19 16.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" />
    </svg>
  )},
  { label: 'Home', path: '/home', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )},
  { label: 'Closet', path: '/closet', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2 12 5.5 8 2 3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
    </svg>
  )},
  { label: 'Dashboard', path: '/dashboard', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )},
  { label: 'Goals', path: '/goals', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  )},
  { label: 'How It Works', path: '/how-it-works', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  )},
  { label: 'Feedback', path: '/feedback', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )},
];

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Expanded backdrop */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/10 z-[99] lg:hidden"
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar rail */}
      <motion.aside
        className="fixed top-0 left-0 bottom-0 z-[100] flex flex-col bg-white border-r border-near-black/5"
        animate={{ width: expanded ? 220 : 60 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{ boxShadow: '2px 0 12px rgba(0,0,0,0.03)' }}
      >
        {/* Logo / toggle */}
        <div className="flex items-center h-14 px-4 border-b border-near-black/5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-lg bg-coral flex items-center justify-center flex-shrink-0"
          >
            <span className="text-white text-xs">🐹</span>
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="ml-3 text-sm font-semibold text-near-black tracking-wide uppercase whitespace-nowrap"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Capy
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1 px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const isFeedback = item.path === '/feedback';
            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setExpanded(false);
                }}
                className={`flex items-center gap-3 rounded-xl transition-all duration-150 ${
                  expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
                } ${
                  isActive
                    ? 'bg-coral/10 text-coral'
                    : isFeedback
                      ? 'text-coral hover:bg-coral/5'
                      : 'text-near-black/40 hover:text-near-black/70 hover:bg-near-black/3'
                }`}
                title={!expanded ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`text-sm whitespace-nowrap overflow-hidden flex items-center gap-2 ${isActive ? 'font-semibold' : ''}`}
                      style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                    >
                      {isFeedback ? (
                        <>
                          <span className="font-bold" style={{
                            background: 'linear-gradient(135deg, #FF7E5F, #FEB47B)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}>Feedback</span>
                          <span className="bg-coral text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none" style={{ WebkitTextFillColor: 'white' }}>$100</span>
                        </>
                      ) : item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* Bottom-anchored Settings */}
        <div className="px-2 pb-3 border-t border-near-black/5 pt-2">
          <button
            onClick={() => {
              router.push('/settings');
              setExpanded(false);
            }}
            className={`flex items-center gap-3 rounded-xl text-near-black/35 hover:text-near-black/70 hover:bg-near-black/3 transition-all duration-150 w-full ${
              expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'
            }`}
            title={!expanded ? 'Settings' : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm whitespace-nowrap overflow-hidden"
                  style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
