import { create } from 'zustand';
import { Live } from '@/lib/api/lives';

interface LiveState {
    activeLives: Live[];
    currentLive: Live | null;
    viewers: number;
    isOrganizing: boolean;
    setActiveLives: (lives: Live[]) => void;
    setCurrentLive: (live: Live | null) => void;
    updateViewers: (count: number) => void;
    setOrganizing: (isOrganizing: boolean) => void;
    reorderLives: (startIndex: number, endIndex: number) => void;
}

// Store pour l'état des lives
export const useLiveStore = create<LiveState>((set) => ({
    activeLives: [],
    currentLive: null,
    viewers: 0,
    isOrganizing: false,

    setActiveLives: (lives) => set({ activeLives: lives }),

    setCurrentLive: (live) => set({ currentLive: live }),

    updateViewers: (count) => set({ viewers: count }),

    setOrganizing: (isOrganizing) => set({ isOrganizing }),

    reorderLives: (startIndex, endIndex) =>
        set((state) => {
            const result = Array.from(state.activeLives);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return { activeLives: result };
        }),
}));
