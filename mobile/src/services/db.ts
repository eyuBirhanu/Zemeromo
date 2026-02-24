import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ CHANGE THIS TO YOUR IP
const API_URL = "http://192.168.42.244:5000/api";

export const LocalDB = {
    getSongs: async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('songs');
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) { return []; }
    },

    syncWithServer: async () => {
        try {
            const response = await fetch(`${API_URL}/content/feed`);
            const data = await response.json();
            if (data.success) {
                await AsyncStorage.setItem('songs', JSON.stringify(data.data));
                return data.data;
            }
        } catch (error) {
            console.log("Offline mode");
        }
    }
};