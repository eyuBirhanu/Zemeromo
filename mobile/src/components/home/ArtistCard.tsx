import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';

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
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            {/* Image Container with subtle border */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: artist.image || 'https://via.placeholder.com/150' }}
                    style={styles.image}
                />
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{artist.name}</Text>

                <Text style={styles.church} numberOfLines={1}>
                    {artist.churchName}
                </Text>

                {/* Subtle Album Counter */}
                {artist.albumCount > 0 && (
                    <View style={styles.statsRow}>
                        <Ionicons name="disc-outline" size={10} color={COLORS.primary} />
                        <Text style={styles.statsText}>{artist.albumCount} Albums</Text>
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
        // Removed background color for cleaner "floating" look, or keep slight surface
        // backgroundColor: COLORS.dark.surface, 
        // borderRadius: 12,
        // padding: SPACING.s,
    },
    imageContainer: {
        width: 130,
        height: 130,
        borderRadius: 16, // Matches Featured Card radius
        overflow: 'hidden',
        marginBottom: SPACING.s,
        backgroundColor: COLORS.dark.surface,
        borderWidth: 1,
        borderColor: COLORS.dark.border,
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
        color: COLORS.dark.text,
        fontFamily: FONTS.bold,
        fontSize: 14,
        marginBottom: 2,
    },
    church: {
        color: COLORS.dark.textSecondary,
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
        color: COLORS.primary, // Emerald
        fontFamily: FONTS.medium,
        fontSize: 10,
    }
});