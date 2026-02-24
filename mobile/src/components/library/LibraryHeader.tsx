import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

interface LibraryHeaderProps {
    activeTab: 'Downloads' | 'Local';
    onTabChange: (tab: 'Downloads' | 'Local') => void;
    onSortPress: () => void;
}

export default function LibraryHeader({ activeTab, onTabChange, onSortPress }: LibraryHeaderProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Library</Text>

            <View style={styles.row}>
                {/* Tabs (Pills) */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        onPress={() => onTabChange('Downloads')}
                        style={[styles.tab, activeTab === 'Downloads' && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === 'Downloads' && styles.activeTabText]}>
                            Downloads
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onTabChange('Local')}
                        style={[styles.tab, activeTab === 'Local' && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === 'Local' && styles.activeTabText]}>
                            On Device
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Sort Button */}
                <TouchableOpacity onPress={onSortPress} style={styles.sortBtn}>
                    <Feather name="list" size={20} color={COLORS.dark.text} />
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
        backgroundColor: COLORS.dark.bg,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.dark.text,
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
        borderColor: COLORS.dark.border,
        backgroundColor: 'transparent',
    },
    activeTab: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.dark.textSecondary,
    },
    activeTabText: {
        color: COLORS.dark.bg,
    },
    sortBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.dark.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.dark.border,
    }
});