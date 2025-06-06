
import type { Sticker, StickerBookMilestone, StickerRarity } from '@/types';

const POKEMON_STICKERS_COUNT = 100;

const POKEMON_NAMES_FIRST_100: string[] = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie",
  "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata", "Raticate",
  "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina",
  "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff",
  "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett",
  "Dugtrio", "Meowth", "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag",
  "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell",
  "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro",
  "Magnemite", "Magneton", "Farfetch'd", "Doduo", "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder",
  "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb"
];

const generatePokemonStickers = (): Sticker[] => {
  const stickers: Sticker[] = [];
  for (let i = 1; i <= POKEMON_STICKERS_COUNT; i++) {
    let rarity: StickerRarity = 'common';
    if (i > 60 && i <= 90) { // Pokemon ID 61-90 are rare
      rarity = 'rare';
    } else if (i > 90) { // Pokemon ID 91-100 are epic
      rarity = 'epic';
    }
    const pokemonName = POKEMON_NAMES_FIRST_100[i-1] || `Pokemon #${i}`; // Fallback just in case
    stickers.push({
      id: `pk${i}`,
      name: pokemonName,
      imageSrc: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`,
      rarity: rarity,
      description: `A fascinating creature, ${pokemonName}, from the diverse Pokemon world.`,
      aiHint: 'pokemon creature'
    });
  }
  return stickers;
};

export const ALL_STICKERS_DATA: Sticker[] = generatePokemonStickers();

export const STICKER_BOOK_MILESTONES_DATA: StickerBookMilestone[] = [
  { id: 'm1', count: 10, rewardMessage: "Wow! You've collected 10 unique stickers! Keep up the great work!", achieved: false },
  { id: 'm2', count: 25, rewardMessage: "Fantastic! 25 unique stickers! You're a dedicated collector!", achieved: false },
  { id: 'm3', count: 50, rewardMessage: "Amazing! 50 unique stickers! Halfway to mastering the collection!", achieved: false },
  { id: 'm4', count: 75, rewardMessage: "Incredible! 75 unique stickers! You're becoming a true Pokemon scholar!", achieved: false },
  { id: 'm5', count: POKEMON_STICKERS_COUNT, rewardMessage: `Congratulations! You've collected all ${POKEMON_STICKERS_COUNT} stickers! You are a Master Sticker Scholar!`, achieved: false },
];

export const GACHA_COST = 25;
export const INITIAL_COINS = 100;
