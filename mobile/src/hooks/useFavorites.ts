// src/hooks/useFavorites.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useFavorites = (id: string, type: 'album' | 'song' | 'artist' | 'church') => {
    const key = `fav_${type}_${id}`;
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        // Load initial state
        AsyncStorage.getItem(key).then(val => setIsFavorite(val === 'true'));
    }, [id]);

    const toggleFavorite = async () => {
        const newState = !isFavorite;
        setIsFavorite(newState);
        if (newState) {
            await AsyncStorage.setItem(key, 'true');
        } else {
            await AsyncStorage.removeItem(key);
        }
    };

    return { isFavorite, toggleFavorite };
};