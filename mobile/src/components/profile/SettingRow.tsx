import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';

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
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={type === 'toggle' ? () => onToggle && onToggle(!value as boolean) : onPress}
            activeOpacity={type === 'toggle' ? 1 : 0.6}
            disabled={type === 'toggle' && !onToggle}
        >
            {/* Icon Circle - Smaller & Sleeker */}
            <View style={[
                styles.iconBox,
                isDestructive && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
            ]}>
                <Ionicons
                    name={icon}
                    size={20} // Reduced from 22
                    color={isDestructive ? '#EF4444' : COLORS.white}
                />
            </View>

            {/* Text */}
            <View style={styles.textContainer}>
                <Text style={[styles.title, isDestructive && { color: '#EF4444' }]}>
                    {title}
                </Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {/* Trailing Element */}
            <View style={styles.trailing}>
                {type === 'link' && (
                    <Ionicons name="chevron-forward" size={18} color={COLORS.dark.textSecondary} />
                )}

                {type === 'value' && (
                    <Text style={styles.valueText}>{value}</Text>
                )}

                {type === 'toggle' && (
                    <Switch
                        trackColor={{ false: '#374151', true: 'rgba(212, 244, 121, 0.3)' }}
                        thumbColor={value ? COLORS.accent : '#9CA3AF'}
                        ios_backgroundColor="#374151"
                        onValueChange={onToggle}
                        value={value as boolean}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} // Make switch slightly smaller
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
        backgroundColor: COLORS.dark.surface,
        borderBottomWidth: 1, // Real separator
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    iconBox: {
        width: 36,  // Reduced from 42
        height: 36, // Reduced from 42
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: COLORS.white,
        fontSize: 15, // Reduced from 16 for better proportion
        fontFamily: FONTS.medium,
        marginBottom: 1,
    },
    subtitle: {
        color: COLORS.dark.textSecondary,
        fontSize: 12,
        fontFamily: FONTS.regular,
    },
    trailing: {
        marginLeft: 8,
    },
    valueText: {
        color: COLORS.accent,
        fontSize: 13,
        fontFamily: FONTS.bold,
    }
});