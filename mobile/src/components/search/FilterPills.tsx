import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { SPACING, FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

const FILTERS = ["All", "Song", "Artist", "Album", "Church"];

interface FilterPillsProps {
    activeFilter: string;
    onSelect: (filter: string) => void;
}

export default function FilterPills({ activeFilter, onSelect }: FilterPillsProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >
                {FILTERS.map((filter) => {
                    const isActive = activeFilter === filter;
                    return (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => onSelect(filter)}
                            activeOpacity={0.8}
                            style={[
                                styles.pill,
                                isActive
                                    ? { backgroundColor: colors.primary } // Emerald
                                    : { backgroundColor: colors.surface } // Surface color
                            ]}
                        >
                            <Text style={[
                                styles.text,
                                isActive
                                    ? { color: colors.white }
                                    : { color: colors.textSecondary }
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginBottom: SPACING.m },
    container: { paddingHorizontal: SPACING.m, paddingVertical: 4 },
    pill: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 100,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    text: {
        fontSize: 13,
        fontFamily: FONTS.medium,
        letterSpacing: 0.2,
    },
});