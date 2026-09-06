'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from '@/lib/auth';
import AppSidebar from '@/components/AppSidebar';
import SidebarNav from '@/components/SidebarNav';

// Pages that are fully public (no auth, no sidebar)
const PUBLIC_ROUTES = ['/', '/signup', '/terms', '/privacy'];

// Auth-required pages that still don't show the sidebar (onboarding flow)
const NO_SIDEBAR_ROUTES = ['/onboarding'];

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  // Mobile nav state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const noSidebar = NO_SIDEBAR_ROUTES.includes(pathname);

  useEffect(() => {
    // Check mobile breakpoint
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged((user) => {
      setIsAuthed(!!user);
      setAuthChecked(true);

      // Redirect to signup if trying to access private routes while logged out
      if (!user && !isPublic) {
        router.push('/signup');
      }
    });
    return unsub;
  }, [router, isPublic]);

  // Public routes — no sidebar
  if (isPublic) {
    return <>{children}</>;
  }

  // While checking auth, show loading
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-coral animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // No-sidebar authenticated routes (onboarding)
  if (noSidebar) {
    return <>{children}</>;
  }

  // Authenticated routes — sidebar + content
  if (isAuthed) {
    return (
      <div className="flex min-h-screen">
        {/* ═══ Mobile Header ═══ */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md z-40 border-b border-near-black/5 flex items-center px-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 -ml-2 rounded-xl text-near-black/60 hover:text-near-black hover:bg-near-black/5 transition-colors"
              aria-label="Open navigation menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <span className="ml-3 font-bold text-coral text-lg translate-y-[1px]" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Capy</span>
          </div>
        )}

        {/* ═══ Mobile SidebarNav Overlay ═══ */}
        {isMobile && (
          <SidebarNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        )}

        {/* ═══ Desktop Sidebar ═══ */}
        {!isMobile && <AppSidebar />}

        <main className={`flex-1 transition-all duration-300 ${isMobile ? 'pt-14' : 'ml-[60px]'}`}>
          {children}
        </main>
      </div>
    );
  }

  // Fallback — shouldn't reach here
  return <>{children}</>;
}
