'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CapyTeacher from '@/components/CapyTeacher';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function resetMockData() {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith('capy_'))
    .forEach((k) => localStorage.removeItem(k));
  window.location.reload();
}

const CHIPS = ['Stats homework', 'English assignment', 'Study for exam'];

const STEP_DATA = [
  {
    icon: '📎',
    step: '01',
    title: 'Upload your assignment',
    desc: 'Paste a rubric, screenshot instructions, or describe what you need to finish. Capy Teacher evaluates it and sets the stakes.',
  },
  {
    icon: '⏱',
    step: '02',
    title: 'Race the clock',
    desc: "A dramatic countdown timer puts your brain into focus mode. Your pet watches nervously — don't let them down.",
  },
  {
    icon: '✅',
    step: '03',
    title: 'Capy checks your proof',
    desc: 'Upload a screenshot of your work. Our AI teacher verifies you actually did it. No faking. Your pet earns XP when you deliver.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I literally finished my AP Bio lab report in one sitting for the first time ever. The timer thing actually works — when Mochi was panicking at 2 minutes left, I couldn't stop working.",
    name: 'Sarah K.',
    detail: 'High school junior',
    initial: 'S',
    color: '#F97066',
  },
  {
    quote:
      "The fact that an AI actually checks if you did the work is what makes this different. I can't just set a timer and scroll TikTok for 30 minutes anymore. Capy knows.",
    name: 'Marcus T.',
    detail: 'College freshman',
    initial: 'M',
    color: '#F59E0B',
  },
  {
    quote:
      "My capybara is level 5 and wears a crown now. I know it's silly but I genuinely feel bad when she loses XP. I've never been this consistent with studying.",
    name: 'Aisha M.',
    detail: 'High school senior',
    initial: 'A',
    color: '#8B5CF6',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [taskInput, setTaskInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Only keep refs needed for direct DOM mutation (not for GSAP targets)
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);   // mouse sheen
  const mockupRef = useRef<HTMLDivElement>(null);     // 3D tilt
  const timerValRef = useRef<HTMLSpanElement>(null);  // counter text
  const xpValRef = useRef<HTMLSpanElement>(null);     // counter text
  const rafRef = useRef<number>(0);

  const handleSubmit = useCallback(() => {
    if (!taskInput.trim()) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    router.push('/signup?task=' + encodeURIComponent(taskInput.trim()));
  }, [taskInput, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── GSAP Timeline ────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const isMobile = window.innerWidth < 768;
    const scrollLen = isMobile ? 8000 : 12000;

    const ctx = gsap.context(() => {
      // ── Initial states (all off before intro plays) ──
      gsap.set('.hero-content', { autoAlpha: 0, y: 30 });
      gsap.set('.main-card', { y: window.innerHeight + 300 });
      gsap.set('.mockup-wrapper', {
        y: 200, rotationX: 50, rotationY: -30, z: -500, autoAlpha: 0,
      });
      gsap.set('.floating-badge', { autoAlpha: 0, y: 30 });
      gsap.set('.card-text-left', { autoAlpha: 0, y: 30 });
      gsap.set('.card-brand', { autoAlpha: 0, y: 20 });
      gsap.set('.how-it-works-section', { autoAlpha: 0 });
      gsap.set('.how-step-card', { autoAlpha: 0, y: 60 });
      gsap.set('.testimonials-section', { autoAlpha: 0 });
      gsap.set('.cta-section', { autoAlpha: 0 });

      // ── Intro timeline: hero fades in on page load ──
      gsap.timeline({ delay: 0.2 }).to('.hero-content', {
        autoAlpha: 1,
        y: 0,
        duration: 1.2,
        ease: 'power2.out',
      });

      // ── Scroll-driven timeline ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: `+=${scrollLen}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Phase 2: hero exits, card rises from below, then expands fullscreen
      tl.to('.hero-content', {
        autoAlpha: 0, scale: 1.03, filter: 'blur(20px)',
        ease: 'power2.in', duration: 3,
      }, 0)
        .to('.main-card', {
          y: 0, duration: 4, ease: 'power3.out',
        }, 0.5)
        .to('.main-card', {
          top: 0, left: 0, width: '100vw', height: '100vh',
          borderRadius: 0, ease: 'power2.inOut', duration: 3,
        }, 4);

      // Phase 3: iPhone reveal + text + badges
      tl.to('.mockup-wrapper', {
        y: 0, rotationX: 0, rotationY: 0, z: 0, autoAlpha: 1,
        ease: 'power2.out', duration: 5,
      }, 8)
        .to('.card-text-left', {
          autoAlpha: 1, y: 0, ease: 'power2.out', duration: 3,
        }, 9)
        .to('.card-brand', {
          autoAlpha: 1, y: 0, ease: 'power2.out', duration: 3,
        }, 9.5)
        .to('.floating-badge', {
          autoAlpha: 1, y: 0, stagger: 0.4, ease: 'back.out(1.7)', duration: 2,
        }, 10);

      // Counter animations (phase 3)
      const timerObj = { val: 4500 };
      tl.to(timerObj, {
        val: 2341, duration: 4, ease: 'none',
        onUpdate() {
          if (!timerValRef.current) return;
          const total = Math.round(timerObj.val);
          const mm = String(Math.floor(total / 100)).padStart(2, '0');
          const ss = String(total % 100).padStart(2, '0');
          timerValRef.current.textContent = mm + ':' + ss;
        },
      }, 9);

      const xpObj = { val: 0 };
      tl.to(xpObj, {
        val: 142, duration: 3, ease: 'power2.out',
        onUpdate() {
          if (xpValRef.current) xpValRef.current.textContent = Math.round(xpObj.val) + ' XP';
        },
      }, 10);

      // Phase 4: phone area hides, card shrinks back, steps appear
      tl.to('.mockup-wrapper, .floating-badge, .card-text-left, .card-brand', {
        autoAlpha: 0, scale: 0.92, ease: 'power2.in', duration: 2,
      }, 14)
        .to('.main-card', {
          top: '7.5vh', left: '7.5vw', width: '85vw', height: '85vh',
          borderRadius: 40, ease: 'power2.inOut', duration: 2.5,
        }, 14.5)
        .to('.how-it-works-section', { autoAlpha: 1, duration: 1 }, 16)
        .to('.how-step-card', {
          autoAlpha: 1, y: 0, stagger: 0.3, ease: 'power2.out', duration: 2.5,
        }, 16.5);

      // Phase 5: testimonials
      tl.to('.how-it-works-section', { autoAlpha: 0, duration: 1.5 }, 20)
        .to('.testimonials-section', { autoAlpha: 1, duration: 1.5 }, 21);

      // Phase 6: CTA + card exits
      tl.to('.testimonials-section', { autoAlpha: 0, duration: 1.5 }, 24)
        .to('.cta-section', { autoAlpha: 1, duration: 1.5 }, 25)
        .to('.main-card', { y: '-110vh', ease: 'power3.in', duration: 3 }, 27);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ── Mouse tracking ────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          mainCardRef.current.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
          mainCardRef.current.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
        }
        if (mockupRef.current) {
          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
          gsap.to(mockupRef.current, {
            rotationY: xVal * 12,
            rotationX: -yVal * 12,
            ease: 'power3.out',
            duration: 1.2,
          });
        }
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        .capy-landing { background: #faf8f5; }
        .film-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 50; opacity: 0.025;
          mix-blend-mode: overlay;
          background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>');
        }
        .bg-grid-capy {
          background-size: 60px 60px;
          background-image: linear-gradient(to right, rgba(0,0,0,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.025) 1px, transparent 1px);
          -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
          mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
        }
        .card-sheen-el {
          position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 40;
          background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.07) 0%, transparent 40%);
          mix-blend-mode: screen;
        }
        .iphone-bezel {
          background-color: #111;
          box-shadow: inset 0 0 0 2px #52525b, inset 0 0 0 7px #000,
            0 40px 80px -15px rgba(0,0,0,0.9), 0 15px 25px -5px rgba(0,0,0,0.7);
        }
        .hw-btn-l {
          position: absolute; left: -5px; border-radius: 3px 0 0 3px;
          background: linear-gradient(90deg, #404040 0%, #171717 100%);
          box-shadow: -2px 0 5px rgba(0,0,0,0.8), inset -1px 0 1px rgba(255,255,255,0.15);
        }
        .hw-btn-r {
          position: absolute; right: -5px; border-radius: 0 3px 3px 0;
          background: linear-gradient(270deg, #404040 0%, #171717 100%);
          box-shadow: 2px 0 5px rgba(0,0,0,0.8), inset 1px 0 1px rgba(255,255,255,0.15);
        }
        .screen-glare {
          position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
          background: linear-gradient(110deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 45%);
        }
        .widget-depth {
          background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.03);
        }
        .float-badge {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
          -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 25px 50px -12px rgba(0,0,0,0.6);
        }
        .btn-tactile {
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
          color: #F97066; font-weight: 700; cursor: pointer; border: none;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1),
            0 12px 24px -4px rgba(0,0,0,0.2), inset 0 1px 1px white, inset 0 -3px 6px rgba(0,0,0,0.06);
          transition: all 0.4s cubic-bezier(0.25,1,0.5,1);
        }
        .btn-tactile:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15),
            0 20px 32px -6px rgba(0,0,0,0.3), inset 0 1px 1px white;
        }
        .font-serif { font-family: var(--font-serif, 'DM Serif Display', Georgia, serif); }
        .dynamic-island {
          background: #000; border-radius: 20px; width: 120px; height: 32px;
          position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
        }
        .xp-bar-fill {
          background: linear-gradient(90deg, #F97066, #F59E0B);
          height: 100%; border-radius: 4px; box-shadow: 0 0 8px rgba(249,112,102,0.6);
        }
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        .scroll-hint { animation: scroll-bounce 1.8s ease-in-out infinite; }
        @keyframes capy-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .capy-shake { animation: capy-shake 0.5s ease-in-out; }

        /* ── Initial states: hidden before GSAP takes over ── */
        /* useLayoutEffect sets these via gsap.set(), but these CSS rules
           ensure elements are hidden even during the SSR→hydration gap */
        .hero-content { opacity: 0; }
        .main-card { transform: translateY(calc(100vh + 300px)); }
        .how-it-works-section, .testimonials-section, .cta-section,
        .card-text-left, .card-brand, .floating-badge,
        .mockup-wrapper { opacity: 0; visibility: hidden; }
      `}</style>

      {/* Outer wrapper — required so ScrollTrigger spacer has a natural parent */}
      <div>
        <div
          ref={containerRef}
          className="capy-landing"
          style={{
            height: '100vh',
            overflow: 'hidden',
            position: 'relative',
            // NO perspective here — it breaks ScrollTrigger pinning
          }}
        >
          {/* Film grain */}
          <div className="film-grain" />
          {/* Grid */}
          <div className="bg-grid-capy" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

          {/* ── NAVBAR ─────────────────────────────────────────────── */}
          <nav style={{
            position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 100, width: '92%', maxWidth: 720,
          }}>
            <div style={{
              background: 'rgba(250,248,245,0.88)', backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)', borderRadius: 9999,
              padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 4px 24px -4px rgba(249,112,102,0.15), 0 1px 4px rgba(0,0,0,0.08)',
              border: '1px solid rgba(249,112,102,0.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F97066', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🐹</div>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.12em', fontSize: 13, color: '#1a1a1a', textTransform: 'uppercase' as const }}>Capy</span>
              </div>
              <button
                onClick={() => router.push('/signup')}
                style={{
                  background: '#F97066', color: '#fff', border: 'none', cursor: 'pointer',
                  borderRadius: 9999, padding: '8px 20px', fontSize: 13, fontWeight: 700,
                  fontFamily: 'var(--font-body)', transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 4px 12px rgba(249,112,102,0.35)',
                }}
              >
                Get Started
              </button>
            </div>
          </nav>

          {/* ── HERO ───────────────────────────────────────────────── */}
          {/* class="hero-content" is the GSAP selector target */}
          <div
            className="hero-content"
            style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '80px 24px 24px',
              zIndex: 10,
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <CapyTeacher size={120} expression="happy" animated />
            </div>

            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15,
                color: '#1a1a1a', textAlign: 'center', maxWidth: 680,
                marginBottom: 16, fontWeight: 400,
              }}
            >
              Meet the pet that won&apos;t let you procrastinate.
            </h1>

            <p
              style={{ fontSize: 18, color: 'rgba(26,26,26,0.55)', marginBottom: 28, fontFamily: 'var(--font-body)' }}
            >
              What do you need to finish today?
            </p>

            <div style={{ width: '100%', maxWidth: 520 }}>
              <div
                className={isShaking ? 'capy-shake' : ''}
                style={{
                  background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)', borderRadius: 20,
                  padding: 8, display: 'flex', alignItems: 'flex-end', gap: 8,
                  boxShadow: '0 8px 32px -4px rgba(249,112,102,0.2), 0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(249,112,102,0.15)',
                }}
              >
                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="I need to finish my bio essay..."
                  rows={2}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: 'var(--font-body)', fontSize: 15, color: '#1a1a1a',
                    resize: 'none', padding: '10px 12px', lineHeight: 1.5,
                  }}
                />
                <button
                  onClick={handleSubmit}
                  style={{
                    flexShrink: 0, width: 44, height: 44, borderRadius: 14, border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: taskInput.trim() ? '#F97066' : 'rgba(26,26,26,0.08)',
                    color: taskInput.trim() ? '#fff' : 'rgba(26,26,26,0.25)',
                    transition: 'all 0.15s',
                  }}
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setTaskInput(chip)}
                    style={{
                      background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(249,112,102,0.2)',
                      borderRadius: 9999, padding: '5px 14px', fontSize: 12,
                      color: 'rgba(26,26,26,0.55)', fontFamily: 'var(--font-body)', cursor: 'pointer',
                      transition: 'all 0.15s', backdropFilter: 'blur(8px)',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Scroll hint */}
            <div className="scroll-hint" style={{
              position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: 11, color: 'rgba(26,26,26,0.35)', fontFamily: 'var(--font-body)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Scroll to explore</span>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(26,26,26,0.3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </div>

          {/* ── MAIN CARD ──────────────────────────────────────────── */}
          {/* class="main-card" is the GSAP selector target */}
          {/* Starts at 85vw×85vh centered; GSAP moves it off-screen below on init */}
          <div
            ref={mainCardRef}
            className="main-card"
            style={{
              position: 'absolute',
              top: '7.5vh',
              left: '7.5vw',
              width: '85vw',
              height: '85vh',
              borderRadius: 40,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #F97066 0%, #F59E0B 100%)',
              boxShadow: '0 40px 100px -20px rgba(0,0,0,0.35), 0 20px 40px -10px rgba(249,112,102,0.4)',
              zIndex: 20,
            }}
          >
            <div className="card-sheen-el" />

            {/* ── Phase 3: Phone + Text ────────────────────────────── */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '80px 5% 40px', gap: 32,
            }}>
              {/* Left: text + badge 1 */}
              {/* class="card-text-left" is the GSAP selector target */}
              <div className="card-text-left" style={{
                flex: 1, maxWidth: 280,
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                <h2 className="font-serif" style={{
                  fontSize: 'clamp(1.5rem, 2.5vw, 2.6rem)', color: '#fff', lineHeight: 1.25, fontWeight: 400,
                }}>
                  Accountability,<br />gamified.
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.65 }}>
                  Capy watches you work. Upload your assignment, race the timer, and prove you did the work. No faking — Capy knows.
                </p>
                {/* class="floating-badge" is the GSAP stagger target */}
                <div className="floating-badge float-badge" style={{
                  borderRadius: 16, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 10, maxWidth: 220,
                }}>
                  <span style={{ fontSize: 22 }}>🔥</span>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>7-Day Streak</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: 'var(--font-body)' }}>Capy is proud!</div>
                  </div>
                </div>
              </div>

              {/* iPhone mockup */}
              {/* class="mockup-wrapper" is the GSAP selector target */}
              <div
                ref={mockupRef}
                className="mockup-wrapper iphone-bezel"
                style={{
                  width: 240, height: 490, borderRadius: 44, position: 'relative',
                  flexShrink: 0, transformStyle: 'preserve-3d' as const,
                }}
              >
                {/* Hardware buttons */}
                <div className="hw-btn-l" style={{ top: 80, width: 5, height: 30 }} />
                <div className="hw-btn-l" style={{ top: 120, width: 5, height: 50 }} />
                <div className="hw-btn-l" style={{ top: 180, width: 5, height: 50 }} />
                <div className="hw-btn-r" style={{ top: 100, width: 5, height: 68 }} />

                {/* Screen */}
                <div style={{
                  position: 'absolute', inset: 7, borderRadius: 38, overflow: 'hidden', background: '#0a0a0f',
                }}>
                  <div className="screen-glare" />
                  <div className="dynamic-island" />
                  <div style={{ padding: '52px 14px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: 'var(--font-body)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Today</div>
                        <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)' }}>Focus Session</div>
                      </div>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#F97066,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🐹</div>
                    </div>
                    {/* Pet widget */}
                    <div className="widget-depth" style={{ borderRadius: 14, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>🐹</span>
                      <div>
                        <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-body)' }}>Level 5</div>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'var(--font-body)' }}>
                          <span ref={xpValRef}>0 XP</span>
                        </div>
                      </div>
                    </div>
                    {/* Timer widget */}
                    <div className="widget-depth" style={{ borderRadius: 14, padding: '10px 12px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'var(--font-body)', marginBottom: 3 }}>⏱ Remaining</div>
                      <div style={{ color: '#fff', fontSize: 22, fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: '0.04em', marginBottom: 6 }}>
                        <span ref={timerValRef}>45:00</span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, fontFamily: 'var(--font-body)', marginBottom: 7 }}>AP Bio Lab Report</div>
                      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 5 }}>
                        <div className="xp-bar-fill" style={{ width: '78%' }} />
                      </div>
                    </div>
                    {/* Done task */}
                    <div className="widget-depth" style={{ borderRadius: 14, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontFamily: 'var(--font-body)' }}>✓ Math HW</div>
                      <span style={{ color: '#4ade80', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-body)' }}>Done</span>
                    </div>
                    {/* Home bar */}
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: 90, height: 4, background: 'rgba(255,255,255,0.28)', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: brand + badge 2 */}
              <div style={{
                flex: 1, maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 20,
              }}>
                {/* class="card-brand" is the GSAP selector target */}
                <div className="card-brand font-serif" style={{
                  fontSize: 'clamp(3rem, 5vw, 5.5rem)', color: 'rgba(255,255,255,0.14)',
                  fontWeight: 400, lineHeight: 1, userSelect: 'none' as const,
                }}>
                  CAPY
                </div>
                {/* class="floating-badge" is the GSAP stagger target */}
                <div className="floating-badge float-badge" style={{
                  borderRadius: 16, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 10, maxWidth: 220,
                }}>
                  <span style={{ fontSize: 22 }}>📚</span>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>3 Tasks Done</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: 'var(--font-body)' }}>+45 XP earned</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Phase 4: How it works ─────────────────────────────── */}
            {/* class="how-it-works-section" is the GSAP selector target */}
            <div className="how-it-works-section" style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '80px 5% 40px',
              pointerEvents: 'none',
            }}>
              <h2 className="font-serif" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: '#fff', marginBottom: 8, fontWeight: 400 }}>
                How Capy works
              </h2>
              <div style={{ width: 48, height: 3, background: 'rgba(255,255,255,0.45)', borderRadius: 2, marginBottom: 32 }} />
              <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 860 }}>
                {STEP_DATA.map((step) => (
                  // class="how-step-card" is the GSAP stagger target
                  <div key={step.step} className="how-step-card" style={{
                    flex: 1, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '22px 20px',
                    display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    <div style={{ fontSize: 26 }}>{step.icon}</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>Step {step.step}</div>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)', lineHeight: 1.3 }}>{step.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: 'var(--font-body)', lineHeight: 1.65 }}>{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Phase 5: Testimonials ─────────────────────────────── */}
            {/* class="testimonials-section" is the GSAP selector target */}
            <div className="testimonials-section" style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '80px 5% 40px',
              pointerEvents: 'none',
            }}>
              <h2 className="font-serif" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: '#fff', marginBottom: 8, fontWeight: 400 }}>
                Students love Capy
              </h2>
              <div style={{ width: 48, height: 3, background: 'rgba(255,255,255,0.45)', borderRadius: 2, marginBottom: 32 }} />
              <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 920 }}>
                {TESTIMONIALS.map((t) => (
                  <div key={t.name} style={{
                    flex: 1, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '22px 20px',
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'var(--font-body)', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {t.initial}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)' }}>{t.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'var(--font-body)' }}>{t.detail}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Phase 6: CTA ──────────────────────────────────────── */}
            {/* class="cta-section" is the GSAP selector target */}
            <div className="cta-section" style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px',
              gap: 20, pointerEvents: 'none',
            }}>
              <CapyTeacher size={100} expression="happy" animated />
              <h2 className="font-serif" style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#fff',
                textAlign: 'center', fontWeight: 400, lineHeight: 1.2,
              }}>
                Ready to stop procrastinating?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', fontSize: 18 }}>
                Your capybara is waiting.
              </p>
              <button
                className="btn-tactile"
                onClick={() => router.push('/signup')}
                style={{ pointerEvents: 'auto', borderRadius: 18, padding: '16px 40px', fontSize: 16, fontFamily: 'var(--font-body)' }}
              >
                Get Started — it&apos;s free
              </button>
            </div>
          </div>

          {/* Footer — revealed after card slides off in Phase 6 */}
          <footer style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '20px 24px', textAlign: 'center', zIndex: 5,
          }}>
            <p style={{ fontSize: 11, color: 'rgba(26,26,26,0.3)', fontFamily: 'var(--font-body)' }}>
              © 2026 Capy ·{' '}
              <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
              {' · '}
              <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
            </p>
          </footer>
        </div>
      </div>

      {/* Dev reset */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={resetMockData}
          title="Reset all mock data"
          style={{
            position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
            background: 'rgba(26,26,26,0.8)', color: '#fff', fontSize: 11,
            padding: '6px 12px', borderRadius: 9999, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', backdropFilter: 'blur(8px)',
          }}
        >
          🔄 reset mock
        </button>
      )}
    </>
  );
}
