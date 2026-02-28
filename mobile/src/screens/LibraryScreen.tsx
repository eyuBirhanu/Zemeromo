import React, { useState } from 'react';
import { View, FlatList, StyleSheet, StatusBar, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import FilterPills from '../components/search/FilterPills';
import SearchResultRow from '../components/search/SearchResultRow';
import { SPACING, FONTS } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';

export default function LibraryScreen() {
    const navigation = useNavigation<any>();
    const colors = useThemeColors();
    const { playSong } = usePlayerStore();
    const { favorites } = useFavoritesStore();

    const [activeCategory, setActiveCategory] = useState("All");

    // Filter favorites based on selected pill
    const filteredFavorites = favorites.filter(item => {
        if (activeCategory === "All") return true;
        return item.type.toLowerCase() === activeCategory.toLowerCase();
    });

    const handleItemPress = (item: any) => {
        const type = (item.type || 'Song').toLowerCase();
        if (type === 'artist') navigation.navigate('ArtistDetail', { id: item._id });
        else if (type === 'album') navigation.navigate('AlbumDetail', { id: item._id });
        else if (type === 'church') navigation.navigate('ChurchDetail', { id: item._id });
        else if (type === 'song') navigation.navigate('SongDetail', { id: item._id, title: item.title, artist: item.artistId });
    };

    const handlePlayPress = (item: any) => {
        playSong(item);
        navigation.navigate('Player', { song: item });
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No favorites yet</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                {activeCategory === "All"
                    ? "Save your favorite songs, artists, and albums to find them here easily."
                    : `You haven't saved any ${activeCategory.toLowerCase()}s yet.`}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
            <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.bg} />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Library</Text>
            </View>

            <FilterPills activeFilter={activeCategory} onSelect={setActiveCategory} />

            <FlatList
                data={filteredFavorites}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <SearchResultRow
                        item={item}
                        onPress={handleItemPress}
                        onPlayPress={handlePlayPress}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: SPACING.m, paddingTop: SPACING.s, paddingBottom: SPACING.m },
    headerTitle: { fontSize: 28, fontFamily: FONTS.bold, letterSpacing: -0.5 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontFamily: FONTS.bold, marginTop: 16, marginBottom: 8 },
    emptySub: { fontSize: 14, textAlign: 'center', fontFamily: FONTS.regular, lineHeight: 20 },
});