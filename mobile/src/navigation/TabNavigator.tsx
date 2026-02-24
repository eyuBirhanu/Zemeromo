import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Theme
import { COLORS, FONTS } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';

// Components
import MiniPlayer from '../components/MiniPlayer';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
// import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    const insets = useSafeAreaInsets();
    const { currentSong } = usePlayerStore();

    // Height calculation: Standard 60px + Bottom SafeArea
    const TAB_HEIGHT = 60 + insets.bottom;

    return (
        <View style={styles.container}>

            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarStyle: {
                        height: TAB_HEIGHT,
                        backgroundColor: COLORS.dark.bg, // Match main background for seamless look
                        borderTopWidth: 1,
                        borderTopColor: COLORS.dark.border,
                        paddingTop: 8,
                        paddingBottom: insets.bottom,
                        elevation: 0, // Remove Android shadow
                    },
                    tabBarActiveTintColor: COLORS.accent, // Lime for active
                    tabBarInactiveTintColor: COLORS.dark.textSecondary,
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
                {/* 
                <Tab.Screen 
                    name="Library" 
                    component={LibraryScreen} 
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons name={focused ? "musical-notes" : "musical-notes-outline"} size={24} color={color} />
                        )
                    }}
                /> 
                */}
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
            {/* It sits absolutely above the tab bar */}
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
        backgroundColor: COLORS.dark.bg,
        position: 'relative', // Necessary for absolute positioning of player
    },
    playerContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 100, // Ensure it floats above page content
    }
});