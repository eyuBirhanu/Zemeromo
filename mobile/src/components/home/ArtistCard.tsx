import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SPACING, FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ArtistItem {
    id: string;
    name: string;
    image: string;
    churchName: string;
    albumCount: number;
}

interface Props {
    artist?: ArtistItem;
    onPress?: () => void;
    isLoading?: boolean;
}

// --- SKELETON ---
const Skeleton = ({ style }: { style: any }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;
    const colors = useThemeColors();
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, [opacity]);
    return <Animated.View style={[style, { backgroundColor: colors.isDark ? '#333333' : '#E0E0E0', opacity }]} />;
};

export default function ArtistCard({ artist, onPress, isLoading }: Props) {
    const colors = useThemeColors();
    const [imageError, setImageError] = useState(false);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Skeleton style={styles.imageContainer} />
                <View style={styles.info}>
                    <Skeleton style={{ width: 90, height: 14, borderRadius: 4, marginBottom: 4 }} />
                    <Skeleton style={{ width: 60, height: 10, borderRadius: 4 }} />
                </View>
            </View>
        );
    }

    if (!artist) return null; // Safety check

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.imageContainer, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                {!imageError && artist.image ? (
                    <Image source={{ uri: artist.image }} style={styles.image} onError={() => setImageError(true)} />
                ) : (
                    <View style={styles.fallback}>
                        <Feather name="mic" size={40} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{artist.name}</Text>
                <Text style={[styles.church, { color: colors.textSecondary }]} numberOfLines={1}>{artist.churchName}</Text>
                {artist.albumCount > 0 && (
                    <View style={styles.statsRow}>
                        <Ionicons name="disc-outline" size={10} color={colors.primary} />
                        <Text style={[styles.statsText, { color: colors.primary }]}>{artist.albumCount} Albums</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { width: 130, marginRight: SPACING.m },
    imageContainer: { width: 130, height: 130, borderRadius: 16, overflow: 'hidden', marginBottom: SPACING.s, borderWidth: 1 },
    image: { width: '100%', height: '100%' },
    fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    info: { alignItems: 'flex-start', paddingHorizontal: 4 },
    name: { fontFamily: FONTS.bold, fontSize: 14, marginBottom: 2 },
    church: { fontFamily: FONTS.medium, fontSize: 11, marginBottom: 4 },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statsText: { fontFamily: FONTS.medium, fontSize: 10 }
});