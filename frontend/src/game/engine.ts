// Arcana Duel engine — faithful port of the original web game rules.
// Pure functions over an explicit GameState + a module-level fx queue that the
// duel screen drains after every action to run sounds and animations.

import {
  CARD_DEFS,
  SUPPORT_EFFECTS,
  tributeCostFor,
  STARTING_LP,
  STARTING_HAND,
  HAND_LIMIT,
  FATE_INTERVAL,
  FATE_EVENTS,
  type FateKey,
} from "./cards";
import {
  CardInstance,
  Difficulty,
  FxEvent,
  GameMode,
  GameState,
  Position,
} from "./types";

let uidCounter = 1;
let fxQueue: FxEvent[] = [];

export function pushFx(ev: FxEvent) {
  fxQueue.push(ev);
}

export function drainFx(): FxEvent[] {
  const fx = fxQueue;
  fxQueue = [];
  return fx;
}

export function log(state: GameState, msg: string) {
  state.log.unshift(msg);
  if (state.log.length > 60) state.log.length = 60;
}

export function newGame(
  mode: GameMode,
  opts?: { name1?: string; name2?: string; botDifficulty?: Difficulty },
): GameState {
  const state: GameState = {
    mode,
    botDifficulty: opts?.botDifficulty ?? "normal",
    players: [
      { name: opts?.name1 ?? "Giocatore 1", lp: STARTING_LP, hand: [], field: [null, null, null] },
      { name: opts?.name2 ?? "Giocatore 2", lp: STARTING_LP, hand: [], field: [null, null, null] },
    ],
    deck: shuffledDeck(),
    current: 0,
    turnCount: 1,
    phase: "action",
    summonedThisTurn: false,
    supportUsedThisTurn: 0,
    positionChangedThisTurn: {},
    log: [],
    over: false,
    graveyard: [],
  };
  for (let i = 0; i < STARTING_HAND; i++) {
    drawCard(state, 0, true);
    drawCard(state, 1, true);
  }
  log(
    state,
    "Il duello ha inizio (8000 LP a testa). Il giocatore che comincia non pesca al suo primissimo turno.",
  );
  return state;
}

function shuffledDeck(): CardInstance[] {
  const arr = CARD_DEFS.map((_, i) => ({ uid: 0, idx: i }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  arr.forEach((c) => {
    c.uid = uidCounter++;
  });
  return arr;
}

export function drawCard(state: GameState, playerIdx: number, silent = false): boolean {
  const p = state.players[playerIdx];
  if (state.deck.length === 0) {
    if (!silent) {
      log(state, `${p.name} non può pescare: il mazzo è esaurito!`);
      endGame(state, playerIdx === 0 ? 1 : 0, `${p.name} è rimasto senza carte da pescare.`);
    }
    return false;
  }
  const card = state.deck.shift()!;
  p.hand.push(card);
  return true;
}

function isAlone(state: GameState, playerIdx: number): boolean {
  return fieldCountOf(state, playerIdx) === 1;
}

export function fieldCountOf(state: GameState, playerIdx: number): number {
  return state.players[playerIdx].field.filter(Boolean).length;
}

export function calcAtk(
  state: GameState,
  card: CardInstance,
  ownerIdx: number,
  opts?: { isAttacking?: boolean },
): number {
  const def = CARD_DEFS[card.idx];
  let base = card.swapped ? def.def : def.atk;
  base += card.atkBuff ?? 0;
  if (card.negated) return Math.max(0, base);
  const effect = def.effect;
  if (effect === "fuhrer" && fieldCountOf(state, ownerIdx) === 1) base *= 2;
  if (effect === "union" && fieldCountOf(state, ownerIdx) > 1) base += 500;
  if (effect === "passioni" && opts?.isAttacking) base += 300;
  return Math.max(0, base);
}

export function calcDef(state: GameState, card: CardInstance): number {
  const def = CARD_DEFS[card.idx];
  return card.swapped ? def.atk : def.def;
}

function triggerSummonEffect(state: GameState, card: CardInstance, ownerIdx: number) {
  const def = CARD_DEFS[card.idx];
  const owner = state.players[ownerIdx];
  const oppIdx = (1 - ownerIdx) as 0 | 1;
  const opp = state.players[oppIdx];
  switch (def.effect) {
    case "mago":
      card.swapped = true;
      log(state, `${def.name}: Prestigio! ATK e DEF vengono scambiati.`);
      break;
    case "eremita":
      log(state, `${def.name}: Illuminazione. ${owner.name} pesca una carta.`);
      drawCard(state, ownerIdx);
      break;
    case "diavolo": {
      let targetSlot = -1;
      let best = Infinity;
      opp.field.forEach((c, i) => {
        if (c && !c.negated) {
          const a = calcAtk(state, c, oppIdx, {});
          if (a <= 800 && a < best) {
            best = a;
            targetSlot = i;
          }
        }
      });
      const freeSlot = owner.field.findIndex((s) => s === null);
      if (targetSlot >= 0 && freeSlot >= 0) {
        const stolen = opp.field[targetSlot]!;
        opp.field[targetSlot] = null;
        stolen.stolenFrom = oppIdx;
        stolen.stolenReturnTurn = state.turnCount + 3;
        owner.field[freeSlot] = stolen;
        log(
          state,
          `${def.name}: Tentazione riuscita! ${owner.name} prende il controllo temporaneo di ${CARD_DEFS[stolen.idx].name}.`,
        );
      } else {
        log(state, `${def.name}: Tentazione fallita, nessun bersaglio adatto.`);
      }
      break;
    }
    case "torre": {
      log(state, `${def.name}: Crollo! Tutti i mostri in campo vengono distrutti.`);
      [0, 1].forEach((pi) => {
        state.players[pi].field.forEach((c, i) => {
          if (c) destroyMonster(state, pi, i, { byBattle: false });
        });
      });
      owner.lp = Math.max(0, owner.lp - 500);
      pushFx({ type: "lp", playerIdx: ownerIdx, delta: -500 });
      pushFx({ type: "shake" });
      pushFx({ type: "flash", color: "rgba(208,90,90,0.35)" });
      log(state, `${owner.name} subisce 500 danni dal crollo della torre.`);
      checkWin(state);
      break;
    }
    case "heal400":
      owner.lp += 400;
      pushFx({ type: "lp", playerIdx: ownerIdx, delta: 400 });
      log(state, `${def.name}: ${owner.name} recupera 400 LP.`);
      break;
    case "mondo":
      owner.lp += 200;
      pushFx({ type: "lp", playerIdx: ownerIdx, delta: 200 });
      drawCard(state, ownerIdx);
      log(state, `${def.name}: ${owner.name} recupera 200 LP e pesca una carta.`);
      break;
    case "inganno": {
      pushFx({ type: "coinflip" });
      const heads = Math.random() < 0.5;
      if (heads) {
        card.atkBuff = (card.atkBuff ?? 0) + 2000;
        log(state, `${def.name}: la moneta cade su Testa! ATK permanentemente +2000.`);
      } else {
        log(state, `${def.name}: la moneta cade su Croce. Nessun effetto questa volta.`);
      }
      break;
    }
    case "manodidio": {
      let targetSlot = -1;
      let best = -1;
      opp.field.forEach((c, i) => {
        if (c && !c.negated && CARD_DEFS[c.idx].effect !== "none") {
          const a = calcAtk(state, c, oppIdx, {});
          if (a > best) {
            best = a;
            targetSlot = i;
          }
        }
      });
      if (targetSlot >= 0) {
        opp.field[targetSlot]!.negated = true;
        log(
          state,
          `${def.name}: Intervento Divino! L'effetto di ${CARD_DEFS[opp.field[targetSlot]!.idx].name} viene annullato.`,
        );
      } else {
        log(state, `${def.name}: Intervento Divino non trova bersagli con un effetto attivo.`);
      }
      break;
    }
    case "fortuna":
      drawCard(state, ownerIdx);
      drawCard(state, ownerIdx);
      log(state, `${def.name}: Colpo di Fortuna! ${owner.name} pesca due carte.`);
      break;
    case "lunanera": {
      const d0 = state.players[0].lp - Math.floor(state.players[0].lp / 2);
      const d1 = state.players[1].lp - Math.floor(state.players[1].lp / 2);
      state.players[0].lp = Math.floor(state.players[0].lp / 2);
      state.players[1].lp = Math.floor(state.players[1].lp / 2);
      pushFx({ type: "lp", playerIdx: 0, delta: -d0 });
      pushFx({ type: "lp", playerIdx: 1, delta: -d1 });
      pushFx({ type: "shake" });
      pushFx({ type: "flash", color: "rgba(127,90,220,0.35)" });
      log(state, `${def.name}: Eclissi! Entrambi i giocatori dimezzano i propri LP.`);
      checkWin(state);
      break;
    }
    case "madre": {
      const n = fieldCountOf(state, ownerIdx);
      owner.lp += 300 * n;
      pushFx({ type: "lp", playerIdx: ownerIdx, delta: 300 * n });
      log(state, `${def.name}: Istinto Materno. ${owner.name} recupera ${300 * n} LP.`);
      break;
    }
    case "presagio": {
      if (state.deck.length > 0) {
        const topName = CARD_DEFS[state.deck[0].idx].name;
        log(state, `${def.name}: Presagio... la prossima carta del mazzo è "${topName}".`);
      } else {
        log(state, `${def.name}: Presagio, ma il mazzo è vuoto.`);
      }
      break;
    }
    case "ciclo":
      owner.lp += 200;
      pushFx({ type: "lp", playerIdx: ownerIdx, delta: 200 });
      log(state, `${def.name}: Ciclo. ${owner.name} recupera 200 LP.`);
      break;
    case "sapienza":
      log(
        state,
        `${def.name}: Sapere Condiviso. Il sapere non fa preferenze: entrambi i giocatori pescano una carta.`,
      );
      drawCard(state, 0);
      drawCard(state, 1);
      break;
    case "pericolo": {
      let targetSlot = -1;
      let best = -1;
      opp.field.forEach((c, i) => {
        if (c && !c.negated) {
          const a = calcAtk(state, c, oppIdx, {});
          if (a > best) {
            best = a;
            targetSlot = i;
          }
        }
      });
      if (targetSlot >= 0) {
        const target = opp.field[targetSlot]!;
        target.atkBuff = (target.atkBuff ?? 0) - 500;
        log(
          state,
          `${def.name}: Contaminazione! ${CARD_DEFS[target.idx].name} perde 500 ATK permanenti.`,
        );
      } else {
        log(state, `${def.name}: Contaminazione, ma non c'è nessun mostro avversario da indebolire.`);
      }
      break;
    }
    default:
      break;
  }
}

export function destroyMonster(
  state: GameState,
  ownerIdx: number,
  slot: number,
  opts?: { byBattle?: boolean },
): boolean {
  const card = state.players[ownerIdx].field[slot];
  if (!card) return false;
  const def = CARD_DEFS[card.idx];
  if (opts?.byBattle && def.effect === "matto" && isAlone(state, ownerIdx)) {
    log(state, `${def.name} resiste alla distruzione: è l'unica carta sul campo!`);
    return false;
  }
  state.players[ownerIdx].field[slot] = null;
  log(state, `${def.name} (${state.players[ownerIdx].name}) viene distrutto.`);
  state.graveyard.push({ idx: card.idx, ownerIdx, reason: "battaglia" });
  pushFx({ type: "destroy", owner: ownerIdx, slot, cardIdx: card.idx });
  return true;
}

function checkWin(state: GameState) {
  if (state.players[0].lp <= 0 && state.players[1].lp <= 0) {
    endGame(state, -1, "Entrambi i giocatori crollano nello stesso istante.");
  } else if (state.players[0].lp <= 0) {
    endGame(state, 1, `${state.players[0].name} è stato sconfitto.`);
  } else if (state.players[1].lp <= 0) {
    endGame(state, 0, `${state.players[1].name} è stato sconfitto.`);
  }
}

function endGame(state: GameState, winnerIdx: number, reason: string) {
  state.over = true;
  state.winnerIdx = winnerIdx;
  state.overReason = reason;
  log(state, `--- DUELLO CONCLUSO --- ${reason}`);
  pushFx({ type: "gameover" });
}

export function isSupportable(idx: number): boolean {
  return SUPPORT_EFFECTS.has(CARD_DEFS[idx].effect);
}

export function activateSupport(state: GameState, handIdx: number): boolean {
  const p = state.players[state.current];
  const card = p.hand[handIdx];
  if (!card) return false;
  if (state.phase !== "action") return false;
  if (state.supportUsedThisTurn >= 2) return false;
  if (!isSupportable(card.idx)) return false;
  const def = CARD_DEFS[card.idx];
  p.hand.splice(handIdx, 1);
  state.supportUsedThisTurn++;
  log(
    state,
    `${p.name} attiva ${def.name} dalla Zona Supporto (${state.supportUsedThisTurn}/2 questo turno).`,
  );
  pushFx({ type: "support", owner: state.current, cardIdx: card.idx, rarity: def.rarity });
  triggerSummonEffect(state, card, state.current);
  state.graveyard.push({ idx: card.idx, ownerIdx: state.current, reason: "supporto" });
  return true;
}

export function playToField(
  state: GameState,
  handIdx: number,
  slot: number,
  position: Position,
  tributeSlots: number[] = [],
): boolean {
  const p = state.players[state.current];
  const card = p.hand[handIdx];
  if (!card || state.summonedThisTurn) return false;
  if (state.phase !== "action") return false;
  const needed = tributeCostFor(card.idx);
  if (tributeSlots.length !== needed) return false;
  for (const ts of tributeSlots) {
    if (!p.field[ts]) return false;
  }
  // pay the tribute cost first
  tributeSlots.forEach((ts) => {
    const tributed = p.field[ts]!;
    p.field[ts] = null;
    state.graveyard.push({ idx: tributed.idx, ownerIdx: state.current, reason: "tributo" });
    log(state, `${p.name} offre in Tributo ${CARD_DEFS[tributed.idx].name}.`);
  });
  // if the target slot is still occupied (full field), reuse the first freed slot
  if (p.field[slot] !== null && tributeSlots.length > 0) slot = tributeSlots[0];
  if (p.field[slot] !== null) return false;
  p.hand.splice(handIdx, 1);
  card.position = position;
  card.attacked = false;
  card.summonedTurn = state.turnCount;
  p.field[slot] = card;
  state.summonedThisTurn = true;
  const def = CARD_DEFS[card.idx];
  const evocLabel = needed > 0 ? `Evocazione Tributo (${needed})` : "Evocazione Normale";
  log(
    state,
    `${p.name} esegue una ${evocLabel}: ${def.name} (${def.atk}/${def.def}) in posizione di ${position === "atk" ? "Attacco" : "Difesa"}.`,
  );
  triggerSummonEffect(state, card, state.current);
  pushFx({ type: "summon", owner: state.current, slot, rarity: def.rarity, cardIdx: card.idx });
  return true;
}

export function canChangePosition(state: GameState, slot: number): boolean {
  const card = state.players[state.current].field[slot];
  if (!card) return false;
  if (state.phase !== "action") return false;
  if (card.summonedTurn === state.turnCount) return false;
  if (card.attacked) return false;
  const key = `${state.current}_${slot}_${state.turnCount}`;
  return !state.positionChangedThisTurn[key];
}

export function changePosition(state: GameState, slot: number): boolean {
  const p = state.players[state.current];
  const card = p.field[slot];
  if (!card) return false;
  if (!canChangePosition(state, slot)) return false;
  const key = `${state.current}_${slot}_${state.turnCount}`;
  card.position = card.position === "atk" ? "def" : "atk";
  state.positionChangedThisTurn[key] = true;
  log(
    state,
    `${p.name} cambia la posizione di ${CARD_DEFS[card.idx].name} in ${card.position === "atk" ? "Attacco" : "Difesa"}.`,
  );
  return true;
}

export function resolveBattle(state: GameState, attackerSlot: number, targetSlot: number | null) {
  if (state.phase !== "action") return;
  const atkIdx = state.current;
  const defIdx = (1 - state.current) as 0 | 1;
  const attackerP = state.players[atkIdx];
  const defenderP = state.players[defIdx];
  const attacker = attackerP.field[attackerSlot];
  if (!attacker || attacker.position !== "atk" || attacker.attacked) return;
  const attackerDef = CARD_DEFS[attacker.idx];
  const effAtk = calcAtk(state, attacker, atkIdx, { isAttacking: true });

  if (targetSlot === null) {
    if (defenderP.field.some(Boolean)) return;
    pushFx({
      type: "clash",
      aOwner: atkIdx,
      aSlot: attackerSlot,
      aCardIdx: attacker.idx,
      dOwner: defIdx,
      dSlot: null,
      dCardIdx: null,
    });
    defenderP.lp -= effAtk;
    pushFx({ type: "lp", playerIdx: defIdx, delta: -effAtk });
    if (effAtk >= 1200) pushFx({ type: "flash", color: "rgba(208,90,90,0.3)" });
    log(state, `${attackerDef.name} attacca direttamente! ${defenderP.name} subisce ${effAtk} danni.`);
    attacker.attacked = true;
    checkWin(state);
    return;
  }

  const defender = defenderP.field[targetSlot];
  if (!defender) return;
  attacker.attacked = true;
  pushFx({
    type: "clash",
    aOwner: atkIdx,
    aSlot: attackerSlot,
    aCardIdx: attacker.idx,
    dOwner: defIdx,
    dSlot: targetSlot,
    dCardIdx: defender.idx,
  });

  if (defender.position === "atk") {
    const effDef = calcAtk(state, defender, defIdx, { isAttacking: false });
    log(
      state,
      `${attackerDef.name} (${effAtk}) attacca ${CARD_DEFS[defender.idx].name} (${effDef}) in Attacco.`,
    );
    if (effAtk > effDef) {
      const diff = effAtk - effDef;
      destroyMonster(state, defIdx, targetSlot, { byBattle: true });
      defenderP.lp -= diff;
      pushFx({ type: "lp", playerIdx: defIdx, delta: -diff });
      log(state, `${defenderP.name} subisce ${diff} danni.`);
      if (attackerDef.effect === "morte" && !attacker.negated && defenderP.hand.length > 0) {
        const r = Math.floor(Math.random() * defenderP.hand.length);
        const discarded = defenderP.hand.splice(r, 1)[0];
        state.graveyard.push({ idx: discarded.idx, ownerIdx: defIdx, reason: "mietitrice" });
        log(state, `Mietitrice: ${defenderP.name} scarta ${CARD_DEFS[discarded.idx].name} dalla mano.`);
      }
    } else if (effAtk < effDef) {
      const diff = effDef - effAtk;
      destroyMonster(state, atkIdx, attackerSlot, { byBattle: true });
      attackerP.lp -= diff;
      pushFx({ type: "lp", playerIdx: atkIdx, delta: -diff });
      log(state, `${attackerP.name} subisce ${diff} danni di ritorno.`);
    } else {
      destroyMonster(state, atkIdx, attackerSlot, { byBattle: true });
      destroyMonster(state, defIdx, targetSlot, { byBattle: true });
      log(state, "Entrambi i mostri si distruggono a vicenda.");
    }
  } else {
    const effDef2 = calcDef(state, defender);
    log(
      state,
      `${attackerDef.name} (${effAtk}) attacca ${CARD_DEFS[defender.idx].name} (DEF ${effDef2}) in Difesa.`,
    );
    if (effAtk > effDef2) {
      destroyMonster(state, defIdx, targetSlot, { byBattle: true });
      if (attackerDef.effect === "morte" && !attacker.negated && defenderP.hand.length > 0) {
        const r = Math.floor(Math.random() * defenderP.hand.length);
        const discarded = defenderP.hand.splice(r, 1)[0];
        state.graveyard.push({ idx: discarded.idx, ownerIdx: defIdx, reason: "mietitrice" });
        log(state, `Mietitrice: ${defenderP.name} scarta ${CARD_DEFS[discarded.idx].name} dalla mano.`);
      }
    } else if (effAtk < effDef2) {
      const diff = effDef2 - effAtk;
      attackerP.lp -= diff;
      pushFx({ type: "lp", playerIdx: atkIdx, delta: -diff });
      log(state, `${attackerP.name} urta una difesa solida e subisce ${diff} danni.`);
    } else {
      log(state, "L'attacco si infrange senza alcun effetto.");
    }
  }
  checkWin(state);
}

function processReturns(state: GameState) {
  [0, 1].forEach((pi) => {
    state.players[pi].field.forEach((c, i) => {
      if (c && c.stolenReturnTurn && c.stolenReturnTurn <= state.turnCount) {
        const originalOwner = c.stolenFrom!;
        state.players[pi].field[i] = null;
        delete c.stolenReturnTurn;
        delete c.stolenFrom;
        const freeSlot = state.players[originalOwner].field.findIndex((s) => s === null);
        if (freeSlot >= 0) {
          state.players[originalOwner].field[freeSlot] = c;
          log(state, `${CARD_DEFS[c.idx].name} torna sotto il controllo del suo proprietario originale.`);
        } else {
          log(state, `${CARD_DEFS[c.idx].name} torna al proprietario, ma il campo è pieno: viene scartato.`);
        }
      }
    });
  });
}

export function endTurnCore(state: GameState) {
  const p = state.players[state.current];
  while (p.hand.length > HAND_LIMIT) {
    const discarded = p.hand.pop()!;
    state.graveyard.push({ idx: discarded.idx, ownerIdx: state.current, reason: "limite mano" });
    log(state, `${p.name} supera il limite di mano e scarta ${CARD_DEFS[discarded.idx].name}.`);
  }
  state.current = (1 - state.current) as 0 | 1;
  state.turnCount++;
  state.phase = "draw";
  state.summonedThisTurn = false;
  state.supportUsedThisTurn = 0;
  processReturns(state);
  state.players[state.current].field.forEach((c) => {
    if (c) c.attacked = false;
  });
  log(state, `--- Turno ${state.turnCount}: tocca a ${state.players[state.current].name} ---`);
  maybeFateEvent(state);
}

const FATE_POOL: FateKey[] = [
  "tempesta",
  "marea",
  "dono",
  "eclissi",
  "giudizio",
  "furia",
  "carestia",
  "specchio",
];

export function maybeFateEvent(state: GameState) {
  if (state.over) return;
  if (state.turnCount < FATE_INTERVAL) return;
  if (state.turnCount % FATE_INTERVAL !== 0) return;
  const key = FATE_POOL[Math.floor(Math.random() * FATE_POOL.length)];
  const info = FATE_EVENTS[key];
  log(state, `⚡ EVENTO DEL DESTINO — ${info.title}: ${info.desc}`);
  pushFx({ type: "fate", fate: key, title: info.title, desc: info.desc });
  applyFate(state, key);
  checkWin(state);
}

function applyFate(state: GameState, key: FateKey) {
  const [p0, p1] = state.players;
  switch (key) {
    case "tempesta":
      [0, 1].forEach((pi) =>
        state.players[pi].field.forEach((c) => {
          if (c) c.atkBuff = (c.atkBuff ?? 0) - 300;
        }),
      );
      pushFx({ type: "flash", color: "rgba(120,140,200,0.28)" });
      pushFx({ type: "shake" });
      break;
    case "marea":
      p0.lp = Math.max(0, p0.lp - 500);
      p1.lp = Math.max(0, p1.lp - 500);
      pushFx({ type: "lp", playerIdx: 0, delta: -500 });
      pushFx({ type: "lp", playerIdx: 1, delta: -500 });
      pushFx({ type: "flash", color: "rgba(168,36,36,0.3)" });
      pushFx({ type: "shake" });
      break;
    case "dono":
      p0.lp += 600;
      p1.lp += 600;
      pushFx({ type: "lp", playerIdx: 0, delta: 600 });
      pushFx({ type: "lp", playerIdx: 1, delta: 600 });
      pushFx({ type: "flash", color: "rgba(212,175,55,0.25)" });
      break;
    case "eclissi":
      drawCard(state, 0);
      drawCard(state, 1);
      pushFx({ type: "draw", owner: state.current });
      break;
    case "giudizio":
      [0, 1].forEach((pi) => {
        let weakSlot = -1;
        let weak = Infinity;
        state.players[pi].field.forEach((c, i) => {
          if (c) {
            const v = calcAtk(state, c, pi, {});
            if (v < weak) {
              weak = v;
              weakSlot = i;
            }
          }
        });
        if (weakSlot >= 0) destroyMonster(state, pi, weakSlot, { byBattle: false });
      });
      pushFx({ type: "flash", color: "rgba(235,235,245,0.25)" });
      pushFx({ type: "shake" });
      break;
    case "furia":
      [0, 1].forEach((pi) =>
        state.players[pi].field.forEach((c) => {
          if (c) c.atkBuff = (c.atkBuff ?? 0) + 400;
        }),
      );
      pushFx({ type: "flash", color: "rgba(208,90,60,0.28)" });
      break;
    case "carestia":
      [0, 1].forEach((pi) => {
        const hand = state.players[pi].hand;
        if (hand.length > 0) {
          const r = Math.floor(Math.random() * hand.length);
          const d = hand.splice(r, 1)[0];
          state.graveyard.push({ idx: d.idx, ownerIdx: pi, reason: "carestia" });
        }
      });
      break;
    case "specchio": {
      const hi = Math.max(p0.lp, p1.lp);
      const target = Math.floor(hi / 2);
      [0, 1].forEach((pi) => {
        if (state.players[pi].lp < target) {
          const gain = target - state.players[pi].lp;
          state.players[pi].lp = target;
          pushFx({ type: "lp", playerIdx: pi, delta: gain });
        }
      });
      pushFx({ type: "flash", color: "rgba(212,175,55,0.22)" });
      break;
    }
  }
}

export function performDraw(state: GameState): boolean {
  if (state.over || state.phase !== "draw") return false;
  const ok = drawCard(state, state.current);
  if (state.over) return false;
  if (ok) pushFx({ type: "draw", owner: state.current });
  state.phase = "action";
  return true;
}
