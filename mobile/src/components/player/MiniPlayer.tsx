import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SPACING, FONTS } from '../../constants/theme';
import { usePlayerStore } from '../../store/playerStore';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function MiniPlayer() {
    const navigation = useNavigation<any>();
    const colors = useThemeColors();

    const { currentSong, isPlaying, pauseSound, resumeSound, position, duration } = usePlayerStore();

    if (!currentSong) return null;

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    const togglePlay = () => {
        if (isPlaying) pauseSound();
        else resumeSound();
    };

    const handlePress = () => {
        navigation.navigate('Player', { song: currentSong });
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.9}
            style={[styles.container, { backgroundColor: colors.surface }]} // Adapts to theme
        >
            {/* Progress Bar */}
            <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceLight }]}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.accent }]} />
            </View>

            <View style={styles.content}>
                <Image
                    source={{ uri: currentSong.thumbnailUrl || currentSong.albumId?.coverImageUrl }}
                    style={[styles.art, { backgroundColor: colors.surfaceLight }]}
                />

                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{currentSong.title}</Text>
                    <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
                        {currentSong.artistId?.name || "Unknown Artist"}
                    </Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={togglePlay} style={[styles.playBtn, { backgroundColor: colors.accent }]}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={24} color={colors.isDark ? '#000' : '#fff'} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 78,
        left: 8,
        right: 8,
        borderRadius: 12,
        height: 64,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        overflow: 'hidden'
    },
    progressBarBg: { height: 2, width: '100%' },
    progressBarFill: { height: 2 },
    content: { flexDirection: 'row', alignItems: 'center', padding: 8, flex: 1 },
    art: { width: 48, height: 48, borderRadius: 8 },
    textContainer: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    title: { fontSize: 14, fontFamily: FONTS.bold },
    artist: { fontSize: 12, fontFamily: FONTS.regular },
    controls: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
    playBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }
});