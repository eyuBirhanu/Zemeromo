import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSettingsStore } from '../store/settingsStore';
import { COLORS } from '../constants/theme';

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
    // Zustand persist stores usually have a `hasHydrated` check if using newer versions,
    // but the simplest way is to rely on a local loading state if needed.
    // However, Zustand usually loads very fast from AsyncStorage.

    const hasSeenOnboarding = useSettingsStore((state) => state.hasSeenOnboarding);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Allow a tiny delay for storage hydration
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.dark.bg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.accent} />
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