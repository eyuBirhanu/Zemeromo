import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function HomeHeader() {
    const navigation = useNavigation<any>();
    const colors = useThemeColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {/* Left: Greeting & Logo */}
            <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>Selam, Wegene 👋</Text>
                <View style={styles.logoRow}>
                    <Text style={[styles.brandText, { color: colors.text }]}>
                        Zeme
                        {/* FIX: Use Primary (Emerald) in light mode for readability, Accent (Lime) in dark */}
                        <Text style={{ color: colors.isDark ? colors.accent : colors.primary }}>
                            romo
                        </Text>
                    </Text>
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                </View>
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
                    style={[styles.profileBtn, { borderColor: colors.isDark ? colors.accent : colors.primary }]}
                    onPress={() => navigation.navigate('Profile')}
                >
                    {/* Placeholder Avatar */}
                    <View style={[styles.avatar, { backgroundColor: colors.isDark ? colors.accent : colors.primary }]}>
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
        paddingTop: SPACING.xl, // Safe area top
        paddingBottom: SPACING.m,
    },
    greeting: {
        fontFamily: FONTS.medium,
        fontSize: 12,
        marginBottom: 2,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    brandText: {
        fontFamily: FONTS.bold,
        fontSize: 24,
        letterSpacing: -0.5,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 5,
        marginLeft: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        padding: 2,
        borderWidth: 1.5,
    },
    avatar: {
        flex: 1,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    }
});