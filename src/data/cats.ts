import type { CatSpecies } from '../types'

export const CAT_SPECIES: CatSpecies[] = [
  { id: 'tabby', name: 'Tigré', emoji: '🐱', rarity: 'common', zone: 'rue', description: 'Le classique du quartier', trait: 'Curieux' },
  { id: 'ginger', name: 'Roux', emoji: '🧡', rarity: 'common', zone: 'jardin', description: 'Pelage flamboyant', trait: 'Joueur' },
  { id: 'black', name: 'Noir', emoji: '🖤', rarity: 'common', zone: 'rue', description: 'Silhouette mystérieuse', trait: 'Indépendant' },
  { id: 'white', name: 'Blanc', emoji: '🤍', rarity: 'common', zone: 'café', description: 'Élégance pure', trait: 'Calme' },
  { id: 'calico', name: 'Tricolore', emoji: '🎨', rarity: 'uncommon', zone: 'jardin', description: 'Motif unique', trait: 'Joueur' },
  { id: 'siamese', name: 'Siamois', emoji: '👑', rarity: 'uncommon', zone: 'café', description: 'Yeux bleus perçants', trait: 'Bavard' },
  { id: 'maine', name: 'Maine Coon', emoji: '🦁', rarity: 'uncommon', zone: 'parc', description: 'Géant doux', trait: 'Protecteur' },
  { id: 'british', name: 'British', emoji: '🧸', rarity: 'uncommon', zone: 'toit', description: 'Boule de poils', trait: 'Paisible' },
  { id: 'bengal', name: 'Bengal', emoji: '🐆', rarity: 'rare', zone: 'parc', description: 'Motif léopard', trait: 'Énergique' },
  { id: 'ragdoll', name: 'Ragdoll', emoji: '💙', rarity: 'rare', zone: 'café', description: 'Se laisse porter', trait: 'Câlin' },
  { id: 'sphynx', name: 'Sphynx', emoji: '👽', rarity: 'rare', zone: 'toit', description: 'Sans poils, plein d\'amour', trait: 'Chaleureux' },
  { id: 'persian', name: 'Persan', emoji: '👸', rarity: 'rare', zone: 'jardin', description: 'Fourrure royale', trait: 'Majestueux' },
  { id: 'abyssinian', name: 'Abyssin', emoji: '✨', rarity: 'legendary', zone: 'parc', description: 'Agile et ancien', trait: 'Explorateur' },
  { id: 'scottish', name: 'Scottish Fold', emoji: '🦉', rarity: 'legendary', zone: 'café', description: 'Oreilles pliées adorables', trait: 'Mignon' },
  { id: 'norwegian', name: 'Norvégien', emoji: '❄️', rarity: 'legendary', zone: 'toit', description: 'Roi des toits', trait: 'Aventurier' },
  { id: 'shadow', name: 'Chat de l\'Ombre', emoji: '🌙', rarity: 'mythic', zone: 'rue', description: 'N\'apparaît qu\'à la tombée', trait: 'Mystique' },
  { id: 'golden', name: 'Chat Doré', emoji: '🌟', rarity: 'mythic', zone: 'parc', description: 'Une fois par siècle', trait: 'Légendaire' },
  { id: 'cloud', name: 'Chat Nuage', emoji: '☁️', rarity: 'mythic', zone: 'toit', description: 'Flotte légèrement', trait: 'Onirique' },
]

export const getSpeciesById = (id: string) => CAT_SPECIES.find(c => c.id === id)

export const getSpeciesByZone = (zone: string) => CAT_SPECIES.filter(c => c.zone === zone)

export const getSpeciesByRarity = (rarity: string) => CAT_SPECIES.filter(c => c.rarity === rarity)
