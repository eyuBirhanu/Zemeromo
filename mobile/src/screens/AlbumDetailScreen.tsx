import React, { useState } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet,
    StatusBar, FlatList, ActivityIndicator, Share, Linking
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

import { SPACING, FONTS } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors';
import { useFavorites } from '../hooks/useFavorites'; // Use the new hook
import SongRow from '../components/shared/SongRow';
import { Song } from '../types/api';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';

const fetchAlbumDetails = async (id: string) => {
    const albumRes = await api.get(`/albums/${id}`);
    const songsRes = await api.get(`/songs?albumId=${id}`);
    return { ...albumRes.data.data, songs: songsRes.data.data };
};

export default function AlbumDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params;
    const colors = useThemeColors();
    const { playSongList, currentSong, isPlaying, pauseSound, resumeSound } = usePlayerStore();

    // Favorites Hook
    const [imageError, setImageError] = useState(false);
    const { toggleFavorite, checkIsFavorite } = useFavoritesStore();
    const isFavorite = checkIsFavorite(id);

    const { data: album, isLoading, isError } = useQuery({
        queryKey: ['album', id],
        queryFn: () => fetchAlbumDetails(id),
        staleTime: 1000 * 60 * 5,
    });

    const handlePlayPause = (song: Song, index: number) => {
        if (currentSong?._id === song._id) {
            if (isPlaying) pauseSound();
            else resumeSound();
        } else {
            playSongList(album.songs, index);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out the album "${album.title}" by ${album.artistId?.name} on Zemeromo! \n\nhttps://zemeromo.com/album/${id}`,
                title: `Share ${album.title}`
            });
        } catch (error) { console.log(error); }
    };

    const goToArtist = () => {
        if (album?.artistId?._id) {
            navigation.navigate('ArtistDetail', { id: album.artistId._id });
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.bg }]}>
                <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (isError || !album) {
        return (
            <View style={[styles.center, { backgroundColor: colors.bg }]}>
                <Text style={{ color: colors.textSecondary }}>Album not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary, fontFamily: FONTS.bold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const hasSongs = album.songs && album.songs.length > 0;

    const renderHeader = () => (
        <View>
            {/* --- ARTWORK --- */}
            <View style={styles.artWrapper}>
                {!imageError && album.coverImageUrl ? (
                    <Image
                        source={{ uri: album.coverImageUrl }}
                        style={styles.coverImage}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    // Fallback Gradient if image fails
                    <LinearGradient
                        colors={[colors.primary, '#000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.coverImage}
                    />
                )}

                {/* Gradient Overlay for Text Visibility */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', colors.bg]}
                    locations={[0, 0.6, 1]}
                    style={styles.gradientOverlay}
                />

                {/* Navbar */}
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                        <Ionicons name="share-social-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- INFO --- */}
            <View style={styles.infoContainer}>
                <Text style={[styles.title, { color: colors.text }]}>{album.title}</Text>

                {/* Clickable Artist Row */}
                <TouchableOpacity onPress={goToArtist} activeOpacity={0.7} style={styles.artistRow}>
                    <Image
                        source={{ uri: album.artistId?.imageUrl || 'https://via.placeholder.com/50' }}
                        style={[styles.artistAvatar, { borderColor: colors.border }]}
                    />
                    <Text style={[styles.artistName, { color: colors.text }]}>
                        {album.artistId?.name || "Unknown"}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                <View style={styles.metaRow}>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{album.genre || "Gospel"}</Text>
                    <Text style={[styles.dot, { color: colors.textSecondary }]}> • </Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{album.releaseYear || "2024"}</Text>
                    <Text style={[styles.dot, { color: colors.textSecondary }]}> • </Text>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>{album.songs?.length || 0} Songs</Text>
                </View>

                {/* --- ACTIONS --- */}
                <View style={styles.actionBar}>
                    <View style={styles.leftActions}>
                        <TouchableOpacity onPress={() => toggleFavorite(album, 'Album')}>
                            <Ionicons name={isFavorite ? "heart" : "heart-outline"} color={isFavorite ? colors.primary : colors.text} />
                        </TouchableOpacity>
                        {/* Removed duplicate share button */}
                    </View>

                    {/* PLAY ALL FAB - Only show if songs exist */}
                    {hasSongs && (
                        <TouchableOpacity
                            style={[styles.playButton, { backgroundColor: colors.accent }]}
                            activeOpacity={0.9}
                            onPress={() => playSongList(album.songs, 0)}
                        >
                            <Ionicons name="play" size={32} color="black" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No songs yet</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                This album doesn't have any tracks added yet.
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <FlatList
                data={album.songs}
                keyExtractor={item => item._id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <SongRow
                        title={item.title}
                        artist={item.artistId?.name || album.artistId?.name}
                        coverImage={item.thumbnailUrl || album.coverImageUrl}
                        duration={item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : undefined}
                        audioUrl={item.audioUrl} // Enables correct Play Button logic
                        isPlaying={isPlaying && currentSong?._id === item._id}
                        onPress={() => navigation.navigate('SongDetail', { id: item._id, song: item })}
                        onPlayPress={() => handlePlayPause(item, index)}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    navBar: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.m, zIndex: 10 },
    iconBtn: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    artWrapper: { width: '100%', height: 380 },
    coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    gradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 250 },
    infoContainer: { paddingHorizontal: SPACING.m, marginTop: -60, paddingBottom: SPACING.l },
    title: { fontSize: 30, fontFamily: FONTS.bold, marginBottom: 8, letterSpacing: -0.5 },
    artistRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    artistAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8, borderWidth: 1 },
    artistName: { fontSize: 16, fontFamily: FONTS.medium },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    metaText: { fontSize: 13, fontFamily: FONTS.regular },
    dot: { marginHorizontal: 4 },
    actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    leftActions: { flexDirection: 'row', gap: 20 },
    actionBtn: { padding: 4 },
    playButton: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontFamily: FONTS.bold, marginTop: 16, marginBottom: 8 },
    emptySub: { textAlign: 'center', fontSize: 14, fontFamily: FONTS.regular, lineHeight: 20 }
});