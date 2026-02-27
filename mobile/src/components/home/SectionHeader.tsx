import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SPACING, FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface Props {
    title: string;
    onSeeAll?: () => void;
}

export default function SectionHeader({ title, onSeeAll }: Props) {
    const colors = useThemeColors();

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
        alignItems: 'flex-end', // Aligns text to the baseline
        paddingHorizontal: SPACING.m,
        marginTop: SPACING.l,
        marginBottom: SPACING.m,
    },
    title: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        letterSpacing: -0.2,
    },
    action: {
        fontSize: 13,
        fontFamily: FONTS.medium,
    },
});