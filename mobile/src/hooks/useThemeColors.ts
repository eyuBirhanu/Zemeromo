import { useThemeStore } from '../store/themeStore';
import { COLORS } from '../constants/theme';

export function useThemeColors() {
    const isDarkMode = useThemeStore((state) => state.isDarkMode);
    const currentColors = isDarkMode ? COLORS.dark : COLORS.light;

    return {
        ...currentColors,
        primary: COLORS.primary,
        accent: COLORS.accent,
        black: COLORS.black,
        white: COLORS.white,
        isDark: isDarkMode
    };
}