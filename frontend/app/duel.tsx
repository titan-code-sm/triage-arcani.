// Il duello — the heart of the app. Full-screen Yu-Gi-Oh style arena.

import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet as RNStyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";import { useSafeAreaInsets } from "react-native-safe-area-context";

import { postDuel } from "@/src/api";
import { CardBack } from "@/src/components/CardBack";
import { CardDetailModal } from "@/src/components/CardDetailModal";
import { DestroyGhost, TarotCard } from "@/src/components/TarotCard";
import { LPBar } from "@/src/components/LPBar";
import { botTurn } from "@/src/game/bot";
import { tributeCostFor } from "@/src/game/cards";
import {
  activateSupport,
  canChangePosition,
  changePosition,
  drainFx,
  endTurnCore,
  isSupportable,
  newGame,
  performDraw,
  playToField,
  resolveBattle,
} from "@/src/game/engine";
import {
  DIFFICULTY_LABELS,
  type Difficulty,
  type FxEvent,
  type GameMode,
  type GameState,
} from "@/src/game/types";
import { useSfx } from "@/src/hooks/useSfx";
import { storage } from "@/src/utils/storage";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const BOT_NAMES: Record<Difficulty, string> = {
  easy: "Il Novizio",
  normal: "L'Adepto",
  hard: "L'Incubo",
};

interface SheetOption {
  label: string;
  icon: string;
  danger?: boolean;
  disabled?: boolean;
  testID: string;
  onPress: () => void;
}

export default function DuelScreen() {
  const params = useLocalSearchParams<{ mode?: string; difficulty?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const sfx = useSfx();
  const { width } = useWindowDimensions();

  const mode: GameMode = params.mode === "hotseat" ? "hotseat" : "bot";
  const difficulty: Difficulty =
    params.difficulty === "easy" || params.difficulty === "hard" ? params.difficulty : "normal";

  const engineRef = useRef<GameState | null>(null);
  if (!engineRef.current) {
    engineRef.current = newGame(mode, {
      name2: mode === "bot" ? BOT_NAMES[difficulty] : "Giocatore 2",
      botDifficulty: difficulty,
    });
  }
  const state = engineRef.current!;
  const [, bump] = useReducer((c: number) => c + 1, 0);

  const [uiLocked, setUiLocked] = useState(false);
  const [handSheetIdx, setHandSheetIdx] = useState<number | null>(null);
  const [fieldSheetSlot, setFieldSheetSlot] = useState<number | null>(null);
  const [attackFromSlot, setAttackFromSlot] = useState<number | null>(null);
  const [targeting, setTargeting] = useState(false);
  const [directAttackSlot, setDirectAttackSlot] = useState<number | null>(null);
  const [tribute, setTribute] = useState<{ handIdx: number; slots: number[] } | null>(null);
  const [changeover, setChangeover] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [ghosts, setGhosts] = useState<{ id: number; owner: number; slot: number; idx: number }[]>([]);
  const [floaters, setFloaters] = useState<{ id: number; playerIdx: number; delta: number }[]>([]);
  const [flash, setFlash] = useState<{ id: number; color: string } | null>(null);
  const [coin, setCoin] = useState(false);
  const [fate, setFate] = useState<{ id: number; title: string; desc: string } | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [hintClosed, setHintClosed] = useState(false);
  const recordedRef = useRef(false);

  useEffect(() => {
    void storage.getItem<string>("arcani_device_id", "").then((id) => {
      if (!id) {
        id = "d-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        void storage.setItem("arcani_device_id", id);
      }
      setDeviceId(id);
    });
    void storage.getItem<boolean>("arcani_hint_closed", false).then((v) => setHintClosed(v ?? false));
  }, []);

  const isHumanTurn = mode === "hotseat" || state.current === 0;
  const canAct = !state.over && !uiLocked && !changeover && state.phase === "action" && isHumanTurn;

  // ---- FX plumbing ----
  const shakeSV = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeSV.value }] }));

  const doShake = () => {
    shakeSV.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(0, { duration: 60 }),
    );
  };

  const doFlash = (color: string) => {
    const id = Date.now() + Math.random();
    setFlash({ id, color });
    setTimeout(() => setFlash((f) => (f && f.id === id ? null : f)), 480);
  };

  const processFx = useCallback(
    (fx: FxEvent[]) => {
      fx.forEach((ev) => {
        switch (ev.type) {
          case "draw":
            sfx.draw();
            break;
          case "summon":
            sfx.summon(ev.rarity === "epocale");
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            break;
          case "destroy": {
            sfx.destroy();
            const id = Date.now() + Math.random();
            setGhosts((g) => [...g, { id, owner: ev.owner, slot: ev.slot, idx: ev.cardIdx }]);
            setTimeout(() => setGhosts((g) => g.filter((x) => x.id !== id)), 750);
            break;
          }
          case "clash":
            sfx.hit();
            doShake();
            doFlash("rgba(235,235,245,0.22)");
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
            break;
          case "lp": {
            const id = Date.now() + Math.random();
            setFloaters((f) => [...f, { id, playerIdx: ev.playerIdx, delta: ev.delta }]);
            setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1200);
            if (ev.delta > 0) sfx.heal();
            if (Math.abs(ev.delta) >= 1200) doFlash("rgba(168,36,36,0.30)");
            break;
          }
          case "shake":
            doShake();
            break;
          case "flash":
            doFlash(ev.color);
            break;
          case "coinflip":
            sfx.coin();
            setCoin(true);
            setTimeout(() => setCoin(false), 1300);
            break;
          case "support":
            sfx.support();
            break;
          case "fate": {
            const id = Date.now() + Math.random();
            sfx.support();
            doFlash("rgba(212,175,55,0.22)");
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            setFate({ id, title: ev.title, desc: ev.desc });
            setTimeout(() => setFate((x) => (x && x.id === id ? null : x)), 2600);
            break;
          }
          case "gameover":
            break;
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sfx],
  );

  const commit = useCallback(() => {
    processFx(drainFx());
    bump();
  }, [processFx]);

  // ---- game over recording ----
  useEffect(() => {
    if (!state.over || recordedRef.current) return;
    recordedRef.current = true;
    const winner = state.winnerIdx;
    if (mode === "bot") {
      if (winner === 0) sfx.victory();
      else if (winner === 1) sfx.defeat();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const result = winner === 0 ? "vittoria" : winner === 1 ? "sconfitta" : "pareggio";
      const entry = {
        device_id: deviceId ?? "",
        opponent: state.players[1].name,
        mode: "bot",
        difficulty,
        result,
        turns: state.turnCount,
        lp_player: Math.max(0, state.players[0].lp),
        lp_opponent: Math.max(0, state.players[1].lp),
        created_at: new Date().toISOString(),
      };
      void (async () => {
        const key = "arcani_bot_stats";
        const stats = (await storage.getItem<Record<string, { wins: number; losses: number }>>(key, {})) ?? {};
        const d = stats[difficulty] ?? { wins: 0, losses: 0 };
        if (winner === 0) d.wins++;
        else if (winner === 1) d.losses++;
        stats[difficulty] = d;
        await storage.setItem(key, stats);
        const hist = (await storage.getItem<typeof entry[]>("arcani_history_local", [])) ?? [];
        hist.unshift(entry);
        if (hist.length > 30) hist.length = 30;
        await storage.setItem("arcani_history_local", hist);
      })();
      if (deviceId) void postDuel(entry).catch(() => {});
    } else {
      sfx.victory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.over]);

  // ---- actions ----
  const restart = () => {
    engineRef.current = newGame(mode, {
      name2: mode === "bot" ? BOT_NAMES[difficulty] : "Giocatore 2",
      botDifficulty: difficulty,
    });
    recordedRef.current = false;
    setGhosts([]);
    setFloaters([]);
    setTargeting(false);
    setTribute(null);
    setHandSheetIdx(null);
    setFieldSheetSlot(null);
    setAttackFromSlot(null);
    setDirectAttackSlot(null);
    setChangeover(mode === "hotseat" ? state.players[0].name : null);
    commit();
  };

  const humanEndTurn = async () => {
    if (state.over || uiLocked || state.phase !== "action" || !isHumanTurn) return;
    sfx.phase();
    endTurnCore(state);
    commit();
    setHandSheetIdx(null);
    setFieldSheetSlot(null);
    setTargeting(false);
    setTribute(null);
    setDirectAttackSlot(null);
    setAttackFromSlot(null);
    if (mode === "bot" && state.current === 1 && !state.over) {
      setUiLocked(true);
      await botTurn(state, { commit });
      setUiLocked(false);
    } else if (mode === "hotseat" && !state.over) {
      setChangeover(state.players[state.current].name);
    }
  };

  const onDeckTap = () => {
    if (state.over || uiLocked || !isHumanTurn || state.phase !== "draw") return;
    if (performDraw(state)) commit();
  };

  const summonCard = (handIdx: number, position: "atk" | "def", tributeSlots: number[] = []) => {
    const p = state.players[state.current];
    let slot = p.field.findIndex((s) => s === null);
    if (slot < 0 && tributeSlots.length > 0) slot = tributeSlots[0];
    if (slot < 0) return;
    if (playToField(state, handIdx, slot, position, tributeSlots)) commit();
    setHandSheetIdx(null);
    setTribute(null);
  };

  const supportCard = (handIdx: number) => {
    if (activateSupport(state, handIdx)) commit();
    setHandSheetIdx(null);
  };

  const onHandCardTap = (i: number) => {
    if (!canAct) return;
    sfx.tap();
    setHandSheetIdx(i);
  };

  const toggleTributeSlot = (slot: number) => {
    if (!tribute) return;
    const need = tributeCostFor(state.players[state.current].hand[tribute.handIdx]?.idx ?? 0);
    setTribute((t) => {
      if (!t) return t;
      if (t.slots.includes(slot)) return { ...t, slots: t.slots.filter((s) => s !== slot) };
      if (t.slots.length >= need) return t;
      return { ...t, slots: [...t.slots, slot] };
    });
    sfx.select();
  };

  const onOwnFieldTap = (slot: number) => {
    if (tribute) {
      toggleTributeSlot(slot);
      return;
    }
    if (!canAct) return;
    if (!state.players[state.current].field[slot]) return;
    sfx.select();
    setFieldSheetSlot(slot);
  };

  const startAttack = (slot: number) => {
    const oppIdx = 1 - state.current;
    const hasMonsters = state.players[oppIdx].field.some(Boolean);
    setFieldSheetSlot(null);
    setAttackFromSlot(slot);
    if (hasMonsters) setTargeting(true);
    else setDirectAttackSlot(slot);
  };

  const attackTarget = (target: number | null) => {
    if (attackFromSlot === null) return;
    const from = attackFromSlot;
    setTargeting(false);
    setDirectAttackSlot(null);
    setAttackFromSlot(null);
    resolveBattle(state, from, target);
    commit();
  };

  const doChangePosition = (slot: number) => {
    if (changePosition(state, slot)) {
      sfx.phase();
      commit();
    }
    setFieldSheetSlot(null);
  };

  // ---- render helpers ----
  const fieldCardW = Math.min(92, (width - spacing.lg * 2 - spacing.md * 2 - 40) / 3);
  const handCardW = Math.min(82, fieldCardW - 6);
  const fieldCardH = fieldCardW * 1.5;

  const renderFieldRow = (owner: number) => (
    <View style={styles.fieldRow}>
      {[0, 1, 2].map((slot) => {
        const card = state.players[owner].field[slot];
        const ghost = ghosts.find((g) => g.owner === owner && g.slot === slot);
        const isTargetable = targeting && owner === 1 - state.current;
        const isTributeSel = tribute?.slots.includes(slot) ?? false;
        return (
          <View key={slot} style={styles.slotWrap}>
            {card ? (
              <TarotCard
                idx={card.idx}
                width={fieldCardW}
                positionBadge={card.position ?? null}
                attacked={card.attacked}
                negated={card.negated}
                selected={isTributeSel || fieldSheetSlot === slot || (targeting && owner === state.current)}
                highlight={isTargetable}
                onPress={() => {
                  if (isTargetable) attackTarget(slot);
                  else if (owner === state.current) onOwnFieldTap(slot);
                }}
                testID={`field-card-${owner}-${slot}`}
              />
            ) : (
              <Pressable
                style={[styles.emptySlot, { width: fieldCardW, height: fieldCardH, borderColor: colors.matEdge }]}
                onPress={() => {
                  if (owner === state.current) onOwnFieldTap(slot);
                }}
                testID={`field-slot-${owner}-${slot}`}
              >
                <Text style={{ color: colors.matEdge, fontFamily: fonts.display }}>—</Text>
              </Pressable>
            )}
            {ghost ? <DestroyGhost idx={ghost.idx} width={fieldCardW} id={ghost.id} /> : null}
          </View>
        );
      })}
    </View>
  );

  const renderSupportRow = (owner: number) => {
    const used = owner === state.current ? state.supportUsedThisTurn : 0;
    return (
      <View style={styles.supportRow}>
        <Text style={[styles.supportLabel, { color: colors.onSurfaceTertiary }]}>ZONA SUPPORTO</Text>
        {[0, 1].map((i) => (
          <View
            key={i}
            style={[
              styles.supportSlot,
              {
                borderColor: i < used ? colors.gold : colors.matEdge,
                backgroundColor: i < used ? colors.brandTertiary : "transparent",
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderFloaters = (playerIdx: number) => (
    <View pointerEvents="none" style={RNStyleSheet.absoluteFill}>
      {floaters
        .filter((f) => f.playerIdx === playerIdx)
        .map((f) => (
          <Animated.Text
            key={f.id}
            entering={FadeInDown.duration(120)}
            exiting={FadeOutUp.duration(500)}
            style={[styles.floater, { color: f.delta > 0 ? colors.lpGreen : "#E85D5D" }]}
            testID={`lp-floater-${playerIdx}`}
          >
            {f.delta > 0 ? `+${f.delta}` : `${f.delta}`}
          </Animated.Text>
        ))}
    </View>
  );

  const renderOppHand = () => (
    <View style={styles.oppHand}>
      {state.players[1].hand.slice(0, 8).map((c) => (
        <CardBack key={c.uid} width={18} />
      ))}
      <Text style={[styles.oppHandCount, { color: colors.muted }]} testID="opp-hand-count">
        mano: {state.players[1].hand.length}
      </Text>
    </View>
  );

  const latestLog = state.log[0] ?? "";

  const renderCenter = () => {
    const mustDraw = state.phase === "draw" && isHumanTurn && !state.over && !changeover;
    return (
      <View style={[styles.centerStrip, { borderColor: colors.divider }]}>
        <View style={[styles.turnBadge, { backgroundColor: colors.brandTertiary, borderColor: colors.matEdge }]}>
          <Text style={[styles.turnText, { color: colors.goldSoft }]} numberOfLines={1} testID="turn-indicator">
            TURNO {state.turnCount} · {state.players[state.current].name.toUpperCase()}
          </Text>
        </View>
        <Pressable onPress={() => setLogOpen(true)} style={styles.logTicker} testID="log-ticker">
          <Text numberOfLines={1} style={[styles.logText, { color: colors.onSurfaceTertiary }]}>
            {latestLog}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDeckTap}
          style={[styles.deckPile, mustDraw && styles.deckPileGlow, { borderColor: mustDraw ? colors.gold : colors.matEdge }]}
          testID="deck-pile"
        >
          <CardBack width={30} count={state.deck.length} />
        </Pressable>
      </View>
    );
  };

  const hint = !isHumanTurn
    ? "L'avversario sta tramando..."
    : state.phase === "draw"
      ? "Tocca il mazzo per pescare."
      : state.summonedThisTurn
        ? "Hai già evocato: attacca o termina il turno."
        : "Tocca una carta della mano per evocarla.";

  const renderActionArea = () => {
    if (tribute) {
      const need = tributeCostFor(state.players[state.current].hand[tribute.handIdx]?.idx ?? 0);
      const ready = tribute.slots.length === need;
      return (
        <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Text style={[styles.tributeText, { color: colors.goldSoft }]} testID="tribute-banner">
            Sacrifica {need} mostri ({tribute.slots.length}/{need})
          </Text>
          <Pressable
            onPress={() => summonCard(tribute.handIdx, "atk", tribute.slots)}
            disabled={!ready}
            style={[styles.actionBtn, { backgroundColor: ready ? colors.brandPrimary : colors.surfaceTertiary }]}
            testID="tribute-attack-button"
          >
            <Text style={[styles.actionBtnText, { color: ready ? colors.onBrandPrimary : colors.muted }]}>ATTACCO</Text>
          </Pressable>
          <Pressable
            onPress={() => summonCard(tribute.handIdx, "def", tribute.slots)}
            disabled={!ready}
            style={[styles.actionBtn, { backgroundColor: ready ? colors.info : colors.surfaceTertiary }]}
            testID="tribute-defense-button"
          >
            <Text style={[styles.actionBtnText, { color: ready ? colors.onInfo : colors.muted }]}>DIFESA</Text>
          </Pressable>
          <Pressable
            onPress={() => setTribute(null)}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceTertiary }]}
            testID="tribute-cancel-button"
          >
            <Text style={[styles.actionBtnText, { color: colors.onSurfaceTertiary }]}>ANNULLA</Text>
          </Pressable>
        </View>
      );
    }
    if (targeting) {
      return (
        <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Text style={[styles.tributeText, { color: colors.goldSoft }]} testID="targeting-banner">
            Scegli un bersaglio
          </Text>
          <Pressable
            onPress={() => {
              setTargeting(false);
              setAttackFromSlot(null);
            }}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceTertiary, flex: 1 }]}
            testID="targeting-cancel-button"
          >
            <Text style={[styles.actionBtnText, { color: colors.onSurfaceTertiary }]}>ANNULLA</Text>
          </Pressable>
        </View>
      );
    }
    if (directAttackSlot !== null) {
      return (
        <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Text style={[styles.tributeText, { color: "#E85D5D" }]} testID="direct-attack-banner">
            Attacco diretto!
          </Text>
          <Pressable
            onPress={() => attackTarget(null)}
            style={[styles.actionBtn, { backgroundColor: colors.brandPrimary, flex: 1 }]}
            testID="direct-attack-confirm-button"
          >
            <Text style={[styles.actionBtnText, { color: colors.onBrandPrimary }]}>CONFERMA</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setDirectAttackSlot(null);
              setAttackFromSlot(null);
            }}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceTertiary, flex: 1 }]}
            testID="direct-attack-cancel-button"
          >
            <Text style={[styles.actionBtnText, { color: colors.onSurfaceTertiary }]}>ANNULLA</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        {!hintClosed ? (
          <Text style={[styles.hint, { color: colors.onSurfaceTertiary }]} testID="duel-hint">
            {hint}
            <Text
              onPress={() => {
                setHintClosed(true);
                void storage.setItem("arcani_hint_closed", true);
              }}
              style={styles.hintClose}
            >
              {"  ✕"}
            </Text>
          </Text>
        ) : (
          <View />
        )}
        <Pressable
          onPress={humanEndTurn}
          disabled={!canAct}
          style={[styles.endTurnBtn, { backgroundColor: canAct ? colors.gold : colors.surfaceTertiary }]}
          testID="end-turn-button"
        >
          <Text style={[styles.endTurnText, { color: canAct ? colors.onBrandSecondary : colors.muted }]}>
            FINE TURNO
          </Text>
        </Pressable>
      </View>
    );
  };

  const sheetVisible = handSheetIdx !== null || fieldSheetSlot !== null;
  const closeSheet = () => {
    setHandSheetIdx(null);
    setFieldSheetSlot(null);
  };

  const renderSheet = () => {
    let options: SheetOption[] = [];
    let previewIdx: number | null = null;
    if (handSheetIdx !== null) {
      const card = state.players[state.current].hand[handSheetIdx];
      if (!card) return null;
      previewIdx = card.idx;
      const cost = tributeCostFor(card.idx);
      const freeSlot = state.players[state.current].field.findIndex((s) => s === null);
      const fieldFull = freeSlot < 0;
      const canSummon = canAct && !state.summonedThisTurn && (!fieldFull || cost > 0);
      const canPay = fieldCountOfOwn() >= cost;
      options = [
        {
          label: cost > 0 ? `Evoca in Attacco · Tributo ×${cost}` : "Evoca in Attacco",
          icon: "sword",
          disabled: !canSummon || !canPay,
          testID: "sheet-summon-atk",
          onPress: () => {
            if (cost > 0) {
              setTribute({ handIdx: handSheetIdx, slots: [] });
              setHandSheetIdx(null);
            } else {
              summonCard(handSheetIdx, "atk");
            }
          },
        },
        {
          label: cost > 0 ? `Evoca in Difesa · Tributo ×${cost}` : "Evoca in Difesa",
          icon: "shield-half-full",
          disabled: !canSummon || !canPay,
          testID: "sheet-summon-def",
          onPress: () => {
            if (cost > 0) {
              setTribute({ handIdx: handSheetIdx, slots: [] });
              setHandSheetIdx(null);
            } else {
              summonCard(handSheetIdx, "def");
            }
          },
        },
        {
          label: `Attiva come Supporto (${state.supportUsedThisTurn}/2)`,
          icon: "flash",
          disabled: !(canAct && isSupportable(card.idx) && state.supportUsedThisTurn < 2),
          testID: "sheet-support",
          onPress: () => supportCard(handSheetIdx),
        },
        {
          label: "Vedi la carta",
          icon: "eye",
          disabled: false,
          testID: "sheet-view-card",
          onPress: () => {
            setDetailIdx(card.idx);
            closeSheet();
          },
        },
      ];
    } else if (fieldSheetSlot !== null) {
      const card = state.players[state.current].field[fieldSheetSlot];
      if (!card) return null;
      previewIdx = card.idx;
      const canBattle = canAct && card.position === "atk" && !card.attacked;
      options = [
        {
          label: "Dichiara Battaglia",
          icon: "sword-cross",
          disabled: !canBattle,
          testID: "sheet-attack",
          onPress: () => startAttack(fieldSheetSlot),
        },
        {
          label: "Cambia Posizione",
          icon: "swap-vertical",
          disabled: !(canAct && canChangePosition(state, fieldSheetSlot)),
          testID: "sheet-change-position",
          onPress: () => doChangePosition(fieldSheetSlot),
        },
        {
          label: "Vedi la carta",
          icon: "eye",
          disabled: false,
          testID: "sheet-view-field-card",
          onPress: () => {
            setDetailIdx(card.idx);
            closeSheet();
          },
        },
      ];
    }
    return (
      <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={styles.sheetBackdrop} onPress={closeSheet} testID="sheet-backdrop">
          <View
            style={[
              styles.sheetPanel,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.matEdge,
                paddingBottom: insets.bottom + spacing.md,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHeader}>
              {previewIdx !== null ? (
                <TarotCard idx={previewIdx} width={44} testID="sheet-card-preview" />
              ) : null}
              <View style={styles.sheetOptions}>
                {options.map((opt) => (
                  <Pressable
                    key={opt.testID}
                    onPress={opt.disabled ? undefined : opt.onPress}
                    disabled={opt.disabled}
                    style={[
                      styles.sheetOption,
                      {
                        borderColor: opt.disabled ? colors.border : opt.danger ? colors.error : colors.matEdge,
                        opacity: opt.disabled ? 0.45 : 1,
                      },
                    ]}
                    testID={opt.testID}
                  >
                    <MaterialIcons name={opt.icon as any} size={18} color={opt.disabled ? colors.muted : colors.goldSoft} />
                    <Text style={[styles.sheetOptionText, { color: opt.disabled ? colors.muted : colors.onSurface }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
                <Pressable style={styles.sheetClose} onPress={closeSheet} testID="sheet-close-button">
                  <Text style={[styles.sheetCloseText, { color: colors.muted }]}>Chiudi</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  };

  function fieldCountOfOwn() {
    return state.players[state.current].field.filter(Boolean).length;
  }

  const opponentName = state.players[1].name;
  const oppDiffLabel = mode === "bot" ? DIFFICULTY_LABELS[difficulty] : "LOCALE";

  return (
    <View style={styles.root} testID="duel-screen">
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={() => router.back()} style={styles.leaveBtn} testID="duel-exit-button">
          <MaterialIcons name="exit-run" size={20} color={colors.goldSoft} />
          <Text style={[styles.leaveText, { color: colors.goldSoft }]}>Esci</Text>
        </Pressable>
        <Pressable onPress={() => setLogOpen(true)} style={styles.leaveBtn} testID="duel-log-button">
          <MaterialIcons name="script-text-outline" size={18} color={colors.goldSoft} />
          <Text style={[styles.leaveText, { color: colors.goldSoft }]}>Cronaca</Text>
        </Pressable>
      </View>
      <Animated.View style={[styles.shakeWrap, shakeStyle]}>
        {/* Opponent panel */}
        <View style={styles.playerPanel}>
          <LPBar name={`${opponentName} · ${oppDiffLabel}`} lp={state.players[1].lp} align="right" testID="lp-opponent" />
          {renderFloaters(1)}
        </View>
        {renderOppHand()}
        {renderSupportRow(1)}
        {renderFieldRow(1)}

        {renderCenter()}

        {renderFieldRow(0)}
        {renderSupportRow(0)}
        {/* Player panel */}
        <View style={styles.playerPanel}>
          <LPBar name={state.players[0].name} lp={state.players[0].lp} testID="lp-player" />
          {renderFloaters(0)}
        </View>

        {/* Hand */}
        <View style={styles.handArea} testID="hand-area">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.handContent}>
            {state.players[0].hand.map((c, i) => (
              <TarotCard
                key={c.uid}
                idx={c.idx}
                width={handCardW}
                showName
                onPress={() => onHandCardTap(i)}
                disabled={!canAct}
                testID={`hand-card-${i}`}
              />
            ))}
          </ScrollView>
        </View>

        {renderActionArea()}
      </Animated.View>

      {/* flash overlay */}
      {flash ? (
        <Animated.View
          entering={FadeIn.duration(60)}
          exiting={FadeOut.duration(380)}
          pointerEvents="none"
          style={[RNStyleSheet.absoluteFill, { backgroundColor: flash.color }]}
        />
      ) : null}

      {/* coin overlay */}
      {coin ? (
        <View style={[RNStyleSheet.absoluteFill, styles.coinOverlay]} pointerEvents="none">
          <CoinSpin />
        </View>
      ) : null}

      {/* Fate event banner */}
      {fate ? (
        <View style={[RNStyleSheet.absoluteFill, styles.fateOverlay]} pointerEvents="none">
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(400)}
            style={[styles.fatePanel, { borderColor: colors.gold, backgroundColor: colors.surface }]}
          >
            <Text style={[styles.fateTag, { color: colors.gold }]}>⚡ EVENTO DEL DESTINO</Text>
            <Text style={[styles.fateTitle, { color: colors.goldSoft }]} testID="fate-title">{fate.title}</Text>
            <Text style={[styles.fateDesc, { color: colors.onSurfaceSecondary }]}>{fate.desc}</Text>
          </Animated.View>
        </View>
      ) : null}

      {renderSheet()}

      {/* changeover (hotseat) */}
      {changeover ? (
        <Modal visible transparent animationType="fade">
          <View style={[RNStyleSheet.absoluteFill, styles.changeoverOverlay]}>
            <Text style={[styles.changeoverTitle, { color: colors.goldSoft }]} testID="changeover-title">
              TURNO {state.turnCount}
            </Text>
            <Text style={[styles.changeoverName, { color: colors.onSurface }]}>{changeover}, sei tu</Text>
            <Text style={[styles.changeoverSub, { color: colors.muted }]}>La mano è nascosta. Passa il dispositivo.</Text>
            <Pressable
              onPress={() => {
                setChangeover(null);
                sfx.phase();
              }}
              style={[styles.changeoverBtn, { backgroundColor: colors.brandPrimary }]}
              testID="changeover-ready-button"
            >
              <Text style={[styles.endTurnText, { color: colors.onBrandPrimary }]}>SONO PRONTO</Text>
            </Pressable>
          </View>
        </Modal>
      ) : null}

      {/* log modal */}
      <Modal visible={logOpen} transparent animationType="slide" onRequestClose={() => setLogOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setLogOpen(false)}>
          <View
            style={[
              styles.logPanel,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.matEdge, paddingBottom: insets.bottom + spacing.md },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.logTitle, { color: colors.goldSoft }]}>CRONACA DEL DUELLO</Text>
            <ScrollView style={styles.logScroll} testID="duel-log-list">
              {state.log.map((line, i) => (
                <Text key={i} style={[styles.logLine, { color: colors.onSurfaceTertiary, opacity: 1 - Math.min(0.6, i * 0.04) }]}>
                  {line}
                </Text>
              ))}
            </ScrollView>
            <Pressable onPress={() => setLogOpen(false)} style={[styles.sheetClose, { alignSelf: "center" }]} testID="log-close-button">
              <Text style={[styles.sheetCloseText, { color: colors.muted }]}>Chiudi</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* game over */}
      {state.over ? (
        <View style={[RNStyleSheet.absoluteFill, styles.gameoverOverlay]} pointerEvents="box-none">
          <View style={[styles.gameoverPanel, { backgroundColor: colors.surface, borderColor: mode === "bot" ? (state.winnerIdx === 0 ? colors.gold : colors.error) : colors.gold }]}>
            <Text
              style={[styles.gameoverTitle, { color: mode === "bot" ? (state.winnerIdx === 0 ? colors.gold : "#E85D5D") : colors.goldSoft }]}
              testID="gameover-title"
            >
              {mode === "bot"
                ? state.winnerIdx === 0
                  ? "VITTORIA"
                  : state.winnerIdx === 1
                    ? "SCONFITTA"
                    : "PAREGGIO"
                : `${state.players[state.winnerIdx]?.name?.toUpperCase() ?? "PAREGGIO"} VINCE`}
            </Text>
            <Text style={[styles.gameoverReason, { color: colors.onSurfaceSecondary }]} testID="gameover-reason">
              {state.overReason}
            </Text>
            <Text style={[styles.gameoverTurns, { color: colors.muted }]}>Durata: {state.turnCount} turni</Text>
            <Pressable onPress={restart} style={[styles.changeoverBtn, { backgroundColor: colors.brandPrimary }]} testID="rematch-button">
              <Text style={[styles.endTurnText, { color: colors.onBrandPrimary }]}>RIVINCITA</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={[styles.changeoverBtn, { backgroundColor: colors.surfaceTertiary }]} testID="gameover-menu-button">
              <Text style={[styles.endTurnText, { color: colors.onSurface }]}>TORNA ALL’ARENA</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <CardDetailModal idx={detailIdx} onClose={() => setDetailIdx(null)} />
    </View>
  );
}

function CoinSpin() {
  const { colors } = useTheme();
  const styles = useStyles();
  const rot = useSharedValue(0);
  React.useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 700, easing: Easing.linear }), -1);
  }, [rot]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotateY: `${rot.value}deg` as any }] }));
  return (
    <Animated.View style={[styles.coin, { borderColor: colors.gold, backgroundColor: colors.brandTertiary }, style]}>
      <Text style={{ color: colors.gold, fontFamily: fonts.displayBold, fontSize: 18 }}>?</Text>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  leaveBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: spacing.sm },
  leaveText: { fontSize: 13, fontFamily: fonts.bodyMedium },
  shakeWrap: { flex: 1, backgroundColor: colors.surface },
  playerPanel: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.mat,
  },
  slotWrap: { position: "relative" },
  emptySlot: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.mat,
  },
  supportLabel: { fontSize: 9, fontFamily: fonts.display, letterSpacing: 2, marginRight: spacing.xs },
  supportSlot: { width: 22, height: 16, borderRadius: 4, borderWidth: 1.5, borderStyle: "dashed" },
  oppHand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 2,
  },
  oppHandCount: { fontSize: 11, fontFamily: fonts.body, marginLeft: spacing.sm },
  centerStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: colors.surface,
  },
  turnBadge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: 190,
  },
  turnText: { fontSize: 10, fontFamily: fonts.displayBold, letterSpacing: 1 },
  logTicker: { flex: 1 },
  logText: { fontSize: 11, fontFamily: fonts.body },
  deckPile: {
    borderRadius: radius.sm,
    borderWidth: 1.5,
    padding: 2,
  },
  deckPileGlow: { shadowColor: colors.gold, shadowOpacity: 0.8, shadowRadius: 8 },
  handArea: { paddingHorizontal: spacing.md, height: 138 },
  handContent: { alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.xs },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  hint: { flex: 1, fontSize: 12, fontFamily: fonts.body, lineHeight: 17 },
  hintClose: { color: colors.muted, fontFamily: fonts.bodyBold },
  tributeText: { flex: 1, fontSize: 13, fontFamily: fonts.bodyMedium },
  actionBtn: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: { fontSize: 12, fontFamily: fonts.displayBold, letterSpacing: 1 },
  endTurnBtn: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
  },
  endTurnText: { fontSize: 13, fontFamily: fonts.displayBold, letterSpacing: 2 },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(5,5,8,0.6)",
    justifyContent: "flex-end",
  },
  sheetPanel: {
    borderTopWidth: 1.5,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sheetHeader: { flexDirection: "row", gap: spacing.lg, alignItems: "flex-start" },
  sheetOptions: { flex: 1, gap: spacing.sm },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    minHeight: 46,
  },
  sheetOptionText: { fontSize: 14, fontFamily: fonts.bodyMedium },
  sheetClose: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  sheetCloseText: { fontSize: 13, fontFamily: fonts.body, textAlign: "center" },
  logPanel: {
    borderTopWidth: 1.5,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    maxHeight: "70%",
  },
  logTitle: { fontSize: 14, fontFamily: fonts.displayBold, letterSpacing: 2, marginBottom: spacing.sm },
  logScroll: { maxHeight: 400 },
  logLine: { fontSize: 12, fontFamily: fonts.body, lineHeight: 18, marginBottom: 6 },
  coinOverlay: {
    backgroundColor: "rgba(5,5,8,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  coin: {
    width: 90,
    height: 90,
    borderRadius: radius.pill,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  fateOverlay: { alignItems: "center", justifyContent: "center", padding: spacing.xl },
  fatePanel: { borderWidth: 2, borderRadius: radius.lg, padding: spacing.xl, alignItems: "center", gap: spacing.sm, maxWidth: 340 },
  fateTag: { fontSize: 12, fontFamily: fonts.displayBold, letterSpacing: 3 },
  fateTitle: { fontSize: 26, fontFamily: fonts.displayBold, textAlign: "center" },
  fateDesc: { fontSize: 14, fontFamily: fonts.body, textAlign: "center", lineHeight: 20 },
  changeoverOverlay: {
    backgroundColor: "rgba(10,11,14,0.98)",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  changeoverTitle: { fontSize: 20, fontFamily: fonts.displayBold, letterSpacing: 4 },
  changeoverName: { fontSize: 26, fontFamily: fonts.displayBold, textAlign: "center" },
  changeoverSub: { fontSize: 13, fontFamily: fonts.body, textAlign: "center" },
  changeoverBtn: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    marginTop: spacing.sm,
    alignSelf: "center",
  },
  gameoverOverlay: {
    backgroundColor: "rgba(5,5,8,0.9)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  gameoverPanel: {
    width: "100%",
    maxWidth: 360,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  gameoverTitle: { fontSize: 34, fontFamily: fonts.displayBold, letterSpacing: 4 },
  gameoverReason: { fontSize: 14, fontFamily: fonts.body, textAlign: "center" },
  gameoverTurns: { fontSize: 12, fontFamily: fonts.body },
  floaterHolder: { position: "absolute", right: spacing.xl, top: 0 },
  floater: {
    position: "absolute",
    right: spacing.lg,
    top: -6,
    fontSize: 20,
    fontFamily: fonts.displayBold,
  },
}));
