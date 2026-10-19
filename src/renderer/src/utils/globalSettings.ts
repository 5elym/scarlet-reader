// store.ts
import { create } from 'zustand'

interface SettingsState {
  fontSize: number
  setFontSize: (size: number) => void
  isPaginated: boolean
  setIsPaginated: (val: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSize: 100, // Percentage
  setFontSize: (size) => set({ fontSize: Math.max(0, size) }),
  isPaginated: true, // false = Continuous Scroll with taps, true = Paginated taps
  setIsPaginated: (val) => set({ isPaginated: val })
}))
