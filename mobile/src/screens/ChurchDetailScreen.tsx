import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, Linking, FlatList, Platform, Share, Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';

import api from '../lib/api';
import { SPACING, FONTS } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors';
import ArtistCard from '../components/home/ArtistCard';
import { IChurch, Artist } from '../types/api';
import { useFavoritesStore } from '../store/favoritesStore';

interface ChurchDetailData extends IChurch {
    teams: Artist[];
}

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

export default function ChurchDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id, title: placeholderTitle, image: placeholderImage } = route.params || {};
    const colors = useThemeColors();

    const [coverError, setCoverError] = useState(false);
    const [logoError, setLogoError] = useState(false);

    // Favorites Hook
    const { toggleFavorite, checkIsFavorite } = useFavoritesStore();
    const isFavorite = checkIsFavorite(id);

    const { data: church, isLoading, isError } = useQuery({
        queryKey: ['church', id],
        queryFn: () => fetchChurchDetails(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });

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

    const handleShare = async () => {
        if (!church) return;
        try {
            await Share.share({
                message: `Check out ${church.name} on Zemeromo! \n\nhttps://zemeromo.com/church/${id}`,
                title: `Share ${church.name}`
            });
        } catch (error) { console.log(error); }
    };

    // ==========================================
    // 1. SKELETON LOADING STATE
    // ==========================================
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.bg }]}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    {/* Header Image Skeleton */}
                    <View style={styles.headerContainer}>
                        <Skeleton style={styles.headerImage} />

                        {/* Fake Navbar */}
                        <View style={styles.navBar}>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                                <Ionicons name="chevron-back" size={24} color="white" />
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={styles.iconBtn}>
                                    <Ionicons name="heart-outline" size={22} color="white" />
                                </View>
                                <View style={styles.iconBtn}>
                                    <Ionicons name="share-social-outline" size={22} color="white" />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Profile Info Skeleton */}
                    <View style={styles.profileContainer}>
                        <View style={styles.logoWrapper}>
                            <Skeleton style={[styles.logo, { borderColor: colors.bg, backgroundColor: colors.bg }]} />
                        </View>

                        <Skeleton style={{ width: 200, height: 32, borderRadius: 8, marginBottom: 8 }} />
                        <Skeleton style={{ width: 150, height: 24, borderRadius: 12, marginBottom: 24 }} />

                        {/* Action Buttons Skeleton */}
                        <View style={styles.actionRow}>
                            <Skeleton style={styles.primaryBtn} />
                            <Skeleton style={styles.secondaryBtn} />
                        </View>
                    </View>

                    {/* Stats Skeleton */}
                    <View style={[styles.statsContainer, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                        {[1, 2, 3].map((item, index) => (
                            <React.Fragment key={item}>
                                <View style={styles.statItem}>
                                    <Skeleton style={{ width: 40, height: 24, borderRadius: 4, marginBottom: 6 }} />
                                    <Skeleton style={{ width: 60, height: 12, borderRadius: 4 }} />
                                </View>
                                {index < 2 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
                            </React.Fragment>
                        ))}
                    </View>

                    {/* About Skeleton */}
                    <View style={styles.section}>
                        <Skeleton style={{ width: 80, height: 24, borderRadius: 4, marginBottom: SPACING.m }} />
                        <Skeleton style={{ width: '100%', height: 14, borderRadius: 4, marginBottom: 8 }} />
                        <Skeleton style={{ width: '90%', height: 14, borderRadius: 4, marginBottom: 8 }} />
                        <Skeleton style={{ width: '95%', height: 14, borderRadius: 4, marginBottom: 8 }} />
                        <Skeleton style={{ width: '60%', height: 14, borderRadius: 4 }} />
                    </View>

                    {/* Worship Teams Horizontal Skeleton */}
                    <View style={styles.section}>
                        <Skeleton style={{ width: 140, height: 24, borderRadius: 4, marginBottom: SPACING.m }} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {[1, 2, 3].map((key) => (
                                <View key={key} style={{ marginRight: SPACING.m }}>
                                    {/* Using approx dimensions of an ArtistCard */}
                                    <Skeleton style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 8 }} />
                                    <Skeleton style={{ width: 100, height: 14, borderRadius: 4, alignSelf: 'center', marginBottom: 4 }} />
                                    <Skeleton style={{ width: 60, height: 12, borderRadius: 4, alignSelf: 'center' }} />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        );
    }

    // ==========================================
    // 2. ERROR STATE
    // ==========================================
    if (isError || !church) {
        return (
            <View style={[styles.center, { backgroundColor: colors.bg, paddingHorizontal: 20 }]}>
                <Ionicons name="alert-circle-outline" size={60} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                <Text style={{ color: colors.text, fontFamily: FONTS.bold, fontSize: 18 }}>Church not found</Text>
                <Text style={{ color: colors.textSecondary, fontFamily: FONTS.regular, marginTop: 8 }}>We couldn't load the details.</Text>

                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.goBackBtn, { backgroundColor: colors.primary }]}>
                    <Text style={{ color: '#fff', fontFamily: FONTS.bold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Determine if we have valid images to show
    const coverImageUrl = church.coverImageUrl || placeholderImage;
    const hasValidCover = coverImageUrl && !coverError;
    const hasValidLogo = church.logoUrl && !logoError;

    // ==========================================
    // 3. MAIN CONTENT
    // ==========================================
    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* --- HEADER IMAGE --- */}
                <View style={styles.headerContainer}>
                    {hasValidCover ? (
                        <Image
                            source={{ uri: coverImageUrl }}
                            style={styles.headerImage}
                            onError={() => setCoverError(true)}
                        />
                    ) : (
                        <LinearGradient
                            colors={[colors.primary, '#000']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.headerImage}
                        />
                    )}

                    <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={styles.topGradient} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)', colors.bg]} locations={[0, 0.6, 1]} style={styles.gradient} />

                    {/* Top Nav Actions */}
                    <View style={styles.navBar}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity style={styles.iconBtn} onPress={() => toggleFavorite(church, 'Church')}>
                                <Ionicons
                                    name={isFavorite ? "heart" : "heart-outline"}
                                    size={22}
                                    color={isFavorite ? colors.primary : "white"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                                <Ionicons name="share-social-outline" size={22} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* --- PROFILE INFO --- */}
                <View style={styles.profileContainer}>

                    {/* Logo */}
                    <View style={styles.logoWrapper}>
                        {hasValidLogo ? (
                            <Image
                                source={{ uri: church.logoUrl }}
                                style={[styles.logo, { borderColor: colors.bg }]}
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <View style={[styles.logo, styles.placeholderLogo, { borderColor: colors.bg, backgroundColor: colors.surface }]}>
                                <MaterialCommunityIcons name="church" size={40} color={colors.textSecondary} />
                            </View>
                        )}
                    </View>

                    {/* Text Info */}
                    <Text style={[styles.name, { color: colors.text }]}>{church.name}</Text>

                    <View style={styles.badgeRow}>
                        <View style={[styles.pill, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                            <Text style={[styles.pillText, { color: colors.primary }]}>{church.denomination || "Ministry"}</Text>
                        </View>

                        <View style={styles.locationRow}>
                            <Ionicons name="location-sharp" size={14} color={colors.textSecondary} />
                            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                                {church.address?.city || "Ethiopia"}, {church.address?.subCity}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons (Call & Directions) */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: colors.accent }, !church.contactPhone && { opacity: 0.5 }]}
                            onPress={handleCall}
                            disabled={!church.contactPhone}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="call" size={18} color={colors.black} />
                            <Text style={[styles.primaryBtnText, { color: colors.black }]}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryBtn, { borderColor: colors.border }]}
                            onPress={handleDirections}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="map-outline" size={18} color={colors.text} />
                            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Directions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- STATS --- */}
                <View style={[styles.statsContainer, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: colors.text }]}>{church.teams.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Choirs</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: colors.text }]}>{church.stats?.albumsCount || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Albums</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: colors.text }]}>{church.stats?.songsCount || 0}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Songs</Text>
                    </View>
                </View>

                {/* --- ABOUT --- */}
                {church.description && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={6}>
                            {church.description}
                        </Text>
                    </View>
                )}

                {/* --- WORSHIP TEAMS --- */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Worship Teams</Text>
                    {church.teams.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Feather name="users" size={40} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No teams yet</Text>
                            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>This church hasn't registered any worship teams.</Text>
                        </View>
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
                                        churchName: church.name,
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
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header
    headerContainer: { height: 280, width: '100%', position: 'relative' },
    headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 100 },
    gradient: { ...StyleSheet.absoluteFillObject, top: '20%' },

    navBar: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.m, zIndex: 10 },
    iconBtn: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

    // Profile
    profileContainer: { alignItems: 'center', marginTop: -60, paddingHorizontal: SPACING.l },
    logoWrapper: { marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
    logo: { width: 110, height: 110, borderRadius: 55, borderWidth: 4 },
    placeholderLogo: { justifyContent: 'center', alignItems: 'center' },

    name: { fontSize: 26, fontFamily: FONTS.bold, textAlign: 'center', marginBottom: 8, letterSpacing: -0.5 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
    pillText: { fontSize: 12, fontFamily: FONTS.bold, textTransform: 'uppercase' },

    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    locationText: { fontSize: 14, fontFamily: FONTS.medium },

    // Actions
    actionRow: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 32 },
    primaryBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 24, gap: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    primaryBtnText: { fontFamily: FONTS.bold, fontSize: 16 },
    secondaryBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 24, gap: 8, borderWidth: 1 },
    secondaryBtnText: { fontFamily: FONTS.medium, fontSize: 16 },

    // Stats
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderTopWidth: 1, paddingVertical: 16, marginHorizontal: SPACING.m, marginBottom: 24 },
    statItem: { alignItems: 'center', width: '30%' },
    statNum: { fontSize: 20, fontFamily: FONTS.bold, marginBottom: 2 },
    statLabel: { fontSize: 11, fontFamily: FONTS.regular, textTransform: 'uppercase', letterSpacing: 1 },
    statDivider: { width: 1, height: 30, alignSelf: 'center' },

    // Content
    section: { paddingHorizontal: SPACING.m, marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontFamily: FONTS.bold, marginBottom: 16 },
    description: { lineHeight: 22, fontSize: 14, fontFamily: FONTS.regular },

    // Empty & Misc
    emptyContainer: { alignItems: 'center', padding: 20, gap: 10, borderWidth: 1, borderColor: 'rgba(156, 163, 175, 0.2)', borderRadius: 16, borderStyle: 'dashed' },
    emptyTitle: { fontSize: 16, fontFamily: FONTS.bold },
    emptySub: { fontSize: 13, textAlign: 'center', fontFamily: FONTS.regular },
    goBackBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 }
});