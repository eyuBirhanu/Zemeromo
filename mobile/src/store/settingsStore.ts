import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
    hasSeenOnboarding: boolean;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            hasSeenOnboarding: false,
            completeOnboarding: () => set({ hasSeenOnboarding: true }),
            resetOnboarding: () => set({ hasSeenOnboarding: false }),
        }),
        {
            name: 'user-settings', // unique name
            storage: createJSONStorage(() => AsyncStorage), // Use Async Storage
        }
    )
);