import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const THEMES = ['forest-green', 'luxury-black', 'clean-minimal', 'burgundy'] as const

export type Theme = (typeof THEMES)[number]

export const THEME_LABELS: Record<Theme, string> = {
  'forest-green': 'Forest Green',
  'luxury-black': 'Luxury Black',
  'clean-minimal': 'Clean Minimal',
  burgundy: 'Burgundy',
}

const apply = (theme: Theme) => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'forest-green',
      setTheme: (theme) => {
        apply(theme)
        set({ theme })
      },
    }),
    {
      name: 'coco-plus-theme',
      onRehydrateStorage: () => (state) => {
        if (state) apply(state.theme)
      },
    },
  ),
)
