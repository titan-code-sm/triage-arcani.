// Animated life points bar with player label, Yu-Gi-Oh style.

import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

interface Props {
  name: string;
  lp: number;
  max?: number;
  align?: "left" | "right";
  testID?: string;
}

export function LPBar({ name, lp, max = 8000, align = "left", testID }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const width = useRef(new Animated.Value(1)).current;
  const ratio = Math.max(0, Math.min(1, lp / max));

  useEffect(() => {
    Animated.timing(width, {
      toValue: ratio,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [ratio, width]);

  const fillWidth = width.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const low = lp / max < 0.3;

  return (
    <View style={styles.container} testID={testID}>
      <View style={[styles.header, align === "right" && styles.headerRight]}>
        <Text style={[styles.name, { color: colors.goldSoft }]} numberOfLines={1}>
          {name}
        </Text>
        <Text
          style={[styles.lp, { color: low ? "#E85D5D" : colors.goldSoft }]}
          testID={testID ? `${testID}-value` : undefined}
        >
          {Math.max(0, lp)}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceTertiary, borderColor: colors.matEdge }]}>
        <Animated.View
          style={[styles.fill, { width: fillWidth, backgroundColor: low ? colors.error : colors.lpGreen }]}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  headerRight: { flexDirection: "row-reverse" },
  name: {
    fontSize: 13,
    fontFamily: fonts.displayBold,
    letterSpacing: 1,
    flexShrink: 1,
  },
  lp: {
    fontSize: 17,
    fontFamily: fonts.displayBold,
  },
  track: {
    height: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.pill },
}));
