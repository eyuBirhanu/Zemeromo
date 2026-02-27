import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    artist: ArtistItem;
    onPress: () => void;
}

export default function ArtistCard({ artist, onPress }: Props) {
    const colors = useThemeColors();

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            {/* Image Container with subtle border */}
            <View style={[styles.imageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Image
                    source={{ uri: artist.image || 'https://via.placeholder.com/150' }}
                    style={styles.image}
                />
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{artist.name}</Text>

                <Text style={[styles.church, { color: colors.textSecondary }]} numberOfLines={1}>
                    {artist.churchName}
                </Text>

                {/* Subtle Album Counter */}
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
    container: {
        width: 130, // Clean width
        marginRight: SPACING.m,
    },
    imageContainer: {
        width: 130,
        height: 130,
        borderRadius: 16, // Matches Featured Card radius
        overflow: 'hidden',
        marginBottom: SPACING.s,
        borderWidth: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    info: {
        alignItems: 'flex-start', // Align text left for modern look
        paddingHorizontal: 4,
    },
    name: {
        fontFamily: FONTS.bold,
        fontSize: 14,
        marginBottom: 2,
    },
    church: {
        fontFamily: FONTS.medium,
        fontSize: 11,
        marginBottom: 4,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statsText: {
        fontFamily: FONTS.medium,
        fontSize: 10,
    }
});