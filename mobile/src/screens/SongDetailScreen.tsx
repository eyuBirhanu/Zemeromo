import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, Platform, Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../lib/api';
import { SPACING, FONTS } from '../constants/theme';
import { Song } from '../types/api';
import { usePlayerStore } from '../store/playerStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useFavoritesStore } from '../store/favoritesStore';

// --- FETCHER ---
const fetchSongDetails = async (id: string): Promise<Song> => {
    const response = await api.get(`/songs/${id}`);
    return response.data.data;
};

// ==========================================
// REUSABLE SKELETON COMPONENT
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

    return (
        <Animated.View
            style={[
                style,
                {
                    backgroundColor: colors.isDark ? '#333333' : '#E0E0E0',
                    opacity,
                },
            ]}
        />
    );
};

// --- SETTINGS HOOK ---
const useReaderSettings = () => {
    const [fontSize, setFontSize] = useState(18);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const storedSize = await AsyncStorage.getItem('reader_fontSize');
            if (storedSize) setFontSize(parseInt(storedSize, 10));
            setLoading(false);
        })();
    }, []);

    const updateFontSize = (newSize: number) => {
        const size = Math.max(14, Math.min(newSize, 32));
        setFontSize(size);
        AsyncStorage.setItem('reader_fontSize', size.toString());
    };

    return { fontSize, updateFontSize, loading };
};

export default function SongDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params || {};
    const { playSong } = usePlayerStore();
    const colors = useThemeColors();

    // Favorites & Settings State
    const { toggleFavorite, checkIsFavorite } = useFavoritesStore();
    const isFavorite = checkIsFavorite(id);
    const { fontSize, updateFontSize, loading: settingsLoading } = useReaderSettings();
    const [showSettings, setShowSettings] = useState(false);

    // Data Fetch (Updated with specific Offline Support settings)
    const { data: song, isLoading, isError } = useQuery({
        queryKey: ['song', id],
        queryFn: () => fetchSongDetails(id),
        // offline support tweaks:
        staleTime: 1000 * 60 * 60 * 24, // Treat data as fresh for 24 hours (loads instantly)
        gcTime: 1000 * 60 * 60 * 24 * 7, // Keep lyrics saved in local storage for 7 days!
    });

    const hasAudio = song?.audioUrl && song.audioUrl.trim().length > 0;

    // --- NAVIGATION HANDLERS ---
    const goToArtist = () => {
        const artistId = typeof song?.artistId === 'object' ? song.artistId._id : song?.artistId;
        if (artistId) navigation.navigate('ArtistDetail', { id: artistId });
    };

    const goToAlbum = () => {
        const albumId = typeof song?.albumId === 'object' ? song.albumId._id : song?.albumId;
        if (albumId) navigation.navigate('AlbumDetail', { id: albumId });
    };

    // ==========================================
    // 1. SKELETON LOADING STATE
    // ==========================================
    if (isLoading || settingsLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.bg }]}>
                <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.bg} />

                {/* Fake Header */}
                <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Skeleton style={{ width: 120, height: 16, borderRadius: 4, marginBottom: 4 }} />
                        <Skeleton style={{ width: 80, height: 12, borderRadius: 4 }} />
                    </View>

                    <View style={styles.headerActions}>
                        <Skeleton style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />
                        <Skeleton style={{ width: 32, height: 32, borderRadius: 16 }} />
                    </View>
                </View>

                {/* Lyrics Body Skeletons */}
                <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}>
                    <View style={styles.contentHeader}>
                        <Skeleton style={{ width: 200, height: 28, borderRadius: 6, marginBottom: 16 }} />
                        <View style={styles.metaLinksRow}>
                            <Skeleton style={{ width: 80, height: 24, borderRadius: 12 }} />
                            <Skeleton style={{ width: 100, height: 24, borderRadius: 12 }} />
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Simulating Lyrics Lines */}
                    <View style={{ paddingHorizontal: SPACING.xl, marginTop: 10 }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((line, index) => (
                            <Skeleton
                                key={line}
                                style={{
                                    width: index % 3 === 0 ? '70%' : index % 2 === 0 ? '90%' : '85%',
                                    height: fontSize - 2,
                                    borderRadius: 4,
                                    marginBottom: fontSize * 0.8
                                }}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    }

    // ==========================================
    // 2. ERROR STATE
    // ==========================================
    if (isError || !song) {
        return (
            <View style={[styles.center, { backgroundColor: colors.bg, paddingHorizontal: 20 }]}>
                <Ionicons name="document-text-outline" size={60} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                <Text style={{ color: colors.text, fontFamily: FONTS.bold, fontSize: 18 }}>Lyrics not found</Text>
                <Text style={{ color: colors.textSecondary, fontFamily: FONTS.regular, marginTop: 8, textAlign: 'center' }}>
                    We couldn't load this song. Please check your internet connection.
                </Text>

                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.goBackBtn, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#fff', fontFamily: FONTS.bold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const artistName = typeof song.artistId === 'object' ? song.artistId.name : "Unknown Artist";
    const albumTitle = typeof song.albumId === 'object' ? song.albumId.title : "Single";

    // ==========================================
    // 3. MAIN CONTENT
    // ==========================================
    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.bg} />

            {/* --- COMPACT HEADER --- */}
            <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
                    <TouchableOpacity onPress={goToArtist} activeOpacity={0.7}>
                        <Text style={[styles.headerSubtitle, { color: colors.primary }]} numberOfLines={1}>
                            {artistName}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Header Actions */}
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => toggleFavorite(song, 'Song')} style={styles.iconBtn}>
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={22}
                            color={isFavorite ? colors.primary : colors.text}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setShowSettings(!showSettings)}
                        style={[styles.iconBtn, showSettings && { backgroundColor: colors.surface }]}
                    >
                        <Ionicons
                            name="text"
                            size={22}
                            color={showSettings ? colors.primary : colors.text}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- SETTINGS DROPDOWN --- */}
            {showSettings && (
                <View style={[styles.settingsDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.settingRow}>
                        <TouchableOpacity onPress={() => updateFontSize(fontSize - 2)} style={[styles.sizeBtn, { backgroundColor: colors.surfaceLight }]}>
                            <MaterialCommunityIcons name="format-font-size-decrease" size={20} color={colors.text} />
                        </TouchableOpacity>

                        <Text style={[styles.sizeValue, { color: colors.primary }]}>{fontSize}</Text>

                        <TouchableOpacity onPress={() => updateFontSize(fontSize + 2)} style={[styles.sizeBtn, { backgroundColor: colors.surfaceLight }]}>
                            <MaterialCommunityIcons name="format-font-size-increase" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* --- LYRICS SCROLLVIEW --- */}
            <ScrollView
                style={{ backgroundColor: colors.bg }}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentHeader}>
                    <Text style={[styles.mainTitle, { color: colors.text }]}>{song.title}</Text>

                    <View style={styles.metaLinksRow}>
                        <TouchableOpacity onPress={goToArtist} style={styles.linkPill}>
                            <Feather name="mic" size={12} color={colors.primary} />
                            <Text style={[styles.linkText, { color: colors.primary }]}>{artistName}</Text>
                        </TouchableOpacity>

                        {song.albumId && (
                            <>
                                <Text style={{ color: colors.textSecondary }}>•</Text>
                                <TouchableOpacity onPress={goToAlbum} style={styles.linkPill}>
                                    <Ionicons name="disc-outline" size={14} color={colors.primary} />
                                    <Text style={[styles.linkText, { color: colors.primary }]}>{albumTitle}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* Subtly colored divider using Primary (Emerald) */}
                <View style={[styles.divider, { backgroundColor: colors.primary }]} />

                <Text style={[
                    styles.lyrics,
                    {
                        color: colors.text,
                        fontSize: fontSize,
                        lineHeight: fontSize * 1.6
                    }
                ]}>
                    {song.lyrics || "Lyrics are not available for this song."}
                </Text>

                <View style={[styles.footer, { borderColor: colors.border }]}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        © {new Date(song.createdAt).getFullYear()} {typeof song.churchId === 'object' ? song.churchId?.name : "Church"}
                    </Text>
                </View>

            </ScrollView>

            {/* --- EXTENDED FAB (Only if Audio Exists) - Now using Primary Color --- */}
            {hasAudio && (
                <TouchableOpacity
                    style={[styles.extendedFab, { backgroundColor: colors.primary }]}
                    activeOpacity={0.9}
                    onPress={() => playSong(song)}
                >
                    <Ionicons name="play" size={24} color={colors.white} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
        paddingBottom: 10, paddingHorizontal: SPACING.m, borderBottomWidth: 1, zIndex: 20
    },
    iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitleContainer: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
    headerTitle: { fontSize: 16, fontFamily: FONTS.bold },
    headerSubtitle: { fontSize: 12, fontFamily: FONTS.medium, marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },

    // Settings Dropdown
    settingsDropdown: {
        position: 'absolute', top: Platform.OS === 'android' ? StatusBar.currentHeight! + 60 : 100,
        right: SPACING.m, width: 150, borderRadius: 12, padding: 12, borderWidth: 1, zIndex: 50,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 10
    },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sizeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
    sizeValue: { fontSize: 16, fontFamily: FONTS.bold, width: 30, textAlign: 'center' },

    // Content
    contentHeader: { paddingHorizontal: SPACING.l, alignItems: 'center', marginBottom: 10 },
    mainTitle: { fontSize: 26, fontFamily: FONTS.bold, textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },

    metaLinksRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
    linkPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    linkText: { fontSize: 12, fontFamily: FONTS.bold },

    divider: { width: 40, height: 3, alignSelf: 'center', marginVertical: 24, opacity: 0.4, borderRadius: 2 },

    lyrics: { marginHorizontal: SPACING.xl, paddingHorizontal: SPACING.m, textAlign: 'left', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },

    footer: { marginTop: 60, borderTopWidth: 1, marginHorizontal: SPACING.l, paddingTop: 20, alignItems: 'center' },
    footerText: { fontSize: 12, fontFamily: FONTS.regular },

    // FAB
    extendedFab: {
        position: 'absolute', right: 20, bottom: 40, height: 60, width: 60,
        alignItems: 'center', justifyContent: 'center', borderRadius: 30, zIndex: 30,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
    },
    goBackBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 }
});