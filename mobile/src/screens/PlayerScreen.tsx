import React, { useState } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
    ScrollView, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { SPACING, FONTS, COLORS } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useFavoritesStore } from '../store/favoritesStore';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const colors = useThemeColors();
    const { song: paramSong } = route.params || {};
    const { toggleFavorite, checkIsFavorite } = useFavoritesStore();
    const isFavorite = checkIsFavorite(paramSong?._id);

    const {
        isPlaying, isBuffering, playSong, pauseSound, resumeSound,
        currentSong, position, duration, seekTo, skipToNext, skipToPrevious,
        isShuffling, toggleShuffle, repeatMode, toggleRepeat
    } = usePlayerStore();

    const [isDragging, setIsDragging] = useState(false);
    const [dragValue, setDragValue] = useState(0);

    const [artError, setArtError] = useState(false);
    const [artistImgError, setArtistImgError] = useState(false);

    const activeSong = currentSong || paramSong;

    const formatTime = (millis: number) => {
        if (!millis || millis < 0 || isNaN(millis)) return "0:00";
        const totalSeconds = Math.floor(millis / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (isBuffering) return; // Disable button while loading
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

    const openAlbum = () => {
        const albumId = activeSong.albumId?._id || activeSong.albumId;
        if (albumId) navigation.navigate('AlbumDetail', { id: albumId });
    };

    if (!activeSong) return <View style={styles.container} />;

    const artistName = typeof activeSong.artistId === 'object' ? activeSong.artistId?.name : "Unknown Artist";
    const rawArtistImage = typeof activeSong.artistId === 'object' ? activeSong.artistId?.imageUrl : null;
    const rawCoverImage = activeSong.thumbnailUrl || activeSong.albumId?.coverImageUrl;

    const hasValidArt = rawCoverImage && !artError;
    const hasValidArtistImg = rawArtistImage && !artistImgError;

    // Determine Repeat Icon
    let repeatIconName: any = "repeat";
    let repeatIconColor = "rgba(255,255,255,0.5)";
    if (repeatMode === 'all') { repeatIconColor = COLORS.accent; }
    if (repeatMode === 'one') { repeatIconName = "repeat-one"; repeatIconColor = COLORS.accent; }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* BLURRED BACKGROUND */}
            <View style={StyleSheet.absoluteFillObject}>
                {hasValidArt ? (
                    <Image source={{ uri: rawCoverImage }} style={{ width: '100%', height: '100%', opacity: 0.8 }} blurRadius={80} />
                ) : (
                    <LinearGradient colors={['#1A1A1A', '#050505']} style={StyleSheet.absoluteFillObject} />
                )}
                <LinearGradient colors={['rgba(7, 8, 11, 0.3)', 'rgba(7, 8, 11, 0.8)', 'rgba(7, 8, 11, 1)']} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFillObject} />
            </View>

            <SafeAreaView style={{ flex: 1 }}>

                {/* 1. HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={10}>
                        <Feather name="chevron-down" size={28} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={openAlbum} style={styles.headerTitleWrapper}>
                        <Text style={styles.headerSubtitle}>PLAYING FROM ALBUM</Text>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {activeSong.albumId?.title || "Single"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconBtn} hitSlop={10}>
                        <MaterialCommunityIcons name="dots-horizontal" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                    <View style={styles.playerSection}>
                        {/* Artwork */}
                        <View style={styles.artContainer}>
                            {hasValidArt ? (
                                <Image source={{ uri: rawCoverImage }} style={styles.art} onError={() => setArtError(true)} />
                            ) : (
                                <View style={[styles.art, styles.fallbackArt]}>
                                    <Ionicons name="musical-notes" size={80} color="rgba(255,255,255,0.2)" />
                                </View>
                            )}
                        </View>

                        {/* Title & Artist */}
                        <View style={styles.trackInfoRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.title} numberOfLines={1}>{activeSong.title}</Text>
                                <TouchableOpacity onPress={openArtist}>
                                    <Text style={styles.artist} numberOfLines={1}>{artistName}</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => toggleFavorite(activeSong, 'Song')}>
                                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={28} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Slider */}
                        <View style={styles.sliderContainer}>
                            <Slider
                                style={{ width: '100%', height: 40, marginHorizontal: -10 }}
                                minimumValue={0}
                                maximumValue={duration || 1}
                                value={isDragging ? dragValue : position}
                                minimumTrackTintColor="white"
                                maximumTrackTintColor="rgba(255,255,255,0.2)"
                                thumbTintColor="white"
                                onSlidingStart={() => setIsDragging(true)}
                                onValueChange={setDragValue}
                                onSlidingComplete={(val) => {
                                    seekTo(val);
                                    setIsDragging(false);
                                }}
                            />
                            <View style={styles.timeRow}>
                                <Text style={styles.timeText}>{formatTime(isDragging ? dragValue : position)}</Text>
                                <Text style={styles.timeText}>{formatTime(duration)}</Text>
                            </View>
                        </View>

                        {/* Controls */}
                        <View style={styles.controls}>
                            <TouchableOpacity onPress={toggleShuffle} hitSlop={10}>
                                <Ionicons name="shuffle" size={24} color={isShuffling ? COLORS.accent : "rgba(255,255,255,0.5)"} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={skipToPrevious} hitSlop={10}>
                                <Ionicons name="play-skip-back" size={38} color="white" />
                            </TouchableOpacity>

                            {/* PLAY BUTTON WITH LOADER */}
                            <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn} disabled={isBuffering}>
                                {isBuffering ? (
                                    <ActivityIndicator size="small" color="black" />
                                ) : (
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={36}
                                        color="black"
                                        style={{ marginLeft: isPlaying ? 0 : 4 }}
                                    />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={skipToNext} hitSlop={10}>
                                <Ionicons name="play-skip-forward" size={38} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={toggleRepeat} hitSlop={10}>
                                <MaterialIcons name={repeatIconName} size={24} color={repeatIconColor} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 4. LYRICS PREVIEW CARD (Spotify Style) */}
                    <TouchableOpacity onPress={openLyrics} activeOpacity={0.9} style={styles.lyricsCard}>
                        <View style={styles.lyricsHeader}>
                            <Text style={styles.lyricsTitle}>Lyrics</Text>
                            <View style={styles.expandBtn}>
                                <Feather name="maximize-2" size={14} color="white" />
                            </View>
                        </View>
                        <Text style={styles.lyricsPreview} numberOfLines={3}>
                            {activeSong.lyrics ? activeSong.lyrics : "No lyrics available for this track."}
                        </Text>
                    </TouchableOpacity>

                    {/* 5. ABOUT THE ARTIST CARD (Spotify Style) */}
                    <TouchableOpacity onPress={openArtist} activeOpacity={0.9} style={styles.artistCard}>
                        <View style={styles.artistCardHeader}>
                            <Text style={styles.artistCardTitle}>About the artist</Text>
                        </View>

                        {hasValidArtistImg ? (
                            <Image
                                source={{ uri: rawArtistImage }}
                                style={styles.artistCardImage}
                                onError={() => setArtistImgError(true)}
                            />
                        ) : (
                            <View style={[styles.artistCardImage, styles.fallbackArtist]}>
                                <Feather name="mic" size={50} color="rgba(255,255,255,0.1)" />
                            </View>
                        )}

                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)', '#111']} style={styles.artistCardGradient} />

                        <View style={styles.artistCardContent}>
                            <Text style={styles.artistCardName}>{artistName}</Text>
                            <TouchableOpacity onPress={openArtist} style={styles.followBtn}>
                                <Text style={styles.followText}>View Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// ... styles remain the same ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' }, // Fallback black

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.s,
        marginBottom: SPACING.l
    },
    headerTitleWrapper: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
    headerSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontFamily: FONTS.medium, letterSpacing: 1, textTransform: 'uppercase' },
    headerTitle: { color: 'white', fontSize: 13, fontFamily: FONTS.bold, marginTop: 2 },
    iconBtn: { padding: 4 },

    playerSection: { paddingHorizontal: SPACING.xl, marginBottom: 30 },

    artContainer: {
        alignItems: 'center',
        marginBottom: 36,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20,
    },
    art: { width: width - 64, height: width - 64, borderRadius: 12 },
    fallbackArt: { backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },

    trackInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { color: 'white', fontSize: 24, fontFamily: FONTS.bold, marginBottom: 4 },
    artist: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontFamily: FONTS.medium },

    sliderContainer: { marginBottom: 10 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -10 },
    timeText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: FONTS.medium, fontVariant: ['tabular-nums'] },

    controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    playBtn: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },

    // --- LYRICS CARD ---
    lyricsCard: {
        marginHorizontal: SPACING.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Translucent Glass look
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        overflow: 'hidden'
    },
    lyricsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    lyricsTitle: { color: 'white', fontFamily: FONTS.bold, fontSize: 16 },
    expandBtn: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 6, borderRadius: 20 },
    lyricsPreview: { color: 'white', fontSize: 18, fontFamily: FONTS.bold, lineHeight: 28, opacity: 0.9 },

    // --- ARTIST CARD ---
    artistCard: {
        marginHorizontal: SPACING.xl,
        backgroundColor: '#111',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 60,
        height: 240, // Fixed height for immersive look
    },
    artistCardHeader: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
    artistCardTitle: { color: 'white', fontFamily: FONTS.bold, fontSize: 14 },
    artistCardImage: { width: '100%', height: '100%', position: 'absolute' },
    fallbackArtist: { backgroundColor: '#1A1A1A' },
    artistCardGradient: { ...StyleSheet.absoluteFillObject },
    artistCardContent: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    artistCardName: { color: 'white', fontSize: 24, fontFamily: FONTS.bold, flex: 1, paddingRight: 10 },
    followBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
    followText: { color: 'white', fontFamily: FONTS.bold, fontSize: 12 }
});