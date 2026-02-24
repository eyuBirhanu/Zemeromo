import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

export default function HomeHeader() {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            {/* Left: Greeting & Logo */}
            <View>
                <Text style={styles.greeting}>Selam, Wegene 👋</Text>
                <View style={styles.logoRow}>
                    <Text style={styles.brandText}>
                        Zeme<Text style={styles.brandAccent}>romo</Text>
                    </Text>
                    <View style={styles.dot} />
                </View>
            </View>

            {/* Right: Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => navigation.navigate('Browse')}
                >
                    <Ionicons name="search-outline" size={22} color={COLORS.dark.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileBtn}
                    onPress={() => navigation.navigate('Profile')}
                >
                    {/* Placeholder Avatar */}
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={16} color={COLORS.dark.bg} />
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
        backgroundColor: COLORS.dark.bg,
    },
    greeting: {
        fontFamily: FONTS.medium,
        fontSize: 12,
        color: COLORS.dark.textSecondary,
        marginBottom: 2,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    brandText: {
        fontFamily: FONTS.bold,
        fontSize: 24,
        color: COLORS.dark.text,
        letterSpacing: -0.5,
    },
    brandAccent: {
        color: COLORS.accent, // Lime Pop
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 5,
        backgroundColor: COLORS.primary, // Emerald dot
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
        backgroundColor: COLORS.dark.surface,
        borderWidth: 1,
        borderColor: COLORS.dark.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        padding: 2,
        borderWidth: 1.5,
        borderColor: COLORS.accent, // Lime border ring
    },
    avatar: {
        flex: 1,
        backgroundColor: COLORS.accent,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    }
});