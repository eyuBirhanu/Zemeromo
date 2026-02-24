import { create } from 'zustand';
import { Audio } from 'expo-av';

interface PlayerState {
    sound: Audio.Sound | null;
    isPlaying: boolean;
    currentSong: any | null;
    queue: any[];
    currentIndex: number;
    duration: number;
    position: number;

    // Actions
    playSongList: (songs: any[], startIndex: number) => Promise<void>;
    playSong: (song: any) => Promise<void>;
    pauseSound: () => Promise<void>;
    resumeSound: () => Promise<void>;
    seekTo: (millis: number) => Promise<void>;
    skipToNext: () => Promise<void>;
    skipToPrevious: () => Promise<void>;
    closePlayer: () => Promise<void>; // <--- NEW: To close mini player
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    sound: null,
    isPlaying: false,
    currentSong: null,
    queue: [],
    currentIndex: -1,
    duration: 0,
    position: 0,

    playSongList: async (songs, startIndex = 0) => {
        set({ queue: songs, currentIndex: startIndex });
        await get().playSong(songs[startIndex]);
    },

    playSong: async (song) => {
        const { sound: oldSound } = get();
        if (oldSound) {
            await oldSound.unloadAsync();
        }

        try {
            const { sound, status } = await Audio.Sound.createAsync(
                { uri: song.audioUrl },
                { shouldPlay: true }
            );

            set({ sound, isPlaying: true, currentSong: song });

            // Update Progress
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    set({
                        duration: status.durationMillis || 0,
                        position: status.positionMillis,
                        isPlaying: status.isPlaying
                    });

                    if (status.didJustFinish) {
                        get().skipToNext();
                    }
                }
            });
        } catch (error) {
            console.error("Error playing song:", error);
        }
    },

    pauseSound: async () => {
        const { sound } = get();
        if (sound) {
            await sound.pauseAsync();
            set({ isPlaying: false });
        }
    },

    resumeSound: async () => {
        const { sound } = get();
        if (sound) {
            await sound.playAsync();
            set({ isPlaying: true });
        }
    },

    seekTo: async (millis) => {
        const { sound } = get();
        if (sound) {
            await sound.setPositionAsync(millis); // <--- This actually moves the song
            set({ position: millis });
        }
    },

    skipToNext: async () => {
        const { queue, currentIndex, playSong } = get();
        if (currentIndex < queue.length - 1) {
            const nextIndex = currentIndex + 1;
            set({ currentIndex: nextIndex });
            await playSong(queue[nextIndex]);
        } else {
            set({ isPlaying: false });
        }
    },

    skipToPrevious: async () => {
        const { queue, currentIndex, playSong, position } = get();
        // If we are more than 3 seconds in, just restart the song
        if (position > 3000) {
            get().seekTo(0);
            return;
        }
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            set({ currentIndex: prevIndex });
            await playSong(queue[prevIndex]);
        }
    },

    closePlayer: async () => {
        const { sound } = get();
        if (sound) {
            await sound.unloadAsync();
        }
        set({ sound: null, currentSong: null, isPlaying: false, position: 0, duration: 0 });
    }
}));