import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/playerStore';
import { COLORS, FONTS } from '../constants/theme';

export default function MiniPlayer() {
    const navigation = useNavigation<any>();

    const {
        currentSong,
        isPlaying,
        pauseSound,
        resumeSound,
        position,
        duration
    } = usePlayerStore();

    if (!currentSong) return null;

    // Calculate Progress
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
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={1}>
            {/* 1. Progress Bar (Top Line) */}
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>

            <View style={styles.contentRow}>
                {/* 2. Art */}
                <Image
                    source={{ uri: currentSong.thumbnailUrl || currentSong.albumId?.coverImageUrl || 'https://via.placeholder.com/50' }}
                    style={styles.art}
                />

                {/* 3. Text Info */}
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
                    <Text style={styles.artist} numberOfLines={1}>
                        {currentSong.artistId?.name || "Unknown Artist"}
                    </Text>
                </View>

                {/* 4. Controls */}
                <View style={styles.controls}>
                    {/* Favorite/Heart could go here */}

                    <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn} hitSlop={10}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={28} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 64, // Fixed height
        backgroundColor: COLORS.dark.surface, // Slightly lighter than bg
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    progressBarBackground: {
        width: '100%',
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.accent, // Lime Progress
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
        backgroundColor: '#333',
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        color: COLORS.white,
        fontSize: 14,
        fontFamily: FONTS.medium,
        marginBottom: 2,
    },
    artist: {
        color: COLORS.dark.textSecondary,
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