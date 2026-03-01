import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Share, StatusBar, TouchableOpacity, Linking, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Feather } from '@expo/vector-icons';

import { SPACING, FONTS } from '../constants/theme';
import SettingRow from '../components/profile/SettingRow';
import { useThemeColors } from '../hooks/useThemeColors';
import { useThemeStore } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';

const PLAY_STORE_LINK = "https://play.google.com/store/apps/details?id=com.eyubirhanu.zemeromo";
const WEBSITE_URL = "https://zemeromo.com";

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { resetOnboarding } = useSettingsStore();


    // --- HOOKS FOR THEME ---
    const colors = useThemeColors();
    const { isDarkMode, toggleTheme } = useThemeStore();

    // --- HANDLERS ---
    const openInAppBrowser = async (url: string) => {
        try {
            await WebBrowser.openBrowserAsync(url, {
                controlsColor: colors.accent,
                toolbarColor: colors.surface,
            });
        } catch (error) {
            Alert.alert("Error", "Could not open link");
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Listen to Ethiopian Gospel songs offline on Zemeromo! Download: ${PLAY_STORE_LINK}`,
                title: 'Share Zemeromo'
            });
        } catch (error: any) {
            console.log(error);
        }
    };

    const handleLoginAlert = () => {
        Alert.alert(
            "Coming Soon",
            "User accounts and personalization features will be available in the next update!",
            [{ text: "Can't Wait!", style: "default" }]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={colors.bg}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                <Text style={[styles.headerTitle, { color: colors.text }]}>Account</Text>

                {/* --- LOGIN PLACEHOLDER --- */}
                <View style={[styles.loginCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceLight }]}>
                        <Ionicons name="person" size={24} color={colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.loginTitle, { color: colors.text }]}>Sign in to Zemeromo</Text>
                        <Text style={[styles.loginSubtitle, { color: colors.textSecondary }]}>Sync your favorites and playlists.</Text>
                    </View>
                    <TouchableOpacity onPress={handleLoginAlert} style={styles.loginBtn}>
                        <Text style={styles.loginBtnText}>Sign In</Text>
                    </TouchableOpacity>
                </View>

                {/* --- APPEARANCE --- */}
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Appearance</Text>
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <View style={[styles.themeRow, { borderBottomColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Feather name={isDarkMode ? "moon" : "sun"} size={20} color={colors.textSecondary} />
                            <Text style={[styles.themeText, { color: colors.text }]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#d1d5db', true: colors.primary }}
                            thumbColor={isDarkMode ? '#fff' : '#fff'}
                        />
                    </View>
                </View>

                {/* --- GENERAL SETTINGS --- */}
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>General</Text>
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    {/* Note: You might need to update SettingRow to use useThemeColors inside it as well */}
                    <SettingRow
                        icon="information-circle-outline"
                        title="About Zemeromo"
                        onPress={() => openInAppBrowser(`${WEBSITE_URL}/about`)}
                    />
                    <SettingRow
                        icon="shield-checkmark-outline"
                        title="Privacy Policy"
                        onPress={() => openInAppBrowser(`${WEBSITE_URL}/privacy`)}
                    />
                    <SettingRow
                        icon="document-text-outline"
                        title="Terms of Service"
                        onPress={() => openInAppBrowser(`${WEBSITE_URL}/terms`)}
                    />
                    {/* <TouchableOpacity
                        onPress={() => {
                            resetOnboarding();
                            alert("Onboarding reset! Restart the app to see it.");
                        }}
                        style={{ padding: 16, backgroundColor: 'red', borderRadius: 8, marginTop: 10 }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Reset Onboarding (Test)</Text>
                    </TouchableOpacity> */}

                </View>

                {/* --- COMMUNITY --- */}
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Community</Text>
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <SettingRow
                        icon="share-social-outline"
                        title="Share App"
                        subtitle="Tell your friends about us"
                        onPress={handleShare}
                    />
                    <SettingRow
                        icon="star-outline"
                        title="Rate Us"
                        subtitle="Leave a review on Play Store"
                        onPress={() => Linking.openURL(PLAY_STORE_LINK)}
                    />
                </View>

                <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0 • Made with ❤️ in Ethiopia</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: SPACING.m,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        marginTop: SPACING.m,
        marginBottom: SPACING.l,
    },
    // Login Card
    loginCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginBottom: 24,
        borderWidth: 1,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    loginTitle: {
        fontSize: 15,
        fontFamily: FONTS.bold,
    },
    loginSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    loginBtn: {
        backgroundColor: '#10B981', // Kept your Emerald Primary
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 100,
    },
    loginBtnText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: FONTS.bold,
    },
    // Theme Row
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    themeText: {
        fontSize: 15,
        fontFamily: FONTS.medium,
    },
    // Section
    sectionHeader: {
        fontSize: 12,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    section: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 24,
    },
    version: {
        textAlign: 'center',
        fontSize: 11,
        marginTop: 10,
        opacity: 0.5,
    },
});