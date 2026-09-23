import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchCards } from "@/src/api";
import { CardDetailModal } from "@/src/components/CardDetailModal";
import { TarotCard } from "@/src/components/TarotCard";
import { CARD_DEFS } from "@/src/game/cards";
import { usesNativeTabs } from "@/src/navigation";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Filter = "all" | "normale" | "epocale";

export default function GalleriaScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<Filter>("all");
  const [detailIdx, setDetailIdx] = useState<number | null>(null);

  const { data } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const cards = useMemo(() => {
    const list = data ?? CARD_DEFS.map((c, idx) => ({ ...c, idx }));
    return list.filter((c) => filter === "all" || c.rarity === filter);
  }, [data, filter]);

  const cardWidth = Math.min(((width - spacing.lg * 3) / 2) * 0.86, 170);

  return (
    <View style={styles.root} testID="galleria-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={[styles.title, { color: colors.goldSoft }]}>Galleria degli Arcani</Text>
        <Text style={[styles.count, { color: colors.muted }]} testID="galleria-count">
          {cards.length} carte
        </Text>
      </View>
      {/* Chip row: one horizontal scroller, never wraps */}
      <View style={styles.chipRow}>
        {(
          [
            ["all", "Tutte"],
            ["normale", "Normali"],
            ["epocale", "Epocali"],
          ] as [Filter, string][]
        ).map(([key, label]) => {
          const selected = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.chip,
                {
                  borderColor: selected ? colors.gold : colors.border,
                  backgroundColor: selected ? colors.brandTertiary : colors.surfaceSecondary,
                  flexShrink: 0,
                },
              ]}
              testID={`galleria-filter-${key}`}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? colors.goldSoft : colors.onSurfaceTertiary },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {cards.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>Nessuna carta nel filtro.</Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(c) => String(c.idx)}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: (usesNativeTabs ? insets.bottom : 0) + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TarotCard
              idx={item.idx}
              width={cardWidth}
              showName
              onPress={() => setDetailIdx(item.idx)}
              testID={`gallery-card-${item.idx}`}
            />
          )}
        />
      )}
      <CardDetailModal idx={detailIdx} onClose={() => setDetailIdx(null)} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 2 },
  title: { fontSize: 24, fontFamily: fonts.displayBold, letterSpacing: 1 },
  count: { fontSize: 12, fontFamily: fonts.body },
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    height: 56,
    alignItems: "center",
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 13, fontFamily: fonts.bodyMedium },
  listContent: { paddingHorizontal: spacing.lg, gap: spacing.md },
  column: { gap: spacing.md },
  emptyText: { fontSize: 14, fontFamily: fonts.body, textAlign: "center" },
}));
