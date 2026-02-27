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
import { SPACING, FONTS } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors'; // THEME HOOK
import ArtistCard from '../components/home/ArtistCard';
import { IChurch, Artist } from '../types/api';

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

export default function ChurchDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id, title: placeholderTitle, image: placeholderImage } = route.params || {};
    const colors = useThemeColors();

    const { data: church, isLoading, isError } = useQuery({
        queryKey: ['church', id],
        queryFn: () => fetchChurchDetails(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // Cache for 5 mins
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

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.bg }]}>
                <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (isError || !church) {
        return (
            <View style={[styles.center, { backgroundColor: colors.bg }]}>
                <Text style={{ color: colors.textSecondary }}>Church not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary, fontFamily: FONTS.bold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* --- HEADER --- */}
                <View style={styles.headerContainer}>
                    <Image
                        source={{ uri: church.coverImageUrl || placeholderImage || 'https://via.placeholder.com/600' }}
                        style={styles.headerImage}
                    />
                    {/* Always Dark Gradient for text readability */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)', colors.bg]}
                        style={styles.gradient}
                    />

                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* --- PROFILE INFO --- */}
                <View style={styles.profileContainer}>
                    <View style={styles.logoWrapper}>
                        {church.logoUrl ? (
                            <Image source={{ uri: church.logoUrl }} style={[styles.logo, { borderColor: colors.bg }]} />
                        ) : (
                            <View style={[styles.logo, styles.placeholderLogo, { borderColor: colors.bg, backgroundColor: colors.surface }]}>
                                <MaterialCommunityIcons name="church" size={40} color={colors.textSecondary} />
                            </View>
                        )}
                    </View>

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

                    {/* Action Buttons */}
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
                        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={4}>
                            {church.description}
                        </Text>
                    </View>
                )}

                {/* --- WORSHIP TEAMS --- */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Worship Teams</Text>
                    {church.teams.length === 0 ? (
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No worship teams listed yet.</Text>
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
    headerContainer: { height: 240, width: '100%', position: 'relative' },
    headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    gradient: { ...StyleSheet.absoluteFillObject, top: '40%' },
    backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.3)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
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
    actionRow: { flexDirection: 'row', gap: 16, width: '100%', marginBottom: 32 },
    primaryBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 24, gap: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    primaryBtnText: { fontFamily: FONTS.bold, fontSize: 16 },
    secondaryBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 24, gap: 8, borderWidth: 1 },
    secondaryBtnText: { fontFamily: FONTS.medium, fontSize: 16 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderTopWidth: 1, paddingVertical: 16, marginHorizontal: SPACING.m, marginBottom: 24 },
    statItem: { alignItems: 'center', width: '30%' },
    statNum: { fontSize: 20, fontFamily: FONTS.bold, marginBottom: 2 },
    statLabel: { fontSize: 11, fontFamily: FONTS.regular, textTransform: 'uppercase', letterSpacing: 1 },
    statDivider: { width: 1, height: 30, alignSelf: 'center' },
    section: { paddingHorizontal: SPACING.m, marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontFamily: FONTS.bold, marginBottom: 16 },
    description: { lineHeight: 22, fontSize: 14, fontFamily: FONTS.regular },
    emptyText: { fontStyle: 'italic', fontFamily: FONTS.regular }
});