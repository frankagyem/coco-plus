import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PLAYLIST } from '../music/playlist'

const POSITION_KEY = 'coco-plus-music-position'

interface SavedPosition {
  track: number
  time: number
}

const readPosition = (): SavedPosition | null => {
  try {
    const raw = localStorage.getItem(POSITION_KEY)
    return raw ? (JSON.parse(raw) as SavedPosition) : null
  } catch {
    return null
  }
}

const writePosition = (track: number, time: number) => {
  try {
    localStorage.setItem(POSITION_KEY, JSON.stringify({ track, time }))
  } catch {
    // Storage may be full or disabled; losing the resume point is harmless.
  }
}

// One shared <audio> element for the whole app. It lives outside React so
// route changes and re-renders never interrupt playback. It is only created
// after the shopper taps a button, so nothing is downloaded on page load.
let audio: HTMLAudioElement | null = null
let lastSaved = 0
let failures = 0

interface MusicState {
  /** Header toggle: Music ON/OFF. */
  enabled: boolean
  /** True once the shopper has tapped to start audio in this page session. */
  unlocked: boolean
  playing: boolean
  track: number
  volume: number
  muted: boolean
  collapsed: boolean
  setEnabled: (enabled: boolean) => void
  start: () => void
  toggle: () => void
  next: () => void
  previous: () => void
  playTrack: (index: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setCollapsed: (collapsed: boolean) => void
}

export const getAudio = () => audio

export const useMusic = create<MusicState>()(
  persist(
    (set, get) => {
      const updateMediaSession = () => {
        if (!('mediaSession' in navigator)) return
        const current = PLAYLIST[get().track]
        navigator.mediaSession.metadata = new MediaMetadata({
          title: current.title,
          artist: current.artist,
          album: 'COCO+ Shopping Vibes',
          artwork: [
            { src: current.cover ?? '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: current.cover ?? '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        })
      }

      const load = (index: number, startAt = 0) => {
        if (!audio) return
        const track = (index + PLAYLIST.length) % PLAYLIST.length
        set({ track })
        audio.src = PLAYLIST[track].src
        if (startAt > 0) {
          audio.addEventListener('loadedmetadata', () => (audio!.currentTime = startAt), {
            once: true,
          })
        }
        writePosition(track, startAt)
        updateMediaSession()
      }

      const play = () => {
        audio?.play().catch(() => set({ playing: false }))
      }

      const ensureAudio = () => {
        if (audio) return audio
        const { volume, muted } = get()
        audio = new Audio()
        audio.preload = 'auto'
        audio.volume = volume
        audio.muted = muted

        audio.addEventListener('play', () => set({ playing: true }))
        audio.addEventListener('pause', () => set({ playing: false }))
        audio.addEventListener('playing', () => (failures = 0))
        audio.addEventListener('ended', () => get().next())
        audio.addEventListener('timeupdate', () => {
          const now = Date.now()
          if (now - lastSaved < 3000) return
          lastSaved = now
          writePosition(get().track, audio!.currentTime)
        })
        // Skip broken links, but stop after a full lap so we never loop forever.
        audio.addEventListener('error', () => {
          failures += 1
          if (failures < PLAYLIST.length) get().next()
          else set({ playing: false })
        })

        window.addEventListener('pagehide', () => {
          if (audio) writePosition(get().track, audio.currentTime)
        })

        if ('mediaSession' in navigator) {
          const session = navigator.mediaSession
          session.setActionHandler('play', play)
          session.setActionHandler('pause', () => audio?.pause())
          session.setActionHandler('nexttrack', () => get().next())
          session.setActionHandler('previoustrack', () => get().previous())
          try {
            session.setActionHandler('seekto', (details) => {
              if (audio && details.seekTime != null) audio.currentTime = details.seekTime
            })
          } catch {
            // seekto is not supported everywhere.
          }
        }

        return audio
      }

      return {
        enabled: true,
        unlocked: false,
        playing: false,
        track: 0,
        volume: 0.6,
        muted: false,
        collapsed: false,

        setEnabled: (enabled) => {
          set({ enabled })
          if (!enabled) audio?.pause()
          // Turning music on from the header is a user gesture, so we can play.
          else get().start()
        },

        start: () => {
          const firstStart = !audio
          ensureAudio()
          set({ unlocked: true, enabled: true })
          if (firstStart) {
            const saved = readPosition()
            const index = saved && saved.track < PLAYLIST.length ? saved.track : get().track
            load(index, saved?.time ?? 0)
          }
          play()
        },

        toggle: () => {
          if (!audio) return get().start()
          if (audio.paused) play()
          else audio.pause()
        },

        next: () => {
          ensureAudio()
          load(get().track + 1)
          play()
        },

        previous: () => {
          ensureAudio()
          // Like most players: restart the song unless we're near its start.
          if (audio!.currentTime > 3) {
            audio!.currentTime = 0
            return
          }
          load(get().track - 1)
          play()
        },

        playTrack: (index) => {
          ensureAudio()
          set({ unlocked: true })
          load(index)
          play()
        },

        setVolume: (volume) => {
          set({ volume, muted: volume === 0 })
          if (audio) {
            audio.volume = volume
            audio.muted = volume === 0
          }
        },

        toggleMute: () => {
          const muted = !get().muted
          set({ muted })
          if (audio) audio.muted = muted
          if (!muted && get().volume === 0) get().setVolume(0.6)
        },

        setCollapsed: (collapsed) => set({ collapsed }),
      }
    },
    {
      name: 'coco-plus-music',
      partialize: ({ enabled, track, volume, muted, collapsed }) => ({
        enabled,
        track,
        volume,
        muted,
        collapsed,
      }),
    },
  ),
)
