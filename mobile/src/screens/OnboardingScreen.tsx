import React, { useRef, useState, useEffect } from 'react';
import {
    View, Text, FlatList, Dimensions, TouchableOpacity,
    SafeAreaView, StatusBar, StyleSheet, ViewToken,
    Platform, Animated
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettingsStore } from '../store/settingsStore';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { useThemeColors } from '../hooks/useThemeColors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Sacred Melodies',
        subtitle: 'A digital sanctuary for Ethiopian Gospel songs. Pure, peaceful, and designed for worship.',
        icon: 'musical-notes',
        color: COLORS.primary, // Emerald
        btnTextColor: '#FFFFFF'
    },
    {
        id: '2',
        title: 'Offline Worship',
        subtitle: 'Save lyrics and songs to your device so you can worship anywhere, anytime without internet.',
        icon: 'cloud-download',
        color: '#3B82F6', // Vibrant Blue
        btnTextColor: '#FFFFFF'
    },
    {
        id: '3',
        title: 'Dive into the Word',
        subtitle: 'Explore meaningful lyrics, discover inspiring artists, and engage with diverse church ministries.',
        icon: 'book', // Changed icon to match the new text
        color: COLORS.accent, // Lime
        btnTextColor: '#000000'
    },
];

export default function OnboardingScreen() {
    const navigation = useNavigation<any>();
    const colors = useThemeColors();
    const { completeOnboarding } = useSettingsStore();

    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Animation for the active icon
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        // Trigger a subtle pulse animation every time the slide changes
        scaleAnim.setValue(0.8);
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 8,
            useNativeDriver: true,
        }).start();
    }, [currentIndex]);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            finishOnboarding();
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
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

    const renderItem = ({ item, index }: { item: typeof SLIDES[0], index: number }) => {
        const isActive = index === currentIndex;

        return (
            <View style={styles.slide}>
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            backgroundColor: item.color + '15',
                            borderColor: item.color + '40',
                            transform: [{ scale: isActive ? scaleAnim : 0.9 }] // Only animate the active one
                        }
                    ]}
                >
                    <Ionicons name={item.icon as any} size={80} color={item.color} />
                </Animated.View>

                <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

            {/* Subtle Abstract Background Glows */}
            <View style={StyleSheet.absoluteFillObject}>
                <LinearGradient
                    colors={[
                        SLIDES[currentIndex].color + (colors.isDark ? '10' : '20'), // Dynamic subtle tint based on slide
                        'transparent',
                        colors.bg
                    ]}
                    style={styles.gradientGlow}
                />
            </View>

            <SafeAreaView style={{ flex: 1 }}>

                {/* --- HEADER --- */}
                <View style={styles.header}>
                    {/* Back Button (Hidden on first slide) */}
                    {currentIndex > 0 ? (
                        <TouchableOpacity onPress={handleBack} style={styles.navIconBtn} hitSlop={15}>
                            <Feather name="chevron-left" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.navIconBtn} /> // Empty placeholder to keep flex-between balanced
                    )}

                    {/* Skip Button (Hidden on last slide) */}
                    {currentIndex < SLIDES.length - 1 ? (
                        <TouchableOpacity onPress={finishOnboarding} style={styles.skipButton} hitSlop={10}>
                            <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.skipButton} /> // Placeholder
                    )}
                </View>

                {/* --- SLIDES CAROUSEL --- */}
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

                {/* --- FOOTER CONTROLS --- */}
                <View style={styles.footer}>
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {SLIDES.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentIndex === index
                                        ? { backgroundColor: SLIDES[index].color, width: 28 }
                                        : { backgroundColor: colors.border, width: 8 }
                                ]}
                            />
                        ))}
                    </View>

                    {/* Dynamic Action Button */}
                    <TouchableOpacity
                        onPress={handleNext}
                        style={[styles.btn, { backgroundColor: SLIDES[currentIndex].color }]}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.btnText, { color: SLIDES[currentIndex].btnTextColor }]}>
                            {currentIndex === SLIDES.length - 1 ? 'Start Worshipping' : 'Continue'}
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={20}
                            color={SLIDES[currentIndex].btnTextColor}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientGlow: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: height * 0.6,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 20,
    },
    navIconBtn: {
        width: 40, height: 40,
        justifyContent: 'center', alignItems: 'center',
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        minWidth: 60,
        alignItems: 'flex-end',
    },
    skipText: {
        fontFamily: FONTS.bold,
        fontSize: 15,
        letterSpacing: 0.5,
    },

    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
        paddingBottom: 40, // Push content slightly up
    },
    iconContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 40
    },
    title: {
        fontSize: 32,
        fontFamily: FONTS.bold,
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5
    },
    subtitle: {
        fontSize: 16,
        fontFamily: FONTS.regular,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: SPACING.s
    },

    footer: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: Platform.OS === 'ios' ? 40 : 60,
        alignItems: 'center'
    },
    pagination: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 36
    },
    dot: {
        height: 8,
        borderRadius: 4
    },

    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 100,
        width: '100%',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8
    },
    btnText: {
        fontFamily: FONTS.bold,
        fontSize: 16
    }
});