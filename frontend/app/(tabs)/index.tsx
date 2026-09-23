import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchCards } from "@/src/api";
import { CardDetailModal } from "@/src/components/CardDetailModal";
import { TarotCard } from "@/src/components/TarotCard";
import { CARD_DEFS } from "@/src/game/cards";
import { hashStringToInt, todayDateStr } from "@/src/game/day";
import { DIFFICULTY_LABELS, type Difficulty } from "@/src/game/types";
import { usesNativeTabs } from "@/src/navigation";
import { storage } from "@/src/utils/storage";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const BOT_STATS_KEY = "arcani_bot_stats";

export default function ArenaScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [dayCardIdx, setDayCardIdx] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [botStats, setBotStats] = useState<Record<string, { wins: number; losses: number }> | null>(null);

  // Validate the backend serves the deck (falls back to the bundled defs).
  useQuery({ queryKey: ["cards"], queryFn: fetchCards, staleTime: 1000 * 60 * 10 });

  React.useEffect(() => {
    void storage.getItem<boolean>("arcani_sound_enabled", true).then((v) => setSoundOn(v ?? true));
    void storage.getItem<Record<string, { wins: number; losses: number }>>(BOT_STATS_KEY, {}).then(setBotStats);
  }, []);

  const dayIdx = useMemo(() => hashStringToInt(todayDateStr()) % CARD_DEFS.length, []);
  const dayDef = CARD_DEFS[dayIdx];

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    void storage.setItem("arcani_sound_enabled", next);
  };

  const startBot = () =>
    router.push({ pathname: "/duel", params: { mode: "bot", difficulty } });
  const startHotseat = () => router.push({ pathname: "/duel", params: { mode: "hotseat" } });

  const totalWins = botStats
    ? Object.values(botStats).reduce((a, d) => a + (d?.wins ?? 0), 0)
    : 0;
  const totalLosses = botStats
    ? Object.values(botStats).reduce((a, d) => a + (d?.losses ?? 0), 0)
    : 0;

  return (
    <View style={styles.root} testID="arena-screen">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: (usesNativeTabs ? insets.bottom : 0) + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.eyeBadge}>
            <MaterialIcons name="eye-outline" size={30} color={colors.gold} />
          </View>
          <Pressable onPress={toggleSound} style={styles.soundBtn} testID="sound-toggle-button">
            <MaterialIcons
              name={soundOn ? "volume-high" : "volume-off"}
              size={22}
              color={soundOn ? colors.gold : colors.muted}
            />
          </Pressable>
        </View>

        <Text style={[styles.title, { color: colors.goldSoft }]}>IL TRIAGE</Text>
        <Text style={[styles.title2, { color: colors.gold }]}>DEGLI ARCANI</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceTertiary }]}>
          Duelli di tarocchi proibiti · 8000 LP · 45 arcani
        </Text>

        {/* Card of the day */}
        <Pressable
          style={[styles.dayCard, { borderColor: colors.matEdge, backgroundColor: colors.surfaceSecondary }]}
          onPress={() => setDayCardIdx(dayIdx)}
          testID="card-of-day"
        >
          <TarotCard idx={dayIdx} width={96} testID="card-of-day-card" />
          <View style={styles.dayInfo}>
            <Text style={[styles.dayLabel, { color: colors.gold }]}>ARCANO DEL GIORNO</Text>
            <Text style={[styles.dayName, { color: colors.onSurface }]}>{dayDef.name}</Text>
            <Text style={[styles.dayFlavor, { color: colors.onSurfaceTertiary }]} numberOfLines={3}>
              “{dayDef.flavor}”
            </Text>
          </View>
        </Pressable>

        {/* Difficulty */}
        <Text style={[styles.sectionTitle, { color: colors.onSurfaceSecondary }]}>Scegli l’avversario</Text>
        <View style={styles.chipRow}>
          {(["easy", "normal", "hard"] as Difficulty[]).map((d) => {
            const selected = difficulty === d;
            return (
              <Pressable
                key={d}
                onPress={() => setDifficulty(d)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? colors.gold : colors.border,
                    backgroundColor: selected ? colors.brandTertiary : colors.surfaceSecondary,
                    flexShrink: 0,
                  },
                ]}
                testID={`difficulty-chip-${d}`}
              >
                <MaterialIcons
                  name={d === "easy" ? "weather-night" : d === "normal" ? "moon-waning-crescent" : "weather-night-partly-cloudy"}
                  size={16}
                  color={selected ? colors.gold : colors.muted}
                />
                <Text style={[styles.chipText, { color: selected ? colors.goldSoft : colors.onSurfaceTertiary }]}>
                  {DIFFICULTY_LABELS[d]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Mode buttons */}
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.brandPrimary }]}
          onPress={startBot}
          testID="start-duel-button"
        >
          <MaterialIcons name="sword-cross" size={22} color={colors.onBrandPrimary} />
          <Text style={[styles.primaryBtnText, { color: colors.onBrandPrimary }]}>INIZIA IL DUELLO</Text>
        </Pressable>
        <Pressable
          style={[styles.secondaryBtn, { borderColor: colors.matEdge, backgroundColor: colors.surfaceSecondary }]}
          onPress={startHotseat}
          testID="start-hotseat-button"
        >
          <MaterialIcons name="account-group" size={20} color={colors.goldSoft} />
          <Text style={[styles.secondaryBtnText, { color: colors.goldSoft }]}>Sfida locale · 2 giocatori</Text>
        </Pressable>

        {/* Local stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.lpGreen }]} testID="arena-wins">{totalWins}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Vittorie</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.error }]} testID="arena-losses">{totalLosses}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Sconfitte</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.goldSoft }]}>45</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Arcani</Text>
          </View>
        </View>
      </ScrollView>

      <CardDetailModal idx={dayCardIdx} onClose={() => setDayCardIdx(null)} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyeBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.matEdge,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  soundBtn: { padding: spacing.sm },
  title: {
    fontSize: 34,
    fontFamily: fonts.displayBold,
    letterSpacing: 4,
    textAlign: "center",
  },
  title2: {
    fontSize: 22,
    fontFamily: fonts.display,
    letterSpacing: 8,
    textAlign: "center",
    marginTop: -spacing.md,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: -spacing.xs,
  },
  dayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  dayInfo: { flex: 1, gap: spacing.xs },
  dayLabel: { fontSize: 11, fontFamily: fonts.displayBold, letterSpacing: 2 },
  dayName: { fontSize: 22, fontFamily: fonts.displayBold },
  dayFlavor: { fontSize: 13, fontFamily: fonts.body, fontStyle: "italic", lineHeight: 18 },
  sectionTitle: { fontSize: 14, fontFamily: fonts.bodyMedium, marginTop: spacing.sm },
  chipRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "nowrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    height: 36,
  },
  chipText: { fontSize: 13, fontFamily: fonts.bodyMedium },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: 16,
    marginTop: spacing.sm,
  },
  primaryBtnText: { fontSize: 16, fontFamily: fonts.displayBold, letterSpacing: 2 },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingVertical: 13,
  },
  secondaryBtnText: { fontSize: 14, fontFamily: fonts.bodyMedium },
  statsRow: { flexDirection: "row", gap: spacing.md },
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
}));
