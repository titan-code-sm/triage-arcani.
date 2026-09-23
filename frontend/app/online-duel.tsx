// Duello Online — networked duel synced through a Firestore room document.
// Only the player whose turn it is mutates the shared GameState and writes it;
// the opponent listens via onSnapshot and animates the incoming events.

import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
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
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardBack } from "@/src/components/CardBack";
import { CardDetailModal } from "@/src/components/CardDetailModal";
import { DestroyGhost, TarotCard } from "@/src/components/TarotCard";
import { LPBar } from "@/src/components/LPBar";
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
import type { FxEvent, GameState } from "@/src/game/types";
import { useSfx } from "@/src/hooks/useSfx";
import {
  abandonRoom,
  deleteRoom,
  pushState,
  requestRematch,
  startGame,
  subscribeRoom,
  type RoomDoc,
} from "@/src/online/rooms";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function OnlineDuelScreen() {
  const params = useLocalSearchParams<{ roomId?: string; role?: string; nick?: string }>();
  const roomId = params.roomId ?? "";
  const role = params.role === "guest" ? "guest" : "host";
  const myIdx = role === "host" ? 0 : 1;
  const oppIdx = (1 - myIdx) as 0 | 1;

  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const sfx = useSfx();
  const { width } = useWindowDimensions();

  const stateRef = useRef<GameState | null>(null);
  const lastSeqRef = useRef<number>(-1);
  const initStartedRef = useRef(false);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((c) => c + 1), []);

  const [room, setRoom] = useState<RoomDoc | null>(null);
  const [handSheetIdx, setHandSheetIdx] = useState<number | null>(null);
  const [fieldSheetSlot, setFieldSheetSlot] = useState<number | null>(null);
  const [attackFromSlot, setAttackFromSlot] = useState<number | null>(null);
  const [targeting, setTargeting] = useState(false);
  const [directAttack, setDirectAttack] = useState<number | null>(null);
  const [tribute, setTribute] = useState<{ handIdx: number; slots: number[] } | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [ghosts, setGhosts] = useState<{ id: number; owner: number; slot: number; idx: number }[]>([]);
  const [floaters, setFloaters] = useState<{ id: number; playerIdx: number; delta: number }[]>([]);
  const [flash, setFlash] = useState<{ id: number; color: string } | null>(null);
  const [coin, setCoin] = useState(false);
  const [fate, setFate] = useState<{ id: number; title: string; desc: string } | null>(null);

  // ---- FX ----
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
          default:
            break;
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sfx],
  );

  // ---- subscribe to room ----
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeRoom(roomId, (r) => {
      if (!r) {
        setRoom((prev) => (prev ? { ...prev, status: "finished", abandonedBy: oppIdx } : prev));
        return;
      }
      setRoom(r);

      // Host boots the game once the guest has joined.
      if (
        role === "host" &&
        r.status === "waiting" &&
        r.guestNick &&
        !initStartedRef.current
      ) {
        initStartedRef.current = true;
        const g = newGame("hotseat", { name1: r.hostNick, name2: r.guestNick });
        stateRef.current = g;
        lastSeqRef.current = 0;
        void startGame(roomId, g);
        return;
      }

      // Adopt incoming authoritative state on new writes.
      if (r.state && typeof r.eventSeq === "number" && r.eventSeq !== lastSeqRef.current) {
        lastSeqRef.current = r.eventSeq;
        stateRef.current = r.state as GameState;
        // Reset transient interaction if it's no longer our turn.
        if (r.state.current !== myIdx) {
          setHandSheetIdx(null);
          setFieldSheetSlot(null);
          setTargeting(false);
          setTribute(null);
          setDirectAttack(null);
          setAttackFromSlot(null);
        }
        if (r.lastWriter !== myIdx) {
          processFx((r.events ?? []) as FxEvent[]);
        }
        rerender();
      } else {
        rerender();
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const state = stateRef.current;
  const waiting = !room || room.status === "waiting" || !state;
  const abandoned = !!room && room.abandonedBy !== null && room.abandonedBy !== undefined && room.status === "finished" && !state?.over;
  const isMyTurn = !!state && !state.over && state.current === myIdx;
  const canAct = isMyTurn && !targeting && !tribute && directAttack === null;

  const commitAndPush = () => {
    if (!state) return;
    const fx = drainFx();
    processFx(fx);
    rerender();
    void pushState(roomId, state, fx, myIdx);
  };

  // ---- actions ----
  const onDeckTap = () => {
    if (!state || !isMyTurn || state.phase !== "draw") return;
    if (performDraw(state)) commitAndPush();
  };

  const summonCard = (handIdx: number, position: "atk" | "def", tributeSlots: number[] = []) => {
    if (!state) return;
    let slot = state.players[myIdx].field.findIndex((s) => s === null);
    if (slot < 0 && tributeSlots.length > 0) slot = tributeSlots[0];
    if (slot < 0) return;
    if (playToField(state, handIdx, slot, position, tributeSlots)) commitAndPush();
    setHandSheetIdx(null);
    setTribute(null);
  };

  const supportCard = (handIdx: number) => {
    if (!state) return;
    if (activateSupport(state, handIdx)) commitAndPush();
    setHandSheetIdx(null);
  };

  const toggleTributeSlot = (slot: number) => {
    if (!tribute || !state) return;
    const need = tributeCostFor(state.players[myIdx].hand[tribute.handIdx]?.idx ?? 0);
    setTribute((t) => {
      if (!t) return t;
      if (t.slots.includes(slot)) return { ...t, slots: t.slots.filter((s) => s !== slot) };
      if (t.slots.length >= need) return t;
      return { ...t, slots: [...t.slots, slot] };
    });
    sfx.select();
  };

  const startAttack = (slot: number) => {
    if (!state) return;
    const hasMonsters = state.players[oppIdx].field.some(Boolean);
    setFieldSheetSlot(null);
    setAttackFromSlot(slot);
    if (hasMonsters) setTargeting(true);
    else setDirectAttack(slot);
  };

  const attackTarget = (target: number | null) => {
    if (attackFromSlot === null || !state) return;
    const from = attackFromSlot;
    setTargeting(false);
    setDirectAttack(null);
    setAttackFromSlot(null);
    resolveBattle(state, from, target);
    commitAndPush();
  };

  const doChangePosition = (slot: number) => {
    if (!state) return;
    if (changePosition(state, slot)) {
      sfx.phase();
      commitAndPush();
    }
    setFieldSheetSlot(null);
  };

  const endTurn = () => {
    if (!state || !isMyTurn || state.phase !== "action") return;
    sfx.phase();
    endTurnCore(state);
    commitAndPush();
    setHandSheetIdx(null);
    setFieldSheetSlot(null);
  };

  const rematch = () => {
    void requestRematch(roomId, role);
    if (role === "host" && room) {
      // host restarts once both agree
      const bothReady = (room.hostRematch || true) && room.guestRematch;
      if (bothReady) {
        const g = newGame("hotseat", { name1: room.hostNick, name2: room.guestNick ?? "Sfidante" });
        stateRef.current = g;
        lastSeqRef.current = 0;
        void startGame(roomId, g);
      }
    }
  };

  const leave = () => {
    if (role === "host" && (!room || room.status === "waiting") && !state) {
      void deleteRoom(roomId);
    } else {
      void abandonRoom(roomId, myIdx);
    }
    router.back();
  };

  // ---- layout ----
  const fieldCardW = Math.min(92, (width - spacing.lg * 2 - spacing.md * 2 - 40) / 3);
  const handCardW = Math.min(82, fieldCardW - 6);
  const fieldCardH = fieldCardW * 1.5;

  const renderFloaters = (playerIdx: number) => (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {floaters
        .filter((f) => f.playerIdx === playerIdx)
        .map((f) => (
          <Animated.Text
            key={f.id}
            entering={FadeInDown.duration(120)}
            exiting={FadeOutUp.duration(500)}
            style={[styles.floater, { color: f.delta > 0 ? colors.lpGreen : "#E85D5D" }]}
          >
            {f.delta > 0 ? `+${f.delta}` : `${f.delta}`}
          </Animated.Text>
        ))}
    </View>
  );

  const renderFieldRow = (owner: number) => (
    <View style={styles.fieldRow}>
      {[0, 1, 2].map((slot) => {
        if (!state) return <View key={slot} style={{ width: fieldCardW, height: fieldCardH }} />;
        const card = state.players[owner].field[slot];
        const ghost = ghosts.find((g) => g.owner === owner && g.slot === slot);
        const isTargetable = targeting && owner === oppIdx;
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
                selected={isTributeSel || fieldSheetSlot === slot}
                highlight={isTargetable}
                onPress={() => {
                  if (isTargetable) attackTarget(slot);
                  else if (owner === myIdx) {
                    if (tribute) toggleTributeSlot(slot);
                    else if (canAct) {
                      sfx.select();
                      setFieldSheetSlot(slot);
                    }
                  }
                }}
                testID={`online-field-${owner}-${slot}`}
              />
            ) : (
              <Pressable
                style={[styles.emptySlot, { width: fieldCardW, height: fieldCardH, borderColor: colors.matEdge }]}
                onPress={() => {
                  if (owner === myIdx && tribute) toggleTributeSlot(slot);
                }}
                testID={`online-slot-${owner}-${slot}`}
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
    const used = state && owner === state.current ? state.supportUsedThisTurn : 0;
    return (
      <View style={styles.supportRow}>
        <Text style={[styles.supportLabel, { color: colors.onSurfaceTertiary }]}>ZONA SUPPORTO</Text>
        {[0, 1].map((i) => (
          <View
            key={i}
            style={[
              styles.supportSlot,
              { borderColor: i < used ? colors.gold : colors.matEdge, backgroundColor: i < used ? colors.brandTertiary : "transparent" },
            ]}
          />
        ))}
      </View>
    );
  };

  const oppHandCount = state ? state.players[oppIdx].hand.length : 0;
  const renderOppHand = () => (
    <View style={styles.oppHand}>
      {Array.from({ length: Math.min(8, oppHandCount) }).map((_, i) => (
        <CardBack key={i} width={18} />
      ))}
      <Text style={[styles.oppHandCount, { color: colors.muted }]}>mano: {oppHandCount}</Text>
    </View>
  );

  const latestLog = state?.log[0] ?? "";
  const renderCenter = () => {
    const mustDraw = !!state && isMyTurn && state.phase === "draw";
    return (
      <View style={[styles.centerStrip, { borderColor: colors.divider }]}>
        <View style={[styles.turnBadge, { backgroundColor: colors.brandTertiary, borderColor: colors.matEdge }]}>
          <Text style={[styles.turnText, { color: colors.goldSoft }]} numberOfLines={1} testID="online-turn-indicator">
            {state ? `TURNO ${state.turnCount}` : "..."} · {isMyTurn ? "TOCCA A TE" : "AVVERSARIO"}
          </Text>
        </View>
        <Pressable onPress={() => setLogOpen(true)} style={styles.logTicker}>
          <Text numberOfLines={1} style={[styles.logText, { color: colors.onSurfaceTertiary }]}>
            {latestLog}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDeckTap}
          style={[styles.deckPile, mustDraw && styles.deckPileGlow, { borderColor: mustDraw ? colors.gold : colors.matEdge }]}
          testID="online-deck-pile"
        >
          <CardBack width={30} count={state?.deck.length ?? 45} />
        </Pressable>
      </View>
    );
  };

  const renderActionArea = () => {
    if (tribute && state) {
      const need = tributeCostFor(state.players[myIdx].hand[tribute.handIdx]?.idx ?? 0);
      const ready = tribute.slots.length === need;
      return (
        <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Text style={[styles.tributeText, { color: colors.goldSoft }]}>
            Sacrifica {need} mostri ({tribute.slots.length}/{need})
          </Text>
          <Pressable onPress={() => summonCard(tribute.handIdx, "atk", tribute.slots)} disabled={!ready} style={[styles.actionBtn, { backgroundColor: ready ? colors.brandPrimary : colors.surfaceTertiary }]}>
            <Text style={[styles.actionBtnText, { color: ready ? colors.onBrandPrimary : colors.muted }]}>ATT</Text>
          </Pressable>
          <Pressable onPress={() => summonCard(tribute.handIdx, "def", tribute.slots)} disabled={!ready} style={[styles.actionBtn, { backgroundColor: ready ? colors.info : colors.surfaceTertiary }]}>
            <Text style={[styles.actionBtnText, { color: ready ? colors.onInfo : colors.muted }]}>DIF</Text>
          </Pressable>
          <Pressable onPress={() => setTribute(null)} style={[styles.actionBtn, { backgroundColor: colors.surfaceTertiary }]}>
            <Text style={[styles.actionBtnText, { color: colors.onSurfaceTertiary }]}>✕</Text>
          </Pressable>
        </View>
      );
    }
    if (targeting) {
      return (
        <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Text style={[styles.tributeText, { color: colors.goldSoft }]}>Scegli un bersaglio</Text>
          <Pressable onPress={() => { setTargeting(false); setAttackFromSlot(null); }} style={[styles.actionBtn, { backgroundColor: colors.surfaceTertiary, flex: 1 }]} testID="online-targeting-cancel">
            <Text style={[styles.actionBtnText, { color: colors.onSurfaceTertiary }]}>ANNULLA</Text>
          </Pressable>
        </View>
      );
    }
    if (directAttack !== null) {
      return (
        <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Text style={[styles.tributeText, { color: "#E85D5D" }]}>Attacco diretto!</Text>
          <Pressable onPress={() => attackTarget(null)} style={[styles.actionBtn, { backgroundColor: colors.brandPrimary, flex: 1 }]} testID="online-direct-confirm">
            <Text style={[styles.actionBtnText, { color: colors.onBrandPrimary }]}>CONFERMA</Text>
          </Pressable>
          <Pressable onPress={() => { setDirectAttack(null); setAttackFromSlot(null); }} style={[styles.actionBtn, { backgroundColor: colors.surfaceTertiary, flex: 1 }]}>
            <Text style={[styles.actionBtnText, { color: colors.onSurfaceTertiary }]}>ANNULLA</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Text style={[styles.hint, { color: colors.onSurfaceTertiary }]} numberOfLines={2}>
          {!state
            ? "In attesa dell'avversario..."
            : !isMyTurn
              ? "Attendi la mossa dell'avversario."
              : state.phase === "draw"
                ? "Tocca il mazzo per pescare."
                : state.summonedThisTurn
                  ? "Attacca o termina il turno."
                  : "Tocca una carta per evocarla."}
        </Text>
        <Pressable onPress={endTurn} disabled={!canAct || state?.phase !== "action"} style={[styles.endTurnBtn, { backgroundColor: canAct && state?.phase === "action" ? colors.gold : colors.surfaceTertiary }]} testID="online-end-turn">
          <Text style={[styles.endTurnText, { color: canAct && state?.phase === "action" ? colors.onBrandSecondary : colors.muted }]}>FINE TURNO</Text>
        </Pressable>
      </View>
    );
  };

  // ---- action sheet (mirrors local duel) ----
  const sheetVisible = handSheetIdx !== null || fieldSheetSlot !== null;
  const closeSheet = () => {
    setHandSheetIdx(null);
    setFieldSheetSlot(null);
  };
  const renderSheet = () => {
    if (!state) return null;
    let options: { label: string; icon: string; disabled: boolean; testID: string; onPress: () => void }[] = [];
    let previewIdx: number | null = null;
    if (handSheetIdx !== null) {
      const card = state.players[myIdx].hand[handSheetIdx];
      if (!card) return null;
      previewIdx = card.idx;
      const cost = tributeCostFor(card.idx);
      const freeSlot = state.players[myIdx].field.findIndex((s) => s === null);
      const fieldFull = freeSlot < 0;
      const canSummon = canAct && !state.summonedThisTurn && (!fieldFull || cost > 0);
      const canPay = state.players[myIdx].field.filter(Boolean).length >= cost;
      options = [
        {
          label: cost > 0 ? `Evoca in Attacco · Tributo ×${cost}` : "Evoca in Attacco",
          icon: "sword",
          disabled: !canSummon || !canPay,
          testID: "online-sheet-summon-atk",
          onPress: () => {
            if (cost > 0) { setTribute({ handIdx: handSheetIdx, slots: [] }); setHandSheetIdx(null); }
            else summonCard(handSheetIdx, "atk");
          },
        },
        {
          label: cost > 0 ? `Evoca in Difesa · Tributo ×${cost}` : "Evoca in Difesa",
          icon: "shield-half-full",
          disabled: !canSummon || !canPay,
          testID: "online-sheet-summon-def",
          onPress: () => {
            if (cost > 0) { setTribute({ handIdx: handSheetIdx, slots: [] }); setHandSheetIdx(null); }
            else summonCard(handSheetIdx, "def");
          },
        },
        {
          label: `Attiva come Supporto (${state.supportUsedThisTurn}/2)`,
          icon: "flash",
          disabled: !(canAct && isSupportable(card.idx) && state.supportUsedThisTurn < 2),
          testID: "online-sheet-support",
          onPress: () => supportCard(handSheetIdx),
        },
        { label: "Vedi la carta", icon: "eye", disabled: false, testID: "online-sheet-view", onPress: () => { setDetailIdx(card.idx); closeSheet(); } },
      ];
    } else if (fieldSheetSlot !== null) {
      const card = state.players[myIdx].field[fieldSheetSlot];
      if (!card) return null;
      previewIdx = card.idx;
      const canBattle = canAct && card.position === "atk" && !card.attacked && state.phase === "action";
      options = [
        { label: "Dichiara Battaglia", icon: "sword-cross", disabled: !canBattle, testID: "online-sheet-attack", onPress: () => startAttack(fieldSheetSlot) },
        { label: "Cambia Posizione", icon: "swap-vertical", disabled: !(canAct && canChangePosition(state, fieldSheetSlot)), testID: "online-sheet-change", onPress: () => doChangePosition(fieldSheetSlot) },
        { label: "Vedi la carta", icon: "eye", disabled: false, testID: "online-sheet-view-field", onPress: () => { setDetailIdx(card.idx); closeSheet(); } },
      ];
    }
    return (
      <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={styles.sheetBackdrop} onPress={closeSheet}>
          <View style={[styles.sheetPanel, { backgroundColor: colors.surfaceSecondary, borderColor: colors.matEdge, paddingBottom: insets.bottom + spacing.md }]} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHeader}>
              {previewIdx !== null ? <TarotCard idx={previewIdx} width={44} /> : null}
              <View style={styles.sheetOptions}>
                {options.map((opt) => (
                  <Pressable key={opt.testID} onPress={opt.disabled ? undefined : opt.onPress} disabled={opt.disabled} style={[styles.sheetOption, { borderColor: opt.disabled ? colors.border : colors.matEdge, opacity: opt.disabled ? 0.45 : 1 }]} testID={opt.testID}>
                    <MaterialIcons name={opt.icon as any} size={18} color={opt.disabled ? colors.muted : colors.goldSoft} />
                    <Text style={[styles.sheetOptionText, { color: opt.disabled ? colors.muted : colors.onSurface }]}>{opt.label}</Text>
                  </Pressable>
                ))}
                <Pressable style={styles.sheetClose} onPress={closeSheet}>
                  <Text style={[styles.sheetCloseText, { color: colors.muted }]}>Chiudi</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  };

  const oppNick = state
    ? state.players[oppIdx].name
    : role === "host"
      ? room?.guestNick ?? "In attesa..."
      : room?.hostNick ?? "Host";
  const myNick = state ? state.players[myIdx].name : params.nick ?? "Tu";

  const iWon = state?.over && state.winnerIdx === myIdx;
  const draw = state?.over && state.winnerIdx === -1;

  return (
    <View style={styles.root} testID="online-duel-screen">
      {/* top bar with leave */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={leave} style={styles.leaveBtn} testID="online-leave-button">
          <MaterialIcons name="exit-run" size={20} color={colors.goldSoft} />
          <Text style={[styles.leaveText, { color: colors.goldSoft }]}>Esci</Text>
        </Pressable>
        <View style={[styles.roleChip, { borderColor: colors.matEdge, backgroundColor: colors.surfaceSecondary }]}>
          <MaterialIcons name="earth" size={13} color={colors.gold} />
          <Text style={[styles.roleText, { color: colors.onSurfaceTertiary }]} numberOfLines={1}>
            {room?.name ?? "Duello Online"}
          </Text>
        </View>
      </View>

      <Animated.View style={[styles.shakeWrap, shakeStyle]}>
        <View style={styles.playerPanel}>
          <LPBar name={oppNick} lp={state ? state.players[oppIdx].lp : 8000} align="right" testID="online-lp-opponent" />
          {renderFloaters(oppIdx)}
        </View>
        {renderOppHand()}
        {renderSupportRow(oppIdx)}
        {renderFieldRow(oppIdx)}

        {renderCenter()}

        {renderFieldRow(myIdx)}
        {renderSupportRow(myIdx)}
        <View style={styles.playerPanel}>
          <LPBar name={myNick} lp={state ? state.players[myIdx].lp : 8000} testID="online-lp-player" />
          {renderFloaters(myIdx)}
        </View>

        <View style={styles.handArea}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.handContent}>
            {state
              ? state.players[myIdx].hand.map((c, i) => (
                  <TarotCard
                    key={c.uid}
                    idx={c.idx}
                    width={handCardW}
                    showName
                    onPress={() => {
                      if (!canAct) return;
                      sfx.tap();
                      setHandSheetIdx(i);
                    }}
                    disabled={!canAct}
                    testID={`online-hand-${i}`}
                  />
                ))
              : null}
          </ScrollView>
        </View>

        {renderActionArea()}
      </Animated.View>

      {flash ? (
        <Animated.View entering={FadeIn.duration(60)} exiting={FadeOut.duration(380)} pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: flash.color }]} />
      ) : null}

      {coin ? (
        <View style={[StyleSheet.absoluteFill, styles.coinOverlay]} pointerEvents="none">
          <CoinSpin />
        </View>
      ) : null}

      {/* Fate event banner */}
      {fate ? (
        <View style={[StyleSheet.absoluteFill, styles.fateOverlay]} pointerEvents="none">
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(400)} style={[styles.fatePanel, { borderColor: colors.gold, backgroundColor: colors.surface }]}>
            <Text style={[styles.fateTag, { color: colors.gold }]}>⚡ EVENTO DEL DESTINO</Text>
            <Text style={[styles.fateTitle, { color: colors.goldSoft }]}>{fate.title}</Text>
            <Text style={[styles.fateDesc, { color: colors.onSurfaceSecondary }]}>{fate.desc}</Text>
          </Animated.View>
        </View>
      ) : null}

      {renderSheet()}

      {/* waiting overlay */}
      {waiting && !abandoned ? (
        <View style={[StyleSheet.absoluteFill, styles.waitOverlay]}>
          <MaterialIcons name="account-clock" size={48} color={colors.gold} />
          <Text style={[styles.waitTitle, { color: colors.goldSoft }]} testID="online-waiting-title">
            {role === "host" ? "In attesa di uno sfidante" : "Connessione alla stanza..."}
          </Text>
          <Text style={[styles.waitSub, { color: colors.muted }]}>
            {role === "host" ? `Stanza "${room?.name ?? ""}" · condividi il nome così ti trovano nella lista.` : "Preparati al duello."}
          </Text>
          <Pressable onPress={leave} style={[styles.waitBtn, { backgroundColor: colors.surfaceTertiary }]} testID="online-cancel-button">
            <Text style={[styles.endTurnText, { color: colors.onSurface }]}>ANNULLA</Text>
          </Pressable>
        </View>
      ) : null}

      {/* abandoned overlay */}
      {abandoned ? (
        <View style={[StyleSheet.absoluteFill, styles.waitOverlay]}>
          <MaterialIcons name="flag-off" size={44} color={colors.goldSoft} />
          <Text style={[styles.waitTitle, { color: colors.goldSoft }]} testID="online-abandoned-title">L&apos;avversario ha abbandonato</Text>
          <Pressable onPress={() => router.back()} style={[styles.waitBtn, { backgroundColor: colors.brandPrimary }]}>
            <Text style={[styles.endTurnText, { color: colors.onBrandPrimary }]}>TORNA ALLA LOBBY</Text>
          </Pressable>
        </View>
      ) : null}

      {/* log modal */}
      <Modal visible={logOpen} transparent animationType="slide" onRequestClose={() => setLogOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setLogOpen(false)}>
          <View style={[styles.logPanel, { backgroundColor: colors.surfaceSecondary, borderColor: colors.matEdge, paddingBottom: insets.bottom + spacing.md }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.logTitle, { color: colors.goldSoft }]}>CRONACA DEL DUELLO</Text>
            <ScrollView style={styles.logScroll}>
              {(state?.log ?? []).map((line, i) => (
                <Text key={i} style={[styles.logLine, { color: colors.onSurfaceTertiary, opacity: 1 - Math.min(0.6, i * 0.04) }]}>{line}</Text>
              ))}
            </ScrollView>
            <Pressable onPress={() => setLogOpen(false)} style={[styles.sheetClose, { alignSelf: "center" }]}>
              <Text style={[styles.sheetCloseText, { color: colors.muted }]}>Chiudi</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* game over */}
      {state?.over ? (
        <View style={[StyleSheet.absoluteFill, styles.gameoverOverlay]} pointerEvents="box-none">
          <View style={[styles.gameoverPanel, { backgroundColor: colors.surface, borderColor: iWon ? colors.gold : colors.error }]}>
            <Text style={[styles.gameoverTitle, { color: draw ? colors.goldSoft : iWon ? colors.gold : "#E85D5D" }]} testID="online-gameover-title">
              {draw ? "PAREGGIO" : iWon ? "VITTORIA" : "SCONFITTA"}
            </Text>
            <Text style={[styles.gameoverReason, { color: colors.onSurfaceSecondary }]}>{state.overReason}</Text>
            <Text style={[styles.gameoverTurns, { color: colors.muted }]}>Durata: {state.turnCount} turni</Text>
            {room && (room.hostRematch || room.guestRematch) && !(room.hostRematch && room.guestRematch) ? (
              <Text style={[styles.gameoverTurns, { color: colors.gold }]}>
                {(role === "host" ? room.hostRematch : room.guestRematch) ? "In attesa dell'avversario per la rivincita..." : "L'avversario vuole la rivincita!"}
              </Text>
            ) : null}
            <Pressable onPress={rematch} style={[styles.waitBtn, { backgroundColor: colors.brandPrimary }]} testID="online-rematch-button">
              <Text style={[styles.endTurnText, { color: colors.onBrandPrimary }]}>RIVINCITA</Text>
            </Pressable>
            <Pressable onPress={leave} style={[styles.waitBtn, { backgroundColor: colors.surfaceTertiary }]} testID="online-gameover-leave">
              <Text style={[styles.endTurnText, { color: colors.onSurface }]}>ESCI</Text>
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
  useEffect(() => {
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
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingBottom: spacing.xs, gap: spacing.sm },
  leaveBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: spacing.sm },
  leaveText: { fontSize: 13, fontFamily: fonts.bodyMedium },
  roleChip: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, maxWidth: 200 },
  roleText: { fontSize: 11, fontFamily: fonts.bodyMedium },
  shakeWrap: { flex: 1, backgroundColor: colors.surface },
  playerPanel: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  fieldRow: { flexDirection: "row", justifyContent: "center", gap: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.mat },
  slotWrap: { position: "relative" },
  emptySlot: { borderRadius: radius.md, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  supportRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: 3, backgroundColor: colors.mat },
  supportLabel: { fontSize: 9, fontFamily: fonts.display, letterSpacing: 2, marginRight: spacing.xs },
  supportSlot: { width: 22, height: 16, borderRadius: 4, borderWidth: 1.5, borderStyle: "dashed" },
  oppHand: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 2 },
  oppHandCount: { fontSize: 11, fontFamily: fonts.body, marginLeft: spacing.sm },
  centerStrip: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderTopWidth: 1, borderBottomWidth: 1, backgroundColor: colors.surface },
  turnBadge: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, maxWidth: 170 },
  turnText: { fontSize: 10, fontFamily: fonts.displayBold, letterSpacing: 1 },
  logTicker: { flex: 1 },
  logText: { fontSize: 11, fontFamily: fonts.body },
  deckPile: { borderRadius: radius.sm, borderWidth: 1.5, padding: 2 },
  deckPileGlow: { shadowColor: colors.gold, shadowOpacity: 0.8, shadowRadius: 8 },
  handArea: { paddingHorizontal: spacing.md, height: 138 },
  handContent: { alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.xs },
  actionBar: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  hint: { flex: 1, fontSize: 12, fontFamily: fonts.body, lineHeight: 17 },
  tributeText: { flex: 1, fontSize: 13, fontFamily: fonts.bodyMedium },
  actionBtn: { borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 12, alignItems: "center", justifyContent: "center", minWidth: 52 },
  actionBtnText: { fontSize: 12, fontFamily: fonts.displayBold, letterSpacing: 1 },
  endTurnBtn: { borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: 13 },
  endTurnText: { fontSize: 13, fontFamily: fonts.displayBold, letterSpacing: 2 },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(5,5,8,0.6)", justifyContent: "flex-end" },
  sheetPanel: { borderTopWidth: 1.5, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingTop: spacing.lg, paddingHorizontal: spacing.lg },
  sheetHeader: { flexDirection: "row", gap: spacing.lg, alignItems: "flex-start" },
  sheetOptions: { flex: 1, gap: spacing.sm },
  sheetOption: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 13, minHeight: 46 },
  sheetOptionText: { fontSize: 14, fontFamily: fonts.bodyMedium, flex: 1 },
  sheetClose: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  sheetCloseText: { fontSize: 13, fontFamily: fonts.body, textAlign: "center" },
  logPanel: { borderTopWidth: 1.5, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingTop: spacing.lg, paddingHorizontal: spacing.lg, maxHeight: "70%" },
  logTitle: { fontSize: 14, fontFamily: fonts.displayBold, letterSpacing: 2, marginBottom: spacing.sm },
  logScroll: { maxHeight: 400 },
  logLine: { fontSize: 12, fontFamily: fonts.body, lineHeight: 18, marginBottom: 6 },
  coinOverlay: { backgroundColor: "rgba(5,5,8,0.7)", alignItems: "center", justifyContent: "center" },
  coin: { width: 90, height: 90, borderRadius: radius.pill, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  fateOverlay: { alignItems: "center", justifyContent: "center", padding: spacing.xl },
  fatePanel: { borderWidth: 2, borderRadius: radius.lg, padding: spacing.xl, alignItems: "center", gap: spacing.sm, maxWidth: 340 },
  fateTag: { fontSize: 12, fontFamily: fonts.displayBold, letterSpacing: 3 },
  fateTitle: { fontSize: 26, fontFamily: fonts.displayBold, textAlign: "center" },
  fateDesc: { fontSize: 14, fontFamily: fonts.body, textAlign: "center", lineHeight: 20 },
  waitOverlay: { backgroundColor: "rgba(10,11,14,0.96)", alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  waitTitle: { fontSize: 22, fontFamily: fonts.displayBold, textAlign: "center" },
  waitSub: { fontSize: 13, fontFamily: fonts.body, textAlign: "center", lineHeight: 19 },
  waitBtn: { borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: 14, marginTop: spacing.sm, alignSelf: "center" },
  gameoverOverlay: { backgroundColor: "rgba(5,5,8,0.9)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
  gameoverPanel: { width: "100%", maxWidth: 360, borderRadius: radius.lg, borderWidth: 2, padding: spacing.xl, alignItems: "center", gap: spacing.sm },
  gameoverTitle: { fontSize: 34, fontFamily: fonts.displayBold, letterSpacing: 4 },
  gameoverReason: { fontSize: 14, fontFamily: fonts.body, textAlign: "center" },
  gameoverTurns: { fontSize: 12, fontFamily: fonts.body, textAlign: "center" },
  floater: { position: "absolute", right: spacing.lg, top: -6, fontSize: 20, fontFamily: fonts.displayBold },
}));
