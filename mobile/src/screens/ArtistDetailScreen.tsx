import React, { useState } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, ActivityIndicator, LayoutAnimation, Platform, UIManager, Share
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';

import api from '../lib/api';
import { SPACING, FONTS } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors'; // Theme Hook
import { useFavorites } from '../hooks/useFavorites'; // Local Storage Favorites Hook
import SongRow from '../components/shared/SongRow';
import { Artist, Album, Song } from '../types/api';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Types...
interface AlbumWithSongs extends Album { songs: Song[]; }
interface ArtistDetailData extends Artist { albums: AlbumWithSongs[]; }

const fetchArtistDetails = async (artistId: string): Promise<ArtistDetailData> => {
    const [artistRes, albumsRes, songsRes] = await Promise.all([
        api.get(`/artists/${artistId}`),
        api.get(`/albums?artistId=${artistId}`),
        api.get(`/songs?artistId=${artistId}`)
    ]);

    const artist = artistRes.data.data;
    const rawAlbums: Album[] = albumsRes.data.data || [];
    const rawSongs: Song[] = songsRes.data.data || [];

    const mergedAlbums = rawAlbums.map(album => ({
        ...album,
        songs: rawSongs.filter(song => {
            const songAlbumId = typeof song.albumId === 'object' ? song.albumId?._id : song.albumId;
            return songAlbumId === album._id;
        })
    }));

    return { ...artist, albums: mergedAlbums };
};

export default function ArtistDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params;
    const colors = useThemeColors();
    const { playSongList, currentSong, isPlaying, pauseSound, resumeSound } = usePlayerStore();

    const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const { toggleFavorite, checkIsFavorite } = useFavoritesStore();
    const isFavorite = checkIsFavorite(id);

    const { data: artist, isLoading, isError } = useQuery({
        queryKey: ['artist', id],
        queryFn: () => fetchArtistDetails(id),
        staleTime: 1000 * 60 * 5, // 5 min cache
    });

    const toggleAlbum = (albumId: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedAlbumId(expandedAlbumId === albumId ? null : albumId);
    };

    const handlePlayPause = (song: Song, albumSongs: Song[], index: number) => {
        if (currentSong?._id === song._id) {
            if (isPlaying) pauseSound();
            else resumeSound();
        } else {
            playSongList(albumSongs, index);
        }
    };

    const handleShare = async () => {
        if (!artist) return;
        try {
            await Share.share({
                message: `Listen to ${artist.name} on Zemeromo! \n\nhttps://zemeromo.com/artist/${id}`,
                title: `Share ${artist.name}`
            });
        } catch (error) { console.log(error); }
    };

    const goToChurch = () => {
        const churchId = artist?.churchId?._id || artist?.churchId;
        if (churchId) {
            navigation.navigate('ChurchDetail', { id: churchId });
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

    if (isError || !artist) {
        return (
            <View style={[styles.center, { backgroundColor: colors.bg }]}>
                <Text style={{ color: colors.textSecondary }}>Artist not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary, fontFamily: FONTS.bold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* --- HEADER --- */}
                <View style={styles.headerContainer}>
                    {!imageError && artist.imageUrl ? (
                        <Image
                            source={{ uri: artist.imageUrl }}
                            style={styles.headerImage}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        // Fallback Gradient if image fails
                        <LinearGradient
                            colors={[colors.primary, '#000']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.headerImage}
                        />
                    )}

                    {/* Top gradient so the white back button is always visible */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.5)', 'transparent']}
                        style={styles.topGradient}
                    />

                    {/* Bottom gradient blending smoothly into the background theme */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)', colors.bg]}
                        locations={[0, 0.6, 1]}
                        style={styles.gradient}
                    />

                    <View style={styles.navBar}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.headerContent}>
                        <Text style={[styles.name, { color: "#fff" }]}>{artist.name}</Text>

                        {/* Clickable Church Badge */}
                        <TouchableOpacity
                            onPress={goToChurch}
                            activeOpacity={0.8}
                            style={[styles.churchBadge, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                        >
                            <MaterialCommunityIcons name="church" size={14} color={colors.textSecondary} />
                            <Text style={[styles.churchText, { color: colors.textSecondary }]}>
                                {artist.churchId?.name || "Independent"}
                            </Text>
                            <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                        </TouchableOpacity>

                        {/* Action Bar (Favorites & Share) */}
                        <View style={styles.actionBar}>
                            <TouchableOpacity onPress={() => toggleFavorite(artist, 'Artist')} style={styles.actionBtn}>
                                <Ionicons
                                    name={isFavorite ? "heart" : "heart-outline"}
                                    size={28}
                                    color={isFavorite ? colors.primary : colors.text}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                                <Ionicons name="share-social-outline" size={26} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* --- STATS --- */}
                <View style={[styles.statsContainer, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: colors.text }]}>{artist.stats?.albumsCount || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Albums</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: colors.text }]}>{artist.stats?.songsCount || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Songs</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: colors.text }]}>{artist.membersCount || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
                    </View>
                </View>

                {/* --- BIO --- */}
                {artist.description && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
                        <Text style={[styles.bioText, { color: colors.textSecondary }]} numberOfLines={4}>
                            {artist.description}
                        </Text>
                    </View>
                )}

                {/* --- DISCOGRAPHY --- */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Discography</Text>

                    {artist.albums.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="disc-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No albums yet</Text>
                            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>This artist hasn't released any albums on Zemeromo yet.</Text>
                        </View>
                    ) : (
                        artist.albums.map((album) => {
                            const isExpanded = expandedAlbumId === album._id;
                            return (
                                <View key={album._id} style={[styles.albumCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <TouchableOpacity
                                        style={styles.albumHeader}
                                        onPress={() => toggleAlbum(album._id)}
                                        activeOpacity={0.9}
                                    >
                                        <Image source={{ uri: album.coverImageUrl || artist.imageUrl }} style={[styles.albumCover, { backgroundColor: colors.surfaceLight }]} />
                                        <View style={styles.albumInfo}>
                                            <Text style={[styles.albumTitle, { color: colors.text }]}>{album.title}</Text>
                                            <Text style={[styles.albumMeta, { color: colors.textSecondary }]}>
                                                {album.releaseYear || 'Unknown'} • {album.songs.length} Songs
                                            </Text>
                                        </View>
                                        <View style={[styles.chevronBox, isExpanded ? { backgroundColor: colors.accent } : { backgroundColor: colors.surfaceLight }]}>
                                            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={isExpanded ? colors.black : colors.text} />
                                        </View>
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={[styles.songsList, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
                                            {album.songs.length === 0 ? (
                                                <Text style={[styles.emptyTextSmall, { color: colors.textSecondary }]}>No songs available.</Text>
                                            ) : (
                                                album.songs.map((song, idx) => (
                                                    <SongRow
                                                        key={song._id}
                                                        title={song.title}
                                                        artist={song.artistId?.name || artist.name}
                                                        coverImage={song.thumbnailUrl || album.coverImageUrl}
                                                        duration={song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : undefined}
                                                        audioUrl={song.audioUrl} // Enables Play Button Logic
                                                        isPlaying={isPlaying && currentSong?._id === song._id}
                                                        onPress={() => navigation.navigate('SongDetail', { id: song._id, song })}
                                                        onPlayPress={() => handlePlayPause(song, album.songs, idx)}
                                                    />
                                                ))
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { height: 380, position: 'relative', justifyContent: 'flex-end' },
    headerImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
    topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
    gradient: { ...StyleSheet.absoluteFillObject, top: '20%' },
    navBar: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.m, zIndex: 10 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    headerContent: { padding: SPACING.l, alignItems: 'center' },
    name: { fontSize: 32, fontFamily: FONTS.bold, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },

    churchBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100 },
    churchText: { fontSize: 13, fontFamily: FONTS.medium },

    actionBar: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 4 },
    actionBtn: { padding: 4 },

    tagRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
    tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    tagText: { fontSize: 12, fontFamily: FONTS.medium },

    statsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.l, borderBottomWidth: 1, borderTopWidth: 1, marginBottom: SPACING.l, marginHorizontal: SPACING.m },
    statItem: { alignItems: 'center', width: '30%' },
    statNum: { fontSize: 20, fontFamily: FONTS.bold },
    statLabel: { fontSize: 11, fontFamily: FONTS.regular, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
    statDivider: { width: 1, height: 30, alignSelf: 'center' },

    section: { paddingHorizontal: SPACING.m, marginBottom: SPACING.l },
    sectionTitle: { fontSize: 20, fontFamily: FONTS.bold, marginBottom: SPACING.m },
    bioText: { fontSize: 14, lineHeight: 22, fontFamily: FONTS.regular },

    // Empty States
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 20, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontFamily: FONTS.bold, marginTop: 16, marginBottom: 8 },
    emptySub: { textAlign: 'center', fontSize: 14, fontFamily: FONTS.regular, lineHeight: 20 },
    emptyTextSmall: { fontSize: 13, padding: 16, textAlign: 'center' },

    // Accordion
    albumCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
    albumHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    albumCover: { width: 56, height: 56, borderRadius: 8 },
    albumInfo: { flex: 1, marginLeft: 12 },
    albumTitle: { fontSize: 16, fontFamily: FONTS.bold, marginBottom: 2 },
    albumMeta: { fontSize: 12, fontFamily: FONTS.regular },
    chevronBox: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    songsList: { borderTopWidth: 1 }
});