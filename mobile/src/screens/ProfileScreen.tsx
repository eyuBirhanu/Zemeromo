import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Share, StatusBar, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, FONTS } from '../constants/theme';
import SettingRow from '../components/profile/SettingRow';

const PLAY_STORE_LINK = "https://play.google.com/store/apps/details?id=com.eyubirhanu.zemeromo";
const WEBSITE_URL = "https://zemeromo.com";

export default function ProfileScreen() {
    const navigation = useNavigation();

    // --- HANDLERS ---
    const openInAppBrowser = async (url: string) => {
        try {
            await WebBrowser.openBrowserAsync(url, {
                controlsColor: COLORS.accent,
                toolbarColor: '#1F2937',
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.dark.bg} />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                <Text style={styles.headerTitle}>Account</Text>

                {/* --- LOGIN PLACEHOLDER --- */}
                <View style={styles.loginCard}>
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={24} color={COLORS.dark.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.loginTitle}>Sign in to Zemeromo</Text>
                        <Text style={styles.loginSubtitle}>Sync your favorites and playlists.</Text>
                    </View>
                    <TouchableOpacity onPress={handleLoginAlert} style={styles.loginBtn}>
                        <Text style={styles.loginBtnText}>Sign In</Text>
                    </TouchableOpacity>
                </View>



                {/* --- GENERAL SETTINGS --- */}
                <Text style={styles.sectionHeader}>General</Text>
                <View style={styles.section}>
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
                </View>

                {/* --- COMMUNITY --- */}
                <Text style={styles.sectionHeader}>Community</Text>
                <View style={styles.section}>
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

                <Text style={styles.version}>Version 1.0.0 • Made with ❤️ in Ethiopia</Text>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark.bg,
        paddingHorizontal: SPACING.m,
    },
    headerTitle: {
        fontSize: 28, // Reduced from 34
        fontFamily: FONTS.bold,
        color: COLORS.white,
        marginTop: SPACING.m,
        marginBottom: SPACING.l,
    },
    // Login Card
    loginCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.dark.surface,
        padding: 14, // Reduced padding
        borderRadius: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.dark.border,
    },
    avatarPlaceholder: {
        width: 44, // Reduced from 50
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.dark.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    loginTitle: {
        color: COLORS.white,
        fontSize: 15, // Reduced from 16
        fontFamily: FONTS.bold,
    },
    loginSubtitle: {
        color: COLORS.dark.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    loginBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 14,
        paddingVertical: 6, // Slimmer button
        borderRadius: 100,
    },
    loginBtnText: {
        color: COLORS.white,
        fontSize: 11,
        fontFamily: FONTS.bold,
    },
    // Section
    sectionHeader: {
        color: COLORS.dark.textSecondary,
        fontSize: 12, // Reduced from 13
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    section: {
        backgroundColor: COLORS.dark.surface,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 24,
    },
    version: {
        textAlign: 'center',
        color: COLORS.dark.textSecondary,
        fontSize: 11,
        marginTop: 10,
        opacity: 0.5,
    },
});