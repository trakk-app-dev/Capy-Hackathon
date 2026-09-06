'use client';

import React from 'react';

export type TeacherExpression = 'neutral' | 'thinking' | 'happy' | 'stern' | 'scanning';

interface CapyTeacherProps {
  size?: number;
  expression?: TeacherExpression;
  animated?: boolean;
  className?: string;
}

export default function CapyTeacher({
  size = 120,
  expression = 'neutral',
  animated = false,
  className = '',
}: CapyTeacherProps) {
  // Expression-based features
  const getLeftEyeShape = () => {
    switch (expression) {
      case 'thinking': return { cx: 37, cy: 38, rx: 3.5, ry: 4 };
      case 'happy': return { cx: 38, cy: 39, rx: 3.5, ry: 3 };
      case 'stern': return { cx: 38, cy: 38, rx: 3.5, ry: 3.5 };
      case 'scanning': return { cx: 38, cy: 38, rx: 3, ry: 3.5 };
      default: return { cx: 38, cy: 38, rx: 3.5, ry: 4 };
    }
  };

  const getRightEyeShape = () => {
    switch (expression) {
      case 'thinking': return { cx: 62, cy: 37, rx: 3.5, ry: 4 };
      case 'happy': return { cx: 62, cy: 39, rx: 3.5, ry: 3 };
      case 'stern': return { cx: 62, cy: 38, rx: 3.5, ry: 3.5 };
      case 'scanning': return { cx: 62, cy: 38, rx: 3, ry: 3.5 };
      default: return { cx: 62, cy: 38, rx: 3.5, ry: 4 };
    }
  };

  const getMouth = () => {
    switch (expression) {
      case 'happy':
        return <path d="M 44 52 Q 50 58 56 52" stroke="#4A3728" strokeWidth="2" fill="none" strokeLinecap="round" />;
      case 'thinking':
        return <circle cx="52" cy="54" r="2.5" fill="#4A3728" />;
      case 'stern':
        return <path d="M 45 53 L 55 53" stroke="#4A3728" strokeWidth="2" strokeLinecap="round" />;
      case 'scanning':
        return <path d="M 46 52 Q 50 55 54 52" stroke="#4A3728" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
      default:
        return <path d="M 45 52 Q 50 56 55 52" stroke="#4A3728" strokeWidth="2" fill="none" strokeLinecap="round" />;
    }
  };

  const getLeftBrow = () => {
    switch (expression) {
      case 'thinking':
        return <path d="M 33 31 Q 37 27 42 30" stroke="#6B5744" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
      case 'stern':
        return <path d="M 33 32 Q 37 29 42 31" stroke="#6B5744" strokeWidth="1.8" fill="none" strokeLinecap="round" />;
      default:
        return null;
    }
  };

  const getRightBrow = () => {
    switch (expression) {
      case 'thinking':
        return <path d="M 58 30 Q 63 28 67 32" stroke="#6B5744" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
      case 'stern':
        return <path d="M 58 31 Q 63 29 67 32" stroke="#6B5744" strokeWidth="1.8" fill="none" strokeLinecap="round" />;
      default:
        return null;
    }
  };

  const leftEye = getLeftEyeShape();
  const rightEye = getRightEyeShape();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${animated && expression === 'scanning' ? 'scanning-rock' : ''} ${className}`}
      style={{ transition: 'all 0.5s ease' }}
    >
      <defs>
        <linearGradient id="teacherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7E5F" />
          <stop offset="50%" stopColor="#FEB47B" />
          <stop offset="100%" stopColor="#C4A7E7" />
        </linearGradient>
        <linearGradient id="teacherBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8B78A" />
          <stop offset="40%" stopColor="#D2A070" />
          <stop offset="100%" stopColor="#C4916A" />
        </linearGradient>
      </defs>

      {/* Body — rounded capybara silhouette */}
      <ellipse cx="50" cy="58" rx="30" ry="28" fill="url(#teacherBodyGradient)" />

      {/* Belly highlight */}
      <ellipse cx="50" cy="65" rx="20" ry="16" fill="#ECC8A0" opacity="0.5" />

      {/* Small ears */}
      <ellipse cx="32" cy="33" rx="6" ry="7" fill="#D2A070" />
      <ellipse cx="32" cy="33" rx="4" ry="5" fill="#E8C4A0" />
      <ellipse cx="68" cy="33" rx="6" ry="7" fill="#D2A070" />
      <ellipse cx="68" cy="33" rx="4" ry="5" fill="#E8C4A0" />

      {/* Head */}
      <ellipse cx="50" cy="40" rx="24" ry="20" fill="#D2A070" />

      {/* Face lighter area */}
      <ellipse cx="50" cy="44" rx="18" ry="14" fill="#E8C8A8" opacity="0.6" />

      {/* Glasses — TWO circles (signature!) */}
      <circle cx="38" cy="38" r="8" fill="none" stroke="#4A3728" strokeWidth="2" />
      <circle cx="62" cy="38" r="8" fill="none" stroke="#4A3728" strokeWidth="2" />
      {/* Bridge */}
      <path d="M 46 38 Q 50 36 54 38" stroke="#4A3728" strokeWidth="1.5" fill="none" />
      {/* Temple arms */}
      <path d="M 30 38 L 25 35" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 70 38 L 75 35" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />

      {/* Glass lenses (subtle tint) */}
      <circle cx="38" cy="38" r="7" fill="rgba(200,220,255,0.1)" />
      <circle cx="62" cy="38" r="7" fill="rgba(200,220,255,0.1)" />

      {/* Eyebrows */}
      {getLeftBrow()}
      {getRightBrow()}

      {/* Eyes (behind glasses) */}
      <g className={animated ? 'pet-eye-drift' : ''} style={{ transition: 'all 0.5s ease' }}>
        <ellipse {...leftEye} fill="#4A3728" />
        {/* Eye shine */}
        <circle cx={leftEye.cx + 1} cy={leftEye.cy - 1} r="1.2" fill="white" opacity="0.8" />

        <ellipse {...rightEye} fill="#4A3728" />
        <circle cx={rightEye.cx + 1} cy={rightEye.cy - 1} r="1.2" fill="white" opacity="0.8" />
      </g>

      {/* Nose */}
      <ellipse cx="50" cy="47" rx="3" ry="2" fill="#8B6F5C" />

      {/* Mouth */}
      <g style={{ transition: 'all 0.5s ease' }}>
        {getMouth()}
      </g>

      {/* Tiny pointer stick (optional accessory) */}
      <line x1="75" y1="55" x2="85" y2="40" stroke="#8B6F5C" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="85" cy="39" r="2" fill="#FF7E5F" />

      {/* Small arms */}
      <ellipse cx="24" cy="60" rx="6" ry="4" fill="#C4916A" transform="rotate(-15, 24, 60)" />
      <ellipse cx="76" cy="60" rx="6" ry="4" fill="#C4916A" transform="rotate(15, 76, 60)" />

      {/* Small feet */}
      <ellipse cx="38" cy="84" rx="7" ry="4" fill="#B8845E" />
      <ellipse cx="62" cy="84" rx="7" ry="4" fill="#B8845E" />
    </svg>
  );
}
