import React, { useCallback } from 'react';
import { StyleSheet, StatusBar, View, FlatList, Text, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { usePlayerStore } from '../store/playerStore';
import { useThemeColors } from '../hooks/useThemeColors'; // THEME HOOK

// Components
import HomeHeader from '../components/home/HomeHeader';
import FeaturedCard from '../components/home/FeaturedCard';
import ArtistCard from '../components/home/ArtistCard';
import SectionHeader from '../components/home/SectionHeader';
import SongRow from '../components/shared/SongRow';

import { SPACING, FONTS } from '../constants/theme';
import { Album, Artist, Song } from '../types/api';

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

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const colors = useThemeColors();
    const { playSongList, currentSong, isPlaying, pauseSound, resumeSound, playSong } = usePlayerStore();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['homeData'],
        queryFn: fetchHomeData,
    });

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

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <HomeHeader />

            <View style={styles.section}>
                <SectionHeader title="Featured" />
                {!data?.featuredMixed || data.featuredMixed.length === 0 ? (
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No featured content.</Text>
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
                        snapToInterval={Dimensions.get('window').width * 0.85 + SPACING.m}
                        decelerationRate="fast"
                    />
                )}
            </View>

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

    if (isLoading && !data) {
        return (
            <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
                <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>Failed to load Zemeromo.</Text>
                <Text onPress={() => refetch()} style={{ color: colors.primary, fontFamily: FONTS.bold }}>Try Again</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
            <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.bg} />

            <FlatList
                data={data?.freshSongs}
                keyExtractor={item => item._id}
                ListHeaderComponent={renderHeader}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
                }
                renderItem={({ item }) => (
                    <SongRow
                        title={item.title}
                        artist={item.artistId?.name || "Unknown"}
                        // albumName={item.albumId?.title} // Good to keep
                        coverImage={item.thumbnailUrl || item.albumId?.coverImageUrl || ""}
                        duration={item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : undefined}

                        audioUrl={item.audioUrl}

                        isPlaying={isPlaying && currentSong?._id === item._id}

                        onPress={() => goToSongDetail(item)}

                        onPlayPress={() => handlePlayPause(item)}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No songs available.</Text>
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
    emptyText: { marginLeft: SPACING.m, fontStyle: 'italic', fontFamily: FONTS.regular }
});