export interface Track {
  title: string
  artist: string
  src: string
  /** Optional cover art shown in the widget and on the lock screen. */
  cover?: string
}

/**
 * Shopping-vibes playlist.
 *
 * The default entries are royalty-free demo tracks hosted by SoundHelix so the
 * player works out of the box. To use your own lo-fi / Afrobeats songs, drop
 * the MP3 files into `public/music/` and point `src` at them, e.g.
 * `{ title: 'Accra Sunset', artist: 'COCO+', src: '/music/accra-sunset.mp3' }`.
 * Only add music you have the rights to play publicly.
 */
export const PLAYLIST: Track[] = [
  {
    title: 'Sunday Stroll',
    artist: 'SoundHelix · demo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    title: 'Window Shopping',
    artist: 'SoundHelix · demo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    title: 'Dansoman Drive',
    artist: 'SoundHelix · demo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    title: 'Golden Hour Fit',
    artist: 'SoundHelix · demo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
  {
    title: 'Slow Checkout',
    artist: 'SoundHelix · demo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    title: 'Linen & Lights',
    artist: 'SoundHelix · demo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  },
]
