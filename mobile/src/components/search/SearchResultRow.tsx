import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';

interface SearchResultRowProps {
    item: any;
    onPress: (item: any) => void;
    onPlayPress: (item: any) => void;
}

export default function SearchResultRow({ item, onPress, onPlayPress }: SearchResultRowProps) {
    // 1. Normalize Type (Handle case-sensitivity from backend)
    const rawType = item.type || 'Song';
    const type = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase(); // Ensure "Song", "Artist", "Church"

    const isArtist = type === 'Artist';
    const isChurch = type === 'Church';
    const isAlbum = type === 'Album';
    const isSong = type === 'Song';

    // 2. Image Logic
    const imageUri = item.image || item.imageUrl || item.coverImageUrl || item.thumbnailUrl;

    // 3. Smart Subtitle Logic
    const getSubtitle = () => {
        const parts = [];

        if (isSong) {
            // Song: Show Artist Name
            if (item.artistId?.name) parts.push(item.artistId.name);
            else if (item.artist) parts.push(item.artist);

            // Song: Show Album Name if available
            if (item.albumId?.title) parts.push(item.albumId.title);

            // Song: Fallback to Tags if no artist info (Unlikely but good for safety)
            if (parts.length === 0 && item.tags && item.tags.length > 0) {
                parts.push(`#${item.tags[0]}`);
            }
        }
        else if (isArtist) {
            // Artist: Show their Church
            if (item.churchId?.name) parts.push(item.churchId.name);
            else parts.push("Artist"); // Fallback
        }
        else if (isAlbum) {
            // Album: Show Artist
            if (item.artistId?.name) parts.push(item.artistId.name);
            else parts.push("Album");
        }
        else if (isChurch) {
            // Church: Show Location
            if (item.location) parts.push(item.location);
            else parts.push("Congregation");
        }

        return parts.join(' • ');
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            {/* --- LEFT: IMAGE / ICON --- */}
            <View style={[
                styles.imageContainer,
                isArtist && styles.roundImage, // Artist = Circle
                isChurch && styles.churchImage // Church = Slightly rounded
            ]}>
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    // FALLBACK ICONS
                    <View style={styles.placeholder}>
                        {isChurch && <MaterialCommunityIcons name="church" size={22} color={COLORS.dark.textSecondary} />}
                        {isArtist && <Feather name="mic" size={22} color={COLORS.dark.textSecondary} />}
                        {isAlbum && <Ionicons name="disc-outline" size={22} color={COLORS.dark.textSecondary} />}
                        {isSong && <Ionicons name="musical-notes" size={22} color={COLORS.dark.textSecondary} />}
                    </View>
                )}
            </View>

            {/* --- MIDDLE: INFO --- */}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.title || item.name}
                </Text>

                <View style={styles.metaRow}>
                    {/* TYPE BADGE (Small Colored Text) */}
                    <Text style={[
                        styles.typeText,
                        isChurch ? { color: '#60A5FA' } : // Blue for Church
                            isArtist ? { color: '#F472B6' } : // Pink for Artist
                                { color: COLORS.primary }         // Emerald for Content
                    ]}>
                        {type.toUpperCase()}
                    </Text>

                    {/* SEPARATOR & SUBTITLE */}
                    <Text style={styles.dot}> • </Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {getSubtitle()}
                    </Text>
                </View>
            </View>

            {/* --- RIGHT: ACTION --- */}
            <View style={styles.action}>
                {isSong ? (
                    // PLAY BUTTON (Lime)
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onPlayPress(item);
                        }}
                        style={styles.playBtn}
                        hitSlop={10}
                    >
                        <Ionicons name="play" size={16} color={COLORS.black} style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                ) : (
                    // NAVIGATION CHEVRON
                    <Ionicons name="chevron-forward" size={18} color={COLORS.dark.border} />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10, // Tighter padding for list density
        paddingHorizontal: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.dark.border,
        backgroundColor: COLORS.dark.bg, // Ensure solid background
    },
    // IMAGE STYLES
    imageContainer: {
        width: 52,
        height: 52,
        borderRadius: 8, // Default (Songs/Albums)
        overflow: 'hidden',
        backgroundColor: COLORS.dark.surface,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    roundImage: {
        borderRadius: 26, // Circle for Artists
    },
    churchImage: {
        borderRadius: 12, // Distinct shape for Churches
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.dark.surfaceLight,
    },

    // TEXT STYLES
    info: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'center',
    },
    title: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.medium,
        marginBottom: 3,
        letterSpacing: -0.2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    dot: {
        color: COLORS.dark.textSecondary,
        fontSize: 10,
        marginHorizontal: 2,
    },
    subtitle: {
        color: COLORS.dark.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
        maxWidth: '85%', // Prevent text from hitting the button
    },

    // ACTION STYLES
    action: {
        marginLeft: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.accent, // LIME
        alignItems: 'center',
        justifyContent: 'center',
        // Slight shadow/glow
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    }
});