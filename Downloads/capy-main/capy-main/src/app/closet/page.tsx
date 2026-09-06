'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged } from '@/lib/auth';
import { getPet, updatePet, type PetData } from '@/lib/db';
import { HATS, CLOTHES, COLORS } from '@/lib/items';
import CapyPet from '@/components/CapyPet';

type Tab = 'hats' | 'clothes' | 'colors';

export default function ClosetPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [pet, setPet] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('hats');
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(async (user) => {
      if (!user) { router.push('/signup'); return; }
      setUid(user.uid);
      const petData = await getPet(user.uid);
      setPet(petData);
      setLoading(false);
    });
    return unsub;
  }, [router]);

  const isItemUnlocked = (itemId: string) => {
    return pet?.unlockedItems?.includes(itemId) || false;
  };

  const handleEquipHat = async (hatId: string | null) => {
    if (!uid || !pet) return;
    setSaving(true);
    const newHat = pet.equippedHat === hatId ? null : hatId;
    await updatePet(uid, { equippedHat: newHat });
    setPet({ ...pet, equippedHat: newHat });
    setSaving(false);
  };

  const handleEquipClothes = async (clothesId: string | null) => {
    if (!uid || !pet) return;
    setSaving(true);
    const newClothes = pet.equippedClothes === clothesId ? null : clothesId;
    await updatePet(uid, { equippedClothes: newClothes });
    setPet({ ...pet, equippedClothes: newClothes });
    setSaving(false);
  };

  const handleSaveName = async () => {
    if (!uid || !pet || !nameInput.trim()) { setEditingName(false); return; }
    const trimmed = nameInput.trim();
    if (trimmed === pet.name) { setEditingName(false); return; }
    setSaving(true);
    await updatePet(uid, { name: trimmed });
    setPet({ ...pet, name: trimmed });
    setEditingName(false);
    setSaving(false);
  };

  const handleChangeColor = async (colorId: string) => {
    if (!uid || !pet) return;
    setSaving(true);
    await updatePet(uid, { color: colorId });
    setPet({ ...pet, color: colorId });
    setSaving(false);
  };

  if (loading || !pet) {
    return (
      <div className="gradient-closet min-h-screen flex items-center justify-center">
        <div className="skeleton w-48 h-8" />
      </div>
    );
  }

  return (
    <div className="gradient-closet min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button onClick={() => router.push('/home')} className="flex items-center gap-1.5 text-sm text-near-black/40 hover:text-coral transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Home
        </button>
        <h1 className="text-2xl text-near-black">Closet</h1>
        <div className="w-16" />
      </div>

      <div className="px-6 pb-12 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* ═══ RIGHT (visually appears on right on desktop): Live Preview ═══ */}
          <motion.div
            initial={{ x: 15, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:order-2"
          >
            <div className="glass-strong rounded-2xl p-8 text-center sticky top-20" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <div className="flex justify-center">
                <CapyPet
                  size={180}
                  color={pet.color}
                  expression="happy"
                  hat={pet.equippedHat}
                  clothes={pet.equippedClothes}
                  animated
                />
              </div>

              {/* Pet name — inline editing */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {editingName ? (
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                    className="input-glow bg-white rounded-lg px-3 py-1 text-lg text-near-black text-center max-w-[160px]"
                    style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)' }}
                    maxLength={20}
                  />
                ) : (
                  <>
                    <h3 className="text-xl text-near-black">{pet.name}</h3>
                    <button
                      onClick={() => { setNameInput(pet.name); setEditingName(true); }}
                      className="text-near-black/25 hover:text-coral transition-colors"
                      title="Rename pet"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              <p className="text-xs text-near-black/40 mt-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                Level {pet.level} · {pet.xp} XP
              </p>
              {saving && (
                <p className="text-[10px] text-coral mt-2" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>Saving...</p>
              )}
            </div>
          </motion.div>

          {/* ═══ LEFT: Item Grid ═══ */}
          <motion.div
            initial={{ x: -15, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:order-1"
          >
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-near-black/5 rounded-xl p-1">
              {(['hats', 'clothes', 'colors'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                    tab === t ? 'bg-white text-near-black shadow-sm' : 'text-near-black/40'
                  }`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {t === 'hats' ? '🎩 Hats' : t === 'clothes' ? '👕 Clothes' : '🎨 Colors'}
                </button>
              ))}
            </div>

            {/* Items grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-3"
              >
                {tab === 'hats' && (
                  <>
                    {/* None option */}
                    <button
                      onClick={() => handleEquipHat(null)}
                      className={`card-hover glass rounded-xl p-4 text-center transition-all ${
                        !pet.equippedHat ? 'ring-2 ring-coral' : ''
                      }`}
                      style={{ boxShadow: 'var(--shadow-sm)' }}
                    >
                      <div className="text-2xl mb-2">🚫</div>
                      <p className="text-xs text-near-black/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>None</p>
                    </button>

                    {HATS.map((hat) => {
                      const unlocked = isItemUnlocked(hat.id);
                      const equipped = pet.equippedHat === hat.id;
                      return (
                        <button
                          key={hat.id}
                          onClick={() => unlocked && handleEquipHat(hat.id)}
                          disabled={!unlocked}
                          className={`card-hover glass rounded-xl p-4 text-center transition-all relative ${
                            equipped ? 'ring-2 ring-coral' : ''
                          } ${!unlocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                          style={{ boxShadow: 'var(--shadow-sm)' }}
                        >
                          {/* Mini preview */}
                          <div className="mb-2 flex justify-center">
                            <CapyPet size={50} color={pet.color} hat={hat.id} expression="happy" />
                          </div>
                          <p className="text-xs text-near-black/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{hat.name}</p>
                          {equipped && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-coral rounded-full flex items-center justify-center">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                          )}
                          {!unlocked && (
                            <span className="absolute bottom-2 right-2 text-[9px] text-near-black/40 font-bold" style={{ fontFamily: 'var(--font-body)' }}>Lv{hat.unlockLevel}</span>
                          )}
                        </button>
                      );
                    })}
                  </>
                )}

                {tab === 'clothes' && (
                  <>
                    <button
                      onClick={() => handleEquipClothes(null)}
                      className={`card-hover glass rounded-xl p-4 text-center transition-all ${
                        !pet.equippedClothes ? 'ring-2 ring-coral' : ''
                      }`}
                      style={{ boxShadow: 'var(--shadow-sm)' }}
                    >
                      <div className="text-2xl mb-2">🚫</div>
                      <p className="text-xs text-near-black/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>None</p>
                    </button>

                    {CLOTHES.map((item) => {
                      const unlocked = isItemUnlocked(item.id);
                      const equipped = pet.equippedClothes === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => unlocked && handleEquipClothes(item.id)}
                          disabled={!unlocked}
                          className={`card-hover glass rounded-xl p-4 text-center transition-all relative ${
                            equipped ? 'ring-2 ring-coral' : ''
                          } ${!unlocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                          style={{ boxShadow: 'var(--shadow-sm)' }}
                        >
                          <div className="mb-2 flex justify-center">
                            <CapyPet size={50} color={pet.color} clothes={item.id} expression="happy" />
                          </div>
                          <p className="text-xs text-near-black/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{item.name}</p>
                          {equipped && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-coral rounded-full flex items-center justify-center">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                          )}
                          {!unlocked && (
                            <span className="absolute bottom-2 right-2 text-[9px] text-near-black/40 font-bold" style={{ fontFamily: 'var(--font-body)' }}>Lv{item.unlockLevel}</span>
                          )}
                        </button>
                      );
                    })}
                  </>
                )}

                {tab === 'colors' && (
                  <>
                    {COLORS.map((color) => {
                      const unlocked = isItemUnlocked(color.id);
                      const selected = pet.color === color.id;
                      return (
                        <button
                          key={color.id}
                          onClick={() => unlocked && handleChangeColor(color.id)}
                          disabled={!unlocked}
                          className={`card-hover glass rounded-xl p-4 text-center transition-all relative ${
                            selected ? 'ring-2 ring-coral' : ''
                          } ${!unlocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                          style={{ boxShadow: 'var(--shadow-sm)' }}
                        >
                          <div className="mb-2 flex justify-center items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full"
                              style={{ backgroundColor: color.hex === 'pattern' ? '#C4A7E7' : color.hex, boxShadow: 'var(--shadow-sm)' }}
                            />
                          </div>
                          <p className="text-xs text-near-black/60" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>{color.name}</p>
                          {selected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-coral rounded-full flex items-center justify-center">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                          )}
                          {!unlocked && (
                            <span className="absolute bottom-2 right-2 text-[9px] text-near-black/40 font-bold" style={{ fontFamily: 'var(--font-body)' }}>Lv{color.unlockLevel}</span>
                          )}
                        </button>
                      );
                    })}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
