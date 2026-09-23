// Bot AI — faithful port of the original bot with three difficulties.
// easy   = Novizio: random plays
// normal = Adepto: greedy attack/defense evaluation
// hard   = Incubo: prefers strong support effects, hunts lethal

import { CARD_DEFS, tributeCostFor } from "./cards";
import {
  activateSupport,
  calcAtk,
  calcDef,
  changePosition,
  endTurnCore,
  fieldCountOf,
  performDraw,
  playToField,
  resolveBattle,
} from "./engine";
import type { GameState } from "./types";

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function botTurn(
  state: GameState,
  hooks: { commit: () => void },
) {
  const { commit } = hooks;
  await sleep(650);

  if (state.phase === "draw") {
    performDraw(state);
    commit();
    await sleep(500);
  }
  if (state.over) return;

  const diff = state.botDifficulty;
  const me = 1;
  const opp = 0;
  const bot = state.players[me];
  const human = state.players[opp];

  // --- summon (respecting tribute costs) ---
  if (!state.summonedThisTurn && bot.hand.length > 0) {
    const freeSlot = bot.field.findIndex((s) => s === null);
    const monstersOnField = fieldCountOf(state, me);
    const affordable = bot.hand
      .map((c, i) => ({ c, i }))
      .filter((x) => tributeCostFor(x.c.idx) <= monstersOnField);
    if (freeSlot >= 0 && affordable.length > 0) {
      let handIdx: number;
      let position: "atk" | "def";
      if (diff === "easy") {
        const pick = affordable[Math.floor(Math.random() * affordable.length)];
        handIdx = pick.i;
        position = Math.random() < 0.5 ? "atk" : "def";
      } else {
        let bestAtkIdx = affordable[0].i;
        let bestDefIdx = affordable[0].i;
        affordable.forEach((x) => {
          if (CARD_DEFS[x.c.idx].atk > CARD_DEFS[bot.hand[bestAtkIdx].idx].atk) bestAtkIdx = x.i;
          if (CARD_DEFS[x.c.idx].def > CARD_DEFS[bot.hand[bestDefIdx].idx].def) bestDefIdx = x.i;
        });
        const underThreat = human.field.some(
          (c) => c && c.position === "atk" && calcAtk(state, c, opp, {}) >= 1500,
        );
        const behind = bot.lp < human.lp * 0.6;
        if (behind && !underThreat) {
          handIdx = bestAtkIdx;
          position = "atk";
        } else if (underThreat) {
          handIdx = bestDefIdx;
          position = "def";
        } else {
          handIdx = bestAtkIdx;
          position = "atk";
        }
        if (diff === "hard") {
          const goodFx = ["fortuna", "heal400", "manodidio", "torre", "madre"];
          let fxIdx = -1;
          affordable.forEach((x) => {
            if (goodFx.includes(CARD_DEFS[x.c.idx].effect)) fxIdx = x.i;
          });
          if (fxIdx >= 0 && CARD_DEFS[bot.hand[fxIdx].idx].effect !== "torre") handIdx = fxIdx;
        }
      }
      const needed = tributeCostFor(bot.hand[handIdx].idx);
      let tributeSlots: number[] = [];
      if (needed > 0) {
        const owned = bot.field.map((c, i) => ({ c, i })).filter((x) => x.c);
        owned.sort((a, b) => calcAtk(state, a.c, me, {}) - calcAtk(state, b.c, me, {}));
        tributeSlots = owned.slice(0, needed).map((x) => x.i);
      }
      playToField(state, handIdx, freeSlot, position, tributeSlots);
      commit();
      await sleep(750);
    }
  }

  // --- support activation ---
  if (diff !== "easy" && state.supportUsedThisTurn < 2 && bot.hand.length > 0) {
    const idx = bot.hand.findIndex((c) => {
      const eff = CARD_DEFS[c.idx].effect;
      return (
        ["eremita", "diavolo", "torre", "heal400", "mondo", "manodidio", "fortuna", "lunanera", "madre", "sapienza", "pericolo", "presagio", "ciclo"].includes(eff)
      );
    });
    if (idx >= 0) {
      activateSupport(state, idx);
      commit();
      await sleep(650);
    }
  }

  // --- reposition weak attackers before battling ---
  if (diff !== "easy") {
    bot.field.forEach((c, i) => {
      if (!c || c.summonedTurn === state.turnCount || c.attacked) return;
      const isWeakAtk = c.position === "atk" && calcAtk(state, c, me, {}) < 600;
      if (isWeakAtk) changePosition(state, i);
    });
    commit();
  }

  // --- battle ---
  if (!state.over) {
    commit();
    await sleep(500);

    const attackers = bot.field
      .map((c, i) => ({ c, i }))
      .filter((x) => x.c && x.c.position === "atk" && !x.c.attacked);
    for (const { c, i } of attackers) {
      if (state.over) break;
      const effAtk = calcAtk(state, c, me, { isAttacking: true });
      const humanHasField = human.field.some(Boolean);
      let doAttack = false;
      let targetSlot: number | null = null;

      if (!humanHasField) {
        doAttack = true;
        targetSlot = null;
      } else if (diff === "easy") {
        doAttack = Math.random() < 0.5;
        if (doAttack) {
          const options = human.field.map((c2, i2) => i2).filter((i2) => human.field[i2]);
          targetSlot = options[Math.floor(Math.random() * options.length)];
        }
      } else {
        let best = -1;
        let bestScore = -Infinity;
        human.field.forEach((c2, i2) => {
          if (!c2) return;
          const otherVal = c2.position === "atk" ? calcAtk(state, c2, opp, {}) : calcDef(state, c2);
          const score = effAtk - otherVal;
          if (score > bestScore) {
            bestScore = score;
            best = i2;
          }
        });
        if (best >= 0 && (bestScore >= 0 || (diff === "hard" && human.lp <= effAtk))) {
          doAttack = true;
          targetSlot = best;
        } else if (diff === "hard" && human.lp <= effAtk && !humanHasField) {
          doAttack = true;
          targetSlot = null;
        }
      }

      if (doAttack) {
        resolveBattle(state, i, targetSlot);
        commit();
        await sleep(750);
      }
    }
  }

  if (!state.over) {
    await sleep(300);
    endTurnCore(state);
    commit();
  } else {
    commit();
  }
}
