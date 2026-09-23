// Full card inspection modal: big art, effect, flavor and scene text.

import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@react-native-vector-icons/material-design-icons";

import { cardImageUrl } from "@/src/api";
import { CARD_DEFS, EFFECT_INFO, tributeCostFor } from "@/src/game/cards";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

interface Props {
  idx: number | null;
  onClose: () => void;
}

export function CardDetailModal({ idx, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  if (idx === null) return null;
  const def = CARD_DEFS[idx];
  const effect = EFFECT_INFO[def.effect];
  const cost = tributeCostFor(idx);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} testID="card-detail-backdrop">
        <Pressable style={styles.panel} onPress={() => {}}>
          <View style={styles.topRow}>
            <View style={[styles.rarityChip, { backgroundColor: def.rarity === "epocale" ? colors.gold : colors.surfaceTertiary }]}>
              <Text style={[styles.rarityText, { color: def.rarity === "epocale" ? colors.onBrandSecondary : colors.onSurfaceTertiary }]}>
                {def.rarity === "epocale" ? "EPOCALE" : "NORMALE"}
              </Text>
            </View>
            {cost > 0 ? (
              <View style={[styles.rarityChip, { backgroundColor: colors.brandTertiary }]}>
                <Text style={[styles.rarityText, { color: colors.goldSoft }]}>
                  TRIBUTI: {"★".repeat(cost)}
                </Text>
              </View>
            ) : null}
            <Pressable onPress={onClose} style={styles.closeBtn} testID="card-detail-close-button">
              <MaterialIcons name="close" size={20} color={colors.onSurfaceSecondary} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={[styles.artFrame, { borderColor: def.rarity === "epocale" ? colors.gold : colors.matEdge }]}>
              <Image source={{ uri: cardImageUrl(idx) }} style={styles.art} contentFit="cover" />
              <View style={styles.statsRow}>
                <Text style={[styles.stat, { color: "#E85D5D" }]} testID="card-detail-atk">ATK {def.atk}</Text>
                <Text style={[styles.stat, { color: "#5FB8A5" }]} testID="card-detail-def">DEF {def.def}</Text>
              </View>
            </View>
            <Text style={[styles.name, { color: colors.goldSoft }]} testID="card-detail-name">
              {def.name}
            </Text>
            {effect.title ? (
              <View style={[styles.effectBox, { borderColor: colors.matEdge, backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.effectTitle, { color: colors.gold }]}>✦ {effect.title}</Text>
                <Text style={[styles.effectDesc, { color: colors.onSurfaceSecondary }]}>{effect.desc}</Text>
              </View>
            ) : null}
            <Text style={[styles.flavor, { color: colors.onSurfaceSecondary }]}>“{def.flavor}”</Text>
            <Text style={[styles.scene, { color: colors.muted }]}>{def.scene}</Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(5,5,8,0.86)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "88%",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.matEdge,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: 0,
  },
  rarityChip: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  rarityText: { fontSize: 10, fontFamily: fonts.displayBold, letterSpacing: 1 },
  closeBtn: { marginLeft: "auto", padding: spacing.xs },
  content: { padding: spacing.lg, gap: spacing.md },
  artFrame: {
    borderRadius: radius.md,
    borderWidth: 2,
    overflow: "hidden",
    alignSelf: "center",
    width: 220,
    height: 330,
  },
  art: { width: "100%", height: "100%" },
  statsRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
    backgroundColor: "rgba(10,11,14,0.85)",
    paddingVertical: spacing.xs,
  },
  stat: { fontSize: 14, fontFamily: fonts.displayBold },
  name: {
    fontSize: 24,
    fontFamily: fonts.displayBold,
    textAlign: "center",
    letterSpacing: 1,
  },
  effectBox: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  effectTitle: { fontSize: 14, fontFamily: fonts.bodyBold },
  effectDesc: { fontSize: 13, fontFamily: fonts.body, lineHeight: 19 },
  flavor: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    fontStyle: "italic",
    lineHeight: 21,
    textAlign: "center",
  },
  scene: {
    fontSize: 12,
    fontFamily: fonts.body,
    lineHeight: 18,
    textAlign: "center",
  },
}));
