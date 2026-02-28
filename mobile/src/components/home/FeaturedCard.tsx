import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 200;

interface Props {
    item: any;
    onPress: () => void;
    onPlayPress: () => void;
}

export default function FeaturedCard({ item, onPress, onPlayPress }: Props) {
    const colors = useThemeColors();
    const [imageError, setImageError] = useState(false); // Track if image failed

    const isSong = item.type === 'song' || item.type === 'Song';
    const artistName = typeof item.artist === 'object' ? item.artist.name : (item.artist || 'Unknown');
    const artistImage = typeof item.artist === 'object' ? item.artist.image : null;

    // Check for valid image URL
    const coverImage = item.coverImage || item.thumbnailUrl;
    const hasValidImage = coverImage && coverImage.trim().length > 0 && !imageError;

    const displayTags = item.tags ? item.tags.slice(0, 2) : [];

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
            {/* 1. BACKGROUND LAYER */}
            {hasValidImage ? (
                // A. Real Image
                <Image
                    source={{ uri: coverImage }}
                    style={styles.image}
                    resizeMode="cover"
                    onError={() => setImageError(true)} // Trigger fallback if load fails
                />
            ) : (
                // B. Fallback Abstract Gradient (Professional Look)
                <LinearGradient
                    colors={[colors.primary, '#000000']} // Emerald to Black
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.image}
                />
            )}

            {/* 2. OVERLAY GRADIENT (Always needed for text readability) */}
            <LinearGradient
                colors={['transparent', 'rgba(15, 19, 26, 0.6)', 'rgba(15, 19, 26, 0.95)']}
                locations={[0, 0.6, 1]}
                style={styles.gradient}
            />

            {/* 3. CONTENT LAYER */}
            <View style={styles.content}>

                {/* TOP: Tags */}
                <View style={styles.topRow}>
                    <View style={[styles.typeBadge, { backgroundColor: isSong ? colors.accent : colors.primary }]}>
                        <Text style={[styles.typeText, { color: isSong ? 'black' : 'white' }]}>
                            {isSong ? 'SINGLE' : 'ALBUM'}
                        </Text>
                    </View>

                    <View style={styles.tagContainer}>
                        {displayTags.map((tag: string, index: number) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText} numberOfLines={1}>#{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* BOTTOM: Info */}
                <View style={styles.bottomSection}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

                        <View style={styles.artistRow}>
                            {artistImage ? (
                                <Image source={{ uri: artistImage }} style={styles.artistAvatar} />
                            ) : (
                                <View style={[styles.artistAvatar, { backgroundColor: colors.surfaceLight }]} />
                            )}
                            <Text style={styles.artistName} numberOfLines={1}>{artistName}</Text>
                        </View>
                    </View>

                    {/* Action Button */}
                    {isSong ? (
                        <TouchableOpacity
                            style={[styles.playBtn, { backgroundColor: colors.accent }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onPlayPress();
                            }}
                        >
                            <Ionicons name="play" size={20} color={colors.black} style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.albumIcon, { borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                            <Ionicons name="albums-outline" size={20} color={colors.primary} />
                            <Text style={[styles.songCount, { color: colors.primary }]}>{item.songCount || 0}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        marginRight: SPACING.m,
        borderWidth: 1,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#1a1f2b', // Default bg color while loading
    },
    gradient: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    content: {
        flex: 1,
        padding: SPACING.m,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
    },
    tagContainer: {
        flexDirection: 'row',
        gap: 6,
        maxWidth: '60%',
        justifyContent: 'flex-end',
    },
    tag: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tagText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontFamily: FONTS.medium,
    },
    bottomSection: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        paddingRight: SPACING.s,
    },
    title: {
        color: 'white', // Always white because of dark overlay
        fontSize: 20,
        fontFamily: FONTS.bold,
        marginBottom: 6,
        letterSpacing: -0.5,
    },
    artistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    artistAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
    },
    artistName: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    playBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    albumIcon: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
    },
    songCount: {
        fontSize: 9,
        fontFamily: FONTS.bold,
        marginTop: 2,
    }
});