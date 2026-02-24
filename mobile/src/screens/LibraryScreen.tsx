// import React, { useEffect, useState, useMemo } from 'react';
// import { View, FlatList, StyleSheet, StatusBar, Text, Modal, TouchableOpacity } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Feather } from '@expo/vector-icons';
// import * as MediaLibrary from 'expo-media-library';
// import { useNavigation } from '@react-navigation/native';

// // Components & Theme
// import LibraryHeader from '../components/library/LibraryHeader';
// import SongRow from '../components/shared/SongRow';
// import { COLORS, SPACING } from '../constants/theme';

// // Services
// import { usePlayerStore } from '../store/playerStore';

// type Tab = 'Local' | 'Downloads';
// type SortOption = 'Newest' | 'A-Z';

// // Mock Downloads (Replace with actual service)
// const MOCK_DOWNLOADS = [
//     { _id: 'd1', title: 'Downloaded Song A', artist: { name: 'Artist A' }, audioUrl: 'file://...', duration: 260, modificationTime: Date.now() - 10000, thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000' },
//     { _id: 'd2', title: 'Downloaded Song B', artist: { name: 'Artist B' }, audioUrl: 'file://...', duration: 190, modificationTime: Date.now(), thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000' },
// ];

// export default function LibraryScreen() {
//     const navigation = useNavigation<any>();
//     const { isPlaying, currentSong, playSong, pauseSound, resumeSound, playSongList } = usePlayerStore();

//     const [activeTab, setActiveTab] = useState<Tab>('Downloads');
//     const [sortOption, setSortOption] = useState<SortOption>('Newest');
//     const [isSortVisible, setIsSortVisible] = useState(false);

//     const [localSongs, setLocalSongs] = useState<any[]>([]);
//     const [downloadedSongs, setDownloadedSongs] = useState<any[]>(MOCK_DOWNLOADS);
//     const [loading, setLoading] = useState(false);

//     // --- FETCH LOGIC ---
//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 if (activeTab === 'Local') {
//                     const { status } = await MediaLibrary.requestPermissionsAsync();
//                     if (status === 'granted') {
//                         const media = await MediaLibrary.getAssetsAsync({
//                             mediaType: 'audio',
//                             sortBy: MediaLibrary.SortBy.creationTime
//                         });
//                         setLocalSongs(media.assets);
//                     }
//                 } else {
//                     // In real app: const data = await DownloadService.getDownloadedSongs();
//                     // For now, using mock.
//                     setDownloadedSongs(MOCK_DOWNLOADS);
//                 }
//             } catch (e) { console.error(e); }
//             finally { setLoading(false); }
//         };
//         fetchData();
//     }, [activeTab]);

//     // --- SORT LOGIC ---
//     const sortedData = useMemo(() => {
//         const data = activeTab === 'Local' ? localSongs : downloadedSongs;

//         return [...data].sort((a, b) => {
//             if (sortOption === 'A-Z') {
//                 const titleA = a.filename || a.title;
//                 const titleB = b.filename || b.title;
//                 return titleA.localeCompare(titleB);
//             }
//             // Newest First
//             return b.modificationTime - a.modificationTime;
//         });
//     }, [localSongs, downloadedSongs, activeTab, sortOption]);

//     // --- PLAY LOGIC ---
//     const handlePlayPause = (song: any, index: number) => {
//         if (isPlaying && currentSong?._id === song._id) {
//             pauseSound();
//         } else if (!isPlaying && currentSong?._id === song._id) {
//             resumeSound();
//         } else {
//             // Map the format to what PlayerStore expects
//             const playlist = sortedData.map(item => ({
//                 _id: item.id || item._id,
//                 title: item.title || item.filename,
//                 artistId: item.artistId || { name: item.artist?.name || 'Device Audio' },
//                 audioUrl: item.uri || item.audioUrl,
//                 thumbnailUrl: item.thumbnailUrl || null,
//                 duration: item.duration * 1000 // Convert seconds to millis
//             }));
//             playSongList(playlist, index);
//         }
//     };

//     const goToSongDetail = (song: any) => {
//         navigation.navigate('SongDetail', { id: song._id }); // Pass ID for lyric screen
//     };

//     // --- RENDERERS ---
//     const renderSkeleton = () => (
//         <View style={{ paddingHorizontal: SPACING.m }}>
//             {[1, 2, 3, 4, 5].map(i => (
//                 <View key={i} style={styles.skeletonRow}>
//                     <View style={styles.skeletonImage} />
//                     <View style={{ gap: 8, flex: 1 }}>
//                         <View style={styles.skeletonTextLine} />
//                         <View style={[styles.skeletonTextLine, { width: '40%' }]} />
//                     </View>
//                 </View>
//             ))}
//         </View>
//     );

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar barStyle="light-content" backgroundColor={COLORS.dark.bg} />

//             <LibraryHeader
//                 activeTab={activeTab}
//                 onTabChange={setActiveTab}
//                 onSortPress={() => setIsSortVisible(true)}
//             />

//             {loading ? renderSkeleton() : (
//                 <FlatList
//                     data={sortedData}
//                     keyExtractor={item => item.id || item._id}
//                     renderItem={({ item, index }) => { // <-- FIX: Destructure 'index' here
//                         const durationSec = Math.floor(item.duration);
//                         return (
//                             <SongRow
//                                 title={item.title || item.filename.replace('.mp3', '')}
//                                 artist={activeTab === 'Local' ? 'Device Audio' : item.artist?.name || "Unknown"}
//                                 coverImage={item.thumbnailUrl || ""}
//                                 duration={`${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`}
//                                 isPlaying={isPlaying && currentSong?._id === (item.id || item._id)}
//                                 onRowPress={() => goToSongDetail(item)}
//                                 onPlayPause={() => handlePlayPause(item, index)} // <-- Pass 'index' here
//                             />
//                         );
//                     }}
//                     contentContainerStyle={{ paddingBottom: 100 }}
//                     ListEmptyComponent={
//                         <View style={styles.empty}>
//                             <Feather name="download-cloud" size={40} color={COLORS.dark.textSecondary} />
//                             <Text style={styles.emptyText}>No music found here.</Text>
//                             <Text style={styles.emptySub}>Songs you download will appear here.</Text>
//                         </View>
//                     }
//                 />
//             )}

//             {/* Sort Modal */}
//             <Modal visible={isSortVisible} transparent animationType="fade">
//                 <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsSortVisible(false)}>
//                     <View style={styles.modalContent}>
//                         <Text style={styles.modalTitle}>Sort By</Text>
//                         {['Newest', 'A-Z'].map((opt) => (
//                             <TouchableOpacity
//                                 key={opt}
//                                 style={styles.sortOption}
//                                 onPress={() => { setSortOption(opt as SortOption); setIsSortVisible(false); }}
//                             >
//                                 <Text style={[styles.sortText, sortOption === opt && { color: COLORS.accent }]}>{opt}</Text>
//                                 {sortOption === opt && <Feather name="check" size={18} color={COLORS.accent} />}
//                             </TouchableOpacity>
//                         ))}
//                     </View>
//                 </TouchableOpacity>
//             </Modal>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: COLORS.dark.bg },
//     skeletonRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.m, marginBottom: 20 },
//     skeletonImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: COLORS.dark.surface, marginRight: 14, opacity: 0.5 },
//     skeletonTextLine: { height: 12, borderRadius: 6, backgroundColor: COLORS.dark.surface, opacity: 0.5 },
//     empty: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
//     emptyText: { color: COLORS.dark.text, marginTop: 16, fontSize: 18, fontWeight: 'bold' },
//     emptySub: { color: COLORS.dark.textSecondary, marginTop: 4 },
//     modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
//     modalContent: { backgroundColor: COLORS.dark.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.l },
//     modalTitle: { color: COLORS.dark.text, fontSize: 18, fontWeight: 'bold', marginBottom: SPACING.m },
//     sortOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.dark.border },
//     sortText: { color: COLORS.dark.text, fontSize: 16 },
// });