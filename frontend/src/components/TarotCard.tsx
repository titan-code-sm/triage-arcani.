// Tarot card renderer: gold-framed art with stats pill, position badge,
// epocale glow, selection state and destroy ghost animations.

import { Image } from "expo-image";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated as RNAnimated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { cardImageUrl } from "@/src/api";
import { CARD_DEFS } from "@/src/game/cards";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

interface Props {
  idx: number;
  width: number;
  showName?: boolean;
  showStats?: boolean;
  positionBadge?: "atk" | "def" | null;
  attacked?: boolean;
  negated?: boolean;
  selected?: boolean;
  highlight?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  testID?: string;
}

export function TarotCard(props: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const def = CARD_DEFS[props.idx];
  const height = props.width * 1.5;
  const isEpic = def.rarity === "epocale";

  const glow = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    if (isEpic) {
      const loop = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(glow, { toValue: 1, duration: 1400, useNativeDriver: false }),
          RNAnimated.timing(glow, { toValue: 0.45, duration: 1400, useNativeDriver: false }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isEpic, glow]);

  const glowStyle = isEpic
    ? {
        shadowColor: colors.gold,
        shadowOpacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.7] }),
        shadowRadius: 12,
      }
    : {};

  return (
    <View style={{ width: props.width, alignItems: "center" }}>
      <View style={{ width: props.width, height }}>
        <RNAnimated.View
          style={[
            styles.frame,
            glowStyle,
            {
              width: props.width,
              height,
              borderColor: props.selected ? colors.goldSoft : isEpic ? colors.gold : colors.matEdge,
              borderWidth: props.selected ? 2.5 : isEpic ? 2 : 1.5,
              backgroundColor: colors.surfaceSecondary,
            },
            props.highlight ? styles.highlightFrame : null,
          ]}
        >
          <Image
            source={{ uri: cardImageUrl(props.idx) }}
            style={[StyleSheet.absoluteFill, styles.art]}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
          {props.showStats !== false ? (
            <View
              style={[styles.statsPill, { backgroundColor: "rgba(10,11,14,0.82)" }]}
              testID={props.testID ? `${props.testID}-stats` : undefined}
            >
              <Text style={[styles.statsText, { color: "#E85D5D" }]}>{def.atk}</Text>
              <Text style={[styles.statsText, { color: colors.muted }]}>/</Text>
              <Text style={[styles.statsText, { color: "#5FB8A5" }]}>{def.def}</Text>
            </View>
          ) : null}
          {props.positionBadge ? (
            <View
              style={[
                styles.positionBadge,
                {
                  backgroundColor: props.positionBadge === "atk" ? colors.brandPrimary : colors.info,
                },
              ]}
            >
              <MaterialIcons
                name={props.positionBadge === "atk" ? "sword" : "shield-half-full"}
                size={12}
                color="#FFF5F5"
              />
            </View>
          ) : null}
          {props.attacked || props.negated ? (
            <View style={[StyleSheet.absoluteFill, styles.dimOverlay]}>
              <MaterialIcons
                name={props.negated ? "cancel" : "sword-cross"}
                size={22}
                color={colors.goldSoft}
              />
            </View>
          ) : null}
        </RNAnimated.View>
      </View>
      {props.showName ? (
        <Text
          numberOfLines={1}
          style={[styles.cardName, { color: colors.onSurfaceSecondary, width: props.width + 24 }]}
        >
          {def.name}
        </Text>
      ) : null}
      {props.onPress || props.onLongPress ? (
        <Pressable
          onPress={props.disabled ? undefined : props.onPress}
          onLongPress={props.onLongPress}
          accessibilityRole="button"
          testID={props.testID}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}

/** Ghost of a destroyed card: pops and fades at the slot it died in. */
export function DestroyGhost({ idx, width, id }: { idx: number; width: number; id: number }) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  useEffect(() => {
    opacity.value = withTiming(0, { duration: 550, easing: Easing.out(Easing.quad) });
    scale.value = withTiming(1.18, { duration: 550, easing: Easing.out(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ghost,
        { width, height: width * 1.5, borderColor: colors.error },
        style,
      ]}
    >
      <Image source={{ uri: cardImageUrl(idx) }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(168,36,36,0.45)" }]} />
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  frame: {
    borderRadius: radius.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  highlightFrame: {
    borderColor: colors.goldSoft,
    shadowColor: colors.gold,
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  art: { borderRadius: radius.md - 1 },
  statsPill: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    borderRadius: radius.sm,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    paddingVertical: 1,
  },
  statsText: { fontSize: 11, fontFamily: fonts.displayBold, lineHeight: 15 },
  positionBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,11,14,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  ghost: {
    position: "absolute",
    borderRadius: radius.md,
    borderWidth: 2,
    overflow: "hidden",
  },
}));
