import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export default function SearchInput({ value, onChangeText, placeholder, autoFocus }: SearchInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[
            styles.container,
            isFocused && styles.containerFocused
        ]}>
            <Ionicons
                name="search"
                size={20}
                color={isFocused ? COLORS.accent : COLORS.dark.textSecondary}
                style={styles.icon}
            />

            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder || "Search songs, artists..."}
                placeholderTextColor={COLORS.dark.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={autoFocus}
                selectionColor={COLORS.accent}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText("")} hitSlop={10}>
                    <Ionicons name="close-circle" size={18} color={COLORS.dark.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.dark.surface,
        height: 52,
        borderRadius: 14,
        paddingHorizontal: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.dark.border,
        marginBottom: SPACING.s,
    },
    containerFocused: {
        borderColor: COLORS.accent, // Lime Border on Focus
        backgroundColor: 'rgba(212, 244, 121, 0.05)', // Very subtle Lime tint
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.white,
        fontFamily: FONTS.medium,
        fontSize: 15,
        height: '100%',
    },
});