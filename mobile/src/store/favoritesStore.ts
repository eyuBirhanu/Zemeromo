import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteItem {
    _id: string;
    type: 'Song' | 'Album' | 'Artist' | 'Church';
    // Store the basic info needed to display the row
    title?: string;
    name?: string;
    imageUrl?: string;
    coverImageUrl?: string;
    thumbnailUrl?: string;
    logoUrl?: string;
    audioUrl?: string;
    artistId?: any;
    albumId?: any;
    churchId?: any;
    duration?: number;[key: string]: any; // Allow other fields
}

interface FavoritesState {
    favorites: FavoriteItem[];
    toggleFavorite: (item: any, type: FavoriteItem['type']) => void;
    checkIsFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            favorites: [],

            toggleFavorite: (item, type) => {
                const currentFavs = get().favorites;
                const exists = currentFavs.some(fav => fav._id === item._id);

                if (exists) {
                    // Remove it
                    set({ favorites: currentFavs.filter(fav => fav._id !== item._id) });
                } else {
                    // Add it and attach the type
                    set({ favorites: [{ ...item, type }, ...currentFavs] });
                }
            },

            checkIsFavorite: (id) => {
                return get().favorites.some(fav => fav._id === id);
            }
        }),
        {
            name: 'zemeromo-favorites',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);