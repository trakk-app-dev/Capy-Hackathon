'use client';

import React from 'react';
import { getColorHex } from '@/lib/items';

export type PetExpression = 'happy' | 'curious' | 'worried' | 'panicking' | 'sad' | 'celebrating';

interface CapyPetProps {
  size?: number;
  color?: string; // color id from items.ts (e.g., 'tan', 'pink', 'blue')
  expression?: PetExpression;
  hat?: string | null;
  clothes?: string | null;
  animated?: boolean;
  className?: string;
}

export default function CapyPet({
  size = 120,
  color = 'tan',
  expression = 'happy',
  hat = null,
  clothes = null,
  animated = false,
  className = '',
}: CapyPetProps) {
  const bodyColor = getColorHex(color);
  const darkerColor = darkenColor(bodyColor, 0.15);
  const lighterColor = lightenColor(bodyColor, 0.15);

  // ─── Expression-based features ─────────────────────────────────

  const getEyes = () => {
    switch (expression) {
      case 'happy':
        return (
          <>
            <ellipse cx="38" cy="40" rx="5" ry="5.5" fill="#4A3728" />
            <circle cx="39.5" cy="38.5" r="1.8" fill="white" opacity="0.9" />
            <ellipse cx="62" cy="40" rx="5" ry="5.5" fill="#4A3728" />
            <circle cx="63.5" cy="38.5" r="1.8" fill="white" opacity="0.9" />
          </>
        );
      case 'curious':
        return (
          <>
            <ellipse cx="37" cy="39" rx="5.5" ry="6" fill="#4A3728" />
            <circle cx="38.5" cy="37.5" r="2" fill="white" opacity="0.9" />
            <ellipse cx="63" cy="39" rx="5.5" ry="6" fill="#4A3728" />
            <circle cx="64.5" cy="37.5" r="2" fill="white" opacity="0.9" />
          </>
        );
      case 'worried':
        return (
          <>
            {/* Angled down brows */}
            <path d="M 32 34 Q 36 31 42 33" stroke="#6B5744" strokeWidth="1.5" fill="none" />
            <path d="M 58 33 Q 64 31 68 34" stroke="#6B5744" strokeWidth="1.5" fill="none" />
            <ellipse cx="38" cy="40" rx="4.5" ry="5" fill="#4A3728" />
            <circle cx="39" cy="38.5" r="1.5" fill="white" opacity="0.9" />
            <ellipse cx="62" cy="40" rx="4.5" ry="5" fill="#4A3728" />
            <circle cx="63" cy="38.5" r="1.5" fill="white" opacity="0.9" />
          </>
        );
      case 'panicking':
        return (
          <>
            {/* HUGE eyes */}
            <ellipse cx="36" cy="38" rx="7" ry="7.5" fill="#4A3728" />
            <circle cx="38" cy="36" r="2.5" fill="white" opacity="0.9" />
            <circle cx="35" cy="39" r="1" fill="white" opacity="0.5" />
            <ellipse cx="64" cy="38" rx="7" ry="7.5" fill="#4A3728" />
            <circle cx="66" cy="36" r="2.5" fill="white" opacity="0.9" />
            <circle cx="63" cy="39" r="1" fill="white" opacity="0.5" />
          </>
        );
      case 'sad':
        return (
          <>
            {/* Half-closed eyes */}
            <path d="M 33 40 Q 38 37 43 40" stroke="#4A3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 57 40 Q 62 37 67 40" stroke="#4A3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'celebrating':
        return (
          <>
            {/* Star/sparkle eyes */}
            <polygon points="38,34 39.5,38 43,38 40,41 41,45 38,42 35,45 36,41 33,38 36.5,38" fill="#FFD700" />
            <polygon points="62,34 63.5,38 67,38 64,41 65,45 62,42 59,45 60,41 57,38 60.5,38" fill="#FFD700" />
          </>
        );
      default:
        return (
          <>
            <ellipse cx="38" cy="40" rx="5" ry="5.5" fill="#4A3728" />
            <circle cx="39.5" cy="38.5" r="1.8" fill="white" opacity="0.9" />
            <ellipse cx="62" cy="40" rx="5" ry="5.5" fill="#4A3728" />
            <circle cx="63.5" cy="38.5" r="1.8" fill="white" opacity="0.9" />
          </>
        );
    }
  };

  const getMouth = () => {
    switch (expression) {
      case 'happy':
        return <path d="M 43 53 Q 50 60 57 53" stroke="#4A3728" strokeWidth="2" fill="none" strokeLinecap="round" />;
      case 'curious':
        return <ellipse cx="50" cy="54" rx="3" ry="2.5" fill="#4A3728" />;
      case 'worried':
        return <path d="M 44 56 Q 50 52 56 56" stroke="#4A3728" strokeWidth="2" fill="none" strokeLinecap="round" />;
      case 'panicking':
        return <ellipse cx="50" cy="55" rx="5" ry="4" fill="#4A3728" />;
      case 'sad':
        return <path d="M 44 56 Q 50 51 56 56" stroke="#4A3728" strokeWidth="2" fill="none" strokeLinecap="round" />;
      case 'celebrating':
        return (
          <>
            <path d="M 42 52 Q 50 62 58 52" stroke="#4A3728" strokeWidth="2" fill="#FF9A80" strokeLinecap="round" />
          </>
        );
      default:
        return <path d="M 43 53 Q 50 58 57 53" stroke="#4A3728" strokeWidth="2" fill="none" strokeLinecap="round" />;
    }
  };

  const getAnimationClass = () => {
    if (!animated) return '';
    switch (expression) {
      case 'panicking': return 'pet-shake';
      case 'celebrating': return 'pet-bounce';
      default: return 'pet-float';
    }
  };

  // ─── Arms position based on expression ─────────────────────────
  const getArms = () => {
    switch (expression) {
      case 'panicking':
        return (
          <>
            <ellipse cx="22" cy="50" rx="6" ry="4" fill={darkerColor} transform="rotate(-40, 22, 50)" />
            <ellipse cx="78" cy="50" rx="6" ry="4" fill={darkerColor} transform="rotate(40, 78, 50)" />
          </>
        );
      case 'celebrating':
        return (
          <>
            <ellipse cx="20" cy="48" rx="6" ry="4" fill={darkerColor} transform="rotate(-50, 20, 48)" />
            <ellipse cx="80" cy="48" rx="6" ry="4" fill={darkerColor} transform="rotate(50, 80, 48)" />
          </>
        );
      default:
        return (
          <>
            <ellipse cx="24" cy="62" rx="6" ry="4" fill={darkerColor} transform="rotate(-10, 24, 62)" />
            <ellipse cx="76" cy="62" rx="6" ry="4" fill={darkerColor} transform="rotate(10, 76, 62)" />
          </>
        );
    }
  };

  // ─── Hat rendering ─────────────────────────────────────────────
  const renderHat = () => {
    if (!hat) return null;
    switch (hat) {
      case 'beanie':
        return (
          <g>
            <ellipse cx="50" cy="24" rx="20" ry="10" fill="#E74C3C" />
            <rect x="30" y="22" width="40" height="8" rx="3" fill="#C0392B" />
            <circle cx="50" cy="16" r="3" fill="#E74C3C" />
          </g>
        );
      case 'cowboy':
        return (
          <g>
            <ellipse cx="50" cy="24" rx="28" ry="5" fill="#8B6914" />
            <ellipse cx="50" cy="20" rx="16" ry="10" fill="#A67C00" />
            <ellipse cx="50" cy="24" rx="16" ry="3" fill="#8B6914" />
          </g>
        );
      case 'party':
        return (
          <g>
            <polygon points="50,8 38,28 62,28" fill="#FF7E5F" />
            <polygon points="50,8 42,28 58,28" fill="#FEB47B" opacity="0.6" />
            <circle cx="50" cy="8" r="3" fill="#FFD700" />
            <ellipse cx="50" cy="28" rx="14" ry="3" fill="#FF7E5F" />
          </g>
        );
      case 'graduation':
        return (
          <g>
            <rect x="34" y="18" width="32" height="6" rx="1" fill="#1E1E2E" />
            <polygon points="50,14 34,22 50,18 66,22" fill="#1E1E2E" />
            <line x1="64" y1="22" x2="68" y2="30" stroke="#FFD700" strokeWidth="1.5" />
            <circle cx="68" cy="31" r="2" fill="#FFD700" />
          </g>
        );
      case 'crown':
        return (
          <g>
            <polygon points="34,28 38,14 44,22 50,10 56,22 62,14 66,28" fill="#FFD700" />
            <rect x="34" y="26" width="32" height="5" rx="1" fill="#FFB347" />
            <circle cx="42" cy="17" r="1.5" fill="#FF7E5F" />
            <circle cx="50" cy="13" r="1.5" fill="#C4A7E7" />
            <circle cx="58" cy="17" r="1.5" fill="#87CEEB" />
          </g>
        );
      case 'baseball':
        return (
          <g>
            <ellipse cx="50" cy="24" rx="20" ry="10" fill="#2E86C1" />
            <ellipse cx="50" cy="28" rx="22" ry="4" fill="#1A5276" />
            <path d="M 30 28 Q 28 28 28 26" stroke="#1A5276" strokeWidth="2" fill="none" />
          </g>
        );
      case 'beret':
        return (
          <g>
            <ellipse cx="50" cy="22" rx="18" ry="9" fill="#C0392B" />
            <ellipse cx="57" cy="18" rx="10" ry="6" fill="#A93226" />
            <circle cx="53" cy="14" r="2" fill="#E74C3C" />
          </g>
        );
      case 'flower':
        return (
          <g>
            {/* Flower petals around head */}
            {[0,45,90,135,180,225,270,315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x = 50 + 16 * Math.cos(rad);
              const y = 22 + 10 * Math.sin(rad);
              return <ellipse key={i} cx={x} cy={y} rx="4" ry="3" fill={['#FF7E5F','#FEB47B','#C4A7E7','#FFB347','#FF6B6B','#87CEEB','#98FB98','#FFD700'][i]} opacity="0.9" transform={`rotate(${angle}, ${x}, ${y})`} />;
            })}
            <circle cx="50" cy="22" r="5" fill="#FFD700" />
          </g>
        );
      case 'headband':
        return (
          <g>
            <path d="M 30 28 Q 50 22 70 28" stroke="#FF7E5F" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="22" r="5" fill="#FF7E5F" />
            <path d="M 48 20 Q 50 16 52 20 Q 54 24 50 23 Q 46 24 48 20" fill="#FEB47B" />
          </g>
        );
      case 'tophat':
        return (
          <g>
            <rect x="38" y="10" width="24" height="18" rx="2" fill="#1E1E2E" />
            <ellipse cx="50" cy="28" rx="18" ry="4" fill="#2C3E50" />
            <rect x="40" y="24" width="20" height="3" fill="#C4A7E7" opacity="0.6" />
          </g>
        );
      case 'wizard':
        return (
          <g>
            <polygon points="50,5 38,30 62,30" fill="#6A1B9A" />
            <polygon points="50,5 43,30 57,30" fill="#7B1FA2" opacity="0.6" />
            <ellipse cx="50" cy="30" rx="14" ry="4" fill="#4A148C" />
            <circle cx="45" cy="18" r="1.5" fill="#FFD700" />
            <circle cx="55" cy="22" r="1.2" fill="#FFD700" />
            <circle cx="48" cy="25" r="1" fill="#C4A7E7" />
          </g>
        );
      case 'santa':
        return (
          <g>
            <path d="M 34 28 Q 38 14 50 14 Q 62 14 66 28" fill="#E74C3C" />
            <ellipse cx="50" cy="12" rx="10" ry="5" fill="#E74C3C" />
            <path d="M 34 28 Q 50 24 66 28" stroke="white" strokeWidth="4" fill="none" />
            <circle cx="54" cy="10" r="3" fill="white" />
          </g>
        );
      case 'chef':
        return (
          <g>
            <rect x="40" y="20" width="20" height="14" rx="2" fill="white" />
            <ellipse cx="50" cy="18" rx="12" ry="9" fill="white" />
            <ellipse cx="50" cy="18" rx="10" ry="7" fill="#F8F8F8" />
            <rect x="42" y="27" width="16" height="3" fill="#E8E8E8" />
          </g>
        );
      case 'fedora':
        return (
          <g>
            <ellipse cx="50" cy="27" rx="24" ry="5" fill="#5D4037" />
            <path d="M 36 27 Q 36 15 50 14 Q 64 15 64 27" fill="#6D4C41" />
            <path d="M 38 27 Q 38 18 50 17 Q 62 18 62 27" fill="#795548" />
            <path d="M 40 20 Q 50 18 60 20" stroke="#4E342E" strokeWidth="1" fill="none" />
          </g>
        );
      case 'viking':
        return (
          <g>
            {/* Helmet dome */}
            <path d="M 34 28 Q 34 14 50 13 Q 66 14 66 28" fill="#7F8C8D" />
            <rect x="34" y="25" width="32" height="5" rx="1" fill="#95A5A6" />
            {/* Horns */}
            <path d="M 34 22 Q 24 16 22 10 Q 26 12 30 22" fill="#F5F5DC" />
            <path d="M 66 22 Q 76 16 78 10 Q 74 12 70 22" fill="#F5F5DC" />
            <line x1="36" y1="23" x2="37" y2="28" stroke="#BDC3C7" strokeWidth="1.5" />
            <line x1="50" y1="14" x2="50" y2="28" stroke="#BDC3C7" strokeWidth="1" />
            <line x1="64" y1="23" x2="63" y2="28" stroke="#BDC3C7" strokeWidth="1.5" />
          </g>
        );
      default:
        return null;
    }
  };

  // ─── Clothes rendering ─────────────────────────────────────────
  // Body ellipse: cx=50, cy=60, rx=28, ry=26 → spans x:22-78, y:34-86
  // Clothes paths must extend to match the body width
  const renderClothes = () => {
    if (!clothes) return null;
    switch (clothes) {
      case 'tshirt':
        return (
          <g>
            <path d="M 24 56 Q 24 72 50 75 Q 76 72 76 56 Q 68 52 62 54 L 56 58 L 44 58 L 38 54 Q 32 52 24 56" fill="#3498DB" opacity="0.85" />
            <path d="M 44 58 L 56 58" stroke="#2980B9" strokeWidth="1" />
          </g>
        );
      case 'hoodie':
        return (
          <g>
            <path d="M 24 54 Q 24 74 50 77 Q 76 74 76 54 Q 68 52 60 54 L 56 56 L 44 56 L 40 54 Q 32 52 24 54" fill="#8E44AD" opacity="0.85" />
            {/* Kangaroo pocket */}
            <rect x="40" y="62" width="20" height="8" rx="4" fill="#7D3C98" opacity="0.5" />
          </g>
        );
      case 'scarf':
        return (
          <g>
            <path d="M 30 49 Q 30 55 50 57 Q 70 55 70 49 Q 64 46 58 49 L 50 52 L 42 49 Q 36 46 30 49" fill="#E74C3C" opacity="0.85" />
            {/* Hanging part */}
            <path d="M 58 51 Q 60 60 57 68" stroke="#E74C3C" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.85" />
            <path d="M 57 68 L 57 73" stroke="#C0392B" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.85" />
          </g>
        );
      case 'jacket':
        return (
          <g>
            <path d="M 23 55 Q 23 75 50 78 Q 77 75 77 55 Q 68 52 60 54 L 53 57 L 50 76 L 47 57 L 40 54 Q 32 52 23 55" fill="#2C3E50" opacity="0.85" />
            {/* Zipper */}
            <line x1="50" y1="57" x2="50" y2="76" stroke="#95A5A6" strokeWidth="1" />
          </g>
        );
      case 'suit':
        return (
          <g>
            <path d="M 24 55 Q 24 75 50 78 Q 76 75 76 55 Q 68 52 60 54 L 53 57 L 50 76 L 47 57 L 40 54 Q 32 52 24 55" fill="#1E1E2E" opacity="0.85" />
            <path d="M 40 54 L 46 60 L 50 57" fill="#2C3E50" opacity="0.9" />
            <path d="M 60 54 L 54 60 L 50 57" fill="#2C3E50" opacity="0.9" />
            <polygon points="50,57 46,62 50,76 54,62" fill="#E74C3C" opacity="0.9" />
          </g>
        );
      case 'bow_tie':
        return (
          <g>
            <polygon points="40,49 50,54 40,59" fill="#E74C3C" opacity="0.9" />
            <polygon points="60,49 50,54 60,59" fill="#E74C3C" opacity="0.9" />
            <circle cx="50" cy="54" r="3" fill="#C0392B" />
          </g>
        );
      case 'vest':
        return (
          <g>
            <path d="M 28 55 Q 28 74 50 77 Q 72 74 72 55 Q 66 52 59 54 L 54 57 L 50 75 L 46 57 L 41 54 Q 34 52 28 55" fill="#1A6B3C" opacity="0.85" />
            <circle cx="50" cy="62" r="1.5" fill="#145A32" />
            <circle cx="50" cy="68" r="1.5" fill="#145A32" />
          </g>
        );
      case 'cape':
        return (
          <g>
            {/* Cape behind */}
            <path d="M 32 55 Q 16 68 20 82 Q 50 88 80 82 Q 84 68 68 55" fill="#8E44AD" opacity="0.7" />
            {/* Cape front clasp */}
            <circle cx="50" cy="55" r="2.5" fill="#FFD700" />
          </g>
        );
      case 'uniform':
        return (
          <g>
            {/* Blazer */}
            <path d="M 24 55 Q 24 75 50 78 Q 76 75 76 55 Q 68 52 59 54 L 53 57 L 50 76 L 47 57 L 41 54 Q 32 52 24 55" fill="#1A237E" opacity="0.85" />
            {/* Tie */}
            <polygon points="50,57 47,62 50,73 53,62" fill="#E53935" opacity="0.9" />
            {/* Pocket badge */}
            <rect x="57" y="60" width="8" height="6" rx="1" fill="#FFD700" opacity="0.7" />
          </g>
        );
      case 'apron':
        return (
          <g>
            {/* Apron body */}
            <path d="M 38 55 L 35 74 Q 50 78 65 74 L 62 55 Q 57 53 50 54 Q 43 53 38 55" fill="#FFF8E1" opacity="0.9" />
            {/* Pocket */}
            <rect x="43" y="62" width="14" height="8" rx="2" fill="#F9A825" opacity="0.5" />
            <line x1="50" y1="62" x2="50" y2="70" stroke="#F9A825" strokeWidth="1" />
          </g>
        );
      case 'raincoat':
        return (
          <g>
            <path d="M 23 52 Q 23 75 50 78 Q 77 75 77 52 Q 68 46 59 50 L 54 56 L 50 76 L 46 56 L 41 50 Q 32 46 23 52" fill="#F4D03F" opacity="0.9" />
            {/* Buttons */}
            <circle cx="50" cy="58" r="1.5" fill="#D4AC0D" />
            <circle cx="50" cy="64" r="1.5" fill="#D4AC0D" />
            <circle cx="50" cy="70" r="1.5" fill="#D4AC0D" />
          </g>
        );
      case 'lab_coat':
        return (
          <g>
            <path d="M 23 55 Q 23 76 50 79 Q 77 76 77 55 Q 68 52 59 54 L 53 57 L 50 77 L 47 57 L 41 54 Q 32 52 23 55" fill="white" opacity="0.92" />
            {/* Pocket */}
            <rect x="56" y="62" width="10" height="8" rx="1" fill="#BDC3C7" opacity="0.4" />
            {/* Pen in pocket */}
            <line x1="59" y1="61" x2="59" y2="66" stroke="#2980B9" strokeWidth="1.5" />
            <line x1="62" y1="61" x2="62" y2="66" stroke="#E74C3C" strokeWidth="1.5" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${getAnimationClass()} ${className}`}
      style={{ transition: 'all 0.5s ease' }}
    >
      <defs>
        {/* Pattern fills for special colors */}
        <pattern id="polkadot-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill={bodyColor} />
          <circle cx="4" cy="4" r="1.5" fill="white" opacity="0.4" />
        </pattern>
        <pattern id="striped-pattern" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill={bodyColor} />
          <rect width="3" height="6" fill="white" opacity="0.2" />
        </pattern>
      </defs>

      {/* ─── BASE: Body ─────────────────────────────────────────── */}
      <ellipse
        cx="50"
        cy="60"
        rx="28"
        ry="26"
        fill={color === 'polkadot' ? 'url(#polkadot-pattern)' : color === 'striped' ? 'url(#striped-pattern)' : bodyColor}
      />

      {/* Belly highlight */}
      <ellipse cx="50" cy="66" rx="18" ry="14" fill={lighterColor} opacity="0.5" />

      {/* Small ears */}
      <ellipse cx="34" cy="34" rx="6" ry="7" fill={bodyColor} />
      <ellipse cx="34" cy="34" rx="4" ry="5" fill={lighterColor} />
      <ellipse cx="66" cy="34" rx="6" ry="7" fill={bodyColor} />
      <ellipse cx="66" cy="34" rx="4" ry="5" fill={lighterColor} />

      {/* Head */}
      <ellipse cx="50" cy="42" rx="22" ry="18" fill={bodyColor} />

      {/* Face lighter area */}
      <ellipse cx="50" cy="46" rx="16" ry="12" fill={lighterColor} opacity="0.5" />

      {/* ─── CLOTHES LAYER (shifted down to clear mouth/chin) ────── */}
      <g transform="translate(0, 7)">
        {renderClothes()}
      </g>

      {/* ─── ARMS ───────────────────────────────────────────────── */}
      <g style={{ transition: 'all 0.5s ease' }}>
        {getArms()}
      </g>

      {/* ─── FACE ───────────────────────────────────────────────── */}
      {/* Eyes */}
      <g className={animated && (expression === 'happy' || expression === 'curious') ? 'pet-eye-drift' : ''} style={{ transition: 'all 0.5s ease' }}>
        {getEyes()}
      </g>

      {/* Nose */}
      <ellipse cx="50" cy="48" rx="3.5" ry="2.5" fill={darkenColor(bodyColor, 0.3)} />
      {/* Nose shine */}
      <circle cx="49" cy="47.5" r="1" fill="white" opacity="0.3" />

      {/* Mouth */}
      <g style={{ transition: 'all 0.5s ease' }}>
        {getMouth()}
      </g>

      {/* Blush circles */}
      {(expression === 'happy' || expression === 'celebrating') && (
        <>
          <circle cx="30" cy="46" r="4" fill="#FF9A80" opacity="0.3" />
          <circle cx="70" cy="46" r="4" fill="#FF9A80" opacity="0.3" />
        </>
      )}

      {/* ─── HAT LAYER (on top) ─────────────────────────────────── */}
      {renderHat()}

      {/* ─── Small feet ─────────────────────────────────────────── */}
      <ellipse cx="40" cy="84" rx="7" ry="4" fill={darkerColor} />
      <ellipse cx="60" cy="84" rx="7" ry="4" fill={darkerColor} />

      {/* ─── Celebrating sparkles ───────────────────────────────── */}
      {expression === 'celebrating' && animated && (
        <>
          <text x="18" y="20" fontSize="10" className="sparkle" style={{ animationDelay: '0s' }}>✨</text>
          <text x="75" y="15" fontSize="8" className="sparkle" style={{ animationDelay: '0.3s' }}>✨</text>
          <text x="10" y="55" fontSize="7" className="sparkle" style={{ animationDelay: '0.6s' }}>✨</text>
          <text x="85" y="50" fontSize="9" className="sparkle" style={{ animationDelay: '0.9s' }}>✨</text>
          <text x="50" y="8" fontSize="10" className="sparkle" style={{ animationDelay: '0.4s' }}>⭐</text>
        </>
      )}
    </svg>
  );
}

// ─── Color helpers ─────────────────────────────────────────────────

function darkenColor(hex: string, amount: number): string {
  if (hex === 'pattern') return '#B8A090';
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function lightenColor(hex: string, amount: number): string {
  if (hex === 'pattern') return '#E8D8C8';
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
