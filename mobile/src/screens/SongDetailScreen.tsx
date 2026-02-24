import React, { useState, useEffect } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, ActivityIndicator, Platform, Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../lib/api';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { Song } from '../types/api';
import { usePlayerStore } from '../store/playerStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- FETCHER ---
const fetchSongDetails = async (id: string): Promise<Song> => {
    const response = await api.get(`/songs/${id}`);
    return response.data.data;
};

// --- SETTINGS HOOK ---
const useReaderSettings = () => {
    const [fontSize, setFontSize] = useState(18);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const storedSize = await AsyncStorage.getItem('reader_fontSize');
            const storedTheme = await AsyncStorage.getItem('reader_theme');
            if (storedSize) setFontSize(parseInt(storedSize, 10));
            if (storedTheme) setTheme(storedTheme as 'dark' | 'light');
            setLoading(false);
        })();
    }, []);

    const updateFontSize = (newSize: number) => {
        const size = Math.max(14, Math.min(newSize, 30));
        setFontSize(size);
        AsyncStorage.setItem('reader_fontSize', size.toString());
    };

    const toggleTheme = (newTheme: 'dark' | 'light') => {
        setTheme(newTheme);
        AsyncStorage.setItem('reader_theme', newTheme);
    };

    return { fontSize, updateFontSize, theme, toggleTheme, loading };
};

export default function SongDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params || {};
    const { playSong } = usePlayerStore();
    const insets = useSafeAreaInsets();
    const TAB_HEIGHT = 60 + insets.bottom;

    // Settings State
    const { fontSize, updateFontSize, theme, toggleTheme, loading: settingsLoading } = useReaderSettings();
    const [showSettings, setShowSettings] = useState(false);

    // Data Fetch
    const { data: song, isLoading, isError } = useQuery({
        queryKey: ['song', id],
        queryFn: () => fetchSongDetails(id),
    });

    // --- COLOR LOGIC (Local to Lyric Area) ---
    // We keep the main container DARK to match the app, 
    // but change the scrollview background if 'Light' is selected.
    const isLight = theme === 'light';
    const bgColor = isLight ? '#FDFBF7' : COLORS.dark.bg; // Soft Cream vs Dark
    const textColor = isLight ? '#1F2937' : 'rgba(255,255,255,0.9)';
    const settingsBg = COLORS.dark.surface; // Always dark for contrast against the app header

    if (isLoading || settingsLoading) {
        return (
            <View style={[styles.center, { backgroundColor: COLORS.dark.bg }]}>
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    if (isError || !song) {
        return (
            <View style={styles.center}>
                <Text style={{ color: COLORS.dark.textSecondary }}>Song not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: COLORS.accent, marginTop: 10 }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.dark.bg} />

            {/* --- COMPACT HEADER (Always Dark) --- */}
            {/* This keeps the app feeling consistent */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>

                {/* Mini Song Info in Header */}
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{song.artistId?.name || "Unknown"}</Text>
                </View>

                {/* Settings Toggle */}
                <TouchableOpacity
                    onPress={() => setShowSettings(!showSettings)}
                    style={[styles.iconBtn, showSettings && { backgroundColor: COLORS.accent }]}
                >
                    <Ionicons
                        name="text"
                        size={22}
                        color={showSettings ? COLORS.black : "white"}
                    />
                </TouchableOpacity>
            </View>

            {/* --- SETTINGS DROPDOWN (No Blur, Absolute) --- */}
            {showSettings && (
                <View style={styles.settingsDropdown}>
                    {/* Theme Toggle */}
                    <View style={styles.settingRow}>
                        <TouchableOpacity
                            onPress={() => toggleTheme('dark')}
                            style={[styles.themeOption, theme === 'dark' && styles.themeOptionActive]}
                        >
                            <Ionicons name="moon" size={16} color="white" />
                            <Text style={styles.themeText}>Dark</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => toggleTheme('light')}
                            style={[styles.themeOption, theme === 'light' && styles.themeOptionActive]}
                        >
                            <Ionicons name="sunny" size={16} color="white" />
                            <Text style={styles.themeText}>Light</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Font Sizer */}
                    <View style={styles.settingRow}>
                        <TouchableOpacity onPress={() => updateFontSize(fontSize - 2)} style={styles.sizeBtn}>
                            <MaterialCommunityIcons name="format-font-size-decrease" size={20} color="white" />
                        </TouchableOpacity>

                        <Text style={styles.sizeValue}>{fontSize}</Text>

                        <TouchableOpacity onPress={() => updateFontSize(fontSize + 2)} style={styles.sizeBtn}>
                            <MaterialCommunityIcons name="format-font-size-increase" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* --- LYRICS SCROLLVIEW --- */}
            <ScrollView
                style={{ backgroundColor: bgColor }} // Changes based on theme
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Minimal Header Inside ScrollView */}
                <View style={styles.contentHeader}>
                    <Text style={[styles.mainTitle, { color: textColor }]}>{song.title}</Text>
                    <View style={styles.metaRow}>
                        <Text style={[styles.metaPill, { color: COLORS.accent, borderColor: COLORS.accent }]}>
                            {song.genre || "Gospel"}
                        </Text>
                        <Text style={[styles.metaText, { color: isLight ? '#6B7280' : COLORS.dark.textSecondary }]}>
                            {song.albumId?.title || "Single"}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <Text style={[
                    styles.lyrics,
                    {
                        color: textColor,
                        fontSize: fontSize,
                        lineHeight: fontSize * 1.6
                    }
                ]}>
                    {song.lyrics || "Lyrics are not available for this song."}
                </Text>

                <View style={[styles.footer, { borderColor: isLight ? '#E5E7EB' : COLORS.dark.border }]}>
                    <Text style={[styles.footerText, { color: isLight ? '#9CA3AF' : COLORS.dark.textSecondary }]}>
                        © {new Date().getFullYear()} {song.churchId?.name || "Church"}
                    </Text>
                </View>

            </ScrollView>

            {/* --- EXTENDED FAB (Bottom Right) --- */}
            <TouchableOpacity
                style={styles.extendedFab}
                activeOpacity={0.9}
                onPress={() => playSong(song)}
            >
                <Ionicons name="play" size={20} color={COLORS.black} />
                {/* <Text style={styles.fabText}>Listen</Text> */}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark.bg, // Outer container always dark
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.dark.bg,
    },
    // Top Bar
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
        paddingBottom: 10,
        paddingHorizontal: SPACING.m,
        backgroundColor: COLORS.dark.bg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.dark.border,
        zIndex: 20, // Sit above everything
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    headerTitle: {
        color: 'white',
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    headerSubtitle: {
        color: COLORS.dark.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    // Settings Dropdown
    settingsDropdown: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight! + 60 : 100,
        right: SPACING.m,
        width: 200,
        backgroundColor: COLORS.dark.surface, // Always dark popup
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.dark.border,
        zIndex: 50, // Topmost
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 4,
    },
    themeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 6,
        gap: 6,
    },
    themeOptionActive: {
        backgroundColor: COLORS.dark.surfaceLight,
        borderWidth: 1,
        borderColor: COLORS.dark.border,
    },
    themeText: {
        color: 'white',
        fontSize: 12,
        fontFamily: FONTS.medium,
    },
    sizeBtn: {
        width: 40,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
    },
    sizeValue: {
        color: COLORS.accent,
        fontSize: 14,
        fontFamily: FONTS.bold,
        width: 30,
        textAlign: 'center',
    },
    // Content
    contentHeader: {
        paddingHorizontal: SPACING.l,
        alignItems: 'center',
        marginBottom: 10,
    },
    mainTitle: {
        fontSize: 24,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaPill: {
        fontSize: 11,
        fontFamily: FONTS.bold,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 100,
        textTransform: 'uppercase',
    },
    metaText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    divider: {
        width: 40,
        height: 2,
        backgroundColor: COLORS.accent,
        alignSelf: 'center',
        marginVertical: 20,
        opacity: 0.5,
    },
    lyrics: {
        marginHorizontal: SPACING.xxl,
        paddingHorizontal: SPACING.l,
        textAlign: 'left', // Center align usually looks best for hymns
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    footer: {
        marginTop: 60,
        borderTopWidth: 1,
        marginHorizontal: SPACING.l,
        paddingTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    // Extended FAB
    extendedFab: {
        position: 'absolute',
        // left: 20,
        right: 20,
        bottom: 40,
        height: 60,
        width: 60,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accent,
        borderRadius: 100,
        zIndex: 30,
    },
    // fabText: {
    //     color: COLORS.black,
    //     fontSize: 16,
    //     fontFamily: FONTS.bold,
    //     textTransform: 'uppercase',
    //     letterSpacing: 0.5,
    // }
});