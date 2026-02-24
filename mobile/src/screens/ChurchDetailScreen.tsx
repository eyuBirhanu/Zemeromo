import React from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, Linking, FlatList, ActivityIndicator, Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';

import api from '../lib/api';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import ArtistCard from '../components/home/ArtistCard';
import { IChurch, Artist } from '../types/api';

// --- TYPES ---
interface ChurchDetailData extends IChurch {
    teams: Artist[];
}

// --- FETCHER ---
const fetchChurchDetails = async (churchId: string): Promise<ChurchDetailData> => {
    const [churchRes, teamsRes] = await Promise.all([
        api.get(`/churches/${churchId}`),
        api.get(`/artists?churchId=${churchId}`)
    ]);

    return {
        ...churchRes.data.data,
        teams: teamsRes.data.data || []
    };
};

export default function ChurchDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id, title: placeholderTitle, image: placeholderImage } = route.params || {};

    const { data: church, isLoading, isError } = useQuery({
        queryKey: ['church', id],
        queryFn: () => fetchChurchDetails(id),
        enabled: !!id,
    });

    // --- HANDLERS ---
    const handleCall = () => {
        if (church?.contactPhone) Linking.openURL(`tel:${church.contactPhone}`);
    };

    const handleDirections = () => {
        if (!church) return;
        const query = `${church.name}, ${church.address?.subCity || ''}, ${church.address?.city || ''}`;
        const url = Platform.select({
            ios: `maps:0,0?q=${query}`,
            android: `geo:0,0?q=${query}`,
        });
        if (url) Linking.openURL(url);
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    if (isError || !church) {
        return (
            <View style={styles.center}>
                <Text style={{ color: COLORS.dark.textSecondary }}>Church not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* --- HEADER --- */}
                <View style={styles.headerContainer}>
                    <Image
                        source={{ uri: church.coverImageUrl || placeholderImage || 'https://via.placeholder.com/600' }}
                        style={styles.headerImage}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(15, 19, 26, 0.4)', COLORS.dark.bg]}
                        style={styles.gradient}
                    />

                    {/* Back Button */}
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* --- PROFILE INFO --- */}
                <View style={styles.profileContainer}>
                    {/* Logo */}
                    <View style={styles.logoWrapper}>
                        {church.logoUrl ? (
                            <Image source={{ uri: church.logoUrl }} style={styles.logo} />
                        ) : (
                            <View style={[styles.logo, styles.placeholderLogo]}>
                                <MaterialCommunityIcons name="church" size={40} color={COLORS.dark.textSecondary} />
                            </View>
                        )}
                    </View>

                    {/* Text Info */}
                    <Text style={styles.name}>{church.name}</Text>

                    <View style={styles.badgeRow}>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>{church.denomination || "Ministry"}</Text>
                        </View>

                        <View style={styles.locationRow}>
                            <Ionicons name="location-sharp" size={14} color={COLORS.dark.textSecondary} />
                            <Text style={styles.locationText}>
                                {church.address?.city || "Ethiopia"}, {church.address?.subCity}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.primaryBtn, !church.contactPhone && { opacity: 0.5 }]}
                            onPress={handleCall}
                            disabled={!church.contactPhone}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="call" size={18} color={COLORS.black} />
                            <Text style={styles.primaryBtnText}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={handleDirections}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="map-outline" size={18} color={COLORS.white} />
                            <Text style={styles.secondaryBtnText}>Directions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- STATS --- */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{church.teams.length}</Text>
                        <Text style={styles.statLabel}>Choirs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{church.stats?.albumsCount || 0}</Text>
                        <Text style={styles.statLabel}>Albums</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{church.stats?.songsCount || 0}</Text>
                        <Text style={styles.statLabel}>Songs</Text>
                    </View>
                </View>

                {/* --- ABOUT --- */}
                {church.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.description} numberOfLines={4}>
                            {church.description}
                        </Text>
                    </View>
                )}

                {/* --- WORSHIP TEAMS --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Worship Teams</Text>
                    {church.teams.length === 0 ? (
                        <Text style={styles.emptyText}>No worship teams listed yet.</Text>
                    ) : (
                        <FlatList
                            data={church.teams}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item._id}
                            contentContainerStyle={{ paddingRight: SPACING.m }}
                            renderItem={({ item }) => (
                                <ArtistCard
                                    artist={{
                                        id: item._id,
                                        name: item.name,
                                        image: item.imageUrl,
                                        churchName: church.name, // We know they belong to this church
                                        albumCount: item.stats?.albumsCount || 0
                                    }}
                                    onPress={() => navigation.push('ArtistDetail', { id: item._id })}
                                />
                            )}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark.bg,
    },
    center: {
        flex: 1,
        backgroundColor: COLORS.dark.bg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Header
    headerContainer: {
        height: 240,
        width: '100%',
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        top: '40%',
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Profile
    profileContainer: {
        alignItems: 'center',
        marginTop: -60, // Pull up over header
        paddingHorizontal: SPACING.l,
    },
    logoWrapper: {
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    logo: {
        width: 110,
        height: 110,
        borderRadius: 55, // Circle
        borderWidth: 4,
        borderColor: COLORS.dark.bg,
        backgroundColor: COLORS.dark.surface,
    },
    placeholderLogo: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.dark.surfaceLight,
    },
    name: {
        color: COLORS.white,
        fontSize: 26,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    pill: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)', // Light Emerald
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    pillText: {
        color: COLORS.primary,
        fontSize: 12,
        fontFamily: FONTS.bold,
        textTransform: 'uppercase',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        color: COLORS.dark.textSecondary,
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
    // Actions
    actionRow: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
        marginBottom: 32,
    },
    primaryBtn: {
        flex: 1,
        backgroundColor: COLORS.accent, // Lime
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 48,
        borderRadius: 24,
        gap: 8,
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryBtnText: {
        color: COLORS.black,
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
    secondaryBtn: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 48,
        borderRadius: 24,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.dark.border,
    },
    secondaryBtnText: {
        color: COLORS.white,
        fontFamily: FONTS.medium,
        fontSize: 16,
    },
    // Stats
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.dark.border,
        borderTopWidth: 1,
        borderTopColor: COLORS.dark.border,
        paddingVertical: 16,
        marginHorizontal: SPACING.m,
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
        width: '30%',
    },
    statNum: {
        color: COLORS.white,
        fontSize: 20,
        fontFamily: FONTS.bold,
        marginBottom: 2,
    },
    statLabel: {
        color: COLORS.dark.textSecondary,
        fontSize: 11,
        fontFamily: FONTS.regular,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.dark.border,
        alignSelf: 'center',
    },
    // Content
    section: {
        paddingHorizontal: SPACING.m,
        marginBottom: 24,
    },
    sectionTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontFamily: FONTS.bold,
        marginBottom: 16,
    },
    description: {
        color: COLORS.dark.textSecondary,
        lineHeight: 22,
        fontSize: 14,
        fontFamily: FONTS.regular,
    },
    emptyText: {
        color: COLORS.dark.textSecondary,
        fontStyle: 'italic',
        fontFamily: FONTS.regular,
    }
});