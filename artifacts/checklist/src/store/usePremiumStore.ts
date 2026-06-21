import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PremiumState {
  isPremium: boolean;
  activatePremium: () => void;
  deactivatePremium: () => void;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      activatePremium: () => set({ isPremium: true }),
      deactivatePremium: () => set({ isPremium: false }),
    }),
    { name: 'focus-kit-premium-v1' }
  )
);
