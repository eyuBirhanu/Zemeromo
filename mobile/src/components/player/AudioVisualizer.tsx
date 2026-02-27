import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

const { width } = Dimensions.get('window');
const BAR_COUNT = 24;

const Bar = ({ index, isPlaying }: { index: number; isPlaying: boolean }) => {
    const colors = useThemeColors();
    const animatedHeight = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        let animation: Animated.CompositeAnimation;

        if (isPlaying) {
            const randomHeight = Math.random() * 40 + 15;
            const duration = Math.random() * 300 + 200;

            const bounce = Animated.sequence([
                Animated.timing(animatedHeight, {
                    toValue: randomHeight,
                    duration: duration,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedHeight, {
                    toValue: 10,
                    duration: duration,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
            ]);

            animation = Animated.loop(bounce);
            animation.start();
        } else {
            Animated.timing(animatedHeight, {
                toValue: 10,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }

        return () => {
            if (animation) animation.stop();
        };
    }, [isPlaying]);

    return (
        <Animated.View
            style={[
                styles.bar,
                {
                    height: animatedHeight,
                    opacity: isPlaying ? 1 : 0.5,
                    backgroundColor: index > 8 && index < 16 ? colors.accent : colors.textSecondary
                },
            ]}
        />
    );
};

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