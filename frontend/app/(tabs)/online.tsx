import MaterialIcons from "@react-native-vector-icons/material-design-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usesNativeTabs } from "@/src/navigation";
import { createRoom, joinRoom, subscribeWaitingRooms, type RoomDoc } from "@/src/online/rooms";
import { storage } from "@/src/utils/storage";
import { fonts, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const NICK_KEY = "arcani_nickname";

export default function OnlineScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [nick, setNick] = useState("");
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState<RoomDoc[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void storage.getItem<string>(NICK_KEY, "").then((v) => setNick(v ?? ""));
  }, []);

  // Live list of open rooms while this tab is focused.
  useFocusEffect(
    useCallback(() => {
      setRooms(null);
      const unsub = subscribeWaitingRooms((r) => setRooms(r));
      return unsub;
    }, []),
  );

  const persistNick = (v: string) => {
    setNick(v);
    void storage.setItem(NICK_KEY, v);
  };

  const validNick = nick.trim().length >= 2;

  const onCreate = async () => {
    if (!validNick) {
      setError("Scegli un nickname (min 2 caratteri).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const name = roomName.trim() || `Stanza di ${nick.trim()}`;
      const id = await createRoom(name, nick.trim());
      router.push({ pathname: "/online-duel", params: { roomId: id, role: "host", nick: nick.trim() } });
      setRoomName("");
    } catch {
      setError("Impossibile creare la stanza. Controlla la connessione.");
    } finally {
      setBusy(false);
    }
  };

  const onJoin = async (room: RoomDoc) => {
    if (!validNick) {
      setError("Scegli un nickname prima di unirti.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await joinRoom(room.id, nick.trim());
      router.push({ pathname: "/online-duel", params: { roomId: room.id, role: "guest", nick: nick.trim() } });
    } catch {
      setError("Impossibile unirsi alla stanza.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root} testID="online-screen">
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: (usesNativeTabs ? insets.bottom : 0) + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <Text style={[styles.title, { color: colors.goldSoft }]}>Duelli Online</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceTertiary }]}>
          Apri una stanza o unisciti a un duellante in attesa.
        </Text>

        {/* Nickname */}
        <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Il tuo nickname</Text>
        <TextInput
          value={nick}
          onChangeText={persistNick}
          placeholder="Es. Maestro degli Arcani"
          placeholderTextColor={colors.muted}
          maxLength={24}
          style={[styles.input, { color: colors.onSurface, borderColor: colors.matEdge, backgroundColor: colors.surfaceSecondary }]}
          testID="nickname-input"
        />

        {/* Create room */}
        <View style={[styles.card, { borderColor: colors.matEdge, backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.cardTitle, { color: colors.gold }]}>APRI UNA STANZA</Text>
          <TextInput
            value={roomName}
            onChangeText={setRoomName}
            placeholder="Nome della stanza (facoltativo)"
            placeholderTextColor={colors.muted}
            maxLength={40}
            style={[styles.input, { color: colors.onSurface, borderColor: colors.border, backgroundColor: colors.surface }]}
            testID="room-name-input"
          />
          <Pressable
            onPress={onCreate}
            disabled={busy}
            style={[styles.createBtn, { backgroundColor: colors.brandPrimary, opacity: busy ? 0.6 : 1 }]}
            testID="create-room-button"
          >
            <MaterialIcons name="plus-circle" size={20} color={colors.onBrandPrimary} />
            <Text style={[styles.createBtnText, { color: colors.onBrandPrimary }]}>CREA E ATTENDI</Text>
          </Pressable>
        </View>

        {error ? (
          <Text style={[styles.error, { color: "#E85D5D" }]} testID="online-error">
            {error}
          </Text>
        ) : null}

        {/* Rooms list */}
        <View style={styles.listHeader}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Stanze aperte</Text>
          {rooms ? (
            <Text style={[styles.roomsCount, { color: colors.muted }]} testID="rooms-count">
              {rooms.length}
            </Text>
          ) : null}
        </View>

        {rooms === null ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : rooms.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: colors.border }]} testID="rooms-empty">
            <MaterialIcons name="ghost-outline" size={32} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Nessuna stanza aperta.{"\n"}Creane una e attendi uno sfidante.
            </Text>
          </View>
        ) : (
          <View style={styles.roomList}>
            {rooms.map((r) => (
              <View
                key={r.id}
                style={[styles.roomRow, { borderColor: colors.matEdge, backgroundColor: colors.surfaceSecondary }]}
                testID={`room-row-${r.id}`}
              >
                <View style={styles.roomInfo}>
                  <Text style={[styles.roomName, { color: colors.onSurface }]} numberOfLines={1}>
                    {r.name}
                  </Text>
                  <Text style={[styles.roomHost, { color: colors.muted }]} numberOfLines={1}>
                    Host: {r.hostNick}
                  </Text>
                </View>
                <Pressable
                  onPress={() => onJoin(r)}
                  disabled={busy}
                  style={[styles.joinBtn, { backgroundColor: colors.gold, opacity: busy ? 0.6 : 1 }]}
                  testID={`join-room-${r.id}`}
                >
                  <Text style={[styles.joinBtnText, { color: colors.onBrandSecondary }]}>SFIDA</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md },
  title: { fontSize: 26, fontFamily: fonts.displayBold, letterSpacing: 1 },
  subtitle: { fontSize: 13, fontFamily: fonts.body, marginTop: -spacing.xs },
  label: { fontSize: 13, fontFamily: fonts.bodyMedium, marginTop: spacing.xs },
  input: {
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: { fontSize: 12, fontFamily: fonts.displayBold, letterSpacing: 2 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: 13,
  },
  createBtnText: { fontSize: 14, fontFamily: fonts.displayBold, letterSpacing: 1 },
  error: { fontSize: 13, fontFamily: fonts.bodyMedium },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm },
  roomsCount: { fontSize: 13, fontFamily: fonts.displayBold },
  center: { paddingVertical: spacing.xl, alignItems: "center" },
  emptyBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: { fontSize: 13, fontFamily: fonts.body, textAlign: "center", lineHeight: 19 },
  roomList: { gap: spacing.sm },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  roomInfo: { flex: 1, gap: 2 },
  roomName: { fontSize: 16, fontFamily: fonts.bodyBold },
  roomHost: { fontSize: 12, fontFamily: fonts.body },
  joinBtn: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  joinBtnText: { fontSize: 13, fontFamily: fonts.displayBold, letterSpacing: 1 },
}));
