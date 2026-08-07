import type { Cat } from '@/types/cat';

type CatBadgeCopy = {
  title: string;
  subtitle: string;
};

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length]!;
}

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

/**
 * Celebration title for the first-capture badge — playful, tied to the cat's traits.
 * Deterministic per cat id so the same capture always shows the same copy.
 */
export function pickCatRelatedBadgeCopy(cat: Cat): CatBadgeCopy {
  const seed = hashSeed(cat.id || cat.name || String(cat.number));
  const color = normalize(cat.analysis.color);
  const breed = normalize(cat.analysis.breed);
  const coat = normalize(cat.analysis.coat);
  const tag = normalize(cat.analysis.tags?.[0]);
  const rarity = normalize(cat.analysis.rarity);

  const titles: string[] = [];

  if (color.includes('roux') || color.includes('ginger') || color.includes('orange')) {
    titles.push('Flamme du quartier', 'Roi des roux', 'Coucher de soleil');
  }
  if (color.includes('noir') || color.includes('black')) {
    titles.push('Ombre féline', 'Mystère de minuit', 'Panthère locale');
  }
  if (color.includes('blanc') || color.includes('white')) {
    titles.push('Nuage de rue', 'Perle du trottoir', 'Flocon urbain');
  }
  if (color.includes('gris') || color.includes('grey') || color.includes('gray')) {
    titles.push('Brume du parc', 'Argent des toits', 'Fumée douce');
  }
  if (color.includes('tigr') || coat.includes('tigr') || coat.includes('tabby')) {
    titles.push('Tigré légendaire', 'Rayures du destin', 'Petit tigre');
  }
  if (breed.includes('européen') || breed.includes('european')) {
    titles.push('Européen charmeur', 'Chat de pavé', 'Voisin félin');
  }
  if (breed && !breed.includes('inconnu') && !breed.includes('unknown')) {
    titles.push(`${cat.analysis.breed.trim()} surprise`);
  }
  if (tag) {
    titles.push(`Âme ${tag}`, `Esprit ${tag}`);
  }
  if (rarity.includes('rare') || rarity.includes('épique') || rarity.includes('légendaire')) {
    titles.push('Capture rare', 'Trésor du quartier', 'Légende locale');
  }

  titles.push(
    'Ami des chats',
    'Premier cliché',
    'Œil de lynx',
    'Chasseur de miaous',
    'Compagnon du jour',
    `${cat.name} forever`,
  );

  const uniqueTitles = [...new Set(titles.filter(Boolean))];
  const title = pick(uniqueTitles, seed);

  const subtitleBits: string[] = [];
  if (cat.name.trim()) subtitleBits.push(cat.name.trim());
  if (cat.analysis.color?.trim()) subtitleBits.push(cat.analysis.color.trim());
  if (
    cat.analysis.breed?.trim() &&
    !normalize(cat.analysis.breed).includes('inconnu')
  ) {
    subtitleBits.push(cat.analysis.breed.trim());
  }
  if (subtitleBits.length < 2) {
    subtitleBits.push('Premier cliché');
  }

  return {
    title,
    subtitle: subtitleBits.slice(0, 3).join(' · '),
  };
}
