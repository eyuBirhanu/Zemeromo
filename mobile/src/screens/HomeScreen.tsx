import React, { useCallback } from 'react';
import { StyleSheet, StatusBar, View, FlatList, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { usePlayerStore } from '../store/playerStore';

// Components
import HomeHeader from '../components/home/HomeHeader';
import FeaturedCard from '../components/home/FeaturedCard';
import ArtistCard from '../components/home/ArtistCard';
import SectionHeader from '../components/home/SectionHeader';
import SongRow from '../components/shared/SongRow'; // Ensure this exists

import { COLORS, SPACING, FONTS } from '../constants/theme';
import { Album, Artist, Song } from '../types/api';

// --- API FETCH FUNCTION ---
const fetchHomeData = async () => {
    // Parallel fetching for speed
    const [featAlbumsRes, featSongsRes, artistsRes, freshSongsRes] = await Promise.all([
        api.get('/albums?isFeatured=true&limit=5'),
        api.get('/songs?isFeatured=true&limit=5'),
        api.get('/artists?limit=5'),
        api.get('/songs?limit=15&sort=-createdAt') // Increased limit for vertical list
    ]);

    // Map Albums to Mixed Format
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

    // Map Songs to Mixed Format
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

    // Interleave or just concat
    const featuredMixed = [...songs, ...albums].sort(() => Math.random() - 0.5); // Simple shuffle

    return {
        featuredMixed,
        popularArtists: artistsRes.data.data as Artist[],
        freshSongs: freshSongsRes.data.data as Song[]
    };
};

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { playSongList, currentSong, isPlaying, playSong, pauseSound, resumeSound } = usePlayerStore();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['homeData'],
        queryFn: fetchHomeData,
    });

    const onRefresh = useCallback(() => {
        refetch();
    }, []);

    // --- NAVIGATION HELPERS ---
    const goToAlbum = (id: string) => navigation.navigate('AlbumDetail', { id });
    const goToArtist = (id: string) => navigation.navigate('ArtistDetail', { id });
    const goToSongDetail = (song: Song) => navigation.navigate('SongDetail', { id: song._id, song });

    // --- AUDIO LOGIC ---
    const handlePlayPause = (song: Song) => {
        if (currentSong?._id === song._id) {
            if (isPlaying) pauseSound();
            else resumeSound();
        } else {
            // If playing from Fresh Arrivals list, create a queue from that list
            if (data?.freshSongs) {
                const index = data.freshSongs.findIndex(s => s._id === song._id);
                if (index !== -1) {
                    playSongList(data.freshSongs, index);
                } else {
                    playSong(song);
                }
            } else {
                playSong(song);
            }
        }
    };

    const handleFeaturedCardPress = (item: any) => {
        if (item.type === 'album') {
            goToAlbum(item.id);
        } else {
            // It's a song, open the details/lyrics view
            goToSongDetail(item.raw);
        }
    };

    const handleFeaturedPlayPress = (item: any) => {
        if (item.type === 'song') {
            // Immediate Play
            playSong(item.raw);
            navigation.navigate('Player'); // Optional: Open player screen
        } else {
            // If they click play on an album, usually open the album
            goToAlbum(item.id);
        }
    };

    // --- RENDER HELPERS ---
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <HomeHeader />

            {/* 1. FEATURED CAROUSEL */}
            <View style={styles.section}>
                <SectionHeader title="Featured" />
                {!data?.featuredMixed || data.featuredMixed.length === 0 ? (
                    <Text style={styles.emptyText}>No featured content.</Text>
                ) : (
                    <FlatList
                        data={data.featuredMixed}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: SPACING.m }}
                        keyExtractor={(item) => item.type + item.id}
                        renderItem={({ item }) => (
                            <FeaturedCard
                                item={item}
                                onPress={() => handleFeaturedCardPress(item)}
                                onPlayPress={() => handleFeaturedPlayPress(item)}
                            />
                        )}
                        snapToInterval={Dimensions.get('window').width * 0.85 + SPACING.m} // Snap effect
                        decelerationRate="fast"
                    />
                )}
            </View>

            {/* 2. POPULAR ARTISTS */}
            <View style={styles.section}>
                <SectionHeader title="Popular Artists" onSeeAll={() => navigation.navigate('Browse')} />
                <FlatList
                    data={data?.popularArtists}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: SPACING.m }}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <ArtistCard
                            artist={{
                                id: item._id,
                                name: item.name,
                                image: item.imageUrl,
                                churchName: item.churchId?.name || "Independent",
                                albumCount: item.stats?.albumsCount || 0
                            }}
                            onPress={() => goToArtist(item._id)}
                        />
                    )}
                />
            </View>

            <View style={styles.sectionTitleContainer}>
                <SectionHeader title="Fresh Arrivals" />
            </View>
        </View>
    );

    // --- LOADING / ERROR STATES ---
    if (isLoading && !data) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={COLORS.accent} />
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Text style={{ color: COLORS.dark.textSecondary, marginBottom: 10 }}>Failed to load Zemeromo.</Text>
                <Text onPress={() => refetch()} style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Try Again</Text>
            </SafeAreaView>
        );
    }

    // --- MAIN RENDER ---
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.dark.bg} />

            <FlatList
                data={data?.freshSongs}
                keyExtractor={item => item._id}
                ListHeaderComponent={renderHeader}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={COLORS.accent} colors={[COLORS.accent]} />
                }
                renderItem={({ item }) => (
                    // Using your Shared SongRow
                    <SongRow
                        title={item.title}
                        artist={item.artistId?.name || "Unknown"}
                        coverImage={item.thumbnailUrl || item.albumId?.coverImageUrl}
                        duration={item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : undefined}
                        isPlaying={isPlaying && currentSong?._id === item._id}
                        onRowPress={() => goToSongDetail(item)}
                        onPlayPause={() => handlePlayPause(item)}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 120 }} // Space for Bottom Tab Player
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No songs available.</Text>
                }
            />
        </SafeAreaView>
    );
}

// Needed imports for SnapToInterval
import { Dimensions } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark.bg,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        marginBottom: SPACING.s,
    },
    section: {
        marginBottom: SPACING.l,
    },
    sectionTitleContainer: {
        marginTop: SPACING.s,
        marginBottom: SPACING.xs
    },
    emptyText: {
        color: COLORS.dark.textSecondary,
        marginLeft: SPACING.m,
        fontStyle: 'italic',
        fontFamily: FONTS.regular,
    }
});