import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants/theme';

interface Props {
    title: string;
    onSeeAll?: () => void;
}

export default function SectionHeader({ title, onSeeAll }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            {onSeeAll && (
                <TouchableOpacity onPress={onSeeAll} hitSlop={10}>
                    <Text style={styles.action}>See all</Text>
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
        color: COLORS.dark.text,
        fontSize: 18,
        fontFamily: FONTS.bold,
        letterSpacing: -0.2,
    },
    action: {
        color: COLORS.primary, // Emerald Green
        fontSize: 13,
        fontFamily: FONTS.medium,
    },
});