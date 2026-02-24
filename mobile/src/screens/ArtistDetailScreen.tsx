import React, { useState } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, ActivityIndicator, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';

import api from '../lib/api';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import SongRow from '../components/shared/SongRow';
import { Artist, Album, Song } from '../types/api';
import { usePlayerStore } from '../store/playerStore';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TYPES ---
interface AlbumWithSongs extends Album {
    songs: Song[];
}

interface ArtistDetailData extends Artist {
    albums: AlbumWithSongs[];
}

// --- FETCHER ---
const fetchArtistDetails = async (artistId: string): Promise<ArtistDetailData> => {
    const [artistRes, albumsRes, songsRes] = await Promise.all([
        api.get(`/artists/${artistId}`),
        api.get(`/albums?artistId=${artistId}`),
        api.get(`/songs?artistId=${artistId}`)
    ]);

    const artist = artistRes.data.data;
    const rawAlbums: Album[] = albumsRes.data.data || [];
    const rawSongs: Song[] = songsRes.data.data || [];

    // Nest songs inside albums
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
    const { playSongList, currentSong, isPlaying, playSong, pauseSound, resumeSound } = usePlayerStore();

    const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(null);

    const { data: artist, isLoading, isError } = useQuery({
        queryKey: ['artist', id],
        queryFn: () => fetchArtistDetails(id),
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

    if (isLoading) {
        return (
            <View style={styles.center}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    if (isError || !artist) {
        return (
            <View style={styles.center}>
                <Text style={{ color: COLORS.dark.textSecondary }}>Artist not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* --- HEADER --- */}
                <View style={styles.headerContainer}>
                    <Image
                        source={{ uri: artist.imageUrl || 'https://via.placeholder.com/400' }}
                        style={styles.headerImage}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(15, 19, 26, 0.4)', COLORS.dark.bg]}
                        style={styles.gradient}
                    />

                    {/* Navbar */}
                    <View style={styles.navBar}>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="share-social-outline" size={22} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Artist Info */}
                    <View style={styles.headerContent}>
                        <Text style={styles.name}>{artist.name}</Text>

                        <View style={styles.churchBadge}>
                            <Ionicons name="home-outline" size={14} color={COLORS.dark.textSecondary} />
                            <Text style={styles.churchText}>{artist.churchId?.name || "Independent"}</Text>
                        </View>

                        {/* Tags */}
                        {artist.tags && artist.tags.length > 0 && (
                            <View style={styles.tagRow}>
                                {artist.tags.slice(0, 3).map((tag: string, i: number) => (
                                    <View key={i} style={styles.tag}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* --- STATS --- */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{artist.stats?.albumsCount || 0}</Text>
                        <Text style={styles.statLabel}>Albums</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{artist.stats?.songsCount || 0}</Text>
                        <Text style={styles.statLabel}>Songs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{artist.membersCount || 0}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                </View>

                {/* --- BIO --- */}
                {artist.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.bioText} numberOfLines={4}>
                            {artist.description}
                        </Text>
                    </View>
                )}

                {/* --- DISCOGRAPHY --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Discography</Text>

                    {artist.albums.length === 0 ? (
                        <Text style={styles.emptyText}>No albums yet.</Text>
                    ) : (
                        artist.albums.map((album) => {
                            const isExpanded = expandedAlbumId === album._id;

                            return (
                                <View key={album._id} style={styles.albumCard}>
                                    {/* Header */}
                                    <TouchableOpacity
                                        style={styles.albumHeader}
                                        onPress={() => toggleAlbum(album._id)}
                                        activeOpacity={0.9}
                                    >
                                        <Image
                                            source={{ uri: album.coverImageUrl || artist.imageUrl }}
                                            style={styles.albumCover}
                                        />
                                        <View style={styles.albumInfo}>
                                            <Text style={styles.albumTitle}>{album.title}</Text>
                                            <Text style={styles.albumMeta}>
                                                {album.releaseYear || 'Unknown'} • {album.songs.length} Songs
                                            </Text>
                                        </View>
                                        <View style={[styles.chevronBox, isExpanded && styles.chevronBoxActive]}>
                                            <Ionicons
                                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color={isExpanded ? COLORS.black : COLORS.white}
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    {/* Songs List */}
                                    {isExpanded && (
                                        <View style={styles.songsList}>
                                            {album.songs.length === 0 ? (
                                                <Text style={styles.emptyTextSmall}>No songs available.</Text>
                                            ) : (
                                                album.songs.map((song, idx) => (
                                                    <SongRow
                                                        key={song._id}
                                                        title={song.title}
                                                        artist={song.artistId?.name || artist.name}
                                                        coverImage={song.thumbnailUrl || album.coverImageUrl}
                                                        duration={song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : undefined}
                                                        isPlaying={isPlaying && currentSong?._id === song._id}
                                                        onRowPress={() => navigation.navigate('SongDetail', { id: song._id, song })}
                                                        onPlayPause={() => handlePlayPause(song, album.songs, idx)}
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
    container: {
        flex: 1,
        backgroundColor: COLORS.dark.bg,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.dark.bg,
    },
    // Header
    headerContainer: {
        height: 380,
        position: 'relative',
        justifyContent: 'flex-end',
    },
    headerImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        top: '20%',
    },
    navBar: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        zIndex: 10,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)', // Glass effect
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)', // Works on iOS
    },
    headerContent: {
        padding: SPACING.l,
        alignItems: 'center',
    },
    name: {
        color: COLORS.white,
        fontSize: 32,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    churchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
    },
    churchText: {
        color: COLORS.dark.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tagText: {
        color: COLORS.white,
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    // Stats
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.dark.border,
        marginBottom: SPACING.l,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    statNum: {
        color: COLORS.white,
        fontSize: 18,
        fontFamily: FONTS.bold,
    },
    statLabel: {
        color: COLORS.dark.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: COLORS.dark.border,
    },
    // Content
    section: {
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.l,
    },
    sectionTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.m,
    },
    bioText: {
        color: COLORS.dark.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        fontFamily: FONTS.regular,
    },
    emptyText: {
        color: COLORS.dark.textSecondary,
        fontStyle: 'italic',
        marginTop: 10,
    },
    emptyTextSmall: {
        color: COLORS.dark.textSecondary,
        fontSize: 13,
        padding: 16,
        textAlign: 'center',
    },
    // Album Card
    albumCard: {
        marginBottom: 16,
        backgroundColor: COLORS.dark.surface,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.dark.border,
    },
    albumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    albumCover: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: COLORS.dark.surfaceLight,
    },
    albumInfo: {
        flex: 1,
        marginLeft: 12,
    },
    albumTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    albumMeta: {
        color: COLORS.dark.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    chevronBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.dark.surfaceLight,
    },
    chevronBoxActive: {
        backgroundColor: COLORS.accent, // Lime when active
    },
    songsList: {
        borderTopWidth: 1,
        borderTopColor: COLORS.dark.border,
        backgroundColor: '#161b22',
    }
});