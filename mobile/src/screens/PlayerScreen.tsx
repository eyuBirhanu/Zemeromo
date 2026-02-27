import React, { useState } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
    ScrollView, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { SPACING, FONTS } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useThemeColors } from '../hooks/useThemeColors'; // Theme Hook

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const colors = useThemeColors();
    const { song: paramSong } = route.params || {};

    const {
        isPlaying, playSong, pauseSound, resumeSound,
        currentSong, position, duration, seekTo, skipToNext, skipToPrevious
    } = usePlayerStore();

    const [isDragging, setIsDragging] = useState(false);
    const [dragValue, setDragValue] = useState(0);

    const activeSong = currentSong || paramSong;

    const formatTime = (millis: number) => {
        if (!millis || millis < 0) return "0:00";
        const totalSeconds = Math.floor(millis / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (isPlaying) pauseSound();
        else {
            if (currentSong?._id === activeSong._id) resumeSound();
            else playSong(activeSong);
        }
    };

    const openLyrics = () => {
        if (activeSong) navigation.navigate('SongDetail', { id: activeSong._id });
    };

    const openArtist = () => {
        const artistId = activeSong.artistId?._id || activeSong.artistId;
        if (artistId) navigation.navigate('ArtistDetail', { id: artistId });
    };

    if (!activeSong) return <View style={[styles.container, { backgroundColor: colors.bg }]} />;

    const artistName = typeof activeSong.artistId === 'object' ? activeSong.artistId?.name : "Unknown Artist";
    const artistImage = typeof activeSong.artistId === 'object' ? activeSong.artistId?.imageUrl : null;

    return (
        <View style={styles.container}>
            {/* Dark Status Bar for immersive feel */}
            <StatusBar barStyle="light-content" />

            {/* Background Gradient (Always Dark for Player Vibe) */}
            <LinearGradient
                colors={colors.isDark ? ['#1E3A8A', '#121212', '#000000'] : ['#E5E7EB', '#FFFFFF']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
            />
            {/* If Light Mode, add a blur overlay to ensure text contrast if we want to keep dark text, 
                BUT standard players usually keep dark backgrounds. 
                Let's adapt the text colors instead. */}

            <SafeAreaView style={{ flex: 1 }}>

                {/* 1. HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Feather name="chevron-down" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                        {activeSong.albumId?.title || "NOW PLAYING"}
                    </Text>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialCommunityIcons name="dots-horizontal" size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 2. MAIN PLAYER UI */}
                    <View style={styles.playerSection}>

                        {/* Artwork */}
                        <View style={styles.artContainer}>
                            <Image
                                source={{ uri: activeSong.thumbnailUrl || activeSong.albumId?.coverImageUrl }}
                                style={[styles.art, { borderColor: colors.border, borderWidth: 1 }]}
                            />
                        </View>

                        {/* Title & Artist Row */}
                        <View style={styles.trackInfoRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{activeSong.title}</Text>
                                <Text style={[styles.artist, { color: colors.textSecondary }]}>{artistName}</Text>
                            </View>
                            {/* Removed Download Button as requested */}
                        </View>

                        {/* Slider */}
                        <View style={styles.sliderContainer}>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={0}
                                maximumValue={duration || 1}
                                value={isDragging ? dragValue : position}
                                minimumTrackTintColor={colors.accent}
                                maximumTrackTintColor={colors.isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
                                thumbTintColor={colors.text}
                                onSlidingStart={() => setIsDragging(true)}
                                onValueChange={setDragValue}
                                onSlidingComplete={(val) => { seekTo(val); setIsDragging(false); }}
                            />
                            <View style={styles.timeRow}>
                                <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(isDragging ? dragValue : position)}</Text>
                                <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(duration)}</Text>
                            </View>
                        </View>

                        {/* Controls */}
                        <View style={styles.controls}>
                            <TouchableOpacity>
                                <Ionicons name="shuffle" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={skipToPrevious}>
                                <Ionicons name="play-skip-back" size={36} color={colors.text} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handlePlayPause} style={[styles.playBtn, { backgroundColor: colors.text }]}>
                                <Ionicons
                                    name={isPlaying ? "pause" : "play"}
                                    size={36}
                                    color={colors.bg} // Invert color for icon
                                    style={{ marginLeft: isPlaying ? 0 : 4 }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={skipToNext}>
                                <Ionicons name="play-skip-forward" size={36} color={colors.text} />
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <MaterialIcons name="repeat" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 3. LYRICS CARD */}
                    <TouchableOpacity onPress={openLyrics} activeOpacity={0.9} style={[styles.lyricsCard, { backgroundColor: colors.isDark ? '#7D2E68' : '#FBCFE8' }]}>
                        <View style={styles.lyricsHeader}>
                            <Text style={[styles.lyricsTitle, { color: colors.isDark ? 'white' : 'black' }]}>Lyrics</Text>
                            <Feather name="maximize-2" size={16} color={colors.isDark ? 'white' : 'black'} />
                        </View>
                        <Text style={[styles.lyricsPreview, { color: colors.isDark ? 'white' : 'black' }]} numberOfLines={3}>
                            {activeSong.lyrics ? activeSong.lyrics : "No lyrics available. Tap to verify."}
                        </Text>
                    </TouchableOpacity>

                    {/* 4. ARTIST CARD */}
                    <TouchableOpacity onPress={openArtist} activeOpacity={0.9} style={[styles.artistCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.cardHeader, { color: 'white' }]}>About the artist</Text>

                        {artistImage && (
                            <Image source={{ uri: artistImage }} style={styles.artistCardImage} />
                        )}

                        <View style={styles.artistCardContent}>
                            <Text style={[styles.artistCardName, { color: 'white' }]}>{artistName}</Text>
                            <View style={styles.artistFollowRow}>
                                <View style={[styles.followBtn, { borderColor: 'white' }]}>
                                    <Text style={[styles.followText, { color: 'white' }]}>See Profile</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        marginTop: SPACING.s,
        marginBottom: SPACING.m
    },
    headerTitle: { fontSize: 12, fontFamily: FONTS.bold, letterSpacing: 1, flex: 1, textAlign: 'center' },
    iconBtn: { padding: 8 },

    playerSection: { paddingHorizontal: SPACING.l, marginBottom: 20 },
    artContainer: { alignItems: 'center', marginBottom: 24 },
    art: { width: width - 48, height: width - 48, borderRadius: 12 },

    trackInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 24, fontFamily: FONTS.bold, marginBottom: 4 },
    artist: { fontSize: 18, fontFamily: FONTS.medium },

    sliderContainer: { marginBottom: 10 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -5 },
    timeText: { fontSize: 12, fontFamily: FONTS.regular },

    controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    playBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },

    lyricsCard: {
        marginHorizontal: SPACING.m,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        height: 140,
        justifyContent: 'space-between'
    },
    lyricsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    lyricsTitle: { fontFamily: FONTS.bold, fontSize: 16 },
    lyricsPreview: { fontSize: 18, fontFamily: FONTS.medium, lineHeight: 24 },

    artistCard: {
        marginHorizontal: SPACING.m,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 40,
    },
    cardHeader: { fontFamily: FONTS.bold, fontSize: 16, padding: 16, position: 'absolute', zIndex: 10, top: 0 },
    artistCardImage: { width: '100%', height: 180, opacity: 0.7 },
    artistCardContent: { padding: 16, marginTop: -40 },
    artistCardName: { fontSize: 24, fontFamily: FONTS.bold, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 10 },
    artistFollowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    followBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
    followText: { fontFamily: FONTS.bold, fontSize: 12 }
});