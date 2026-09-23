// Card back: the Eye of Destiny sigil, drawn with gradients + icons.

import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";

import { fonts, makeStyles, radius, useTheme } from "@/src/theme";

export function CardBack({ width, count }: { width: number; count?: number }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const height = width * 1.5;
  return (
    <View style={{ width, height }}>
      <LinearGradient
        colors={[colors.brandTertiary, colors.surfaceSecondary, colors.brand]}
        style={[styles.back, { width, height, borderColor: colors.matEdge }]}
      >
        <View style={[styles.innerRing, { borderColor: "rgba(212,175,55,0.4)" }]}>
          <MaterialIcons name="eye-outline" size={width * 0.34} color="rgba(212,175,55,0.75)" />
        </View>
        {count !== undefined ? (
          <View style={styles.countBadge} testID="deck-count-badge">
            <Text style={styles.countText}>{count}</Text>
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  back: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  innerRing: {
    width: "72%",
    aspectRatio: 1,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(10,11,14,0.85)",
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countText: { color: colors.goldSoft, fontSize: 11, fontFamily: fonts.displayBold },
}));
