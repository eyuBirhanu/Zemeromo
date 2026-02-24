import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

const CATEGORIES = ["All", "Worship", "Praise", "Mezmur", "Instrumental", "Choir", "Solo"];

export default function CategoryPills() {
    const [active, setActive] = React.useState("All");

    return (
        <View style={{ marginBottom: SPACING.l }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SPACING.m }}
            >
                {CATEGORIES.map((cat, index) => {
                    const isActive = active === cat;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setActive(cat)}
                            style={[
                                styles.pill,
                                isActive ? { backgroundColor: COLORS.accent, borderColor: COLORS.accent } : { borderColor: COLORS.dark.border }
                            ]}
                        >
                            <Text style={[
                                styles.text,
                                isActive ? { color: COLORS.dark.bg } : { color: COLORS.dark.textSecondary }
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 100,
        borderWidth: 1,
        marginRight: 10,
        backgroundColor: 'transparent'
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    }
});