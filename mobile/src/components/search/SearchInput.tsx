import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export default function SearchInput({ value, onChangeText, placeholder, autoFocus }: SearchInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const colors = useThemeColors();

    return (
        <View style={[
            styles.container,
            { backgroundColor: colors.surface, borderColor: colors.border },
            isFocused && { borderColor: colors.accent, backgroundColor: colors.isDark ? 'rgba(212, 244, 121, 0.05)' : 'rgba(16, 185, 129, 0.05)' }
        ]}>
            <Ionicons
                name="search"
                size={20}
                color={isFocused ? colors.accent : colors.textSecondary}
                style={styles.icon}
            />

            <TextInput
                style={[styles.input, { color: colors.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder || "Search songs, artists..."}
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={autoFocus}
                selectionColor={colors.accent}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText("")} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderRadius: 14,
        paddingHorizontal: SPACING.m,
        borderWidth: 1,
        marginBottom: SPACING.s,
    },
    icon: { marginRight: 10 },
    input: {
        flex: 1,
        fontFamily: FONTS.medium,
        fontSize: 15,
        height: '100%',
    },
});