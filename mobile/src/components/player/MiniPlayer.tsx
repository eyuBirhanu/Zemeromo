import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../../store/playerStore';
import { FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function MiniPlayer() {
    const navigation = useNavigation<any>();
    const colors = useThemeColors();

    const {
        currentSong,
        isPlaying,
        isBuffering,
        pauseSound,
        resumeSound,
        closePlayer,
        position,
        duration
    } = usePlayerStore();

    if (!currentSong) return null;

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    const handlePlayPause = (e: any) => {
        e.stopPropagation(); // Prevent opening the full player
        if (isBuffering) return; // Do nothing if it's currently loading
        if (isPlaying) pauseSound();
        else resumeSound();
    };

    const handleClose = (e: any) => {
        e.stopPropagation(); // Prevent opening the full player
        closePlayer();
    };

    const goToArtist = (e: any) => {
        e.stopPropagation(); // Prevent opening the full player
        const artistId = typeof currentSong.artistId === 'object' ? currentSong.artistId._id : currentSong.artistId;
        if (artistId) {
            navigation.navigate('ArtistDetail', { id: artistId });
        }
    };

    const handlePress = () => {
        // Open full player when tapping the background/row
        navigation.navigate('Player', { song: currentSong });
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
            onPress={handlePress}
            activeOpacity={1}
        >
            {/* Progress Bar - Switched to Primary Color */}
            <View style={[styles.progressBarBackground, { backgroundColor: colors.surfaceLight }]}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
            </View>

            <View style={styles.contentRow}>
                {/* Art */}
                <Image
                    source={{ uri: currentSong.thumbnailUrl || currentSong.albumId?.coverImageUrl || 'https://via.placeholder.com/50' }}
                    style={[styles.art, { backgroundColor: colors.surfaceLight }]}
                />

                {/* Text Info */}
                <View style={styles.info}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        {currentSong.title}
                    </Text>

                    {/* Clickable Artist Name using Primary Color */}
                    <TouchableOpacity onPress={goToArtist} hitSlop={10}>
                        <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>
                            {currentSong.artistId?.name || "Unknown Artist"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Controls */}
                <View style={styles.controls}>

                    {/* Play/Pause or Loading Spinner */}
                    <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn} hitSlop={10}>
                        {isBuffering ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Ionicons name={isPlaying ? "pause" : "play"} size={26} color={colors.text} />
                        )}
                    </TouchableOpacity>

                    {/* Close (X) Button */}
                    <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={10}>
                        <Feather name="x" size={24} color={colors.textSecondary} />
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
        paddingRight: 10,
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
        gap: 12, // Space between Play and X buttons
    },
    playBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    }
});