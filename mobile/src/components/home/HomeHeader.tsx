import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface Props {
    isLoading?: boolean;
}

// --- SKELETON ---
const Skeleton = ({ style }: { style: any }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;
    const colors = useThemeColors();
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, [opacity]);
    return <Animated.View style={[style, { backgroundColor: colors.isDark ? '#333333' : '#E0E0E0', opacity }]} />;
};

export default function HomeHeader({ isLoading }: Props) {
    const navigation = useNavigation<any>();
    const colors = useThemeColors();

    // Time-based greeting logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.bg }]}>
                <View>
                    <Skeleton style={{ width: 100, height: 14, borderRadius: 4, marginBottom: 6 }} />
                    <Skeleton style={{ width: 180, height: 24, borderRadius: 6 }} />
                </View>
                <View style={styles.actions}>
                    <Skeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
                    <Skeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {/* Left: Greeting & Welcome */}
            <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()},</Text>
                <Text style={[styles.welcomeText, { color: colors.text }]}>
                    Welcome to <Text style={[styles.brandText, { color: colors.isDark ? colors.accent : colors.primary }]}>Zemeromo</Text>
                </Text>
            </View>

            {/* Right: Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => navigation.navigate('Browse')}
                >
                    <Ionicons name="search-outline" size={22} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.profileBtn, { borderColor: colors.primary }]}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Ionicons name="person" size={16} color={colors.isDark ? colors.black : colors.white} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.m,
    },
    greeting: {
        fontFamily: FONTS.medium,
        fontSize: 13,
        marginBottom: 2,
    },
    welcomeText: {
        fontFamily: FONTS.bold,
        fontSize: 18,
        letterSpacing: -0.5,
    },
    brandText: {
        fontFamily: 'serif',
    },
    actions: { flexDirection: 'row', gap: 12 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    profileBtn: { width: 40, height: 40, borderRadius: 20, padding: 2, borderWidth: 1.5 },
    avatar: { flex: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});