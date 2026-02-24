import React, { useState } from 'react';
import {
    View, Text, Image, TouchableOpacity, StyleSheet,
    StatusBar, FlatList, ActivityIndicator, Share
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

import { COLORS, SPACING, FONTS } from '../constants/theme';
import SongRow from '../components/shared/SongRow';
import { Song } from '../types/api';
import { usePlayerStore } from '../store/playerStore';

const fetchAlbumDetails = async (id: string) => {
    const albumRes = await api.get(`/albums/${id}`);
    const songsRes = await api.get(`/songs?albumId=${id}`);
    return { ...albumRes.data.data, songs: songsRes.data.data };
};

export default function AlbumDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params;
    const { playSongList, currentSong, isPlaying, playSong, pauseSound, resumeSound } = usePlayerStore();
    const [isFavorite, setIsFavorite] = useState(false);

    const { data: album, isLoading, isError } = useQuery({
        queryKey: ['album', id],
        queryFn: () => fetchAlbumDetails(id),
    });

    const handlePlayPause = (song: Song, index: number) => {
        if (currentSong?._id === song._id) {
            if (isPlaying) pauseSound();
            else resumeSound();
        } else {
            playSongList(album.songs, index);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Listen to ${album.title} by ${album.artistId?.name} on Zemeromo!`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    if (isError || !album) {
        return (
            <View style={styles.center}>
                <Text style={{ color: COLORS.dark.textSecondary }}>Album not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: COLORS.accent, fontFamily: FONTS.bold }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderHeader = () => (
        <View>
            {/* --- ARTWORK --- */}
            <View style={styles.artWrapper}>
                <Image source={{ uri: album.coverImageUrl }} style={styles.coverImage} />
                <LinearGradient
                    colors={['transparent', COLORS.dark.bg]}
                    style={styles.gradientOverlay}
                />

                {/* Navbar inside Header for z-index */}
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
                        <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- INFO --- */}
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{album.title}</Text>

                <View style={styles.artistRow}>
                    <Image
                        source={{ uri: album.artistId?.imageUrl || 'https://via.placeholder.com/50' }}
                        style={styles.artistAvatar}
                    />
                    <Text style={styles.artistName}>
                        {album.artistId?.name || "Unknown"}
                    </Text>
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{album.genre || "Gospel"}</Text>
                    <Text style={styles.dot}> • </Text>
                    <Text style={styles.metaText}>{album.releaseYear || "2024"}</Text>
                    <Text style={styles.dot}> • </Text>
                    <Text style={styles.metaText}>{album.churchId?.name || "Church"}</Text>
                </View>

                {/* --- ACTIONS --- */}
                <View style={styles.actionBar}>
                    <View style={styles.leftActions}>
                        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} style={styles.actionBtn}>
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={28}
                                color={isFavorite ? COLORS.accent : COLORS.white}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                            <Ionicons name="share-social-outline" size={26} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* PLAY ALL FAB */}
                    <TouchableOpacity
                        style={styles.playButton}
                        activeOpacity={0.9}
                        onPress={() => {
                            if (album.songs.length > 0) playSongList(album.songs, 0);
                        }}
                    >
                        <Ionicons name="play" size={32} color={COLORS.black} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <FlatList
                data={album.songs}
                keyExtractor={item => item._id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <SongRow
                        title={item.title}
                        artist={item.artistId?.name || album.artistId?.name}
                        coverImage={item.thumbnailUrl || album.coverImageUrl}
                        duration={item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : undefined}
                        isPlaying={isPlaying && currentSong?._id === item._id}
                        onRowPress={() => navigation.navigate('SongDetail', { id: item._id, song: item })}
                        onPlayPause={() => handlePlayPause(item, index)}
                    />
                )}
            // Removed Footer as requested
            />
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.dark.bg,
    },
    // Navbar
    navBar: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        zIndex: 10,
    },
    iconBtn: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Art
    artWrapper: {
        width: '100%',
        height: 380,
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 250,
    },
    // Info
    infoContainer: {
        paddingHorizontal: SPACING.m,
        marginTop: -60, // Pull up over the image
        paddingBottom: SPACING.l,
    },
    title: {
        color: COLORS.white,
        fontSize: 30,
        fontFamily: FONTS.bold,
        marginBottom: 8,
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    artistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    artistAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.white,
    },
    artistName: {
        color: COLORS.white,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    metaText: {
        color: COLORS.dark.textSecondary,
        fontSize: 13,
        fontFamily: FONTS.regular,
    },
    dot: {
        color: COLORS.dark.textSecondary,
        marginHorizontal: 4,
    },
    // Actions
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    leftActions: {
        flexDirection: 'row',
        gap: 20,
    },
    actionBtn: {
        padding: 4,
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    }
});