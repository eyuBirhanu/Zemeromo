// import * as FileSystem from 'expo-file-system';

// export const downloadSong = async (songId: string, audioUrl: string) => {
//     try {
//         if (!FileSystem.documentDirectory) {
//             throw new Error("Device storage not available");
//         }

//         const fileUri = `${FileSystem.documentDirectory}${songId}.mp3`;

//         const info = await FileSystem.getInfoAsync(fileUri);
//         if (info.exists) return fileUri;

//         const downloadRes = await FileSystem.downloadAsync(audioUrl, fileUri);
//         return downloadRes.uri;
//     } catch (e) {
//         console.error("Download failed", e);
//         return null;
//     }
// };