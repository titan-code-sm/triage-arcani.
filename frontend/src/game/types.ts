export type Position = "atk" | "def";
export type Difficulty = "easy" | "normal" | "hard";
export type GameMode = "bot" | "hotseat";

export interface CardInstance {
  uid: number;
  idx: number;
  position?: Position;
  attacked?: boolean;
  summonedTurn?: number;
  swapped?: boolean;
  atkBuff?: number;
  negated?: boolean;
  stolenFrom?: number;
  stolenReturnTurn?: number;
}

export interface PlayerState {
  name: string;
  lp: number;
  hand: CardInstance[];
  field: (CardInstance | null)[]; // 3 slots
}

export type Phase = "draw" | "action";

export interface GameState {
  mode: GameMode;
  botDifficulty: Difficulty;
  players: [PlayerState, PlayerState];
  deck: CardInstance[];
  current: 0 | 1;
  turnCount: number;
  phase: Phase;
  summonedThisTurn: boolean;
  supportUsedThisTurn: number;
  positionChangedThisTurn: Record<string, boolean>;
  log: string[];
  over: boolean;
  winnerIdx?: number;
  overReason?: string;
  graveyard: { idx: number; ownerIdx: number; reason: string }[];
}

export type FxEvent =
  | { type: "lp"; playerIdx: number; delta: number }
  | { type: "shake" }
  | { type: "flash"; color: string }
  | { type: "summon"; owner: number; slot: number; rarity: string; cardIdx: number }
  | { type: "destroy"; owner: number; slot: number; cardIdx: number }
  | {
      type: "clash";
      aOwner: number;
      aSlot: number;
      aCardIdx: number;
      dOwner: number;
      dSlot: number | null;
      dCardIdx: number | null;
    }
  | { type: "coinflip" }
  | { type: "draw"; owner: number }
  | { type: "support"; owner: number; cardIdx: number; rarity: string }
  | { type: "fate"; fate: string; title: string; desc: string }
  | { type: "gameover" };

export type DifficultyLabel = "Novizio" | "Adepto" | "Incubo";

export const DIFFICULTY_LABELS: Record<Difficulty, DifficultyLabel> = {
  easy: "Novizio",
  normal: "Adepto",
  hard: "Incubo",
};
