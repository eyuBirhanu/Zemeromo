import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeColors } from '../hooks/useThemeColors'; // Theme Hook

// Screens
import TabNavigator from './TabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';
import AlbumDetailScreen from '../screens/AlbumDetailScreen';
import ChurchDetailScreen from '../screens/ChurchDetailScreen';
import SongDetailScreen from '../screens/SongDetailScreen';
import PlayerScreen from '../screens/PlayerScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const hasSeenOnboarding = useSettingsStore((state) => state.hasSeenOnboarding);
    const [isReady, setIsReady] = useState(false);
    const colors = useThemeColors(); // Get Theme Colors

    // Wait for hydration (Zustand persist)
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 50);
        return () => clearTimeout(timer);
    }, []);

    if (!isReady) {
        // Theme-aware loading screen
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={hasSeenOnboarding ? "MainTabs" : "Onboarding"}
        >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
            <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
            <Stack.Screen name="ChurchDetail" component={ChurchDetailScreen} />
            <Stack.Screen name="SongDetail" component={SongDetailScreen} />
            <Stack.Screen
                name="Player"
                component={PlayerScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
        </Stack.Navigator>
    );
}