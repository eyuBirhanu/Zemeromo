import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme & Store
import { FONTS } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors'; // <--- NEW HOOK
import { usePlayerStore } from '../store/playerStore';

// Components
import MiniPlayer from '../components/player/MiniPlayer';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    const insets = useSafeAreaInsets();
    const { currentSong } = usePlayerStore();
    const colors = useThemeColors(); // <--- Get Dynamic Colors

    // Height calculation: Standard 60px + Bottom SafeArea
    const TAB_HEIGHT = 60 + insets.bottom;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>

            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarStyle: {
                        height: TAB_HEIGHT,
                        backgroundColor: colors.bg, // Dynamic Background
                        borderTopWidth: 1,
                        borderTopColor: colors.border, // Dynamic Border
                        paddingTop: 8,
                        paddingBottom: insets.bottom,
                        elevation: 0,
                        shadowOpacity: 0, // Remove shadow on iOS for clean look
                    },
                    tabBarActiveTintColor: colors.primary, // Emerald in Light, Emerald in Dark
                    tabBarInactiveTintColor: colors.textSecondary,
                    tabBarLabelStyle: {
                        fontFamily: FONTS.medium,
                        fontSize: 10,
                        marginTop: 4,
                    }
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                        )
                    }}
                />
                <Tab.Screen
                    name="Browse"
                    component={SearchScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />
                        )
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                        )
                    }}
                />
            </Tab.Navigator>

            {/* --- MINI PLAYER DOCKED --- */}
            {currentSong && (
                <View style={[styles.playerContainer, { bottom: TAB_HEIGHT }]}>
                    <MiniPlayer />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    playerContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 100,
    }
});