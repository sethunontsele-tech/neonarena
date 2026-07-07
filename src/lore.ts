export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: 'world' | 'weapon' | 'character' | 'spell';
}

export const LORE_ENTRIES: LoreEntry[] = [
  {
    id: 'the_neon_rift',
    title: 'The Neon Rift',
    category: 'world',
    content: 'In the year 2142, a tear in the digital fabric of reality appeared over the ruins of Old Tokyo. Known as the Neon Rift, it leaked raw data into the physical world, crystallizing into the glowing arenas where champions now fight for the ultimate prize: the Core Access.'
  },
  {
    id: 'the_core_access',
    title: 'The Core Access',
    category: 'world',
    content: 'The Core is the central processing unit of the planetary network. Whoever controls it controls the flow of information, energy, and reality itself. The Arena was built by the AI Overlords to determine who is worthy of this power.'
  },
  {
    id: 'weapon_nova_launcher',
    title: 'Nova Launcher Origins',
    category: 'weapon',
    content: 'Forged from the heart of a collapsed server node, the Nova Launcher doesn\'t just fire rockets—it fires compressed logic bombs that overwrite the local physics of its targets.'
  },
  {
    id: 'spell_blink',
    title: 'The Art of Blinking',
    category: 'spell',
    content: 'Blinking is not teleportation. It is the temporary deletion of one\'s coordinates from the world-buffer and re-insertion at a new location. Mastering it requires a mind that can think in hexadecimal.'
  },
  {
    id: 'character_amber',
    title: 'Amber: The First Glitch',
    category: 'character',
    content: 'Amber was the first human to survive a Rift exposure. Her body is now 40% light-data, allowing her to move faster than the refresh rate of the world.'
  }
];
