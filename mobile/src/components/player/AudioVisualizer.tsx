import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const BAR_COUNT = 24; // Number of bars

// --- Individual Bar Component ---
const Bar = ({ index, isPlaying }: { index: number; isPlaying: boolean }) => {
    // 1. Initial Height Value (10)
    const animatedHeight = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        let animation: Animated.CompositeAnimation;

        if (isPlaying) {
            // 2. Create a random looping animation
            const randomHeight = Math.random() * 40 + 15; // Random height between 15 and 55
            const duration = Math.random() * 300 + 200;   // Random speed

            const bounce = Animated.sequence([
                Animated.timing(animatedHeight, {
                    toValue: randomHeight,
                    duration: duration,
                    easing: Easing.linear,
                    useNativeDriver: false, // Height layout changes need JS driver
                }),
                Animated.timing(animatedHeight, {
                    toValue: 10,
                    duration: duration,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
            ]);

            // Loop forever
            animation = Animated.loop(bounce);
            animation.start();
        } else {
            // 3. Reset to flat when paused
            Animated.timing(animatedHeight, {
                toValue: 10,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }

        return () => {
            // Cleanup: stop animation when component unmounts or pauses
            if (animation) animation.stop();
        };
    }, [isPlaying]);

    return (
        <Animated.View
            style={[
                styles.bar,
                {
                    height: animatedHeight, // Bind height to animated value
                    opacity: isPlaying ? 1 : 0.5,
                    // Center bars get the bright Lime color, sides are gray
                    backgroundColor: index > 8 && index < 16 ? COLORS.accent : COLORS.dark.textSecondary
                },
            ]}
        />
    );
};

// --- Main Container ---
export default function AudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
    return (
        <View style={styles.container}>
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
                <Bar key={i} index={i} isPlaying={isPlaying} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        gap: 4,
        width: width - 60,
    },
    bar: {
        width: 4,
        borderRadius: 2,
    },
});