import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SPACING, FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface SearchResultRowProps {
    item: any;
    onPress: (item: any) => void;
    onPlayPress: (item: any) => void;
}

export default function SearchResultRow({ item, onPress, onPlayPress }: SearchResultRowProps) {
    const colors = useThemeColors();

    const rawType = item.type || 'Song';
    const type = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
    const isArtist = type === 'Artist';
    const isChurch = type === 'Church';
    const isAlbum = type === 'Album';
    const isSong = type === 'Song';

    // --- CHECK AUDIO AVAILABILITY ---
    // Safely check if audioUrl exists and is not empty
    const hasAudio = isSong && item.audioUrl && typeof item.audioUrl === 'string' && item.audioUrl.trim().length > 0;

    const imageUri = item.image || item.imageUrl || item.coverImageUrl || item.thumbnailUrl;

    const getSubtitle = () => {
        const parts = [];
        if (isSong) {
            if (item.artistId?.name) parts.push(item.artistId.name);
            else if (item.artist) parts.push(item.artist);
            if (item.albumId?.title) parts.push(item.albumId.title);
        } else if (isArtist) {
            if (item.churchId?.name) parts.push(item.churchId.name);
            else parts.push("Artist");
        } else if (isAlbum) {
            if (item.artistId?.name) parts.push(item.artistId.name);
            else parts.push("Album");
        } else if (isChurch) {
            if (item.location) parts.push(item.location);
            else parts.push("Congregation");
        }
        return parts.join(' • ');
    };

    return (
        <TouchableOpacity
            style={[styles.container, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            {/* LEFT: IMAGE */}
            <View style={[
                styles.imageContainer,
                isArtist && styles.roundImage,
                isChurch && styles.churchImage,
                { backgroundColor: colors.surface, borderColor: colors.border }
            ]}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.placeholder, { backgroundColor: colors.surfaceLight }]}>
                        {isChurch && <MaterialCommunityIcons name="church" size={22} color={colors.textSecondary} />}
                        {isArtist && <Feather name="mic" size={22} color={colors.textSecondary} />}
                        {isAlbum && <Ionicons name="disc-outline" size={22} color={colors.textSecondary} />}
                        {isSong && <Ionicons name="musical-notes" size={22} color={colors.textSecondary} />}
                    </View>
                )}
            </View>

            {/* MIDDLE: INFO */}
            <View style={styles.info}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {item.title || item.name}
                </Text>

                <View style={styles.metaRow}>
                    <Text style={[
                        styles.typeText,
                        isChurch ? { color: '#60A5FA' } :
                            isArtist ? { color: '#F472B6' } :
                                { color: colors.primary }
                    ]}>
                        {type.toUpperCase()}
                    </Text>

                    <Text style={[styles.dot, { color: colors.textSecondary }]}> • </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                        {getSubtitle()}
                    </Text>
                </View>
            </View>

            {/* RIGHT: ACTION */}
            <View style={styles.action}>
                {isSong ? (
                    hasAudio ? (
                        // CASE 1: Song WITH Audio -> Show Play Button
                        <TouchableOpacity
                            onPress={(e) => { e.stopPropagation(); onPlayPress(item); }}
                            style={[styles.playBtn, { backgroundColor: colors.accent }]}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="play" size={16} color={colors.black} style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                    ) : (
                        // CASE 2: Song WITHOUT Audio -> Show Script Icon (Lyrics only)
                        <View style={styles.iconWrapper}>
                            <MaterialCommunityIcons name="script-text-outline" size={20} color={colors.textSecondary} />
                        </View>
                    )
                ) : (
                    // CASE 3: Not a Song (Artist/Album) -> Show Chevron
                    <Ionicons name="chevron-forward" size={18} color={colors.border} />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: SPACING.m, borderBottomWidth: 1 },
    imageContainer: { width: 52, height: 52, borderRadius: 8, overflow: 'hidden', borderWidth: 1 },
    roundImage: { borderRadius: 26 },
    churchImage: { borderRadius: 12 },
    image: { width: '100%', height: '100%' },
    placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1, marginLeft: 14, justifyContent: 'center' },
    title: { fontSize: 16, fontFamily: FONTS.medium, marginBottom: 3, letterSpacing: -0.2 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    typeText: { fontSize: 10, fontFamily: FONTS.bold, letterSpacing: 0.5 },
    dot: { fontSize: 10, marginHorizontal: 2 },
    subtitle: { fontSize: 12, fontFamily: FONTS.regular, maxWidth: '85%' },
    action: { marginLeft: 12, justifyContent: 'center', alignItems: 'center', minWidth: 40 },
    playBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    iconWrapper: { alignItems: 'center', justifyContent: 'center' }
});