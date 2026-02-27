import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { FONTS } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors';

export default function MiniPlayer() {
    const navigation = useNavigation<any>();
    const colors = useThemeColors();

    const {
        currentSong,
        isPlaying,
        pauseSound,
        resumeSound,
        position,
        duration
    } = usePlayerStore();

    if (!currentSong) return null;

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    const handlePlayPause = (e: any) => {
        e.stopPropagation();
        if (isPlaying) pauseSound();
        else resumeSound();
    };

    const handlePress = () => {
        navigation.navigate('Player', { song: currentSong });
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
            onPress={handlePress}
            activeOpacity={1}
        >
            {/* Progress Bar */}
            <View style={[styles.progressBarBackground, { backgroundColor: colors.surfaceLight }]}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.accent }]} />
            </View>

            <View style={styles.contentRow}>
                {/* Art */}
                <Image
                    source={{ uri: currentSong.thumbnailUrl || currentSong.albumId?.coverImageUrl || 'https://via.placeholder.com/50' }}
                    style={[styles.art, { backgroundColor: colors.surfaceLight }]}
                />

                {/* Text Info */}
                <View style={styles.info}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{currentSong.title}</Text>
                    <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
                        {currentSong.artistId?.name || "Unknown Artist"}
                    </Text>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn} hitSlop={10}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 64,
        borderTopWidth: 1,
    },
    progressBarBackground: {
        width: '100%',
        height: 2,
    },
    progressBarFill: {
        height: '100%',
    },
    contentRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    art: {
        width: 42,
        height: 42,
        borderRadius: 6,
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    artist: {
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    }
});