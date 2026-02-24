import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export const COLORS = {
    // Brand Identity
    primary: '#10B981', // Emerald (Gradients / Badges)
    accent: '#D4F479',  // LIME (Primary Action Buttons - The "Pop")

    // Dark Mode (Default)
    dark: {
        bg: '#0f131a',        // Deep Charcoal (Main Background)
        surface: '#1a1f2b',   // Card Background
        surfaceLight: '#2C3240', // Lighter Surface for borders/inputs
        text: '#FFFFFF',      // Primary Text
        textSecondary: '#9CA3AF', // Subtitles
        border: 'rgba(255,255,255,0.08)', // Subtle dividers
    },

    // Utilities
    black: '#000000',
    white: '#FFFFFF',
    transparentAccent: 'rgba(212, 244, 121, 0.15)', // Low opacity Lime
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48
};

export const FONTS = {
    bold: 'Inter-Bold',     // Ensure these fonts are loaded in App.tsx
    medium: 'Inter-Medium',
    regular: 'Inter-Regular',
};

export const SIZES = {
    width,
    height,
    cardRadius: 24,
    btnRadius: 12,
};