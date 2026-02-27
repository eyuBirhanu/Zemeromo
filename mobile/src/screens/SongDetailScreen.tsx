import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, ActivityIndicator, Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import api from '../lib/api';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { Song } from '../types/api';
import { usePlayerStore } from '../store/playerStore';
import { useThemeColors } from '../hooks/useThemeColors'; // Theme Hook

// --- FETCHER ---
const fetchSongDetails = async (id: string): Promise<Song> => {
    const response = await api.get(`/songs/${id}`);
    return response.data.data;
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
        const size = Math.max(14, Math.min(newSize, 30));
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
    const insets = useSafeAreaInsets();
    const colors = useThemeColors(); // Get Global Theme

    // Settings State
    const { fontSize, updateFontSize, loading: settingsLoading } = useReaderSettings();
    const [showSettings, setShowSettings] = useState(false);

    // Data Fetch
    const { data: song, isLoading, isError } = useQuery({
        queryKey: ['song', id],
        queryFn: () => fetchSongDetails(id),
    });

    // --- CHECK AUDIO AVAILABILITY ---
    // Ensure audioUrl exists and is not an empty string
    const hasAudio = song?.audioUrl && song.audioUrl.trim().length > 0;

    if (isLoading || settingsLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (isError || !song) {
        return (
            <View style={[styles.center, { backgroundColor: colors.bg }]}>
                <Text style={{ color: colors.textSecondary }}>Song not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: colors.primary, marginTop: 10 }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>{song.artistId?.name || "Unknown"}</Text>
                </View>

                {/* Settings Toggle */}
                <TouchableOpacity
                    onPress={() => setShowSettings(!showSettings)}
                    style={[styles.iconBtn, showSettings && { backgroundColor: colors.surface }]}
                >
                    <Ionicons
                        name="text"
                        size={22}
                        color={showSettings ? colors.accent : colors.text}
                    />
                </TouchableOpacity>
            </View>

            {/* --- SETTINGS DROPDOWN --- */}
            {showSettings && (
                <View style={[styles.settingsDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.settingRow}>
                        <TouchableOpacity onPress={() => updateFontSize(fontSize - 2)} style={[styles.sizeBtn, { backgroundColor: colors.surfaceLight }]}>
                            <MaterialCommunityIcons name="format-font-size-decrease" size={20} color={colors.text} />
                        </TouchableOpacity>

                        <Text style={[styles.sizeValue, { color: colors.accent }]}>{fontSize}</Text>

                        <TouchableOpacity onPress={() => updateFontSize(fontSize + 2)} style={[styles.sizeBtn, { backgroundColor: colors.surfaceLight }]}>
                            <MaterialCommunityIcons name="format-font-size-increase" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* --- LYRICS SCROLLVIEW --- */}
            <ScrollView
                style={{ backgroundColor: colors.bg }}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentHeader}>
                    <Text style={[styles.mainTitle, { color: colors.text }]}>{song.title}</Text>
                    <View style={styles.metaRow}>
                        <Text style={[styles.metaPill, { color: colors.accent, borderColor: colors.accent }]}>
                            {song.genre || "Gospel"}
                        </Text>
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {song.albumId?.title || "Single"}
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.accent }]} />

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
                        © {new Date().getFullYear()} {song.churchId?.name || "Church"}
                    </Text>
                </View>

            </ScrollView>

            {/* --- EXTENDED FAB (Only if Audio Exists) --- */}
            {hasAudio && (
                <TouchableOpacity
                    style={[styles.extendedFab, { backgroundColor: colors.accent }]}
                    activeOpacity={0.9}
                    onPress={() => playSong(song)}
                >
                    <Ionicons name="play" size={24} color={colors.black} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
        paddingBottom: 10, paddingHorizontal: SPACING.m, borderBottomWidth: 1, zIndex: 20
    },
    iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitleContainer: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
    headerTitle: { fontSize: 16, fontFamily: FONTS.bold },
    headerSubtitle: { fontSize: 12, fontFamily: FONTS.regular },

    settingsDropdown: {
        position: 'absolute', top: Platform.OS === 'android' ? StatusBar.currentHeight! + 60 : 100,
        right: SPACING.m, width: 160, borderRadius: 12, padding: 12, borderWidth: 1, zIndex: 50,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 10
    },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sizeBtn: { width: 40, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
    sizeValue: { fontSize: 14, fontFamily: FONTS.bold, width: 30, textAlign: 'center' },

    contentHeader: { paddingHorizontal: SPACING.l, alignItems: 'center', marginBottom: 10 },
    mainTitle: { fontSize: 24, fontFamily: FONTS.bold, textAlign: 'center', marginBottom: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaPill: { fontSize: 11, fontFamily: FONTS.bold, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100, textTransform: 'uppercase' },
    metaText: { fontSize: 14, fontFamily: FONTS.medium },

    divider: { width: 40, height: 2, alignSelf: 'center', marginVertical: 20, opacity: 0.5 },
    lyrics: { marginHorizontal: SPACING.xxl, paddingHorizontal: SPACING.l, textAlign: 'left', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    footer: { marginTop: 60, borderTopWidth: 1, marginHorizontal: SPACING.l, paddingTop: 20, alignItems: 'center' },
    footerText: { fontSize: 12, fontFamily: FONTS.regular },

    extendedFab: {
        position: 'absolute', right: 20, bottom: 40, height: 60, width: 60,
        alignItems: 'center', justifyContent: 'center', borderRadius: 30, zIndex: 30,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6
    }
});