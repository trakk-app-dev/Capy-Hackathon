// ─── Accessory Items Data Structure ──────────────────────────────
// All hats, clothes, and colors available in the Closet.
// unlockLevel: minimum pet level to unlock this item.

export interface HatItem {
  id: string;
  name: string;
  unlockLevel: number;
}

export interface ClothesItem {
  id: string;
  name: string;
  unlockLevel: number;
}

export interface ColorItem {
  id: string;
  name: string;
  unlockLevel: number;
  hex: string; // hex color OR 'pattern' for special patterns
}

export const HATS: HatItem[] = [
  { id: 'beanie', name: 'Beanie', unlockLevel: 1 },
  { id: 'cowboy', name: 'Cowboy Hat', unlockLevel: 1 },
  { id: 'party', name: 'Party Hat', unlockLevel: 1 },
  { id: 'beret', name: 'Beret', unlockLevel: 1 },
  { id: 'flower', name: 'Flower Crown', unlockLevel: 1 },
  { id: 'headband', name: 'Headband', unlockLevel: 1 },
  { id: 'tophat', name: 'Top Hat', unlockLevel: 2 },
  { id: 'wizard', name: 'Wizard Hat', unlockLevel: 2 },
  { id: 'santa', name: 'Santa Hat', unlockLevel: 2 },
  { id: 'chef', name: 'Chef Hat', unlockLevel: 3 },
  { id: 'fedora', name: 'Fedora', unlockLevel: 3 },
  { id: 'graduation', name: 'Graduation Cap', unlockLevel: 3 },
  { id: 'baseball', name: 'Baseball Cap', unlockLevel: 4 },
  { id: 'viking', name: 'Viking Helmet', unlockLevel: 4 },
  { id: 'crown', name: 'Crown', unlockLevel: 5 },
];

export const CLOTHES: ClothesItem[] = [
  { id: 'tshirt', name: 'T-Shirt', unlockLevel: 1 },
  { id: 'hoodie', name: 'Hoodie', unlockLevel: 1 },
  { id: 'bow_tie', name: 'Bow Tie', unlockLevel: 1 },
  { id: 'vest', name: 'Vest', unlockLevel: 2 },
  { id: 'scarf', name: 'Scarf', unlockLevel: 2 },
  { id: 'uniform', name: 'School Uniform', unlockLevel: 2 },
  { id: 'apron', name: 'Apron', unlockLevel: 2 },
  { id: 'cape', name: 'Cape', unlockLevel: 3 },
  { id: 'jacket', name: 'Jacket', unlockLevel: 3 },
  { id: 'raincoat', name: 'Raincoat', unlockLevel: 3 },
  { id: 'lab_coat', name: 'Lab Coat', unlockLevel: 4 },
  { id: 'suit', name: 'Suit & Tie', unlockLevel: 6 },
];

export const COLORS: ColorItem[] = [
  { id: 'tan', name: 'Default Tan', unlockLevel: 1, hex: '#D2B48C' },
  { id: 'pink', name: 'Pastel Pink', unlockLevel: 1, hex: '#FFB6C1' },
  { id: 'blue', name: 'Sky Blue', unlockLevel: 1, hex: '#87CEEB' },
  { id: 'mint', name: 'Mint Green', unlockLevel: 1, hex: '#98FB98' },
  { id: 'orange', name: 'Burnt Orange', unlockLevel: 1, hex: '#CC7722' },
  { id: 'coral_red', name: 'Coral Red', unlockLevel: 1, hex: '#FF6B6B' },
  { id: 'white', name: 'Snow White', unlockLevel: 2, hex: '#F5F5F5' },
  { id: 'gold', name: 'Gold', unlockLevel: 2, hex: '#DAA520' },
  { id: 'lavender', name: 'Lavender', unlockLevel: 2, hex: '#C4A7E7' },
  { id: 'purple', name: 'Purple', unlockLevel: 3, hex: '#9B59B6' },
  { id: 'teal', name: 'Teal', unlockLevel: 3, hex: '#20B2AA' },
  { id: 'charcoal', name: 'Charcoal', unlockLevel: 4, hex: '#36454F' },
  { id: 'polkadot', name: 'Polka Dot', unlockLevel: 4, hex: 'pattern' },
  { id: 'striped', name: 'Striped', unlockLevel: 5, hex: 'pattern' },
  { id: 'neon', name: 'Neon Green', unlockLevel: 7, hex: '#39FF14' },
];

// Flat list of all items for unlock checking
export const ALL_ITEMS = [
  ...HATS.map((h) => ({ id: h.id, unlockLevel: h.unlockLevel })),
  ...CLOTHES.map((c) => ({ id: c.id, unlockLevel: c.unlockLevel })),
  ...COLORS.map((c) => ({ id: c.id, unlockLevel: c.unlockLevel })),
];

// Default unlocked items for a new Level 1 pet
export const DEFAULT_UNLOCKED_ITEMS = ALL_ITEMS
  .filter((item) => item.unlockLevel <= 1)
  .map((item) => item.id);

// Get color hex by id
export function getColorHex(colorId: string): string {
  const color = COLORS.find((c) => c.id === colorId);
  return color?.hex || '#D2B48C';
}
