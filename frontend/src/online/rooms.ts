// Firestore realtime lobby + duel-state sync for online play (nickname only,
// no auth). One "rooms" document per game; the current player mutates and
// writes the whole GameState, the opponent listens via onSnapshot.

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/src/firebase";
import type { FxEvent, GameState } from "@/src/game/types";

const ROOMS = "rooms";

export type RoomStatus = "waiting" | "playing" | "finished";

export interface RoomDoc {
  id: string;
  name: string;
  hostNick: string;
  guestNick: string | null;
  status: RoomStatus;
  state: GameState | null;
  events: FxEvent[];
  eventSeq: number;
  lastWriter?: number;
  hostRematch: boolean;
  guestRematch: boolean;
  abandonedBy: number | null;
  createdAt?: { seconds: number } | null;
}

/** Firestore rejects `undefined` — round-trip through JSON to drop them. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function createRoom(name: string, hostNick: string): Promise<string> {
  const ref = await addDoc(collection(db, ROOMS), {
    name: name.slice(0, 40),
    hostNick: hostNick.slice(0, 24),
    guestNick: null,
    status: "waiting" as RoomStatus,
    state: null,
    events: [],
    eventSeq: 0,
    hostRematch: false,
    guestRematch: false,
    abandonedBy: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeWaitingRooms(cb: (rooms: RoomDoc[]) => void): () => void {
  const q = query(
    collection(db, ROOMS),
    where("status", "==", "waiting"),
    orderBy("createdAt", "desc"),
    limit(40),
  );
  return onSnapshot(
    q,
    (snap) => {
      const rooms: RoomDoc[] = [];
      snap.forEach((d) => rooms.push({ id: d.id, ...(d.data() as Omit<RoomDoc, "id">) }));
      cb(rooms);
    },
    () => cb([]),
  );
}

export function subscribeRoom(roomId: string, cb: (room: RoomDoc | null) => void): () => void {
  return onSnapshot(
    doc(db, ROOMS, roomId),
    (snap) => {
      if (!snap.exists()) return cb(null);
      cb({ id: snap.id, ...(snap.data() as Omit<RoomDoc, "id">) });
    },
    () => cb(null),
  );
}

export async function joinRoom(roomId: string, guestNick: string): Promise<void> {
  await updateDoc(doc(db, ROOMS, roomId), { guestNick: guestNick.slice(0, 24) });
}

export async function startGame(roomId: string, state: GameState): Promise<void> {
  await updateDoc(doc(db, ROOMS, roomId), {
    status: "playing" as RoomStatus,
    state: clean(state),
    events: [],
    eventSeq: increment(1),
    lastWriter: 0,
    hostRematch: false,
    guestRematch: false,
    abandonedBy: null,
  });
}

export async function pushState(
  roomId: string,
  state: GameState,
  events: FxEvent[],
  writerIdx: number,
): Promise<void> {
  await updateDoc(doc(db, ROOMS, roomId), {
    state: clean(state),
    events: clean(events),
    eventSeq: increment(1),
    lastWriter: writerIdx,
    status: (state.over ? "finished" : "playing") as RoomStatus,
  });
}

export async function requestRematch(roomId: string, role: "host" | "guest"): Promise<void> {
  await updateDoc(doc(db, ROOMS, roomId), {
    [role === "host" ? "hostRematch" : "guestRematch"]: true,
  });
}

export async function abandonRoom(roomId: string, myIdx: number): Promise<void> {
  try {
    await updateDoc(doc(db, ROOMS, roomId), {
      status: "finished" as RoomStatus,
      abandonedBy: myIdx,
    });
  } catch {
    // room may already be gone
  }
}

export async function deleteRoom(roomId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ROOMS, roomId));
  } catch {
    // ignore
  }
}
