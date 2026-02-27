import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface SettingRowProps {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    type?: 'link' | 'toggle' | 'value';
    value?: string | boolean;
    onToggle?: (val: boolean) => void;
    isDestructive?: boolean;
}

export default function SettingRow({
    icon, title, subtitle, onPress, type = 'link', value, onToggle, isDestructive
}: SettingRowProps) {
    const colors = useThemeColors();

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
            onPress={type === 'toggle' ? () => onToggle && onToggle(!value as boolean) : onPress}
            activeOpacity={type === 'toggle' ? 1 : 0.6}
            disabled={type === 'toggle' && !onToggle}
        >
            {/* Icon Circle */}
            <View style={[
                styles.iconBox,
                { backgroundColor: colors.surfaceLight },
                isDestructive && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
            ]}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={isDestructive ? '#EF4444' : colors.text}
                />
            </View>

            {/* Text */}
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.text }, isDestructive && { color: '#EF4444' }]}>
                    {title}
                </Text>
                {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
            </View>

            {/* Trailing Element */}
            <View style={styles.trailing}>
                {type === 'link' && (
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                )}

                {type === 'value' && (
                    <Text style={[styles.valueText, { color: colors.accent }]}>{value}</Text>
                )}

                {type === 'toggle' && (
                    <Switch
                        trackColor={{ false: '#374151', true: colors.accent }} // Lime track
                        thumbColor={value ? '#fff' : '#9CA3AF'}
                        ios_backgroundColor="#374151"
                        onValueChange={onToggle}
                        value={value as boolean}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: SPACING.m,
        borderBottomWidth: 1,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontFamily: FONTS.medium,
        marginBottom: 1,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    trailing: {
        marginLeft: 8,
    },
    valueText: {
        fontSize: 13,
        fontFamily: FONTS.bold,
    }
});