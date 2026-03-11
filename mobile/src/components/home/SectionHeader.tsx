import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SPACING, FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface Props {
    title: string;
    onSeeAll?: () => void;
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

export default function SectionHeader({ title, onSeeAll, isLoading }: Props) {
    const colors = useThemeColors();

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Skeleton style={{ width: 120, height: 20, borderRadius: 4 }} />
                {onSeeAll && <Skeleton style={{ width: 50, height: 14, borderRadius: 4 }} />}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} hitSlop={10}>
                    <Text style={[styles.action, { color: colors.primary }]}>See all</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.m,
        marginTop: SPACING.l,
        marginBottom: SPACING.m,
    },
    title: { fontSize: 18, fontFamily: FONTS.bold, letterSpacing: -0.2 },
    action: { fontSize: 13, fontFamily: FONTS.medium },
});