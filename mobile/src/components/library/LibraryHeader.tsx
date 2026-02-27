import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SPACING, FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface LibraryHeaderProps {
    activeTab: 'Downloads' | 'Local';
    onTabChange: (tab: 'Downloads' | 'Local') => void;
    onSortPress: () => void;
}

export default function LibraryHeader({ activeTab, onTabChange, onSortPress }: LibraryHeaderProps) {
    const colors = useThemeColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Text style={[styles.title, { color: colors.text }]}>My Library</Text>

            <View style={styles.row}>
                {/* Tabs (Pills) */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        onPress={() => onTabChange('Downloads')}
                        style={[
                            styles.tab,
                            { borderColor: colors.border },
                            activeTab === 'Downloads' && { backgroundColor: colors.accent, borderColor: colors.accent }
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: colors.textSecondary },
                            activeTab === 'Downloads' && { color: colors.isDark ? '#000' : '#fff' }
                        ]}>
                            Downloads
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onTabChange('Local')}
                        style={[
                            styles.tab,
                            { borderColor: colors.border },
                            activeTab === 'Local' && { backgroundColor: colors.accent, borderColor: colors.accent }
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: colors.textSecondary },
                            activeTab === 'Local' && { color: colors.isDark ? '#000' : '#fff' }
                        ]}>
                            On Device
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Sort Button */}
                <TouchableOpacity onPress={onSortPress} style={[styles.sortBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Feather name="list" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.l,
        paddingBottom: SPACING.s,
    },
    title: {
        fontSize: 28,
        fontFamily: FONTS.bold,
        marginBottom: SPACING.m,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tabs: {
        flexDirection: 'row',
        gap: 10,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 100,
        borderWidth: 1,
    },
    tabText: {
        fontSize: 13,
        fontFamily: FONTS.medium,
    },
    sortBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    }
});