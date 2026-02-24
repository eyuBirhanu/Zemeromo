import React, { useState } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
    ActivityIndicator, ScrollView, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SPACING } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { downloadSong } from '../services/downloadService';

const { width, height } = Dimensions.get('window');

export default function PlayerScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { song: paramSong } = route.params || {};

    const {
        isPlaying,
        playSong,
        pauseSound,
        resumeSound,
        currentSong,
        position,
        duration,
        seekTo,
        skipToNext,
        skipToPrevious
    } = usePlayerStore();

    const [isDownloading, setIsDownloading] = useState(false);
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

    const handleDownload = async () => {
        if (!activeSong || isDownloading) return;
        setIsDownloading(true);
        const uri = await downloadSong(activeSong._id, activeSong.audioUrl);
        setIsDownloading(false);
        if (uri) alert("Downloaded!");
    };

    // --- NAVIGATION ---
    const openLyrics = () => {
        if (activeSong) navigation.navigate('SongDetail', { id: activeSong._id });
    };

    const openArtist = () => {
        const artistId = activeSong.artistId?._id || activeSong.artistId;
        if (artistId) navigation.navigate('ArtistDetail', { id: artistId });
    };

    if (!activeSong) return <View style={styles.container} />;

    const artistName = typeof activeSong.artistId === 'object' ? activeSong.artistId?.name : "Unknown Artist";
    const artistImage = typeof activeSong.artistId === 'object' ? activeSong.artistId?.imageUrl : null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Gradient */}
            <LinearGradient
                colors={[COLORS.primary, '#121212', '#000000']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>

                {/* 1. HEADER (Fixed) */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Feather name="chevron-down" size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {activeSong.albumId?.title || "NOW PLAYING"}
                    </Text>
                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialCommunityIcons name="dots-horizontal" size={28} color="white" />
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
                                style={styles.art}
                            />
                        </View>

                        {/* Title & Artist Row */}
                        <View style={styles.trackInfoRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.title} numberOfLines={1}>{activeSong.title}</Text>
                                <Text style={styles.artist}>{artistName}</Text>
                            </View>
                            <TouchableOpacity onPress={handleDownload}>
                                {isDownloading ? (
                                    <ActivityIndicator color={COLORS.accent} />
                                ) : (
                                    <Feather name="download-cloud" size={24} color={COLORS.dark.textSecondary} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Slider */}
                        <View style={styles.sliderContainer}>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={0}
                                maximumValue={duration || 1}
                                value={isDragging ? dragValue : position}
                                minimumTrackTintColor="white"
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor="white"
                                onSlidingStart={() => setIsDragging(true)}
                                onValueChange={setDragValue}
                                onSlidingComplete={(val) => { seekTo(val); setIsDragging(false); }}
                            />
                            <View style={styles.timeRow}>
                                <Text style={styles.timeText}>{formatTime(isDragging ? dragValue : position)}</Text>
                                <Text style={styles.timeText}>{formatTime(duration)}</Text>
                            </View>
                        </View>

                        {/* Controls */}
                        <View style={styles.controls}>
                            <TouchableOpacity>
                                <Ionicons name="shuffle" size={24} color={COLORS.accent} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={skipToPrevious}>
                                <Ionicons name="play-skip-back" size={36} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn}>
                                <Ionicons
                                    name={isPlaying ? "pause" : "play"}
                                    size={36}
                                    color="black"
                                    style={{ marginLeft: isPlaying ? 0 : 4 }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={skipToNext}>
                                <Ionicons name="play-skip-forward" size={36} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <MaterialIcons name="repeat" size={24} color={COLORS.dark.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 3. LYRICS CARD (Preview) */}
                    <TouchableOpacity onPress={openLyrics} activeOpacity={0.9} style={styles.lyricsCard}>
                        <View style={styles.lyricsHeader}>
                            <Text style={styles.lyricsTitle}>Lyrics</Text>
                            <Feather name="maximize-2" size={16} color="white" />
                        </View>
                        <Text style={styles.lyricsPreview} numberOfLines={3}>
                            {activeSong.lyrics ? activeSong.lyrics : "No lyrics available. Tap to verify."}
                        </Text>
                        <View style={styles.lyricsFooter}>
                            <Text style={styles.lyricsTag}>TAP TO READ FULL LYRICS</Text>
                        </View>
                    </TouchableOpacity>

                    {/* 4. ABOUT THE ARTIST (Spotify Style) */}
                    <TouchableOpacity onPress={openArtist} activeOpacity={0.9} style={styles.artistCard}>
                        <Text style={styles.cardHeader}>About the artist</Text>

                        {artistImage && (
                            <Image source={{ uri: artistImage }} style={styles.artistCardImage} />
                        )}

                        <View style={styles.artistCardContent}>
                            <Text style={styles.artistCardName}>{artistName}</Text>
                            <View style={styles.artistFollowRow}>
                                <Text style={styles.artistDesc} numberOfLines={2}>
                                    {activeSong.artistId?.description || "A dedicated worship ministry serving the Lord through song."}
                                </Text>
                                <View style={styles.followBtn}>
                                    <Text style={styles.followText}>See Profile</Text>
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
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        marginTop: SPACING.s,
        marginBottom: SPACING.m
    },
    headerTitle: { color: 'white', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, flex: 1, textAlign: 'center' },
    iconBtn: { padding: 8 },

    playerSection: { paddingHorizontal: SPACING.l, marginBottom: 20 },

    artContainer: { alignItems: 'center', marginBottom: 24 },
    art: { width: width - 48, height: width - 48, borderRadius: 12, backgroundColor: '#333' },

    trackInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    artist: { color: COLORS.dark.textSecondary, fontSize: 18 },

    sliderContainer: { marginBottom: 10 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -5 },
    timeText: { color: COLORS.dark.textSecondary, fontSize: 12 },

    controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },

    // LYRICS CARD
    lyricsCard: {
        backgroundColor: '#7D2E68', // Fallback color, dynamic extraction would be better
        marginHorizontal: SPACING.m,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        height: 140,
        justifyContent: 'space-between'
    },
    lyricsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    lyricsTitle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    lyricsPreview: { color: 'white', fontSize: 18, fontWeight: '600', lineHeight: 24 },
    lyricsFooter: { marginTop: 8 },
    lyricsTag: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

    // ARTIST CARD
    artistCard: {
        backgroundColor: '#242424',
        marginHorizontal: SPACING.m,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 40,
    },
    cardHeader: { color: 'white', fontWeight: 'bold', fontSize: 16, padding: 16, position: 'absolute', zIndex: 10, top: 0 },
    artistCardImage: { width: '100%', height: 180, opacity: 0.7 },
    artistCardContent: { padding: 16, marginTop: -40 },
    artistCardName: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 10 },
    artistFollowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    artistDesc: { color: '#ccc', fontSize: 13, flex: 1, marginRight: 10 },
    followBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: 'white' },
    followText: { color: 'white', fontWeight: 'bold', fontSize: 12 }
});