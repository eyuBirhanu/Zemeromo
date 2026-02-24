import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { usePlayerStore } from '../../store/playerStore';

export default function MiniPlayer() {
    const navigation = useNavigation<any>();

    // Use the New Store
    const { currentSong, isPlaying, pauseSound, resumeSound, position, duration } = usePlayerStore();

    // If no song is loaded, hide the mini player
    if (!currentSong) return null;

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    const togglePlay = () => {
        if (isPlaying) pauseSound();
        else resumeSound();
    };

    const handlePress = () => {
        // Open full player and pass the current song
        navigation.navigate('Player', { song: currentSong });
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.container}>
            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>

            <View style={styles.content}>
                <Image
                    source={{ uri: currentSong.thumbnailUrl || currentSong.albumId?.coverImageUrl }}
                    style={styles.art}
                />

                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
                    <Text style={styles.artist} numberOfLines={1}>
                        {currentSong.artistId?.name || "Unknown Artist"}
                    </Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={24} color={COLORS.dark.bg} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 78, // Adjust based on your TabBar
        left: 8,
        right: 8,
        backgroundColor: '#252525',
        borderRadius: 12,
        height: 64,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        overflow: 'hidden'
    },
    progressBarBg: { height: 2, backgroundColor: 'rgba(255,255,255,0.1)', width: '100%' },
    progressBarFill: { height: 2, backgroundColor: COLORS.accent },
    content: { flexDirection: 'row', alignItems: 'center', padding: 8, flex: 1 },
    art: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#333' },
    textContainer: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    title: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    artist: { color: '#aaa', fontSize: 12 },
    controls: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
    playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' }
});