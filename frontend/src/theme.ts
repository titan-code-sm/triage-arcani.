// Design tokens for "Il Triage degli Arcani" — dark occult Yu-Gi-Oh style.
// The duel arena is a dark-first experience: both schemes share the same
// gothic palette taken from /app/design_guidelines.json so the mood never
// shifts with the device setting.
//
// Usage:
//   const styles = makeStyles((colors) => ({ card: { backgroundColor: colors.surfaceSecondary } }));
//   const { colors } = useTheme(); // for color props (icon color, placeholder...)

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const palette = {
  // Surfaces
  surface: "#0A0B0E",
  onSurface: "#F4F1EA",
  surfaceSecondary: "#14161C",
  onSurfaceSecondary: "#E2DDD5",
  surfaceTertiary: "#1F232D",
  onSurfaceTertiary: "#B8B3A8",
  surfaceInverse: "#F4F1EA",
  onSurfaceInverse: "#0A0B0E",
  muted: "#8A857B",

  // Brand: crimson + antique gold
  brand: "#8B1E1E",
  onBrand: "#FFF5F5",
  brandPrimary: "#A82424",
  onBrandPrimary: "#FFF5F5",
  brandSecondary: "#D4AF37",
  onBrandSecondary: "#14161C",
  brandTertiary: "#2D1515",
  onBrandTertiary: "#E2DDD5",

  // Status
  success: "#1E6B39",
  onSuccess: "#E2DDD5",
  warning: "#B87A1E",
  onWarning: "#14161C",
  error: "#A82424",
  onError: "#FFF5F5",
  info: "#2E5A88",
  onInfo: "#E2DDD5",

  // Lines
  border: "#2D323E",
  borderStrong: "#A82424",
  divider: "#1A1D26",

  // Game-specific extras
  gold: "#D4AF37",
  goldSoft: "#E8CF7A",
  mat: "#14100C",
  matEdge: "#4A3B22",
  lpGreen: "#2F9E4F",
};

export type ThemeColors = typeof palette;

export const defaultScheme: ColorScheme = "dark";

export const themes: { light: ThemeColors; dark?: ThemeColors } = {
  light: palette,
  dark: palette,
};

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.(defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

// Fonts (loaded in app/_layout.tsx via expo-font).
export const fonts = {
  display: "Cinzel",
  displayBold: "Cinzel-Bold",
  body: "Jakarta",
  bodyMedium: "Jakarta-Medium",
  bodyBold: "Jakarta-Bold",
};

// Spacing & radius tokens from design_guidelines.json.
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 6, md: 12, lg: 20, pill: 999 } as const;
