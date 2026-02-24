import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Dimensions,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    ViewToken
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSettingsStore } from '../store/settingsStore';
import { COLORS, SPACING, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Welcome to Zemeromo',
        description: 'A digital sanctuary for Ethiopian Gospel songs. Pure, peaceful, and designed for worship.',
        icon: 'musical-notes',
    },
    {
        id: '2',
        title: 'Always Available',
        description: 'No internet? No problem. Zemeromo intelligently saves lyrics and songs so you can worship anywhere.',
        icon: 'cloud-offline',
    },
    {
        id: '3',
        title: 'Sing Along',
        description: 'Access a vast library of lyrics and connect with the choir. Let the praise begin.',
        icon: 'book',
    },
];

export default function OnboardingScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
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

    const handleBack = () => {
        if (currentIndex > 0) {
            flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
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
                {/* Icon Circle */}
                <View style={styles.iconContainer}>
                    <Ionicons name={item.icon as any} size={80} color={COLORS.primary} />
                </View>

                {/* Text Content */}
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.dark.bg} />

            {/* Header (Skip) */}
            <View style={styles.header}>
                <TouchableOpacity onPress={finishOnboarding} style={styles.skipButton}>
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

            {/* Footer Controls */}
            <View style={styles.footer}>

                {/* Pagination Dots */}
                <View style={styles.paginationContainer}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                currentIndex === index ? styles.activeDot : styles.inactiveDot
                            ]}
                        />
                    ))}
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    {currentIndex > 0 ? (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.spacer} />
                    )}

                    <TouchableOpacity
                        onPress={handleNext}
                        style={styles.nextButton}
                    >
                        <Text style={styles.nextText}>
                            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark.bg, // Deep Charcoal
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
    },
    skipButton: {
        padding: SPACING.s,
    },
    skipText: {
        color: COLORS.dark.textSecondary,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    slide: {
        width: width,
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingTop: 60,
    },
    iconContainer: {
        backgroundColor: COLORS.dark.bg, // Tinted Emerald
        padding: 40,
        borderRadius: 100,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: COLORS.primary, // Emerald Border
    },
    title: {
        fontSize: 28,
        color: COLORS.dark.text,
        textAlign: 'center',
        marginBottom: SPACING.m,
        fontFamily: FONTS.bold,
    },
    description: {
        fontSize: 16,
        color: COLORS.dark.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: SPACING.m,
        fontFamily: FONTS.regular,
    },
    footer: {
        height: 160,
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.l,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        width: 24,
        backgroundColor: COLORS.accent, // Lime
    },
    inactiveDot: {
        width: 8,
        backgroundColor: COLORS.dark.border,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        padding: SPACING.m,
    },
    backText: {
        color: COLORS.dark.text,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    spacer: {
        padding: SPACING.m,
    },
    nextButton: {
        backgroundColor: COLORS.accent, // Lime Button
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 50,
    },
    nextText: {
        color: COLORS.dark.bg, // Dark text on Lime button
        fontFamily: FONTS.bold,
        fontSize: 16,
    },
});