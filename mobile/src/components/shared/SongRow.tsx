import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING, FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface SongRowProps {
    title: string;
    artist: string;
    coverImage: string;
    duration?: string;
    audioUrl?: string;
    onPress: () => void;
    onPlayPress: () => void;
    onMorePress?: () => void;
    isPlaying?: boolean;
}

export default function SongRow({
    title,
    artist,
    coverImage,
    duration,
    audioUrl,
    onPress,
    onPlayPress,
    onMorePress,
    isPlaying
}: SongRowProps) {
    const colors = useThemeColors();
    const [imageError, setImageError] = useState(false);

    // Check if audio exists
    const hasAudio = audioUrl && audioUrl.trim().length > 0;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { borderBottomColor: colors.border },
                isPlaying && { backgroundColor: colors.isDark ? 'rgba(212, 244, 121, 0.05)' : 'rgba(16, 185, 129, 0.05)' }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* 1. Image Section */}
            <View style={styles.imageContainer}>
                {!imageError && coverImage ? (
                    <Image
                        source={{ uri: coverImage }}
                        style={[
                            styles.image,
                            { backgroundColor: colors.surfaceLight },
                            isPlaying && { borderWidth: 1.5, borderColor: colors.accent }
                        ]}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    // Fallback Icon (Music Note)
                    <View style={[
                        styles.image,
                        styles.fallback,
                        { backgroundColor: colors.surfaceLight },
                        isPlaying && { borderWidth: 1.5, borderColor: colors.accent }
                    ]}>
                        <Ionicons name="musical-note" size={20} color={colors.textSecondary} />
                    </View>
                )}

                {/* Playing Overlay Icon */}
                {isPlaying && (
                    <View style={[styles.overlay, { backgroundColor: colors.isDark ? 'rgba(212, 244, 121, 0.6)' : 'rgba(16, 185, 129, 0.6)' }]}>
                        <Ionicons name="bar-chart" size={14} color={colors.black} />
                    </View>
                )}
            </View>

            {/* 2. Info Section */}
            <View style={styles.info}>
                <Text
                    style={[
                        styles.title,
                        { color: colors.text },
                        isPlaying && { color: colors.accent }
                    ]}
                    numberOfLines={1}
                >
                    {title}
                </Text>

                <View style={styles.metaRow}>
                    <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>{artist}</Text>
                    {duration && (
                        <>
                            <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
                            <Text style={[styles.duration, { color: colors.textSecondary }]}>{duration}</Text>
                        </>
                    )}
                </View>
            </View>

            {/* 3. Actions Section */}
            <View style={styles.actions}>
                {hasAudio ? (
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onPlayPress();
                        }}
                        style={styles.playBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={isPlaying ? "pause" : "play-circle"}
                            size={32}
                            color={isPlaying ? colors.accent : colors.textSecondary}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.playBtn}>
                        <MaterialCommunityIcons
                            name="script-text-outline"
                            size={24}
                            color={colors.border}
                        />
                    </View>
                )}

                {onMorePress && (
                    <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={(e) => { e.stopPropagation(); onMorePress(); }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Feather name="more-vertical" size={20} color={colors.textSecondary} />
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
    },
    imageContainer: {
        position: 'relative',
        marginRight: 16,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    fallback: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontFamily: FONTS.medium,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    artist: {
        fontSize: 13,
        fontFamily: FONTS.regular,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        marginHorizontal: 6,
        opacity: 0.6,
    },
    duration: {
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreBtn: {
        padding: 4,
        marginLeft: 4,
    }
});