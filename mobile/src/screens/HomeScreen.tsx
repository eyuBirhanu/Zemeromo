import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, StatusBar, View, FlatList, Text, RefreshControl, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import api from '../lib/api';
import { usePlayerStore } from '../store/playerStore';
import { useThemeColors } from '../hooks/useThemeColors';

// Components
import HomeHeader from '../components/home/HomeHeader';
import FeaturedCard from '../components/home/FeaturedCard';
import ArtistCard from '../components/home/ArtistCard';
import SectionHeader from '../components/home/SectionHeader';
import SongRow from '../components/shared/SongRow';

import { SPACING, FONTS } from '../constants/theme';
import { Album, Artist, Song } from '../types/api';

// --- FETCHER ---
const fetchHomeData = async () => {
    const [featAlbumsRes, featSongsRes, artistsRes, freshSongsRes] = await Promise.all([
        api.get('/albums?isFeatured=true&limit=20'),
        api.get('/songs?isFeatured=true&limit=20'),
        api.get('/artists?limit=20'),
        api.get('/songs?limit=25&sort=-createdAt')
    ]);

    const albums = (featAlbumsRes.data.data as Album[]).map(item => ({
        id: item._id,
        type: 'album' as const,
        title: item.title,
        coverImage: item.coverImageUrl,
        tags: item.tags || [item.genre || 'Worship'],
        songCount: item.stats?.songsCount,
        artist: { name: item.artistId?.name || "Unknown", image: item.artistId?.imageUrl },
        raw: item
    }));

    const songs = (featSongsRes.data.data as Song[]).map(item => ({
        id: item._id,
        type: 'song' as const,
        title: item.title,
        coverImage: item.thumbnailUrl || item.albumId?.coverImageUrl || "",
        tags: ['Single', item.genre || 'Praise'],
        songCount: undefined,
        artist: { name: item.artistId?.name || "Unknown", image: item.artistId?.imageUrl },
        raw: item
    }));

    const featuredMixed = [...songs, ...albums].sort(() => Math.random() - 0.5);

    return {
        featuredMixed,
        popularArtists: artistsRes.data.data as Artist[],
        freshSongs: freshSongsRes.data.data as Song[]
    };
};

// ==========================================
// REUSABLE SKELETON PRIMITIVE
// ==========================================
const Skeleton = ({ style }: { style: any }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;
    const colors = useThemeColors();
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, [opacity]);
    return <Animated.View style={[style, { backgroundColor: colors.isDark ? '#333333' : '#E0E0E0', opacity }]} />;
};

// ==========================================
// SKELETON FOR FRESH ARRIVALS (SONG ROW)
// ==========================================
const SkeletonSongRow = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.m, marginBottom: 16 }}>
        <Skeleton style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <Skeleton style={{ width: '70%', height: 16, marginBottom: 8, borderRadius: 4 }} />
            <Skeleton style={{ width: '40%', height: 12, borderRadius: 4 }} />
        </View>
        <Skeleton style={{ width: 24, height: 24, borderRadius: 12, marginLeft: 16 }} />
    </View>
);

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const colors = useThemeColors();
    const { playSongList, currentSong, isPlaying, pauseSound, resumeSound, playSong } = usePlayerStore();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['homeData'],
        queryFn: fetchHomeData,
    });

    // Determine if we should show skeletons (initial load with no data)
    const showSkeletons = isLoading && !data;

    const onRefresh = useCallback(() => refetch(), []);

    const goToAlbum = (id: string) => navigation.navigate('AlbumDetail', { id });
    const goToArtist = (id: string) => navigation.navigate('ArtistDetail', { id });
    const goToSongDetail = (song: Song) => navigation.navigate('SongDetail', { id: song._id, song });

    const handlePlayPause = (song: Song) => {
        if (currentSong?._id === song._id) {
            if (isPlaying) pauseSound();
            else resumeSound();
        } else {
            if (data?.freshSongs) {
                const index = data.freshSongs.findIndex(s => s._id === song._id);
                if (index !== -1) playSongList(data.freshSongs, index);
                else playSong(song);
            } else {
                playSong(song);
            }
        }
    };

    const handleFeaturedCardPress = (item: any) => {
        if (item.type === 'album') goToAlbum(item.id);
        else goToSongDetail(item.raw);
    };

    const handleFeaturedPlayPress = (item: any) => {
        if (item.type === 'song') {
            playSong(item.raw);
            navigation.navigate('Player', { song: item.raw });
        } else {
            goToAlbum(item.id);
        }
    };

    // ==========================================
    // RENDER HEADER COMPONENTS
    // ==========================================
    const renderHeader = () => {
        // Feed dummy arrays of [1,2,3] if loading so FlatList renders multiple skeletons
        const featuredData = showSkeletons ? ([1, 2, 3] as any[]) : (data?.featuredMixed || []);
        const artistData = showSkeletons ? ([1, 2, 3, 4] as any[]) : (data?.popularArtists || []);

        return (
            <View style={styles.headerContainer}>
                {/* 1. HEADER SKELETON / CONTENT */}
                <HomeHeader isLoading={showSkeletons} />

                {/* 2. FEATURED SECTION */}
                <View style={styles.section}>
                    <SectionHeader title="Featured" isLoading={showSkeletons} />
                    <FlatList
                        data={featuredData}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: SPACING.m }}
                        keyExtractor={(item, index) => showSkeletons ? `feat-skel-${index}` : item.type + item.id}
                        renderItem={({ item }) => (
                            <FeaturedCard
                                isLoading={showSkeletons}
                                item={!showSkeletons ? item : undefined}
                                onPress={() => !showSkeletons && handleFeaturedCardPress(item)}
                                onPlayPress={() => !showSkeletons && handleFeaturedPlayPress(item)}
                            />
                        )}
                        snapToInterval={Dimensions.get('window').width * 0.85 + SPACING.m}
                        decelerationRate="fast"
                        ListEmptyComponent={
                            <View style={[styles.emptyBox, { borderColor: colors.border }]}>
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No featured content right now.</Text>
                            </View>
                        }
                    />
                </View>

                {/* 3. POPULAR ARTISTS SECTION */}
                <View style={styles.section}>
                    <SectionHeader title="Popular Artists" onSeeAll={() => navigation.navigate('Browse')} isLoading={showSkeletons} />
                    <FlatList
                        data={artistData}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: SPACING.m }}
                        keyExtractor={(item, index) => showSkeletons ? `art-skel-${index}` : item._id}
                        renderItem={({ item }) => (
                            <ArtistCard
                                isLoading={showSkeletons}
                                artist={!showSkeletons ? {
                                    id: item._id,
                                    name: item.name,
                                    image: item.imageUrl,
                                    churchName: item.churchId?.name || "Independent",
                                    albumCount: item.stats?.albumsCount || 0
                                } : undefined}
                                onPress={() => !showSkeletons && goToArtist(item._id)}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={[styles.emptyBox, { borderColor: colors.border, width: Dimensions.get('window').width - SPACING.m * 2 }]}>
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No artists found.</Text>
                            </View>
                        }
                    />
                </View>

                {/* 4. FRESH ARRIVALS HEADER */}
                <View style={styles.sectionTitleContainer}>
                    <SectionHeader title="Fresh Arrivals" isLoading={showSkeletons} />
                </View>
            </View>
        );
    };

    // ==========================================
    // ERROR STATE
    // ==========================================
    if (isError) {
        return (
            <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
                <Ionicons name="cloud-offline-outline" size={60} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                <Text style={{ color: colors.text, fontFamily: FONTS.bold, fontSize: 18 }}>Connection Error</Text>
                <Text style={{ color: colors.textSecondary, fontFamily: FONTS.regular, marginTop: 8, marginBottom: 24, textAlign: 'center', paddingHorizontal: 40 }}>
                    Failed to load Zemeromo. Please check your internet connection.
                </Text>

                <TouchableOpacity onPress={() => refetch()} style={[styles.tryAgainBtn, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#fff', fontFamily: FONTS.bold }}>Try Again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Prepare data for the main vertical FlatList (Fresh Arrivals)
    const freshSongsData = showSkeletons ? ([1, 2, 3, 4, 5, 6] as any[]) : (data?.freshSongs || []);

    // ==========================================
    // MAIN RENDER
    // ==========================================
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
            <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.bg} />

            <FlatList
                data={freshSongsData}
                keyExtractor={(item, index) => showSkeletons ? `fresh-skel-${index}` : item._id}
                ListHeaderComponent={renderHeader}
                refreshControl={
                    <RefreshControl refreshing={isLoading && !!data} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
                }
                renderItem={({ item }) => {
                    // Render Skeletons if loading
                    if (showSkeletons) return <SkeletonSongRow />;

                    // Render Real Song Row
                    return (
                        <SongRow
                            title={item.title}
                            artist={item.artistId?.name || "Unknown"}
                            coverImage={item.thumbnailUrl || item.albumId?.coverImageUrl || ""}
                            duration={item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : undefined}
                            audioUrl={item.audioUrl}
                            isPlaying={isPlaying && currentSong?._id === item._id}
                            onPress={() => goToSongDetail(item)}
                            onPlayPress={() => handlePlayPause(item)}
                        />
                    );
                }}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListEmptyComponent={
                    <View style={[styles.emptyBox, { borderColor: colors.border, marginHorizontal: SPACING.m, marginTop: SPACING.m }]}>
                        <Ionicons name="musical-notes-outline" size={32} color={colors.textSecondary} style={{ marginBottom: 8, opacity: 0.5 }} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No songs available yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { marginBottom: SPACING.s },
    section: { marginBottom: SPACING.l },
    sectionTitleContainer: { marginTop: SPACING.s, marginBottom: SPACING.xs },

    // Empty states
    emptyBox: {
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12
    },
    emptyText: {
        fontFamily: FONTS.medium,
        fontSize: 14
    },

    // Error state
    tryAgainBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25
    }
});