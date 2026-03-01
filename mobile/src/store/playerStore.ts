import { create } from 'zustand';
import { Audio } from 'expo-av';

// --- INITIALIZE AUDIO MODE ONCE ---
// This tells the phone "I am a music app, respect my audio"
Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true, // Keep playing when minimized!
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
});

const DEV_URL = 'http://192.168.42.244:5000/';
const PROD_URL = 'https://zemeromo-api.onrender.com/';

const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

const getFullAudioUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${BASE_URL}${url.replace(/\\/g, '/')}`;
};

interface PlayerState {
    sound: Audio.Sound | null;
    isPlaying: boolean;
    isBuffering: boolean;
    currentSong: any | null;

    queue: any[];
    originalQueue: any[];
    currentIndex: number;

    isShuffling: boolean;
    repeatMode: 'off' | 'all' | 'one';

    duration: number;
    position: number;

    // Internal Lock to prevent double-playing
    _isSwitchingTrack: boolean;

    // Actions
    playSongList: (songs: any[], startIndex: number) => Promise<void>;
    playSong: (song: any) => Promise<void>;
    pauseSound: () => Promise<void>;
    resumeSound: () => Promise<void>;
    seekTo: (millis: number) => Promise<void>;
    skipToNext: () => Promise<void>;
    skipToPrevious: () => Promise<void>;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    closePlayer: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    sound: null,
    isPlaying: false,
    isBuffering: false,
    currentSong: null,
    queue: [],
    originalQueue: [],
    currentIndex: -1,
    isShuffling: false,
    repeatMode: 'off',
    duration: 0,
    position: 0,
    _isSwitchingTrack: false, // Prevents rapid taps from creating 10 audio instances

    playSongList: async (songs, startIndex = 0) => {
        set({ queue: songs, originalQueue: songs, currentIndex: startIndex });
        await get().playSong(songs[startIndex]);
    },

    playSong: async (song) => {
        const state = get();

        // 1. PREVENT RAPID TAPPING OVERLAP
        if (state._isSwitchingTrack) {
            console.log("Ignored: Already switching tracks.");
            return;
        }

        // 2. IF CLICKING THE SAME SONG THAT IS ALREADY LOADED
        if (state.currentSong?._id === song._id && state.sound) {
            if (!state.isPlaying) {
                await state.resumeSound();
            }
            return;
        }

        // 3. LOCK THE PLAYER & SHOW LOADER
        set({ _isSwitchingTrack: true, isBuffering: true, currentSong: song, position: 0, duration: 0 });

        try {
            // 4. CLEANLY UNLOAD PREVIOUS SOUND
            if (state.sound) {
                // Remove listener so it stops fighting our state
                state.sound.setOnPlaybackStatusUpdate(null);
                await state.sound.stopAsync();
                await state.sound.unloadAsync();
            }

            const validUrl = getFullAudioUrl(song.audioUrl);
            console.log("Now Playing:", validUrl);

            if (!validUrl) throw new Error("Invalid Audio URL");

            // 5. LOAD NEW SOUND
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: validUrl },
                { shouldPlay: true, progressUpdateIntervalMillis: 1000 }
            );

            // 6. SAVE TO STATE & UNLOCK
            set({ sound: newSound, isPlaying: true, isBuffering: false, _isSwitchingTrack: false });

            // 7. SETUP NEW LISTENERS
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    set({
                        duration: status.durationMillis || 0,
                        position: status.positionMillis,
                        isPlaying: status.isPlaying,
                        isBuffering: status.isBuffering,
                    });

                    // AUTO-PLAY NEXT WHEN FINISHED
                    if (status.didJustFinish) {
                        const { repeatMode, skipToNext, seekTo, resumeSound } = get();
                        if (repeatMode === 'one') {
                            seekTo(0);
                            resumeSound();
                        } else {
                            skipToNext();
                        }
                    }
                } else if (status.error) {
                    console.log(`Playback Error: ${status.error}`);
                    set({ isPlaying: false, isBuffering: false });
                }
            });

        } catch (error) {
            console.error("Failed to play song:", error);
            set({ isPlaying: false, isBuffering: false, _isSwitchingTrack: false });
            // Optional: alert("Could not load song.");
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
            await sound.setPositionAsync(millis);
            set({ position: millis });
        }
    },

    skipToNext: async () => {
        const { queue, currentIndex, playSong, repeatMode } = get();
        if (currentIndex < queue.length - 1) {
            const nextIndex = currentIndex + 1;
            set({ currentIndex: nextIndex });
            await playSong(queue[nextIndex]);
        } else if (repeatMode === 'all' && queue.length > 0) {
            // Loop back to start of album/playlist
            set({ currentIndex: 0 });
            await playSong(queue[0]);
        } else {
            // Stop playing
            set({ isPlaying: false, position: 0 });
        }
    },

    skipToPrevious: async () => {
        const { queue, currentIndex, playSong, position, seekTo } = get();

        // If we are more than 3 seconds into the song, restart the current song instead of skipping back
        if (position > 3000) {
            seekTo(0);
            return;
        }

        // Otherwise, go to the previous song in the queue
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            set({ currentIndex: prevIndex });
            await playSong(queue[prevIndex]);
        }
    },

    toggleShuffle: () => {
        const { isShuffling, originalQueue, currentSong } = get();
        if (!isShuffling) {
            // Turn ON Shuffle: Shuffle the queue
            const newQueue = [...originalQueue].sort(() => Math.random() - 0.5);
            set({
                isShuffling: true,
                queue: newQueue,
                currentIndex: newQueue.findIndex(s => s._id === currentSong?._id)
            });
        } else {
            // Turn OFF Shuffle: Restore original order
            set({
                isShuffling: false,
                queue: originalQueue,
                currentIndex: originalQueue.findIndex(s => s._id === currentSong?._id)
            });
        }
    },

    toggleRepeat: () => {
        const { repeatMode } = get();
        const nextMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
        set({ repeatMode: nextMode });
    },

    closePlayer: async () => {
        const { sound } = get();
        if (sound) {
            sound.setOnPlaybackStatusUpdate(null);
            await sound.unloadAsync();
        }
        set({ sound: null, currentSong: null, isPlaying: false, isBuffering: false, position: 0, duration: 0 });
    }
}));