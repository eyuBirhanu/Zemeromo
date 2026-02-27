import React, { useRef, useState } from 'react';
import {
    View, Text, FlatList, Dimensions, TouchableOpacity,
    SafeAreaView, StatusBar, StyleSheet, ViewToken, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '../store/settingsStore';
import { COLORS, SPACING, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Sacred Melodies',
        subtitle: 'A digital sanctuary for Ethiopian Gospel songs.',
        icon: 'musical-notes',
        color: COLORS.primary
    },
    {
        id: '2',
        title: 'Offline Worship',
        subtitle: 'Save lyrics and songs to worship anywhere, anytime.',
        icon: 'cloud-download',
        color: '#60A5FA' // Soft Blue
    },
    {
        id: '3',
        title: 'Sing Together',
        subtitle: 'Connect with the choir and access a vast library of lyrics.',
        icon: 'people',
        color: COLORS.accent
    },
];

export default function OnboardingScreen() {
    const navigation = useNavigation<any>();
    const { completeOnboarding } = useSettingsStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = () => {
        completeOnboarding();
        navigation.replace('MainTabs');
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
        return (
            <View style={styles.slide}>
                <View style={[styles.iconContainer, { borderColor: item.color }]}>
                    <Ionicons name={item.icon as any} size={80} color={item.color} />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Gradient */}
            <LinearGradient
                colors={[COLORS.dark.bg, '#05070a']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={finishOnboarding}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>

                {/* Slides */}
                <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    renderItem={renderItem}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                    keyExtractor={(item) => item.id}
                />

                {/* Footer */}
                <View style={styles.footer}>
                    {/* Dots */}
                    <View style={styles.pagination}>
                        {SLIDES.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentIndex === index ?
                                        { backgroundColor: SLIDES[index].color, width: 24 } :
                                        { backgroundColor: COLORS.dark.textSecondary, width: 8 }
                                ]}
                            />
                        ))}
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        onPress={handleNext}
                        style={[styles.btn, { backgroundColor: SLIDES[currentIndex].color }]}
                        activeOpacity={0.9}
                    >
                        <Text style={[styles.btnText, { color: currentIndex === 2 ? COLORS.black : COLORS.white }]}>
                            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={20}
                            color={currentIndex === 2 ? COLORS.black : COLORS.white}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.dark.bg },
    header: { alignItems: 'flex-end', paddingHorizontal: SPACING.l, paddingTop: SPACING.m },
    skipText: { color: COLORS.dark.textSecondary, fontFamily: FONTS.medium, fontSize: 14 },

    slide: { width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },

    iconContainer: {
        width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, marginBottom: 40
    },
    title: {
        fontSize: 28, fontFamily: FONTS.bold, color: COLORS.white,
        textAlign: 'center', marginBottom: 12
    },
    subtitle: {
        fontSize: 16, fontFamily: FONTS.regular, color: COLORS.dark.textSecondary,
        textAlign: 'center', lineHeight: 24
    },

    footer: { paddingHorizontal: SPACING.xl, paddingBottom: 60, alignItems: 'center' },
    pagination: { flexDirection: 'row', gap: 8, marginBottom: 40 },
    dot: { height: 8, borderRadius: 4 },

    btn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingVertical: 16, paddingHorizontal: 40, borderRadius: 50,
        width: '100%', justifyContent: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3, shadowRadius: 20, elevation: 10
    },
    btnText: { fontFamily: FONTS.bold, fontSize: 16 }
});