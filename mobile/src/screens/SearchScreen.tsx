import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, StatusBar, Text, Keyboard, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

import SearchInput from '../components/search/SearchInput';
import FilterPills from '../components/search/FilterPills';
import SearchResultRow from '../components/search/SearchResultRow';
import { SPACING, FONTS } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useThemeColors } from '../hooks/useThemeColors';

function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function SearchScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const colors = useThemeColors();
    const { playSong } = usePlayerStore();

    const [searchText, setSearchText] = useState('');
    const [activeCategory, setActiveCategory] = useState(route.params?.type || "All");
    const debouncedSearch = useDebounce(searchText, 500);

    // --- MAIN FETCH FUNCTION ---
    const fetchExploreData = async () => {
        // CASE A: ACTIVE SEARCH (User typing)
        if (debouncedSearch.length > 0) {
            const params: any = { q: debouncedSearch };
            if (activeCategory !== "All") params.type = activeCategory.toLowerCase();

            const res = await api.get('/search', { params });
            return res.data.data || [];
        }

        // CASE B: BROWSE MODE (Empty search)
        // FIX: Explicitly type this array to avoid TS error
        let results: any[] = [];

        // 1. If "All" or "Song", fetch songs
        if (activeCategory === "All" || activeCategory === "Song") {
            try {
                const res = await api.get('/songs?limit=20&sort=-createdAt');
                const songs = (res.data.data || []).map((item: any) => ({ ...item, type: 'Song' }));
                results = [...results, ...songs];
            } catch (e) { console.log('Error fetching songs', e); }
        }

        // 2. If "All" or "Artist", fetch artists
        if (activeCategory === "All" || activeCategory === "Artist") {
            try {
                const res = await api.get('/artists?limit=20');
                const artists = (res.data.data || []).map((item: any) => ({ ...item, type: 'Artist' }));
                results = [...results, ...artists];
            } catch (e) { console.log('Error fetching artists', e); }
        }

        // 3. If "All" or "Album", fetch albums
        if (activeCategory === "All" || activeCategory === "Album") {
            try {
                const res = await api.get('/albums?limit=20');
                const albums = (res.data.data || []).map((item: any) => ({ ...item, type: 'Album' }));
                results = [...results, ...albums];
            } catch (e) { console.log('Error fetching albums', e); }
        }

        // 4. If "All" or "Church", fetch churches
        if (activeCategory === "All" || activeCategory === "Church") {
            try {
                const res = await api.get('/churches?limit=20');
                const churches = (res.data.data || []).map((item: any) => ({ ...item, type: 'Church' }));
                results = [...results, ...churches];
            } catch (e) { console.log('Error fetching churches', e); }
        }

        // Shuffle results if "All"
        if (activeCategory === "All") {
            return results.sort(() => Math.random() - 0.5);
        }

        return results;
    };

    const { data: results = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['explore', debouncedSearch, activeCategory],
        queryFn: fetchExploreData,
        staleTime: 1000 * 60 * 5,
    });

    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleItemPress = (item: any) => {
        Keyboard.dismiss();

        const type = (item.type || 'Song').toLowerCase();

        if (type === 'artist') navigation.navigate('ArtistDetail', { id: item._id });
        else if (type === 'album') navigation.navigate('AlbumDetail', { id: item._id });
        else if (type === 'church') navigation.navigate('ChurchDetail', { id: item._id });
        else if (type === 'song') {
            navigation.navigate('SongDetail', {
                id: item._id,
                title: item.title,
                artist: item.artistId
            });
        }
    };

    const handlePlayPress = (item: any) => {
        playSong(item);
        navigation.navigate('Player', { song: item });
    };

    const renderSkeleton = () => (
        <View style={{ marginTop: 10 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <View key={i} style={styles.skeletonRow}>
                    <View style={[styles.skeletonImage, { backgroundColor: colors.surfaceLight }]} />
                    <View style={{ gap: 8, flex: 1 }}>
                        <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.surfaceLight }]} />
                        <View style={[styles.skeletonLine, { width: '30%', backgroundColor: colors.surfaceLight }]} />
                    </View>
                </View>
            ))}
        </View>
    );

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    {searchText ? "No matches found" : "Start browsing"}
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                    {searchText ? "Try checking your spelling or use different keywords." : "Search for your favorite songs, artists, or lyrics."}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
            <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.bg} />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Browse</Text>
            </View>

            <View style={{ paddingHorizontal: SPACING.m }}>
                <SearchInput value={searchText} onChangeText={setSearchText} autoFocus={false} />
            </View>

            <FilterPills activeFilter={activeCategory} onSelect={setActiveCategory} />

            {isLoading && !isRefetching ? (
                <View style={{ paddingHorizontal: SPACING.m }}>{renderSkeleton()}</View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item._id + (item.type || 'mix')}
                    renderItem={({ item }) => (
                        <SearchResultRow item={item} onPress={handleItemPress} onPlayPress={handlePlayPress} />
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"

                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={onRefresh}
                            tintColor={colors.accent}
                            colors={[colors.accent]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: SPACING.m, paddingTop: SPACING.s, paddingBottom: SPACING.m },
    headerTitle: { fontSize: 28, fontFamily: FONTS.bold, letterSpacing: -0.5 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontFamily: FONTS.bold, marginTop: 16, marginBottom: 8 },
    emptySub: { fontSize: 14, textAlign: 'center', fontFamily: FONTS.regular, lineHeight: 20 },
    skeletonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    skeletonImage: { width: 50, height: 50, borderRadius: 8, marginRight: 14 },
    skeletonLine: { height: 10, borderRadius: 5, opacity: 0.5 }
});