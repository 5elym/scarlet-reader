// store.ts
import { create } from 'zustand'

export interface ReaderSettings {
  fontSize: number
  isPaginated: boolean
}

interface SettingsState extends ReaderSettings {
  setFontSize: (size: number) => void
  setIsPaginated: (val: boolean) => void
  loadSettings: (settings: ReaderSettings) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSize: 100, // Percentage
  setFontSize: (size) => set({ fontSize: Math.max(0, size) }),
  isPaginated: true, // false = Continuous Scroll with taps, true = Paginated taps
  setIsPaginated: (val) => set({ isPaginated: val }),
  loadSettings: (settings) =>
    set({
      fontSize: Number.isFinite(settings.fontSize) ? Math.max(0, settings.fontSize) : 100,
      isPaginated: settings.isPaginated
    })
}))
