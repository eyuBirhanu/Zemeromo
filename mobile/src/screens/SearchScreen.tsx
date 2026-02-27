import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, StatusBar, Text, Keyboard } from 'react-native';
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
import { useThemeColors } from '../hooks/useThemeColors'; // THEME HOOK

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

    const fetchExploreData = async () => {
        if (debouncedSearch.length > 0) {
            const params: any = { q: debouncedSearch };
            if (activeCategory !== "All") params.type = activeCategory.toLowerCase();
            const res = await api.get('/search', { params });
            return res.data.data || [];
        }

        let endpoint = '/songs?limit=20&sort=-createdAt';
        let typeLabel = 'Song';

        if (activeCategory === 'Artist') { endpoint = '/artists?limit=20'; typeLabel = 'Artist'; }
        else if (activeCategory === 'Album') { endpoint = '/albums?limit=20'; typeLabel = 'Album'; }
        else if (activeCategory === 'Church') { endpoint = '/churches?limit=20'; typeLabel = 'Church'; }

        const res = await api.get(endpoint);
        return (res.data.data || []).map((item: any) => ({ ...item, type: typeLabel }));
    };

    const { data: results = [], isLoading } = useQuery({
        queryKey: ['explore', debouncedSearch, activeCategory],
        queryFn: fetchExploreData,
        staleTime: 1000 * 60 * 5,
    });

    const handleItemPress = (item: any) => {
        Keyboard.dismiss();
        const type = item.type || 'Song';
        if (type === 'Artist') navigation.navigate('ArtistDetail', { id: item._id });
        else if (type === 'Album') navigation.navigate('AlbumDetail', { id: item._id });
        else if (type === 'Church') navigation.navigate('ChurchDetail', { id: item._id });
        else if (type === 'Song') navigation.navigate('SongDetail', { id: item._id, title: item.title, artist: item.artistId });
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

            {isLoading ? (
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