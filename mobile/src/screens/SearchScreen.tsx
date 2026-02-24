import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, StatusBar, Text, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

// Components
import SearchInput from '../components/search/SearchInput';
import FilterPills from '../components/search/FilterPills';
import SearchResultRow from '../components/search/SearchResultRow';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';

// Simple Debounce Implementation
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
    const { playSong } = usePlayerStore();

    // 1. State
    const [searchText, setSearchText] = useState('');
    const [activeCategory, setActiveCategory] = useState(route.params?.type || "All");
    const debouncedSearch = useDebounce(searchText, 500);

    // 2. Fetch Logic
    const fetchExploreData = async () => {
        // CASE A: User is searching text
        if (debouncedSearch.length > 0) {
            const params: any = { q: debouncedSearch };
            if (activeCategory !== "All") params.type = activeCategory.toLowerCase();
            const res = await api.get('/search', { params });
            // API usually returns { data: [...] } or { data: { results: [...] } }
            // Adjust based on your backend response structure
            return res.data.data || [];
        }

        // CASE B: Explore / Browse Mode (No Text)
        let endpoint = '/songs?limit=20&sort=-createdAt';
        let typeLabel = 'Song';

        if (activeCategory === 'Artist') {
            endpoint = '/artists?limit=20';
            typeLabel = 'Artist';
        } else if (activeCategory === 'Album') {
            endpoint = '/albums?limit=20';
            typeLabel = 'Album';
        } else if (activeCategory === 'Church') {
            endpoint = '/churches?limit=20';
            typeLabel = 'Church';
        }

        const res = await api.get(endpoint);

        // Normalize data with a 'type' property
        return (res.data.data || []).map((item: any) => ({
            ...item,
            type: typeLabel
        }));
    };

    const { data: results = [], isLoading } = useQuery({
        queryKey: ['explore', debouncedSearch, activeCategory],
        queryFn: fetchExploreData,
    });

    // 3. Handlers
    const handleItemPress = (item: any) => {
        Keyboard.dismiss();
        const type = item.type || 'Song';

        if (type === 'Artist') navigation.navigate('ArtistDetail', { id: item._id });
        else if (type === 'Album') navigation.navigate('AlbumDetail', { id: item._id });
        else if (type === 'Church') navigation.navigate('ChurchDetail', { id: item._id });
        else if (type === 'Song') {
            // Open Details/Lyrics
            navigation.navigate('SongDetail', { id: item._id, title: item.title, artist: item.artistId });
        }
    };

    const handlePlayPress = (item: any) => {
        playSong(item);
        navigation.navigate('Player', { song: item });
    };

    // 4. Render Components
    const renderSkeleton = () => (
        <View style={{ marginTop: 10 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <View key={i} style={styles.skeletonRow}>
                    <View style={styles.skeletonImage} />
                    <View style={{ gap: 8, flex: 1 }}>
                        <View style={[styles.skeletonLine, { width: '60%' }]} />
                        <View style={[styles.skeletonLine, { width: '30%' }]} />
                    </View>
                </View>
            ))}
        </View>
    );

    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={COLORS.dark.border} />
                <Text style={styles.emptyTitle}>
                    {searchText ? "No matches found" : "Start browsing"}
                </Text>
                <Text style={styles.emptySub}>
                    {searchText ? "Try checking your spelling or use different keywords." : "Search for your favorite songs, artists, or lyrics."}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.dark.bg} />

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Browse</Text>
            </View>

            {/* INPUT & FILTERS */}
            <View style={{ paddingHorizontal: SPACING.m }}>
                <SearchInput
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus={false}
                />
            </View>

            <FilterPills
                activeFilter={activeCategory}
                onSelect={setActiveCategory}
            />

            {/* LIST */}
            {isLoading ? (
                <View style={{ paddingHorizontal: SPACING.m }}>
                    {renderSkeleton()}
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item._id + (item.type || 'mix')}
                    renderItem={({ item }) => (
                        <SearchResultRow
                            item={item}
                            onPress={handleItemPress}
                            onPlayPress={handlePlayPress}
                        />
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }} // Space for Player
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark.bg,
    },
    header: {
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.s,
        paddingBottom: SPACING.m,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        color: COLORS.white,
        letterSpacing: -0.5,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySub: {
        color: COLORS.dark.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        fontFamily: FONTS.regular,
        lineHeight: 20,
    },
    skeletonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    skeletonImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: COLORS.dark.surface,
        marginRight: 14,
    },
    skeletonLine: {
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.dark.surface,
        opacity: 0.5,
    }
});