import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';

interface SongRowProps {
    title: string;
    artist: string;
    coverImage: string;
    duration?: string;
    onRowPress: () => void;
    onPlayPause: () => void;
    onMorePress?: () => void;
    isPlaying?: boolean;
}

export default function SongRow({
    title, artist, coverImage, duration, onRowPress, onPlayPause, onMorePress, isPlaying
}: SongRowProps) {
    return (
        <TouchableOpacity
            style={[styles.container, isPlaying && styles.activeContainer]}
            onPress={onRowPress}
            activeOpacity={0.7}
        >
            {/* Image Section */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: coverImage || 'https://via.placeholder.com/100' }}
                    style={[styles.image, isPlaying && styles.activeImage]}
                />

                {/* Playing Overlay Icon */}
                {isPlaying && (
                    <View style={styles.overlay}>
                        <Ionicons name="bar-chart" size={14} color={COLORS.black} />
                    </View>
                )}
            </View>

            {/* Info Section */}
            <View style={styles.info}>
                <Text
                    style={[styles.title, isPlaying && { color: COLORS.accent }]}
                    numberOfLines={1}
                >
                    {title}
                </Text>

                <View style={styles.metaRow}>
                    <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
                    {duration && (
                        <>
                            <View style={styles.dot} />
                            <Text style={styles.duration}>{duration}</Text>
                        </>
                    )}
                </View>
            </View>

            {/* Actions Section */}
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        onPlayPause();
                    }}
                    style={styles.playBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name={isPlaying ? "pause" : "play-circle"}
                        size={28} // Slightly larger for better tap target
                        color={isPlaying ? COLORS.accent : COLORS.dark.textSecondary}
                    />
                </TouchableOpacity>

                {onMorePress && (
                    <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={(e) => { e.stopPropagation(); onMorePress(); }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Feather name="more-vertical" size={20} color={COLORS.dark.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.02)', // Very subtle divider
    },
    activeContainer: {
        backgroundColor: 'rgba(212, 244, 121, 0.03)', // Very faint Lime background when playing
    },
    imageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: COLORS.dark.surface,
    },
    activeImage: {
        borderWidth: 1.5,
        borderColor: COLORS.accent,
    },
    overlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(212, 244, 121, 0.6)', // Lime Overlay
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: COLORS.dark.text,
        fontSize: 15,
        fontFamily: FONTS.medium,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    artist: {
        color: COLORS.dark.textSecondary,
        fontSize: 13,
        fontFamily: FONTS.regular,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: COLORS.dark.textSecondary,
        marginHorizontal: 6,
        opacity: 0.6,
    },
    duration: {
        color: COLORS.dark.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    playBtn: {
        padding: 4,
    },
    moreBtn: {
        padding: 4,
        marginLeft: 4,
    }
});