import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchDuels, fetchStats, type DuelRecordDto } from "@/src/api";
import { DIFFICULTY_LABELS, type Difficulty } from "@/src/game/types";
import { usesNativeTabs } from "@/src/navigation";
import { storage } from "@/src/utils/storage";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const DEVICE_KEY = "arcani_device_id";
const HISTORY_KEY = "arcani_history_local";

function makeDeviceId(): string {
  return "d-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const RESULT_LABEL: Record<string, string> = {
  vittoria: "VITTORIA",
  sconfitta: "SCONFITTA",
  pareggio: "PAREGGIO",
};

export default function StoricoScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [localHistory, setLocalHistory] = useState<DuelRecordDto[]>([]);

  useEffect(() => {
    (async () => {
      let id = await storage.getItem<string>(DEVICE_KEY, "");
      if (!id) {
        id = makeDeviceId();
        await storage.setItem(DEVICE_KEY, id);
      }
      setDeviceId(id);
      const local = await storage.getItem<DuelRecordDto[]>(HISTORY_KEY, []);
      setLocalHistory(local ?? []);
    })();
  }, []);

  const statsQuery = useQuery({
    queryKey: ["stats", deviceId],
    queryFn: () => fetchStats(deviceId!),
    enabled: !!deviceId,
    retry: 1,
  });
  const duelsQuery = useQuery({
    queryKey: ["duels", deviceId],
    queryFn: () => fetchDuels(deviceId!),
    enabled: !!deviceId,
    retry: 1,
  });

  const duels = useMemo(() => {
    if (duelsQuery.data && duelsQuery.data.length > 0) return duelsQuery.data;
    return localHistory;
  }, [duelsQuery.data, localHistory]);

  const stats = useMemo(() => {
    if (statsQuery.data) return statsQuery.data;
    const wins = localHistory.filter((d) => d.result === "vittoria").length;
    const losses = localHistory.filter((d) => d.result === "sconfitta").length;
    const draws = localHistory.filter((d) => d.result === "pareggio").length;
    const total = wins + losses + draws;
    return {
      wins,
      losses,
      draws,
      total,
      winrate: total ? Math.round((wins / total) * 100) : 0,
      by_difficulty: {} as Record<string, { wins: number; losses: number }>,
    };
  }, [statsQuery.data, localHistory]);

  const refreshing = duelsQuery.isRefetching || statsQuery.isRefetching;
  const onRefresh = () => {
    duelsQuery.refetch();
    statsQuery.refetch();
  };

  return (
    <View style={styles.root} testID="storico-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={[styles.title, { color: colors.goldSoft }]}>Registri del Tribunale</Text>
      </View>

      <View style={styles.statRow} testID="storico-stats">
        <View style={[styles.statBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.lpGreen }]} testID="stats-wins">
            {stats.wins}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Vittorie</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.error }]} testID="stats-losses">
            {stats.losses}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Sconfitte</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.goldSoft }]} testID="stats-winrate">
            {stats.winrate}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Winrate</Text>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: (usesNativeTabs ? insets.bottom : 0) + spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        showsVerticalScrollIndicator={false}
        testID="duel-history-list"
      >
        {duels.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="scroll" size={40} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Nessun duello registrato.{"\n"}Scendi nell’arena per iniziare la leggenda.
            </Text>
          </View>
        ) : (
          duels.map((d, i) => {
            const win = d.result === "vittoria";
            const draw = d.result === "pareggio";
            return (
              <View
                key={`${d.created_at}-${i}`}
                style={[styles.row, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                testID={`duel-history-row-${i}`}
              >
                <View
                  style={[
                    styles.resultBadge,
                    {
                      backgroundColor: draw ? colors.surfaceTertiary : win ? colors.success : colors.error,
                    },
                  ]}
                >
                  <Text style={[styles.resultText, { color: draw ? colors.onSurfaceTertiary : colors.onError }]}>
                    {RESULT_LABEL[d.result] ?? d.result.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowOpponent, { color: colors.onSurface }]} numberOfLines={1}>
                    vs {d.opponent}
                  </Text>
                  <Text style={[styles.rowMeta, { color: colors.muted }]}>
                    {d.mode === "bot" ? `IA ${DIFFICULTY_LABELS[(d.difficulty as Difficulty) ?? "normal"] ?? ""} · ` : "Locale · "}
                    {d.turns} turni ·{" "}
                    {d.created_at
                      ? new Date(d.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })
                      : ""}
                  </Text>
                </View>
                <Text style={[styles.rowLp, { color: colors.onSurfaceTertiary }]}>
                  {d.lp_player}/{d.lp_opponent}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: 24, fontFamily: fonts.displayBold },
  statRow: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
  },
  statValue: { fontSize: 24, fontFamily: fonts.displayBold },
  statLabel: { fontSize: 12, fontFamily: fonts.body },
  list: { flex: 1, paddingHorizontal: spacing.lg },
  empty: { alignItems: "center", justifyContent: "center", gap: spacing.md, paddingVertical: 80 },
  emptyText: { fontSize: 14, fontFamily: fonts.body, textAlign: "center", lineHeight: 21 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  resultBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  resultText: { fontSize: 10, fontFamily: fonts.displayBold, letterSpacing: 1 },
  rowInfo: { flex: 1, gap: 2 },
  rowOpponent: { fontSize: 15, fontFamily: fonts.bodyMedium },
  rowMeta: { fontSize: 12, fontFamily: fonts.body },
  rowLp: { fontSize: 13, fontFamily: fonts.displayBold },
}));
