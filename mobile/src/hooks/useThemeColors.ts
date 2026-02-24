// src/hooks/useThemeColors.ts
import { useThemeStore } from '../store/themeStore';
import { COLORS } from '../constants/theme';

export function useThemeColors() {
    const isDarkMode = useThemeStore((state) => state.isDarkMode);

    // Pick the right palette based on state
    const currentColors = isDarkMode ? COLORS.dark : COLORS.light;

    return {
        ...currentColors,
        primary: COLORS.primary,
        accent: COLORS.accent,
        isDark: isDarkMode // Useful for toggling StatusBars or conditional logic
    };
}