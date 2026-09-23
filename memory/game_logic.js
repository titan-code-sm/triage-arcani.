
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDxkzd2lMDVc1FSO4yi3QS7XgBiWAVogOY",
  authDomain: "gioco-arcano.firebaseapp.com",
  projectId: "gioco-arcano",
  storageBucket: "gioco-arcano.firebasestorage.app",
  messagingSenderId: "853586526442",
  appId: "1:853586526442:web:2e2c49088e495b83905793",
  measurementId: "G-KVXPPTSVFH"
};

const CARD_DEFS = [
  {name:'Il Matto', atk:0, def:2200, effect:'matto', rarity:'normale', flavor:'Non ha nulla da perdere, quindi non perde mai il sorriso. O il cane.', scene:'Un campanello suona da nessuna parte. Il Matto fa un inchino a un pubblico che non esiste.'},
  {name:'Il Mago', atk:100, def:2150, effect:'mago', rarity:'normale', flavor:'Sa tre trucchi. Il quarto è convincerti che ne sa cento.', scene:'Le carte si mescolano da sole. Nessuno ha visto come.'},
  {name:'La Papessa', atk:200, def:2100, effect:'presagio', rarity:'normale', flavor:'Custodisce segreti che nemmeno lei ricorda più.', scene:'Un libro si apre su una pagina che prima non c\'era.'},
  {name:'L\'Imperatrice', atk:300, def:2050, effect:'presagio', rarity:'normale', flavor:'Regna su un castello immaginario con polso fermissimo.', scene:'Il trono trema per un istante, poi torna immobile.'},
  {name:'L\'Imperatore', atk:400, def:2000, effect:'none', rarity:'normale', flavor:'Governa. Punto. Non fate domande.', scene:'Il silenzio cala nella stanza. Nessuno osa parlare per primo.'},
  {name:'Il Papa', atk:500, def:1950, effect:'presagio', rarity:'normale', flavor:'Benedice tutto, giudica silenziosamente il resto.', scene:'Una campana suona in lontananza, tre volte, poi tace.'},
  {name:'Gli Amanti', atk:600, def:1900, effect:'union', rarity:'normale', flavor:'Due cuori, un solo voto. Indovina chi lo esprime.', scene:'Due ombre si uniscono in una sola, per un attimo.'},
  {name:'Il Carro', atk:700, def:1850, effect:'presagio', rarity:'normale', flavor:'Va dritto per la sua strada, anche quando la strada non esiste ancora.', scene:'Le ruote girano da sole, in una direzione che nessuno ha scelto.'},
  {name:'La Giustizia', atk:800, def:1800, effect:'none', rarity:'normale', flavor:'Pesa tutto sulla bilancia, tranne le proprie colpe.', scene:'La bilancia oscilla, poi si ferma perfettamente in equilibrio.'},
  {name:'L\'Eremita', atk:900, def:1750, effect:'eremita', rarity:'normale', flavor:'Cammina da solo nella neve perché il wifi in compagnia non prende.', scene:'Una lanterna si accende in fondo al corridoio. Nessuno la tiene in mano.'},
  {name:'La Ruota', atk:1000, def:1700, effect:'ciclo', rarity:'normale', flavor:'Gira, gira, gira. A volte ti porta su. Spesso no.', scene:'Il pavimento gira sotto i piedi di tutti, per un solo istante.'},
  {name:'La Forza', atk:1100, def:1650, effect:'presagio', rarity:'normale', flavor:'Doma il leone con un sorriso e zero esitazioni.', scene:'Un ruggito lontano, poi una quiete innaturale.'},
  {name:'L\'Appeso', atk:1200, def:1600, effect:'none', rarity:'normale', flavor:'Vede il mondo capovolto e giura che così ha più senso.', scene:'Il mondo si capovolge per mezzo secondo. Poi torna com\'era, forse.'},
  {name:'La Morte', atk:1300, def:1550, effect:'morte', rarity:'epocale', flavor:'Non è la fine. È solo... una fine molto definitiva.', scene:'Le candele si spengono tutte insieme, senza vento.'},
  {name:'La Temperanza', atk:1400, def:1500, effect:'none', rarity:'normale', flavor:'Mescola gli elementi con calma zen mentre tutti gli altri vanno nel panico.', scene:'Due liquidi si versano l\'uno nell\'altro senza mai mescolarsi davvero.'},
  {name:'Il Diavolo', atk:1500, def:1450, effect:'diavolo', rarity:'epocale', flavor:'Offre un patto vantaggioso. Le clausole in piccolo sono, per l\'appunto, in piccolo.', scene:'Un profumo di zolfo e di buoni propositi riempie la stanza.'},
  {name:'La Torre', atk:1600, def:1400, effect:'torre', rarity:'epocale', flavor:'Quando crolla, crolla per tutti. Democraticamente distruttiva.', scene:'Un boato lontano. Qualcosa, da qualche parte, è appena crollato.'},
  {name:'La Stella', atk:1700, def:1350, effect:'heal400', rarity:'normale', flavor:'Brilla nel buio e non chiede nulla in cambio. Merce rara, in questo mazzo.', scene:'Una singola luce si accende nel buio più totale.'},
  {name:'La Luna', atk:1800, def:1300, effect:'none', rarity:'normale', flavor:'Illumina appena quel che basta per farti inciampare comunque.', scene:'L\'ombra della luna scivola sul tavolo, anche se non c\'è nessuna finestra.'},
  {name:'Il Sole', atk:1900, def:1250, effect:'heal400', rarity:'normale', flavor:'Splende su tutti senza preferenze, come un raggio di ottimismo instancabile.', scene:'La stanza si scalda all\'improvviso, come se fosse mezzogiorno.'},
  {name:'Il Giudizio', atk:2000, def:1200, effect:'ciclo', rarity:'normale', flavor:'Chiama tutti a rapporto. Nessuno risponde volentieri.', scene:'Una tromba suona da lontano, e tutti si voltano insieme.'},
  {name:'Il Mondo', atk:2100, def:1150, effect:'mondo', rarity:'normale', flavor:'Ha visto tutto, ha fatto tutto, ora si gode il traguardo.', scene:'Un cerchio si chiude. Qualcosa, finalmente, è completo.'},
  {name:'La Perseveranza', atk:2200, def:1100, effect:'none', rarity:'normale', flavor:'Continua a camminare anche quando la lanterna si è spenta da un pezzo.', scene:'Un passo, poi un altro. La lanterna è vuota da un pezzo, ma nessuno si ferma.'},
  {name:'Il Pericolo', atk:2300, def:1050, effect:'pericolo', rarity:'normale', flavor:'Non porta la mascherina per moda: il mestiere è letteralmente pericoloso. Chi le sta vicino ne esce indebolito.', scene:'Una nube tossica si allarga silenziosa. Chi la respira sente le braccia farsi più deboli.'},
  {name:'Il Tempo', atk:2400, def:1000, effect:'none', rarity:'normale', flavor:'Passa comunque, che tu lo passi bene o no.', scene:'Un orologio ticchetta più forte per qualche secondo, poi torna normale.'},
  {name:'Il Führer', atk:2500, def:950, effect:'fuhrer', rarity:'normale', flavor:'Si è auto-proclamato capo. Da solo. Ma quando parla lui, tacciono tutti.', scene:'Qualcuno si schiarisce la voce e tutti, inspiegabilmente, tacciono.'},
  {name:'L\'Inganno', atk:2600, def:900, effect:'inganno', rarity:'normale', flavor:'Non è quello che sembra. O forse sì. È un inganno: chi può dirlo davvero.', scene:'Qualcosa si muove nell\'ombra. O forse è solo un\'ombra.'},
  {name:'La Sapienza', atk:2700, def:850, effect:'sapienza', rarity:'normale', flavor:'Ha letto tutti i libri e li condivide con chiunque, persino con l\'avversario. Il sapere non fa preferenze.', scene:'Le pagine di mille libri sfogliano tutte insieme, da sole, e si aprono anche davanti all\'avversario.'},
  {name:'Il Seme', atk:2800, def:800, effect:'none', rarity:'normale', flavor:'Piccolo, silenzioso, destinato a diventare un problema molto più grande.', scene:'Qualcosa di piccolissimo cade a terra e nessuno ci fa caso. Ancora per poco.'},
  {name:'L\'Ascensione', atk:2900, def:750, effect:'union', rarity:'normale', flavor:'Salgono insieme, sperando che nessuno dei due guardi giù.', scene:'Due mani si stringono, in alto, dove nessuno può raggiungerle.'},
  {name:'Il Vizio', atk:3000, def:700, effect:'ciclo', rarity:'normale', flavor:'Un abbraccio, due colpe, zero rimpianti.', scene:'Un brindisi silenzioso, un sorriso complice, nessun rimorso in vista.'},
  {name:'La Montagna', atk:3100, def:650, effect:'presagio', rarity:'normale', flavor:'Non si scala da soli. O si può, ma poi te ne penti.', scene:'L\'aria si fa più sottile. La vetta sembra più vicina di quanto sia davvero.'},
  {name:'L\'Arroganza', atk:4200, def:0, effect:'none', rarity:'normale', flavor:'Tutto attacco, zero difesa. Un ritratto fedele, a pensarci bene.', scene:'Un petto si gonfia d\'orgoglio. Le difese, nel frattempo, restano a casa.'},
  {name:'La Mano di Dio', atk:3300, def:550, effect:'manodidio', rarity:'normale', flavor:'Tocca, e ciò che era rotto guarisce. O segna un gol irregolare: dipende dai punti di vista.', scene:'Una luce calda tocca ciò che era spezzato. Qualcosa si ricompone.'},
  {name:'La Fede', atk:3400, def:500, effect:'none', rarity:'normale', flavor:'Crede fermamente in qualcosa che nessun altro può vedere. Rispetto.', scene:'Nessuna prova, nessun dubbio. Solo una certezza tranquilla.'},
  {name:'La Grazia', atk:3500, def:450, effect:'ciclo', rarity:'normale', flavor:'Danza tra le pagine di una storia che nessun altro saprebbe raccontare così bene.', scene:'Una melodia si alza da nessuno strumento in particolare.'},
  {name:'La Fortuna', atk:3600, def:400, effect:'fortuna', rarity:'normale', flavor:'A volte basta essere nel posto giusto, vestiti nel modo giusto.', scene:'Una moneta cade, rotola, si ferma dalla parte giusta.'},
  {name:'Il Cambiamento', atk:3700, def:350, effect:'presagio', rarity:'normale', flavor:'Porta tutto quello che ha, anche se non sa bene dove sta andando.', scene:'I bagagli sono già pronti. La destinazione, ancora no.'},
  {name:'Il Baratto', atk:3800, def:300, effect:'none', rarity:'normale', flavor:'Ha un piano. Ha sempre un piano. Fidatevi, più o meno.', scene:'Due mani si stringono su un accordo che nessuno ha letto per intero.'},
  {name:'Il Fuoco', atk:3900, def:250, effect:'none', rarity:'normale', flavor:'Brucia dentro anche quando fuori sembra tutto tranquillo.', scene:'Una scintilla, poi un calore che non si vede ma si sente.'},
  {name:'Le Passioni', atk:4000, def:200, effect:'passioni', rarity:'normale', flavor:'Corre a testa alta verso qualcosa. Non importa cosa: l\'importante è correre forte.', scene:'Il cuore accelera. Non importa il motivo, importa la corsa.'},
  {name:'L\'Afrohouse', atk:4100, def:150, effect:'presagio', rarity:'normale', flavor:'Alza il volume finché anche le stelle si mettono a ballare.', scene:'I bassi fanno tremare i bicchieri. Qualcuno, da qualche parte, alza le braccia.'},
  {name:'La Luna Nera', atk:4200, def:100, effect:'lunanera', rarity:'epocale', flavor:'Quando appare, gli orologi si fermano. I punti vita, un po\' meno.', scene:'La luce sparisce tutta insieme. Per un istante, il mondo trattiene il respiro.'},
  {name:'La Buona Novella', atk:4300, def:50, effect:'presagio', rarity:'normale', flavor:'Porta notizie che cambiano tutto, puntualmente all\'ultimo momento.', scene:'Una lettera arriva, sigillata, proprio mentre nessuno se lo aspettava più.'},
  {name:'La Madre', atk:4400, def:0, effect:'madre', rarity:'epocale', flavor:'Protegge tutti, nutre tutti, non chiede mai nulla in cambio. La vera carta più potente del mazzo.', scene:'Le braccia si aprono, calde, prima ancora che qualcuno chieda aiuto.'}
];

const CARD_IMAGES = {/*stripped*/};

/* ===================== IL TRIAGE DEGLI ARCANI — sound module ===================== */

const SOUND_PREF_KEY = 'triage_sound_enabled';
let soundEnabled = true;
try{ const v = localStorage.getItem(SOUND_PREF_KEY); if(v!==null) soundEnabled = v==='1'; } catch(e){ /* default on */ }

let audioCtx = null;
function getAudioCtx(){
  if(!soundEnabled) return null;
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e){ return null; }
  }
  if(audioCtx.state === 'suspended'){ audioCtx.resume().catch(()=>{}); }
  return audioCtx;
}

function toggleSound(){
  soundEnabled = !soundEnabled;
  try{ localStorage.setItem(SOUND_PREF_KEY, soundEnabled ? '1' : '0'); } catch(e){ /* ignore */ }
  if(soundEnabled) getAudioCtx();
  return soundEnabled;
}

function playTone(freq, startAt, duration, opts){
  const ctx = getAudioCtx();
  if(!ctx) return;
  opts = opts || {};
  const type = opts.type || 'sine';
  const vol = opts.volume!==undefined ? opts.volume : 0.14;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
  if(opts.glideTo){
    osc.frequency.linearRampToValueAtTime(opts.glideTo, ctx.currentTime + startAt + duration);
  }
  gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.02);
}

function playNoiseBurst(startAt, duration, opts){
  const ctx = getAudioCtx();
  if(!ctx) return;
  opts = opts || {};
  const vol = opts.volume!==undefined ? opts.volume : 0.12;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * (1 - i/bufferSize); }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = opts.freq || 900;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(ctx.currentTime + startAt);
}

function soundTap(){ playTone(1400, 0, 0.05, {type:'sine', volume:0.05}); }
function soundDraw(){
  playTone(1600, 0, 0.03, {type:'triangle', volume:0.06});
  playTone(1200, 0.04, 0.08, {type:'sine', volume:0.09});
}
function soundDestroy(){
  playNoiseBurst(0, 0.22, {freq:500, volume:0.14});
  playTone(200, 0.02, 0.2, {type:'sawtooth', volume:0.07, glideTo:40});
}
function soundTribute(){
  playTone(160, 0, 0.18, {type:'square', volume:0.09, glideTo:80});
  playNoiseBurst(0.05, 0.12, {freq:400, volume:0.08});
}
function soundPhase(){
  playTone(660, 0, 0.06, {type:'triangle', volume:0.08});
  playTone(990, 0.06, 0.09, {type:'triangle', volume:0.08});
}
function soundSupport(){
  playTone(520, 0, 0.08, {type:'sine', volume:0.1});
  playTone(780, 0.07, 0.10, {type:'triangle', volume:0.1});
  playTone(1040, 0.14, 0.14, {type:'sine', volume:0.09});
}
function soundSelect(){ playTone(700, 0, 0.07, {type:'triangle', volume:0.09}); }
function soundSummon(rarity){
  playTone(440, 0, 0.09, {type:'sine', volume:0.11});
  playTone(660, 0.07, 0.10, {type:'sine', volume:0.11});
  playTone(880, 0.14, 0.16, {type:'sine', volume:0.12});
  if(rarity==='epocale'){
    playTone(1320, 0.22, 0.22, {type:'triangle', volume:0.1});
  }
}
function soundHit(){
  playNoiseBurst(0, 0.14, {freq:700, volume:0.16});
  playTone(120, 0, 0.12, {type:'sawtooth', volume:0.08, glideTo:60});
}
function soundHeal(){
  playTone(520, 0, 0.10, {type:'sine', volume:0.10});
  playTone(780, 0.08, 0.14, {type:'sine', volume:0.10});
}
function soundClick(){ playTone(300, 0, 0.06, {type:'square', volume:0.05}); }
function soundVictory(){
  [523,659,784,1047].forEach((f,i)=>playTone(f, i*0.12, 0.22, {type:'triangle', volume:0.13}));
}
function soundDefeat(){
  [392,349,293,220].forEach((f,i)=>playTone(f, i*0.14, 0.26, {type:'sawtooth', volume:0.1}));
}
function soundCoin(){
  playTone(900, 0, 0.05, {type:'square', volume:0.08});
  playTone(1100, 0.05, 0.05, {type:'square', volume:0.08});
  playTone(950, 0.1, 0.08, {type:'square', volume:0.08});
}
function vibrate(pattern){
  try{ if(soundEnabled && navigator.vibrate) navigator.vibrate(pattern); } catch(e){ /* ignore */ }
}

/* ===================== ARCANA DUEL — game engine ===================== */

const EFFECT_INFO = {
  none:      { title:'', desc:'' },
  matto:     { title:'Il Folle Immortale', desc:"Finché è l'unica carta sul tuo campo, non può essere distrutta in battaglia." },
  mago:      { title:'Prestigio', desc:'Alla evocazione, scambia permanentemente il suo ATK con la sua DEF.' },
  union:     { title:'Unione', desc:"Se controlli almeno un'altra carta, questa ottiene +500 ATK." },
  eremita:   { title:'Illuminazione', desc:'Alla evocazione, pesca 1 carta.' },
  morte:     { title:'Mietitrice', desc:"Se distrugge un mostro in battaglia, l'avversario scarta una carta a caso dalla mano." },
  diavolo:   { title:'Tentazione', desc:"Alla evocazione, se l'avversario controlla un mostro con ATK ≤ 800, ne prendi il controllo (torna al proprietario dopo due cambi turno)." },
  torre:     { title:'Crollo', desc:'Alla evocazione, distrugge tutti i mostri in campo (compreso questo). Il suo evocatore subisce 500 danni.' },
  heal400:   { title:'Grazia Celeste', desc:'Alla evocazione, il suo controllore recupera 400 LP.' },
  mondo:     { title:'Compimento', desc:'Alla evocazione, pesca 1 carta e recupera 200 LP.' },
  fuhrer:    { title:'Solitario al Comando', desc:"Finché è l'unico mostro che controlli, il suo ATK raddoppia." },
  inganno:   { title:'Maschera', desc:'Alla evocazione, lancia una moneta: testa = +2000 ATK permanenti, croce = nessun effetto.' },
  manodidio: { title:'Intervento Divino', desc:"Alla evocazione, annulla l'effetto del mostro avversario più forte in campo." },
  fortuna:   { title:'Colpo di Fortuna', desc:'Alla evocazione, pesca 2 carte.' },
  passioni:  { title:'Impeto', desc:'Ottiene +300 ATK quando attacca.' },
  lunanera:  { title:'Eclissi', desc:'Alla evocazione, gli LP di entrambi i giocatori vengono dimezzati.' },
  madre:     { title:'Istinto Materno', desc:'Alla evocazione, il suo controllore recupera 300 LP per ogni mostro che controlla.' },
  presagio:  { title:'Presagio', desc:'Alla evocazione, riveli la prossima carta in cima al mazzo.' },
  ciclo:     { title:'Ciclo', desc:'Alla evocazione, il suo controllore recupera 200 LP.' },
  arroganza: { title:'Tutto o Niente', desc:'ATK +1000 rispetto al suo numero, ma DEF ridotta a 0.' },
  sapienza:  { title:'Sapere Condiviso', desc:'Alla evocazione, il sapere non fa preferenze: entrambi i giocatori pescano una carta.' },
  pericolo:  { title:'Contaminazione', desc:'Alla evocazione, il mostro avversario più forte in campo perde 500 ATK permanenti.' }
};

/* CARD_DEFS is injected before this script as a const array of
   { name, atk, def, effect } indexed 0..44, and CARD_IMAGES as {index:base64}. */

let state = null;
let uidCounter = 1;
let selectedHandIndex = null;
let selectedFieldSlot = null;
let selectedTributeSlots = [];
let pendingSummonPosition = null;
let mySeat = 0;          // local seat in online mode (0 or 1) — never synced
let viewerRole = 'player'; // 'player' | 'spectator' — local only, never synced
let matchRef = null;     // Firestore doc reference for online mode
let uiLocked = false;    // true while the bot "thinks" — blocks human input
let fxEvents = [];       // queued visual-effect events, drained by the UI layer after each render
function pushFx(ev){ fxEvents.push(ev); }

/* ---- custom deck pool (deck builder) ---- */
let customDeckPool = null;
try{
  const raw = localStorage.getItem('triage_custom_deck');
  if(raw){ const arr = JSON.parse(raw); if(Array.isArray(arr) && arr.length>=15) customDeckPool = arr; }
} catch(e){ /* ignore */ }

function saveCustomDeckPool(arr){
  customDeckPool = (arr && arr.length>=15) ? arr : null;
  try{
    if(customDeckPool) localStorage.setItem('triage_custom_deck', JSON.stringify(customDeckPool));
    else localStorage.removeItem('triage_custom_deck');
  } catch(e){ /* ignore */ }
}

/* ---- seeded PRNG for the daily challenge ---- */
function hashStringToInt(str){
  let h = 1779033703 ^ str.length;
  for(let i=0;i<str.length;i++){
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0);
}
function mulberry32(seed){
  return function(){
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function todayDateStr(){
  const d = new Date();
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth()+1).padStart(2,'0') + '-' + String(d.getUTCDate()).padStart(2,'0');
}

function log(msg){
  state.log.unshift(msg);
  if(state.log.length>60) state.log.length = 60;
  renderLog();
}

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

function shuffledDeck(seedStr){
  const pool = (customDeckPool && customDeckPool.length>=15) ? customDeckPool : CARD_DEFS.map((c,i)=>i);
  const arr = pool.map(i=>({ uid:0, idx:i }));
  const rng = seedStr ? mulberry32(hashStringToInt(seedStr)) : Math.random;
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(rng()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  arr.forEach(c=>{ c.uid = uidCounter++; });
  return arr;
}

/* mode: 'hotseat' | 'bot' | 'online'
   opts: { name1, name2, botDifficulty, seed, isDaily } */
function newGame(mode, opts){
  opts = opts||{};
  state = {
    mode: mode,
    botDifficulty: opts.botDifficulty || 'normal',
    isDaily: !!opts.isDaily,
    players: [
      { name:opts.name1||'Giocatore 1', lp:8000, hand:[], field:[null,null,null] },
      { name:opts.name2||'Giocatore 2', lp:8000, hand:[], field:[null,null,null] }
    ],
    deck: shuffledDeck(opts.seed),
    current: 0,
    turnCount: 1,
    phase: 'action',
    summonedThisTurn: false,
    supportUsedThisTurn: 0,
    lastAction: null,
    positionChangedThisTurn: {},
    log: [],
    over: false,
    pendingReturns: [],
    graveyard: []
  };
  for(let i=0;i<5;i++){ drawCard(0,true); drawCard(1,true); }
  log('Il duello ha inizio (8000 LP a testa). Il giocatore che comincia non pesca al suo primissimo turno.');
}

/* Yu-Gi-Oh-style tribute cost: how many of your own monsters
   must be sacrificed to Normal Summon a given card. */
function tributeCostFor(idx){
  const atk = CARD_DEFS[idx].atk;
  if(atk>=3500) return 2;
  if(atk>=2500) return 1;
  return 0;
}

/* Effects meaningful as a standalone "support" activation (card goes to the
   graveyard instead of the field, no tribute, no ATK/DEF, no monster body).
   Field-only / passive effects (union, fuhrer, passioni, mago, matto, morte,
   inganno) are excluded because they need to stay on the field to matter. */
const SUPPORT_EFFECTS = new Set(['eremita','diavolo','torre','heal400','mondo',
  'manodidio','fortuna','lunanera','madre','sapienza','pericolo','presagio','ciclo']);

function isSupportable(idx){
  return SUPPORT_EFFECTS.has(CARD_DEFS[idx].effect);
}

function activateSupport(handIdx){
  const p = state.players[state.current];
  const card = p.hand[handIdx];
  if(!card) return false;
  if(state.phase!=='action') return false;
  if(state.supportUsedThisTurn>=2) return false;
  if(!isSupportable(card.idx)) return false;
  const def = CARD_DEFS[card.idx];
  p.hand.splice(handIdx,1);
  state.supportUsedThisTurn++;
  log(p.name + ' attiva ' + def.name + ' dalla Zona Supporto (' + state.supportUsedThisTurn + '/2 questo turno).');
  state.lastAction = {type:'support', owner:state.current, cardIdx:card.idx, rarity:def.rarity, ts:Date.now()};
  pushFx({type:'support', owner:state.current, cardIdx:card.idx, rarity:def.rarity});
  triggerSummonEffect(card, state.current);
  state.graveyard.push({idx:card.idx, ownerIdx:state.current, reason:'supporto'});
  return true;
}

function drawCard(playerIdx, silent){
  const p = state.players[playerIdx];
  if(state.deck.length===0){
    if(!silent){
      log(p.name + ' non può pescare: il mazzo è esaurito!');
      endGame(1-playerIdx, p.name + ' è rimasto senza carte da pescare.');
    }
    return false;
  }
  const card = state.deck.shift();
  p.hand.push(card);
  return true;
}

function isAlone(playerIdx){
  return state.players[playerIdx].field.filter(Boolean).length===1;
}

function fieldCountOf(playerIdx){
  return state.players[playerIdx].field.filter(Boolean).length;
}

function calcAtk(card, ownerIdx, opts){
  opts = opts||{};
  const def = CARD_DEFS[card.idx];
  let base = card.swapped ? def.def : def.atk;
  base += (card.atkBuff||0);
  if(card.negated) return base;
  const effect = def.effect;
  if(effect==='fuhrer' && fieldCountOf(ownerIdx)===1) base = base*2;
  if(effect==='union' && fieldCountOf(ownerIdx)>1) base += 500;
  if(effect==='passioni' && opts.isAttacking) base += 300;
  return Math.max(0, base);
}

function calcDef(card){
  const def = CARD_DEFS[card.idx];
  return card.swapped ? def.atk : def.def;
}

function triggerSummonEffect(card, ownerIdx){
  const def = CARD_DEFS[card.idx];
  const owner = state.players[ownerIdx];
  const oppIdx = 1-ownerIdx;
  const opp = state.players[oppIdx];
  switch(def.effect){
    case 'mago':
      card.swapped = true;
      log(def.name + ': Prestigio! ATK e DEF vengono scambiati.');
      break;
    case 'eremita':
      log(def.name + ': Illuminazione. ' + owner.name + ' pesca una carta.');
      drawCard(ownerIdx);
      break;
    case 'diavolo': {
      let targetSlot = -1, best = Infinity;
      opp.field.forEach((c,i)=>{
        if(c && !c.negated){
          const a = calcAtk(c, oppIdx, {});
          if(a<=800 && a<best){ best=a; targetSlot=i; }
        }
      });
      const freeSlot = owner.field.findIndex(s=>s===null);
      if(targetSlot>=0 && freeSlot>=0){
        const stolen = opp.field[targetSlot];
        opp.field[targetSlot] = null;
        stolen.stolenFrom = oppIdx;
        stolen.stolenReturnTurn = state.turnCount + 3;
        owner.field[freeSlot] = stolen;
        log(def.name + ': Tentazione riuscita! ' + owner.name + ' prende il controllo temporaneo di ' + CARD_DEFS[stolen.idx].name + '.');
      } else {
        log(def.name + ': Tentazione fallita, nessun bersaglio adatto.');
      }
      break;
    }
    case 'torre': {
      log(def.name + ': Crollo! Tutti i mostri in campo vengono distrutti.');
      [0,1].forEach(pi=>{
        state.players[pi].field.forEach((c,i)=>{
          if(c) destroyMonster(pi, i, {byBattle:false});
        });
      });
      owner.lp = Math.max(0, owner.lp - 500);
      pushFx({type:'lp', playerIdx:ownerIdx, delta:-500});
      pushFx({type:'shake'});
      pushFx({type:'flash', color:'rgba(208,90,90,0.35)'});
      log(owner.name + ' subisce 500 danni dal crollo della torre.');
      checkWin();
      break;
    }
    case 'heal400':
      owner.lp += 400;
      pushFx({type:'lp', playerIdx:ownerIdx, delta:400});
      log(def.name + ': ' + owner.name + ' recupera 400 LP.');
      break;
    case 'mondo':
      owner.lp += 200;
      pushFx({type:'lp', playerIdx:ownerIdx, delta:200});
      drawCard(ownerIdx);
      log(def.name + ': ' + owner.name + ' recupera 200 LP e pesca una carta.');
      break;
    case 'inganno': {
      pushFx({type:'coinflip'});
      const heads = Math.random()<0.5;
      if(heads){
        card.atkBuff = (card.atkBuff||0) + 2000;
        log(def.name + ": la moneta cade su Testa! ATK permanentemente +2000.");
      } else {
        log(def.name + ": la moneta cade su Croce. Nessun effetto questa volta.");
      }
      break;
    }
    case 'manodidio': {
      let targetSlot=-1, best=-1;
      opp.field.forEach((c,i)=>{
        if(c && !c.negated && CARD_DEFS[c.idx].effect!=='none'){
          const a = calcAtk(c, oppIdx, {});
          if(a>best){ best=a; targetSlot=i; }
        }
      });
      if(targetSlot>=0){
        opp.field[targetSlot].negated = true;
        log(def.name + ': Intervento Divino! L\'effetto di ' + CARD_DEFS[opp.field[targetSlot].idx].name + ' viene annullato.');
      } else {
        log(def.name + ': Intervento Divino non trova bersagli con un effetto attivo.');
      }
      break;
    }
    case 'fortuna':
      drawCard(ownerIdx); drawCard(ownerIdx);
      log(def.name + ': Colpo di Fortuna! ' + owner.name + ' pesca due carte.');
      break;
    case 'lunanera': {
      const d0 = state.players[0].lp - Math.floor(state.players[0].lp/2);
      const d1 = state.players[1].lp - Math.floor(state.players[1].lp/2);
      state.players[0].lp = Math.floor(state.players[0].lp/2);
      state.players[1].lp = Math.floor(state.players[1].lp/2);
      pushFx({type:'lp', playerIdx:0, delta:-d0});
      pushFx({type:'lp', playerIdx:1, delta:-d1});
      pushFx({type:'shake'});
      pushFx({type:'flash', color:'rgba(127,90,220,0.35)'});
      log(def.name + ': Eclissi! Entrambi i giocatori dimezzano i propri LP.');
      checkWin();
      break;
    }
    case 'madre': {
      const n = fieldCountOf(ownerIdx);
      owner.lp += 300*n;
      pushFx({type:'lp', playerIdx:ownerIdx, delta:300*n});
      log(def.name + ': Istinto Materno. ' + owner.name + ' recupera ' + (300*n) + ' LP.');
      break;
    }
    case 'presagio': {
      if(state.deck.length>0){
        const topName = CARD_DEFS[state.deck[0].idx].name;
        log(def.name + ': Presagio... la prossima carta del mazzo è "' + topName + '".');
      } else {
        log(def.name + ': Presagio, ma il mazzo è vuoto.');
      }
      break;
    }
    case 'ciclo':
      owner.lp += 200;
      pushFx({type:'lp', playerIdx:ownerIdx, delta:200});
      log(def.name + ': Ciclo. ' + owner.name + ' recupera 200 LP.');
      break;
    case 'sapienza':
      log(def.name + ': Sapere Condiviso. Il sapere non fa preferenze: entrambi i giocatori pescano una carta.');
      drawCard(0); drawCard(1);
      break;
    case 'pericolo': {
      let targetSlot=-1, best=-1;
      opp.field.forEach((c,i)=>{
        if(c && !c.negated){
          const a = calcAtk(c, oppIdx, {});
          if(a>best){ best=a; targetSlot=i; }
        }
      });
      if(targetSlot>=0){
        const target = opp.field[targetSlot];
        target.atkBuff = (target.atkBuff||0) - 500;
        log(def.name + ': Contaminazione! ' + CARD_DEFS[target.idx].name + ' perde 500 ATK permanenti.');
      } else {
        log(def.name + ': Contaminazione, ma non c\'è nessun mostro avversario da indebolire.');
      }
      break;
    }
    default:
      break;
  }
}

function destroyMonster(ownerIdx, slot, opts){
  opts = opts||{};
  const card = state.players[ownerIdx].field[slot];
  if(!card) return false;
  const def = CARD_DEFS[card.idx];
  if(opts.byBattle && def.effect==='matto' && isAlone(ownerIdx)){
    log(def.name + ' resiste alla distruzione: è l\'unica carta sul campo!');
    return false;
  }
  state.players[ownerIdx].field[slot] = null;
  log(def.name + ' (' + state.players[ownerIdx].name + ') viene distrutto.');
  state.graveyard.push({idx:card.idx, ownerIdx:ownerIdx, reason:'battaglia'});
  pushFx({type:'destroy', owner:ownerIdx, slot:slot});
  return true;
}

function checkWin(){
  if(state.players[0].lp<=0 && state.players[1].lp<=0){
    endGame(-1, 'Entrambi i giocatori crollano nello stesso istante.');
  } else if(state.players[0].lp<=0){
    endGame(1, state.players[0].name + ' è stato sconfitto.');
  } else if(state.players[1].lp<=0){
    endGame(0, state.players[1].name + ' è stato sconfitto.');
  }
}

function endGame(winnerIdx, reason){
  state.over = true;
  state.winnerIdx = winnerIdx;
  state.overReason = reason;
  log('--- DUELLO CONCLUSO --- ' + reason);
  pushFx({type:'gameover'});
  if(state.mode==='bot' && winnerIdx!==-1){
    botStatsRecord(state.botDifficulty, winnerIdx===0);
  }
  renderAll();
  showGameOver();
  recordLeaderboardResult();
  recordLocalHistory();
  if(state.isDaily) recordDailyResult();
  clearOnlineSession();
}

const BOT_STATS_KEY = 'triage_bot_stats';
function botStatsGet(){
  try{
    const raw = localStorage.getItem(BOT_STATS_KEY);
    if(raw) return JSON.parse(raw);
  } catch(e){ /* ignore */ }
  return {easy:{wins:0,losses:0}, normal:{wins:0,losses:0}, hard:{wins:0,losses:0}};
}
function botStatsRecord(difficulty, humanWon){
  const stats = botStatsGet();
  if(!stats[difficulty]) stats[difficulty] = {wins:0, losses:0};
  if(humanWon) stats[difficulty].wins++; else stats[difficulty].losses++;
  try{ localStorage.setItem(BOT_STATS_KEY, JSON.stringify(stats)); } catch(e){ /* ignore */ }
}

function playToField(handIdx, slot, position, tributeSlots){
  const p = state.players[state.current];
  const card = p.hand[handIdx];
  if(!card || p.field[slot]!==null || state.summonedThisTurn) return false;
  if(state.phase!=='action') return false;
  const needed = tributeCostFor(card.idx);
  tributeSlots = tributeSlots || [];
  if(tributeSlots.length !== needed) return false;
  for(const ts of tributeSlots){
    if(ts===slot || !p.field[ts]) return false;
  }
  // pay the tribute cost first
  tributeSlots.forEach(ts=>{
    const tributed = p.field[ts];
    p.field[ts] = null;
    state.graveyard.push({idx:tributed.idx, ownerIdx:state.current, reason:'tributo'});
    log(p.name + ' offre in Tributo ' + CARD_DEFS[tributed.idx].name + '.');
    soundTributeSafe();
  });
  p.hand.splice(handIdx,1);
  card.position = position;
  card.attacked = false;
  card.summonedTurn = state.turnCount;
  p.field[slot] = card;
  state.summonedThisTurn = true;
  const def = CARD_DEFS[card.idx];
  const evocLabel = needed>0 ? ('Evocazione Tributo (' + needed + ')') : 'Evocazione Normale';
  log(p.name + ' esegue una ' + evocLabel + ': ' + def.name + ' (' + def.atk + '/' + def.def + ') in posizione di ' + (position==='atk'?'Attacco':'Difesa') + '.');
  triggerSummonEffect(card, state.current);
  pushFx({type:'summon', owner:state.current, slot:slot, rarity:def.rarity, cardIdx:card.idx});
  return true;
}

function changePosition(slot){
  const p = state.players[state.current];
  const card = p.field[slot];
  if(!card) return false;
  if(state.phase!=='action') return false;
  if(card.summonedTurn === state.turnCount) return false;
  if(card.attacked) return false;
  const key = state.current + '_' + slot + '_' + state.turnCount;
  if(state.positionChangedThisTurn[key]) return false;
  card.position = card.position==='atk' ? 'def' : 'atk';
  state.positionChangedThisTurn[key] = true;
  log(p.name + ' cambia la posizione di ' + CARD_DEFS[card.idx].name + ' in ' + (card.position==='atk'?'Attacco':'Difesa') + '.');
  return true;
}

function resolveBattle(attackerSlot, targetSlot){
  if(state.phase!=='action') return;
  const atkIdx = state.current, defIdx = 1-state.current;
  const attackerP = state.players[atkIdx], defenderP = state.players[defIdx];
  const attacker = attackerP.field[attackerSlot];
  if(!attacker || attacker.position!=='atk' || attacker.attacked) return;
  const attackerDef = CARD_DEFS[attacker.idx];
  const effAtk = calcAtk(attacker, atkIdx, {isAttacking:true});

  if(targetSlot===null){
    if(defenderP.field.some(Boolean)) return;
    pushFx({type:'clash', aOwner:atkIdx, aSlot:attackerSlot, aCardIdx:attacker.idx, dOwner:defIdx, dSlot:null, dCardIdx:null});
    defenderP.lp -= effAtk;
    pushFx({type:'lp', playerIdx:defIdx, delta:-effAtk});
    if(effAtk>=1200){ pushFx({type:'flash', color:'rgba(208,90,90,0.3)'}); }
    log(attackerDef.name + ' attacca direttamente! ' + defenderP.name + ' subisce ' + effAtk + ' danni.');
    attacker.attacked = true;
    checkWin();
    return;
  }

  const defender = defenderP.field[targetSlot];
  if(!defender) return;
  const defenderDef = CARD_DEFS[defender.idx];
  attacker.attacked = true;
  pushFx({type:'clash', aOwner:atkIdx, aSlot:attackerSlot, aCardIdx:attacker.idx, dOwner:defIdx, dSlot:targetSlot, dCardIdx:defender.idx});

  if(defender.position==='atk'){
    const effDef = calcAtk(defender, defIdx, {isAttacking:false});
    log(attackerDef.name + ' (' + effAtk + ') attacca ' + defenderDef.name + ' (' + effDef + ') in Attacco.');
    if(effAtk>effDef){
      const diff = effAtk-effDef;
      destroyMonster(defIdx, targetSlot, {byBattle:true});
      defenderP.lp -= diff;
      pushFx({type:'lp', playerIdx:defIdx, delta:-diff});
      log(defenderP.name + ' subisce ' + diff + ' danni.');
      if(attackerDef.effect==='morte' && !attacker.negated && defenderP.hand.length>0){
        const r = Math.floor(Math.random()*defenderP.hand.length);
        const discarded = defenderP.hand.splice(r,1)[0];
        state.graveyard.push({idx:discarded.idx, ownerIdx:defIdx, reason:'mietitrice'});
        log('Mietitrice: ' + defenderP.name + ' scarta ' + CARD_DEFS[discarded.idx].name + ' dalla mano.');
      }
    } else if(effAtk<effDef){
      const diff = effDef-effAtk;
      destroyMonster(atkIdx, attackerSlot, {byBattle:true});
      attackerP.lp -= diff;
      pushFx({type:'lp', playerIdx:atkIdx, delta:-diff});
      log(attackerP.name + ' subisce ' + diff + ' danni di ritorno.');
    } else {
      destroyMonster(atkIdx, attackerSlot, {byBattle:true});
      destroyMonster(defIdx, targetSlot, {byBattle:true});
      log('Entrambi i mostri si distruggono a vicenda.');
    }
  } else {
    const effDef2 = calcDef(defender);
    log(attackerDef.name + ' (' + effAtk + ') attacca ' + defenderDef.name + ' (DEF ' + effDef2 + ') in Difesa.');
    if(effAtk>effDef2){
      destroyMonster(defIdx, targetSlot, {byBattle:true});
      if(attackerDef.effect==='morte' && !attacker.negated && defenderP.hand.length>0){
        const r = Math.floor(Math.random()*defenderP.hand.length);
        const discarded = defenderP.hand.splice(r,1)[0];
        state.graveyard.push({idx:discarded.idx, ownerIdx:defIdx, reason:'mietitrice'});
        log('Mietitrice: ' + defenderP.name + ' scarta ' + CARD_DEFS[discarded.idx].name + ' dalla mano.');
      }
    } else if(effAtk<effDef2){
      const diff = effDef2-effAtk;
      attackerP.lp -= diff;
      pushFx({type:'lp', playerIdx:atkIdx, delta:-diff});
      log(attackerP.name + ' urta una difesa solida e subisce ' + diff + ' danni.');
    } else {
      log('L\'attacco si infrange senza alcun effetto.');
    }
  }
  checkWin();
}

function processReturns(){
  [0,1].forEach(pi=>{
    state.players[pi].field.forEach((c,i)=>{
      if(c && c.stolenReturnTurn && c.stolenReturnTurn<=state.turnCount){
        const originalOwner = c.stolenFrom;
        state.players[pi].field[i] = null;
        delete c.stolenReturnTurn; delete c.stolenFrom;
        const freeSlot = state.players[originalOwner].field.findIndex(s=>s===null);
        if(freeSlot>=0){
          state.players[originalOwner].field[freeSlot] = c;
          log(CARD_DEFS[c.idx].name + ' torna sotto il controllo del suo proprietario originale.');
        } else {
          log(CARD_DEFS[c.idx].name + ' torna al proprietario, ma il campo è pieno: viene scartato.');
        }
      }
    });
  });
}

/* Shared turn-advance logic: discard, switch player, reset flags. */
function endTurnCore(){
  const p = state.players[state.current];
  while(p.hand.length>6){
    const discarded = p.hand.pop();
    state.graveyard.push({idx:discarded.idx, ownerIdx:state.current, reason:'limite mano'});
    log(p.name + ' supera il limite di mano e scarta ' + CARD_DEFS[discarded.idx].name + '.');
  }
  state.current = 1-state.current;
  state.turnCount++;
  state.phase = 'draw';
  state.summonedThisTurn = false;
  state.supportUsedThisTurn = 0;
  processReturns();
  state.players[state.current].field.forEach(c=>{ if(c) c.attacked=false; });
  selectedHandIndex=null; selectedFieldSlot=null; selectedTributeSlots=[];
}

function afterChangeover(){
  log('--- Turno ' + state.turnCount + ': tocca a ' + state.players[state.current].name + ' ---');
}

/* Draws the turn's card. Called by tapping the deck pile (human), or
   automatically by the bot. Transitions Draw Phase -> Main Phase 1. */
function performDraw(){
  if(!state || state.over || state.phase!=='draw') return false;
  const ok = drawCard(state.current);
  if(state.over) return false;
  if(ok){
    pushFx({type:'draw', owner:state.current});
    soundDrawSafe();
  }
  state.phase = 'action';
  return true;
}
function soundDrawSafe(){ try{ soundDraw(); }catch(e){ /* sound module not loaded yet */ } }
function soundTributeSafe(){ try{ soundTribute(); }catch(e){ /* ignore */ } }
function soundPhaseSafe(){ try{ soundPhase(); }catch(e){ /* ignore */ } }

/* Called by the "Fine turno" button. Branches by mode. */
async function endTurn(){
  if(state.over || uiLocked) return;
  if(state.mode==='online' && !isMyOnlineTurn()) return;
  if(state.phase!=='action') return;
  endTurnCore();

  if(state.mode==='hotseat'){
    showChangeover();
    return;
  }
  // bot / online: no device hand-off screen needed
  afterChangeover();
  renderAll();
  if(state.mode==='online'){ pushOnlineState(); }
  if(state.mode==='bot' && state.current===1 && !state.over){
    await botPlay();
  }
}

/* ===================== BOT AI ===================== */

async function botPlay(){
  uiLocked = true;
  renderAll();
  await sleep(650);

  if(state.phase==='draw'){
    performDraw();
    renderAll();
    if(state.mode==='online') pushOnlineState();
    await sleep(500);
  }
  if(state.over){ uiLocked = false; renderAll(); return; }

  const diff = state.botDifficulty;
  const me = 1, opp = 0;
  const bot = state.players[me], human = state.players[opp];

  // --- decide a summon (respecting tribute costs, Yu-Gi-Oh style) ---
  if(!state.summonedThisTurn && bot.hand.length>0){
    const freeSlot = bot.field.findIndex(s=>s===null);
    const monstersOnField = fieldCountOf(me);
    const affordable = bot.hand.map((c,i)=>({c,i})).filter(x=>tributeCostFor(x.c.idx) <= monstersOnField);
    if(freeSlot>=0 && affordable.length>0){
      let handIdx, position;
      if(diff==='easy'){
        const pick = affordable[Math.floor(Math.random()*affordable.length)];
        handIdx = pick.i;
        position = Math.random()<0.5 ? 'atk' : 'def';
      } else {
        let bestAtkIdx=affordable[0].i, bestDefIdx=affordable[0].i;
        affordable.forEach(x=>{
          if(CARD_DEFS[x.c.idx].atk > CARD_DEFS[bot.hand[bestAtkIdx].idx].atk) bestAtkIdx=x.i;
          if(CARD_DEFS[x.c.idx].def > CARD_DEFS[bot.hand[bestDefIdx].idx].def) bestDefIdx=x.i;
        });
        const underThreat = human.field.some(c=>c && c.position==='atk' && calcAtk(c,opp,{})>=1500);
        const behind = bot.lp < human.lp*0.6;
        if(behind && !underThreat){ handIdx=bestAtkIdx; position='atk'; }
        else if(underThreat){ handIdx=bestDefIdx; position='def'; }
        else { handIdx=bestAtkIdx; position='atk'; }

        if(diff==='hard'){
          const goodFx = ['fortuna','heal400','manodidio','torre','madre'];
          let fxIdx=-1;
          affordable.forEach(x=>{ if(goodFx.includes(CARD_DEFS[x.c.idx].effect)) fxIdx=x.i; });
          if(fxIdx>=0 && CARD_DEFS[bot.hand[fxIdx].idx].effect!=='torre'){ handIdx=fxIdx; }
        }
      }
      const needed = tributeCostFor(bot.hand[handIdx].idx);
      let tributeSlots = [];
      if(needed>0){
        const owned = bot.field.map((c,i)=>({c,i})).filter(x=>x.c);
        owned.sort((a,b)=>calcAtk(a.c,me,{}) - calcAtk(b.c,me,{}));
        tributeSlots = owned.slice(0,needed).map(x=>x.i);
      }
      const targetSlot = tributeSlots.includes(freeSlot) ? freeSlot : (tributeSlots[0] !== undefined && bot.field[freeSlot]===null ? freeSlot : freeSlot);
      playToField(handIdx, freeSlot, position, tributeSlots);
      renderAll();
      if(state.mode==='online') pushOnlineState();
      await sleep(750);
    }
  }

  // --- possibly activate a support card from hand ---
  if(diff!=='easy' && state.supportUsedThisTurn<2 && bot.hand.length>0){
    const idx = bot.hand.findIndex(c=>isSupportable(c.idx));
    if(idx>=0){
      activateSupport(idx);
      renderAll();
      if(state.mode==='online') pushOnlineState();
      await sleep(650);
    }
  }

  // --- possibly change a monster's position before battling ---
  if(diff!=='easy'){
    bot.field.forEach((c,i)=>{
      if(!c || c.summonedTurn===state.turnCount || c.attacked) return;
      const isWeakAtk = c.position==='atk' && calcAtk(c,me,{})<600;
      if(isWeakAtk){ changePosition(i); }
    });
    renderAll();
  }

  // --- battle: attack with eligible monsters ---
  if(!state.over){
    renderAll();
    if(state.mode==='online') pushOnlineState();
    await sleep(500);

    const attackers = bot.field.map((c,i)=>({c,i})).filter(x=>x.c && x.c.position==='atk' && !x.c.attacked);
    for(const {c,i} of attackers){
      if(state.over) break;
      const effAtk = calcAtk(c, me, {isAttacking:true});
      const humanHasField = human.field.some(Boolean);
      let doAttack = false, targetSlot = null;

      if(!humanHasField){
        doAttack = true; targetSlot = null;
      } else if(diff==='easy'){
        doAttack = Math.random()<0.5;
        if(doAttack){
          const opts = human.field.map((c2,i2)=>i2).filter(i2=>human.field[i2]);
          targetSlot = opts[Math.floor(Math.random()*opts.length)];
        }
      } else {
        let best=-1, bestScore=-Infinity;
        human.field.forEach((c2,i2)=>{
          if(!c2) return;
          const otherVal = c2.position==='atk' ? calcAtk(c2,opp,{}) : calcDef(c2);
          const score = effAtk - otherVal;
          if(score>bestScore){ bestScore=score; best=i2; }
        });
        if(best>=0 && (bestScore>=0 || (diff==='hard' && human.lp<=effAtk))){
          doAttack = true; targetSlot = best;
        } else if(diff==='hard' && human.lp <= effAtk && !humanHasField){
          doAttack = true; targetSlot = null;
        }
      }

      if(doAttack){
        resolveBattle(i, targetSlot);
        renderAll();
        if(state.mode==='online') pushOnlineState();
        await sleep(750);
      }
    }
  }

  uiLocked = false;
  if(!state.over){
    await sleep(300);
    endTurn();
  } else {
    renderAll();
  }
}

/* ===================== REAL-CARD COMPANION MODE ===================== */

let realState = null;

function realNewSession(name1, name2){
  realState = {
    players: [
      { name:name1||'Giocatore 1', lp:8000, field:[null,null,null] },
      { name:name2||'Giocatore 2', lp:8000, field:[null,null,null] }
    ],
    turnCount:1,
    log: [],
    graveyard: []
  };
  realLog('Sessione con carte reali avviata. Registra qui le mosse fatte con il mazzo fisico.');
}

function realLog(msg){
  realState.log.unshift(msg);
  if(realState.log.length>40) realState.log.length=40;
  renderRealLog();
}

function realFieldCount(pIdx){
  return realState.players[pIdx].field.filter(Boolean).length;
}

function realCalcAtk(card, ownerIdx, opts){
  opts=opts||{};
  const def = CARD_DEFS[card.idx];
  let base = card.swapped ? def.def : def.atk;
  base += (card.atkBuff||0);
  if(card.negated) return Math.max(0, base);
  if(def.effect==='fuhrer' && realFieldCount(ownerIdx)===1) base*=2;
  if(def.effect==='union' && realFieldCount(ownerIdx)>1) base+=500;
  if(def.effect==='passioni' && opts.isAttacking) base+=300;
  return Math.max(0, base);
}
function realCalcDef(card){
  const def = CARD_DEFS[card.idx];
  return card.swapped ? def.atk : def.def;
}

function realAddCard(ownerIdx, slot, cardIdx, position){
  const def = CARD_DEFS[cardIdx];
  const card = { idx:cardIdx, position, attacked:false };
  realState.players[ownerIdx].field[slot] = card;
  realLog(realState.players[ownerIdx].name + ' gioca ' + def.name + ' (' + def.atk + '/' + def.def + ') in ' + (position==='atk'?'Attacco':'Difesa') + '.');
  realTriggerEffect(card, ownerIdx);
}

function realTriggerEffect(card, ownerIdx){
  const def = CARD_DEFS[card.idx];
  const owner = realState.players[ownerIdx];
  const oppIdx = 1-ownerIdx, opp = realState.players[oppIdx];
  switch(def.effect){
    case 'mago': card.swapped=true; realLog(def.name+': scambia ATK e DEF.'); break;
    case 'sapienza': realLog(def.name+': Sapere Condiviso — entrambi i giocatori pescano una carta reale.'); break;
    case 'pericolo': {
      let targetSlot=-1, best=-1;
      opp.field.forEach((c,i)=>{ if(c){ const a=realCalcAtk(c,oppIdx,{}); if(a>best){best=a;targetSlot=i;} } });
      if(targetSlot>=0){
        const target = opp.field[targetSlot];
        target.atkBuff = (target.atkBuff||0) - 500;
        realLog(def.name+': Contaminazione! '+CARD_DEFS[target.idx].name+' perde 500 ATK permanenti.');
      } else { realLog(def.name+': nessun mostro avversario da indebolire.'); }
      break;
    }
    case 'eremita': realLog(def.name+': ' + owner.name + ' pesca 1 carta dal mazzo fisico.'); break;
    case 'fortuna': realLog(def.name+': ' + owner.name + ' pesca 2 carte dal mazzo fisico.'); break;
    case 'mondo': owner.lp+=200; realLog(def.name+': ' + owner.name + ' recupera 200 LP e pesca 1 carta fisica.'); break;
    case 'presagio': realLog(def.name+': sbircia la prossima carta del mazzo fisico (nessuna azione qui).'); break;
    case 'heal400': owner.lp+=400; realLog(def.name+': ' + owner.name + ' recupera 400 LP.'); break;
    case 'ciclo': owner.lp+=200; realLog(def.name+': ' + owner.name + ' recupera 200 LP.'); break;
    case 'lunanera':
      realState.players[0].lp = Math.floor(realState.players[0].lp/2);
      realState.players[1].lp = Math.floor(realState.players[1].lp/2);
      realLog(def.name+': entrambi dimezzano gli LP.');
      break;
    case 'madre': { const n=realFieldCount(ownerIdx); owner.lp+=300*n; realLog(def.name+': '+owner.name+' recupera '+(300*n)+' LP.'); break; }
    case 'torre':
      [0,1].forEach(pi=>{ realState.players[pi].field.forEach((c,i)=>{ if(c) realDestroy(pi,i); }); });
      owner.lp = Math.max(0, owner.lp-500);
      realLog(def.name+': crollo totale, ' + owner.name + ' subisce 500 danni.');
      break;
    case 'inganno': {
      const heads = Math.random()<0.5;
      if(heads){ card.atkBuff=(card.atkBuff||0)+2000; realLog(def.name+': Testa! +2000 ATK permanenti.'); }
      else { realLog(def.name+': Croce, nessun effetto.'); }
      break;
    }
    case 'diavolo': {
      let targetSlot=-1, best=Infinity;
      opp.field.forEach((c,i)=>{ if(c){ const a=realCalcAtk(c,oppIdx,{}); if(a<=800 && a<best){best=a;targetSlot=i;} } });
      const freeSlot = owner.field.findIndex(s=>s===null);
      if(targetSlot>=0 && freeSlot>=0){
        const stolen = opp.field[targetSlot];
        opp.field[targetSlot]=null;
        owner.field[freeSlot]=stolen;
        realLog(def.name+': ruba il controllo di ' + CARD_DEFS[stolen.idx].name + ' (restituiscilo manualmente dopo due turni).');
      } else { realLog(def.name+': nessun bersaglio adatto.'); }
      break;
    }
    case 'manodidio': {
      let targetSlot=-1, best=-1;
      opp.field.forEach((c,i)=>{ if(c && CARD_DEFS[c.idx].effect!=='none'){ const a=realCalcAtk(c,oppIdx,{}); if(a>best){best=a;targetSlot=i;} } });
      if(targetSlot>=0){ opp.field[targetSlot].negated=true; realLog(def.name+': annulla l\'effetto di ' + CARD_DEFS[opp.field[targetSlot].idx].name + '.'); }
      else { realLog(def.name+': nessun bersaglio con effetto attivo.'); }
      break;
    }
    default: break;
  }
}

function realDestroy(ownerIdx, slot){
  const card = realState.players[ownerIdx].field[slot];
  if(!card) return false;
  const def = CARD_DEFS[card.idx];
  if(def.effect==='matto' && realFieldCount(ownerIdx)===1){
    realLog(def.name + ' resiste: è l\'unica carta sul campo!');
    return false;
  }
  realState.players[ownerIdx].field[slot] = null;
  realState.graveyard.push({idx:card.idx, ownerIdx:ownerIdx, reason:'battaglia'});
  return true;
}

function realResolveBattle(attackerOwner, attackerSlot, defenderOwner, defenderSlot){
  const attackerP = realState.players[attackerOwner];
  const attacker = attackerP.field[attackerSlot];
  if(!attacker) return;
  const attackerDef = CARD_DEFS[attacker.idx];
  const effAtk = realCalcAtk(attacker, attackerOwner, {isAttacking:true});

  if(defenderSlot===null){
    const defenderP = realState.players[defenderOwner];
    defenderP.lp -= effAtk;
    realLog(attackerDef.name + ' attacca direttamente: ' + defenderP.name + ' subisce ' + effAtk + ' danni.');
    return;
  }
  const defenderP = realState.players[defenderOwner];
  const defender = defenderP.field[defenderSlot];
  if(!defender) return;
  const defenderDef = CARD_DEFS[defender.idx];

  if(defender.position==='atk'){
    const effDef = realCalcAtk(defender, defenderOwner, {});
    if(effAtk>effDef){
      const diff=effAtk-effDef;
      realDestroy(defenderOwner, defenderSlot);
      defenderP.lp-=diff;
      realLog(attackerDef.name+' ('+effAtk+') distrugge '+defenderDef.name+' ('+effDef+'). '+defenderP.name+' subisce '+diff+' danni.'
        + (attackerDef.effect==='morte' ? ' Mietitrice: l\'avversario scarta una carta reale a sua scelta.' : ''));
    } else if(effAtk<effDef){
      const diff=effDef-effAtk;
      realDestroy(attackerOwner, attackerSlot);
      attackerP.lp-=diff;
      realLog(defenderDef.name+' ('+effDef+') respinge '+attackerDef.name+' ('+effAtk+'). '+attackerP.name+' subisce '+diff+' danni.');
    } else {
      realDestroy(attackerOwner, attackerSlot);
      realDestroy(defenderOwner, defenderSlot);
      realLog('Scontro pari: entrambi distrutti.');
    }
  } else {
    const effDef2 = realCalcDef(defender);
    if(effAtk>effDef2){
      realDestroy(defenderOwner, defenderSlot);
      realLog(attackerDef.name+' ('+effAtk+') sfonda la difesa di '+defenderDef.name+' (DEF '+effDef2+').'
        + (attackerDef.effect==='morte' ? ' Mietitrice: l\'avversario scarta una carta reale a sua scelta.' : ''));
    } else if(effAtk<effDef2){
      const diff=effDef2-effAtk;
      attackerP.lp-=diff;
      realLog(defenderDef.name+' (DEF '+effDef2+') respinge '+attackerDef.name+' ('+effAtk+'). '+attackerP.name+' subisce '+diff+' danni.');
    } else {
      realLog('L\'attacco si infrange senza alcun effetto.');
    }
  }
}

/* ===================== ONLINE MODE (Firebase Firestore) ===================== */

let fsDb = null;
function getFsDb(){
  if(fsDb) return fsDb;
  if(typeof firebase === 'undefined'){ return null; }
  try{
    if(!firebase.apps.length){ firebase.initializeApp(FIREBASE_CONFIG); }
    fsDb = firebase.firestore();
  } catch(e){ fsDb = null; }
  return fsDb;
}

function genMatchCode(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s='';
  for(let i=0;i<4;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

let onlineUnsub = null;
let lastKnownLp = null;
let connectionLost = false;

const ONLINE_SESSION_KEY = 'triage_online_session';
function saveOnlineSession(code, seat, role, name){
  try{
    sessionStorage.setItem(ONLINE_SESSION_KEY, JSON.stringify({code, seat, role, name, ts:Date.now()}));
  } catch(e){ /* ignore */ }
}
function getOnlineSession(){
  try{
    const raw = sessionStorage.getItem(ONLINE_SESSION_KEY);
    if(raw) return JSON.parse(raw);
  } catch(e){ /* ignore */ }
  return null;
}
function clearOnlineSession(){
  try{ sessionStorage.removeItem(ONLINE_SESSION_KEY); } catch(e){ /* ignore */ }
}

async function resumeOnlineSession(){
  const session = getOnlineSession();
  if(!session){ return false; }
  const db = getFsDb();
  if(!db){ onlineError('Firebase non è disponibile: controlla la connessione o la configurazione.'); return false; }
  matchRef = db.collection('matches').doc(session.code);
  let snap;
  try{ snap = await matchRef.get(); } catch(e){ onlineError('Errore di connessione: '+(e&&e.message||e)); return false; }
  if(!snap.exists){ clearOnlineSession(); onlineError('La partita non esiste più.'); return false; }
  mySeat = session.seat;
  viewerRole = session.role;
  state = snap.data().state;
  showScreen('duel');
  hideAllOverlays();
  lastSeenReactionTs = Date.now();
  subscribeMatch();
  renderAll();
  return true;
}

function retryOnlineConnection(){
  if(!matchRef) return;
  lastSeenReactionTs = Date.now();
  subscribeMatch();
}

async function onlineCreate(name){
  const db = getFsDb();
  if(!db){ onlineError('Firebase non è disponibile: controlla la connessione o la configurazione.'); return; }
  const code = genMatchCode();
  newGame('online', {name1:name, name2:'In attesa...'});
  mySeat = 0;
  viewerRole = 'player';
  matchRef = db.collection('matches').doc(code);
  try{
    await matchRef.set({ seat1joined:false, state: state, createdAt: Date.now() });
  } catch(e){ onlineError('Impossibile creare la partita: '+(e&&e.message||e)); return; }
  saveOnlineSession(code, 0, 'player', name);
  showOnlineLobbyWaiting(code);
  lastSeenReactionTs = Date.now();
  subscribeMatch();
}

async function onlineJoin(code, name){
  const db = getFsDb();
  if(!db){ onlineError('Firebase non è disponibile: controlla la connessione o la configurazione.'); return; }
  matchRef = db.collection('matches').doc(code.toUpperCase());
  let snap;
  try{ snap = await matchRef.get(); } catch(e){ onlineError('Errore di connessione: '+(e&&e.message||e)); return; }
  if(!snap.exists){ onlineError('Codice non trovato. Controlla e riprova.'); return; }
  const data = snap.data();
  if(data.seat1joined){ onlineError('Questa partita ha già due giocatori.'); return; }
  mySeat = 1;
  const newState = data.state;
  newState.players[1].name = name || 'Giocatore 2';
  try{
    await matchRef.update({ seat1joined:true, state:newState });
  } catch(e){ onlineError('Impossibile unirsi: '+(e&&e.message||e)); return; }
  viewerRole = 'player';
  saveOnlineSession(code.toUpperCase(), 1, 'player', name);
  hideAllOverlays();
  lastSeenReactionTs = Date.now();
  subscribeMatch();
  maybeAutoStartTutorial();
}

function diffAndPushFx(prev, next){
  if(!prev) return;
  if(next.lastAction && next.lastAction.type==='support' &&
     (!prev.lastAction || prev.lastAction.ts !== next.lastAction.ts)){
    pushFx({type:'support', owner:next.lastAction.owner, cardIdx:next.lastAction.cardIdx, rarity:next.lastAction.rarity});
  }
  // find a monster that just became "attacked" this pass (the attack source, if any)
  let attackerInfo = null;
  [0,1].forEach(pi=>{
    prev.players[pi].field.forEach((c,i)=>{
      const nc = next.players[pi].field[i];
      if(c && nc && !c.attacked && nc.attacked){
        attackerInfo = {owner:pi, slot:i, cardIdx:nc.idx};
      }
    });
  });
  // field diffs: summons and destructions
  [0,1].forEach(pi=>{
    for(let i=0;i<3;i++){
      const pc = prev.players[pi].field[i];
      const nc = next.players[pi].field[i];
      if(!pc && nc){
        pushFx({type:'summon', owner:pi, slot:i, rarity:CARD_DEFS[nc.idx].rarity, cardIdx:nc.idx});
      } else if(pc && !nc){
        if(attackerInfo && attackerInfo.owner !== pi){
          pushFx({type:'clash', aOwner:attackerInfo.owner, aSlot:attackerInfo.slot, aCardIdx:attackerInfo.cardIdx, dOwner:pi, dSlot:i, dCardIdx:pc.idx});
        }
        pushFx({type:'destroy', owner:pi, slot:i});
      }
    }
  });
  // direct-attack detection (no field destruction, opponent's field stayed empty, their LP dropped)
  if(attackerInfo){
    const oppIdx = 1-attackerInfo.owner;
    const lpDelta = next.players[oppIdx].lp - prev.players[oppIdx].lp;
    const oppFieldEmpty = next.players[oppIdx].field.every(s=>!s) && prev.players[oppIdx].field.every(s=>!s);
    if(lpDelta<0 && oppFieldEmpty){
      pushFx({type:'clash', aOwner:attackerInfo.owner, aSlot:attackerInfo.slot, aCardIdx:attackerInfo.cardIdx, dOwner:oppIdx, dSlot:null, dCardIdx:null});
    }
  }
  // LP diffs (damage / heal numbers)
  [0,1].forEach(pi=>{
    const delta = next.players[pi].lp - prev.players[pi].lp;
    if(delta!==0) pushFx({type:'lp', playerIdx:pi, delta:delta});
  });
}

function subscribeMatch(){
  connectionLost = false;
  if(onlineUnsub) onlineUnsub();
  onlineUnsub = matchRef.onSnapshot(snap=>{
    connectionLost = false;
    if(!snap.exists) return;
    const data = snap.data();
    const prevState = state;
    state = data.state;
    diffAndPushFx(prevState, state);
    if(mySeat===0 && data.seat1joined){ hideAllOverlays(); maybeAutoStartTutorial(); }
    if(data.reaction && data.reaction.ts > lastSeenReactionTs && data.reaction.from !== mySeat){
      lastSeenReactionTs = data.reaction.ts;
      pushFx({type:'reaction', emoji:data.reaction.emoji});
    }
    renderAll();
    if(state.over) showGameOver();
  }, err=>{
    connectionLost = true;
    log('Connessione al duello online interrotta ('+err.code+').');
    renderAll();
  });
}

async function pushOnlineState(){
  if(!matchRef) return;
  try{
    await matchRef.update({ state: state });
  } catch(e){
    log('Impossibile sincronizzare lo stato: '+(e&&e.message||'errore sconosciuto')+'.');
    renderAll();
  }
}

function isMyOnlineTurn(){
  if(state.mode!=='online') return true;
  if(viewerRole==='spectator') return false;
  return state.current===mySeat;
}

async function onlineSpectate(code){
  const db = getFsDb();
  if(!db){ onlineError('Firebase non è disponibile: controlla la connessione o la configurazione.'); return; }
  matchRef = db.collection('matches').doc(code.toUpperCase());
  let snap;
  try{ snap = await matchRef.get(); } catch(e){ onlineError('Errore di connessione: '+(e&&e.message||e)); return; }
  if(!snap.exists){ onlineError('Codice non trovato. Controlla e riprova.'); return; }
  viewerRole = 'spectator';
  mySeat = -1;
  state = snap.data().state;
  hideAllOverlays();
  lastSeenReactionTs = Date.now();
  subscribeMatch();
  renderAll();
}

/* ===================== LEADERBOARD (Firestore, public) ===================== */

function slugifyName(name){
  return (name||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,60) || 'anonimo';
}

async function recordLeaderboardResult(){
  if(state.winnerIdx===-1 || state.winnerIdx===undefined) return;
  const db = getFsDb();
  if(!db) return;
  const results = [];
  if(state.mode==='bot'){
    results.push({name: state.players[0].name, won: state.winnerIdx===0});
  } else if(state.mode==='hotseat'){
    results.push({name: state.players[0].name, won: state.winnerIdx===0});
    results.push({name: state.players[1].name, won: state.winnerIdx===1});
  } else if(state.mode==='online'){
    if(viewerRole!=='spectator' && mySeat>=0){
      results.push({name: state.players[mySeat].name, won: state.winnerIdx===mySeat});
    }
  }
  for(const r of results){
    if(!r.name) continue;
    const id = slugifyName(r.name);
    try{
      await db.collection('leaderboard').doc(id).set({
        name: r.name,
        wins: firebase.firestore.FieldValue.increment(r.won?1:0),
        losses: firebase.firestore.FieldValue.increment(r.won?0:1),
        updatedAt: Date.now()
      }, {merge:true});
    } catch(e){ /* best-effort, never block the UI on this */ }
  }
}

/* ===================== LOCAL DUEL HISTORY ===================== */

const HISTORY_KEY = 'triage_history';
function recordLocalHistory(){
  if(state.winnerIdx===undefined) return;
  let youIdx = null;
  if(state.mode==='bot') youIdx = 0;
  else if(state.mode==='online' && viewerRole==='player') youIdx = mySeat;
  if(youIdx===null) return;
  const oppIdx = 1-youIdx;
  const result = state.winnerIdx===-1 ? 'pareggio' : (state.winnerIdx===youIdx ? 'vittoria' : 'sconfitta');
  const entry = {
    mode: state.mode,
    opponent: state.players[oppIdx].name,
    result: result,
    turns: state.turnCount,
    date: new Date().toISOString()
  };
  try{
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.unshift(entry);
    if(arr.length>30) arr.length = 30;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
  } catch(e){ /* ignore */ }
}
function getLocalHistory(){
  try{
    const raw = localStorage.getItem(HISTORY_KEY);
    if(raw) return JSON.parse(raw);
  } catch(e){ /* ignore */ }
  return [];
}

/* ===================== DAILY CHALLENGE ===================== */

async function recordDailyResult(){
  const db = getFsDb();
  if(!db) return;
  const won = state.winnerIdx===0;
  try{
    await db.collection('daily_results').add({
      date: todayDateStr(),
      name: state.players[0].name,
      won: won,
      turns: state.turnCount,
      ts: Date.now()
    });
  } catch(e){ /* best-effort */ }
}

async function fetchDailyResults(onData){
  const db = getFsDb();
  if(!db){ onData(null); return; }
  try{
    const snap = await db.collection('daily_results').where('date','==', todayDateStr()).limit(100).get();
    const rows = [];
    snap.forEach(doc=>rows.push(doc.data()));
    rows.sort((a,b)=>{
      if(a.won !== b.won) return a.won ? -1 : 1;
      return (a.turns||99) - (b.turns||99);
    });
    onData(rows.slice(0,10));
  } catch(e){ onData(null); }
}

/* ===================== QUICK REMATCH ===================== */

function quickRematch(){
  if(state.mode==='bot'){
    newGame('bot', {name1:state.players[0].name, name2:'Computer', botDifficulty:state.botDifficulty});
  } else if(state.mode==='hotseat'){
    newGame('hotseat', {name1:state.players[0].name, name2:state.players[1].name});
  } else if(state.mode==='online'){
    if(viewerRole==='spectator') return;
    newGame('online', {name1:state.players[0].name, name2:state.players[1].name});
    pushOnlineState();
  }
}

/* ===================== ONLINE QUICK REACTIONS ===================== */

let lastSeenReactionTs = 0;
async function sendReaction(emoji){
  if(!matchRef || state.mode!=='online' || viewerRole==='spectator') return;
  const ts = Date.now();
  lastSeenReactionTs = ts;
  try{ await matchRef.update({ reaction: {emoji, from:mySeat, ts} }); } catch(e){ /* ignore */ }
}

let leaderboardUnsub = null;
function subscribeLeaderboard(onData){
  const db = getFsDb();
  if(!db){ return null; }
  if(leaderboardUnsub) leaderboardUnsub();
  leaderboardUnsub = db.collection('leaderboard').orderBy('wins','desc').limit(25).onSnapshot(snap=>{
    const rows = [];
    snap.forEach(doc=>rows.push(doc.data()));
    onData(rows);
  }, err=>{ onData(null, err); });
  return leaderboardUnsub;
}

/* ===================== ARCANOMACHIA — FX layer ===================== */

let fxLayer = null;
function fxInit(){
  fxLayer = document.createElement('div');
  fxLayer.id = 'fx-layer';
  document.body.appendChild(fxLayer);

  // universal touch/tap ripple — fires on essentially every interactive tap
  document.addEventListener('pointerdown', e=>{
    const target = e.target.closest('button, .card, .mode-btn, .diff-btn, .picker-item, .tab-btn, .slot');
    if(!target) return;
    fxRippleAt(e.clientX, e.clientY, target);
    soundTap();
  }, {passive:true});
}

function fxRippleAt(x, y, el){
  const rect = el ? el.getBoundingClientRect() : null;
  const ripple = document.createElement('div');
  ripple.className = 'fx-ripple';
  ripple.style.left = x+'px';
  ripple.style.top = y+'px';
  fxLayer.appendChild(ripple);
  ripple.addEventListener('animationend', ()=>ripple.remove());

  if(rect){
    const glow = document.createElement('div');
    glow.className = 'fx-press-glow';
    glow.style.left = rect.left+'px';
    glow.style.top = rect.top+'px';
    glow.style.width = rect.width+'px';
    glow.style.height = rect.height+'px';
    fxLayer.appendChild(glow);
    glow.addEventListener('animationend', ()=>glow.remove());
  }
}

function fxRectFor(role, slot, ownerRole){
  const sel = '[data-role="'+role+'"][data-slot="'+slot+'"]';
  const el = document.querySelector(sel);
  return el ? el.getBoundingClientRect() : null;
}

function fxParticleBurst(rect, opts){
  if(!rect) return;
  opts = opts||{};
  const n = opts.count || 14;
  const colors = opts.colors || ['#f0cf7a','#c9a24a','#d05a5a'];
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  for(let i=0;i<n;i++){
    const p = document.createElement('div');
    p.className = 'fx-particle';
    const angle = (Math.PI*2*i/n) + Math.random()*0.4;
    const dist = 40 + Math.random()*70;
    const dx = Math.cos(angle)*dist;
    const dy = Math.sin(angle)*dist;
    p.style.left = cx+'px';
    p.style.top = cy+'px';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.setProperty('--dx', dx+'px');
    p.style.setProperty('--dy', dy+'px');
    p.style.animationDuration = (500+Math.random()*400)+'ms';
    fxLayer.appendChild(p);
    p.addEventListener('animationend', ()=>p.remove());
  }
}

function fxSummonFlash(rect, rarity){
  if(!rect) return;
  const flash = document.createElement('div');
  flash.className = 'fx-summon-flash fx-rarity-'+rarity;
  flash.style.left = rect.left+'px';
  flash.style.top = rect.top+'px';
  flash.style.width = rect.width+'px';
  flash.style.height = rect.height+'px';
  fxLayer.appendChild(flash);
  flash.addEventListener('animationend', ()=>flash.remove());
  const count = rarity==='epocale' ? 22 : (rarity==='forte' ? 14 : 8);
  const colors = rarity==='epocale' ? ['#f0cf7a','#e37fd0','#7fc9e3','#f7f0c8'] : (rarity==='forte' ? ['#f0cf7a','#c9a24a'] : ['#c9a24a','#8a7040']);
  fxParticleBurst(rect, {count, colors});
  if(rarity==='epocale') fxSparks(rect, 14, ['#fff2b0','#f0cf7a','#ffffff']);
}

function fxSmokePuff(rect){
  if(!rect) return;
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  for(let i=0;i<5;i++){
    const s = document.createElement('div');
    s.className = 'fx-smoke';
    const dx = (Math.random()-0.5)*40;
    const size = 26 + Math.random()*28;
    s.style.left = (cx+dx)+'px';
    s.style.top = cy+'px';
    s.style.width = size+'px';
    s.style.height = size+'px';
    s.style.animationDelay = (i*40)+'ms';
    fxLayer.appendChild(s);
    s.addEventListener('animationend', ()=>s.remove());
  }
}

function fxSparks(rect, count, colors){
  if(!rect) return;
  count = count || 10;
  colors = colors || ['#fff2b0','#ffdf8a'];
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  for(let i=0;i<count;i++){
    const sp = document.createElement('div');
    sp.className = 'fx-spark';
    const ang = Math.random()*Math.PI*2;
    const dist = 20 + Math.random()*55;
    sp.style.left = cx+'px'; sp.style.top = cy+'px';
    sp.style.background = colors[Math.floor(Math.random()*colors.length)];
    sp.style.setProperty('--dx', (Math.cos(ang)*dist)+'px');
    sp.style.setProperty('--dy', (Math.sin(ang)*dist)+'px');
    sp.style.animationDuration = (300+Math.random()*250)+'ms';
    fxLayer.appendChild(sp);
    sp.addEventListener('animationend', ()=>sp.remove());
  }
}

function fxSupportActivate(rect, cardIdx, rarity){
  if(!rect) return;
  const card = document.createElement('img');
  card.src = imgSrc(cardIdx);
  card.className = 'fx-support-card';
  card.style.left = rect.left+'px';
  card.style.top = rect.top+'px';
  card.style.width = rect.width+'px';
  card.style.height = rect.height+'px';
  fxLayer.appendChild(card);
  const glow = document.createElement('div');
  glow.className = 'fx-support-glow';
  glow.style.left = rect.left+'px';
  glow.style.top = rect.top+'px';
  glow.style.width = rect.width+'px';
  glow.style.height = rect.height+'px';
  fxLayer.appendChild(glow);
  fxSparks(rect, rarity==='epocale' ? 16 : 9, ['#7fd6d0','#a0f0ea','#ffffff']);
  setTimeout(()=>{
    card.style.transition = 'opacity 420ms ease-in, transform 420ms ease-in';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.7) translateY(10px)';
  }, 700);
  setTimeout(()=>{ card.remove(); }, 1150);
  glow.addEventListener('animationend', ()=>glow.remove());
}

function fxDeckDraw(){
  const deckEl = document.getElementById('deck-pile');
  const handEl = document.getElementById('hand');
  if(!deckEl || !handEl) return;
  const dRect = deckEl.getBoundingClientRect();
  const hRect = handEl.getBoundingClientRect();
  const card = document.createElement('div');
  card.className = 'fx-draw-card';
  card.style.left = dRect.left+'px';
  card.style.top = dRect.top+'px';
  card.style.width = dRect.width+'px';
  card.style.height = dRect.height+'px';
  fxLayer.appendChild(card);
  requestAnimationFrame(()=>{
    card.style.transition = 'left 480ms cubic-bezier(.3,.7,.4,1), top 480ms cubic-bezier(.3,.7,.4,1), transform 480ms ease, opacity 480ms ease';
    card.style.left = (hRect.left + hRect.width/2 - dRect.width/2) + 'px';
    card.style.top = hRect.top + 'px';
    card.style.transform = 'scale(0.65) rotate(12deg)';
    card.style.opacity = '0.25';
  });
  setTimeout(()=>card.remove(), 560);
}

function fxDestroyBurst(rect){
  if(!rect) return;
  fxParticleBurst(rect, {count:16, colors:['#7a2020','#d05a5a','#3a2c18']});
  fxSmokePuff(rect);
  fxShakeElement(rect);
}

function fxShakeElement(rect){
  // subtle localized shake via a temporary overlay outline pulse
  const ring = document.createElement('div');
  ring.className = 'fx-shatter-ring';
  ring.style.left = rect.left+'px';
  ring.style.top = rect.top+'px';
  ring.style.width = rect.width+'px';
  ring.style.height = rect.height+'px';
  fxLayer.appendChild(ring);
  ring.addEventListener('animationend', ()=>ring.remove());
}

function fxScreenShake(){
  const app = document.querySelector('.app:not([style*="display: none"])') || document.querySelector('.app');
  if(!app) return;
  app.classList.remove('fx-shake');
  void app.offsetWidth;
  app.classList.add('fx-shake');
  setTimeout(()=>app.classList.remove('fx-shake'), 500);
}

function fxScreenFlash(color){
  const flash = document.createElement('div');
  flash.className = 'fx-fullscreen-flash';
  flash.style.background = color || 'rgba(240,207,122,0.35)';
  fxLayer.appendChild(flash);
  flash.addEventListener('animationend', ()=>flash.remove());
}

function fxFloatNumber(rect, text, kind){
  if(!rect) return;
  const el = document.createElement('div');
  el.className = 'fx-float-num fx-float-'+kind;
  el.textContent = text;
  el.style.left = (rect.left + rect.width/2) + 'px';
  el.style.top = rect.top + 'px';
  fxLayer.appendChild(el);
  el.addEventListener('animationend', ()=>el.remove());
}

function fxCoinFlip(onDone){
  const wrap = document.createElement('div');
  wrap.className = 'fx-coin-overlay';
  wrap.innerHTML = '<div class="fx-coin"><div class="fx-coin__face fx-coin__front">✦</div><div class="fx-coin__face fx-coin__back">✧</div></div>';
  fxLayer.appendChild(wrap);
  setTimeout(()=>{
    wrap.remove();
    if(onDone) onDone();
  }, 1000);
}

function fxCardClash(aRect, aIdx, dRect, dIdx){
  if(!aRect) return;
  const dTarget = dRect || aRect;
  const midX = (aRect.left + dTarget.left)/2 + aRect.width/2;
  const midY = (aRect.top + dTarget.top)/2 + aRect.height/2;

  const a = document.createElement('img');
  a.src = imgSrc(aIdx);
  a.className = 'fx-clash-card';
  a.style.left = aRect.left+'px'; a.style.top = aRect.top+'px';
  a.style.width = aRect.width+'px'; a.style.height = aRect.height+'px';
  fxLayer.appendChild(a);

  let d = null;
  if(dIdx!==null && dIdx!==undefined && dRect){
    d = document.createElement('img');
    d.src = imgSrc(dIdx);
    d.className = 'fx-clash-card';
    d.style.left = dRect.left+'px'; d.style.top = dRect.top+'px';
    d.style.width = dRect.width+'px'; d.style.height = dRect.height+'px';
    fxLayer.appendChild(d);
  }

  requestAnimationFrame(()=>{
    a.style.transition = 'transform 260ms cubic-bezier(.4,0,.6,1)';
    a.style.transform = 'translate('+(midX-aRect.left-aRect.width/2)+'px,'+(midY-aRect.top-aRect.height/2)+'px) scale(1.12) rotate(-6deg)';
    if(d){
      d.style.transition = 'transform 260ms cubic-bezier(.4,0,.6,1)';
      d.style.transform = 'translate('+(midX-dRect.left-dRect.width/2)+'px,'+(midY-dRect.top-dRect.height/2)+'px) scale(1.12) rotate(6deg)';
    }
  });
  setTimeout(()=>{
    fxParticleBurst({left:midX-4, top:midY-4, width:8, height:8}, {count:18, colors:['#f0cf7a','#d05a5a','#ffffff']});
    fxSparks({left:midX-4, top:midY-4, width:8, height:8}, 12);
    a.style.transition = 'opacity 240ms ease-in';
    a.style.opacity = '0';
    if(d){ d.style.transition='opacity 240ms ease-in'; d.style.opacity='0'; }
  }, 280);
  setTimeout(()=>{ a.remove(); if(d) d.remove(); }, 560);
}

function fxReactionPop(emoji){
  const el = document.createElement('div');
  el.className = 'fx-reaction-pop';
  el.textContent = emoji;
  el.style.left = '50%';
  el.style.top = '38%';
  fxLayer.appendChild(el);
  el.addEventListener('animationend', ()=>el.remove());
}

function fxConfetti(){
  const colors = ['#f0cf7a','#c9a24a','#d05a5a','#8fc4ba','#ece2c6'];
  for(let i=0;i<60;i++){
    const c = document.createElement('div');
    c.className = 'fx-confetti';
    c.style.left = (Math.random()*100)+'vw';
    c.style.background = colors[Math.floor(Math.random()*colors.length)];
    c.style.animationDuration = (2200+Math.random()*1400)+'ms';
    c.style.animationDelay = (Math.random()*400)+'ms';
    fxLayer.appendChild(c);
    c.addEventListener('animationend', ()=>c.remove());
  }
}

document.addEventListener('DOMContentLoaded', fxInit);

/* ===================== ARCANA DUEL — UI layer ===================== */

function imgSrc(idx){
  const v = CARD_IMAGES[idx];
  return v.indexOf('data:')===0 ? v : ('data:image/jpeg;base64,' + v);
}

/* ===================== IN-BATTLE TUTORIAL ===================== */

const TUTORIAL_SEEN_KEY = 'triage_tutorial_seen';
let tutorialActive = false;
let tutorialStep = null;

const TUTORIAL_STEPS = {
  selectHand: {
    text: 'Benvenuto nel <b>Triage degli Arcani</b>! Tocca una carta della tua mano per selezionarla.',
    highlight: ['#hand']
  },
  chooseSummonPos: {
    text: 'Scegli la posizione: <b>Attacco</b> per colpire, <b>Difesa</b> per proteggerti.',
    highlight: ['#summon-actions']
  },
  placedWaiting: {
    text: 'Carta schierata! Tocca una tua carta in <b>Attacco</b> per combattere, oppure premi <b>Fine turno</b> quando hai finito.',
    highlight: ['#field-bottom', '#btn-end-turn']
  },
  chooseTarget: {
    text: 'Scegli quale carta avversaria colpire, oppure premi <b>Attacco diretto</b> se il suo campo è vuoto.',
    highlight: ['#field-top', '#btn-direct-attack']
  },
  done: {
    text: 'Hai imparato le basi. Buon duello!',
    highlight: []
  }
};

const TUTORIAL_TRANSITIONS = {
  selectHand: { handSelect: 'chooseSummonPos' },
  chooseSummonPos: { summon: 'placedWaiting' },
  placedWaiting: { attackSelect: 'chooseTarget', endTurn: 'done' },
  chooseTarget: { battleResolved: 'placedWaiting' }
};

function tutorialSeen(){
  try{ return localStorage.getItem(TUTORIAL_SEEN_KEY) === '1'; } catch(e){ return true; }
}
function tutorialMarkSeen(){
  try{ localStorage.setItem(TUTORIAL_SEEN_KEY, '1'); } catch(e){ /* ignore */ }
}

function maybeAutoStartTutorial(){
  if(!tutorialSeen()) tutorialStart();
}

function tutorialStart(){
  tutorialActive = true;
  tutorialStep = 'selectHand';
  renderTutorial();
}

function tutorialSkip(){
  tutorialActive = false;
  tutorialStep = null;
  tutorialMarkSeen();
  clearTutorialHighlights();
  document.getElementById('tutorial-banner').classList.remove('is-visible');
}

function tutorialEvent(name){
  if(!tutorialActive || !tutorialStep) return;
  const transitions = TUTORIAL_TRANSITIONS[tutorialStep];
  if(!transitions || !transitions[name]) return;
  tutorialStep = transitions[name];
  renderTutorial();
  if(tutorialStep === 'done'){
    tutorialMarkSeen();
    setTimeout(()=>{
      if(tutorialStep === 'done'){ tutorialActive = false; tutorialStep = null; clearTutorialHighlights(); document.getElementById('tutorial-banner').classList.remove('is-visible'); }
    }, 3200);
  }
}

function clearTutorialHighlights(){
  document.querySelectorAll('.tutorial-highlight').forEach(el=>el.classList.remove('tutorial-highlight'));
}

function renderTutorial(){
  const banner = document.getElementById('tutorial-banner');
  if(!banner) return;
  if(!tutorialActive || !tutorialStep){ banner.classList.remove('is-visible'); clearTutorialHighlights(); return; }
  const step = TUTORIAL_STEPS[tutorialStep];
  document.getElementById('tutorial-banner__text').innerHTML = step.text;
  banner.classList.add('is-visible');
  clearTutorialHighlights();
  step.highlight.forEach(sel=>{
    const el = document.querySelector(sel);
    if(el) el.classList.add('tutorial-highlight');
  });
}

/* ===================== CARD ZOOM (long-press preview) ===================== */

let lpTimer = null, lpTarget = null, lpStartX = 0, lpStartY = 0, lpSuppressClick = false;

function wireLongPress(){
  document.addEventListener('pointerdown', e=>{
    const el = e.target.closest('.card, .picker-item');
    if(!el) return;
    const idx = el.getAttribute('data-cardidx') || el.getAttribute('data-idx');
    if(idx===null) return;
    lpTarget = el;
    lpStartX = e.clientX; lpStartY = e.clientY;
    lpTimer = setTimeout(()=>{
      lpSuppressClick = true;
      openCardZoom(parseInt(idx,10));
      lpTimer = null;
    }, 380);
  });
  document.addEventListener('pointermove', e=>{
    if(lpTimer && (Math.abs(e.clientX-lpStartX)>10 || Math.abs(e.clientY-lpStartY)>10)){
      clearTimeout(lpTimer); lpTimer = null;
    }
  });
  ['pointerup','pointercancel'].forEach(evName=>{
    document.addEventListener(evName, ()=>{
      if(lpTimer){ clearTimeout(lpTimer); lpTimer = null; }
    });
  });
  document.addEventListener('click', e=>{
    if(lpSuppressClick){ e.preventDefault(); e.stopPropagation(); lpSuppressClick = false; }
  }, true);
  document.getElementById('card-zoom-overlay').addEventListener('click', closeCardZoom);
}

function openCardZoom(idx){
  if(isNaN(idx) || !CARD_DEFS[idx]) return;
  const def = CARD_DEFS[idx];
  document.getElementById('card-zoom-img').src = imgSrc(idx);
  document.getElementById('card-zoom-name').textContent = def.name;
  document.getElementById('card-zoom-stats').textContent = def.atk + ' / ' + def.def;
  const rarityEl = document.getElementById('card-zoom-rarity');
  if(def.rarity==='epocale'){ rarityEl.style.display='inline-block'; } else { rarityEl.style.display='none'; }
  const fx = def.effect!=='none' ? EFFECT_INFO[def.effect] : null;
  document.getElementById('card-zoom-effect').innerHTML = fx ? ('<b>'+fx.title+'.</b> '+fx.desc) : 'Nessun effetto (carta base).';
  document.getElementById('card-zoom-flavor').textContent = '"' + def.flavor + '"';
  document.getElementById('card-zoom-overlay').style.display = 'flex';
}
function closeCardZoom(){
  document.getElementById('card-zoom-overlay').style.display = 'none';
}

/* ===================== GRAVEYARD / CIMITERO ===================== */

function openGraveyard(){
  const list = state.graveyard || [];
  const persp = viewPerspective();
  const mine = list.filter(g=>g.ownerIdx===persp.me);
  const theirs = list.filter(g=>g.ownerIdx===persp.opp);
  function renderCol(arr){
    if(arr.length===0) return '<p style="font-size:0.76rem; color:var(--parchment-dim); font-style:italic;">Vuoto.</p>';
    return arr.slice().reverse().map(g=>{
      const def = CARD_DEFS[g.idx];
      return '<div class="graveyard-item"><img src="'+imgSrc(g.idx)+'"/><div><div class="graveyard-item__name">'+def.name+'</div><div class="graveyard-item__reason">'+g.reason+'</div></div></div>';
    }).join('');
  }
  document.getElementById('graveyard-mine-name').textContent = state.players[persp.me].name;
  document.getElementById('graveyard-theirs-name').textContent = state.players[persp.opp].name;
  document.getElementById('graveyard-mine-list').innerHTML = renderCol(mine);
  document.getElementById('graveyard-theirs-list').innerHTML = renderCol(theirs);
  document.getElementById('graveyard-overlay').style.display = 'flex';
}

/* ===================== SOUND TOGGLE ===================== */

function updateSoundButton(){
  const btn = document.getElementById('btn-sound-toggle');
  if(!btn) return;
  btn.textContent = soundEnabled ? '🔊' : '🔇';
}

/* ===================== BOT STATS ===================== */

function renderBotStats(){
  const stats = botStatsGet();
  ['easy','normal','hard'].forEach(diff=>{
    const el = document.getElementById('bot-stats-'+diff);
    if(!el) return;
    const s = stats[diff] || {wins:0,losses:0};
    el.textContent = 'Vinte: ' + s.wins + ' · Perse: ' + s.losses;
  });
}

/* ===================== ONLINE RECONNECT / RESUME ===================== */

function checkResumeSession(){
  const session = getOnlineSession();
  if(!session) return;
  document.getElementById('resume-session-code').textContent = session.code;
  document.getElementById('resume-session-banner').style.display = 'block';
}

/* ===================== CARD GALLERY ===================== */

let galleryFilter = 'all';
function openGallery(){
  document.getElementById('gallery-overlay').style.display = 'flex';
  renderGallery();
}
function renderGallery(){
  const grid = document.getElementById('gallery-grid');
  const cards = CARD_DEFS.map((c,i)=>({c,i})).filter(x=>galleryFilter==='all' || x.c.rarity===galleryFilter);
  grid.innerHTML = cards.map(x=>{
    return '<div class="picker-item gallery-item-'+x.c.rarity+'" data-idx="'+x.i+'"><img src="'+imgSrc(x.i)+'"/><div class="picker-item__name">'+x.c.name+'</div><div class="picker-item__stats">'+x.c.atk+'/'+x.c.def+'</div></div>';
  }).join('');
}

/* ===================== CARD OF THE DAY ===================== */

function renderCardOfDay(){
  const el = document.getElementById('card-of-day');
  if(!el) return;
  const idx = hashStringToInt(todayDateStr()) % CARD_DEFS.length;
  const def = CARD_DEFS[idx];
  el.innerHTML = '<img src="'+imgSrc(idx)+'"/><div><div class="card-of-day__label">Arcano del giorno</div><div class="card-of-day__name">'+def.name+'</div><div class="card-of-day__flavor">"'+def.flavor+'"</div></div>';
  el.onclick = ()=>openCardZoom(idx);
}

/* ===================== DUEL HISTORY ===================== */

function openHistory(){
  document.getElementById('history-overlay').style.display = 'flex';
  const list = getLocalHistory();
  const el = document.getElementById('history-list');
  if(list.length===0){
    el.innerHTML = '<p style="text-align:center; color:var(--parchment-dim); font-style:italic;">Nessun duello ancora registrato su questo dispositivo.</p>';
    return;
  }
  const modeLabel = {bot:'Computer', online:'Online', hotseat:'Locale'};
  el.innerHTML = list.map(h=>{
    const cls = h.result==='vittoria' ? 'is-win' : (h.result==='sconfitta' ? 'is-loss' : 'is-draw');
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString('it-IT', {day:'2-digit', month:'2-digit'});
    return '<div class="history-row '+cls+'"><div class="history-row__result">'+h.result+'</div><div class="history-row__detail">vs '+h.opponent+' &middot; '+(modeLabel[h.mode]||h.mode)+' &middot; '+h.turns+' turni &middot; '+dateStr+'</div></div>';
  }).join('');
}

/* ===================== DAILY CHALLENGE ===================== */

function openDaily(){
  document.getElementById('mode-daily-overlay').style.display = 'flex';
  document.getElementById('daily-date-label').textContent = todayDateStr();
  document.getElementById('daily-leaderboard-list').innerHTML = '<p style="text-align:center; color:var(--parchment-dim);">Caricamento...</p>';
  fetchDailyResults(rows=>{
    const el = document.getElementById('daily-leaderboard-list');
    if(!rows){ el.innerHTML = '<p style="text-align:center; color:var(--red-bright);">Impossibile caricare la classifica di oggi.</p>'; return; }
    if(rows.length===0){ el.innerHTML = '<p style="text-align:center; color:var(--parchment-dim); font-style:italic;">Nessuno ha ancora affrontato la sfida di oggi.</p>'; return; }
    el.innerHTML = rows.map((r,i)=>{
      return '<div class="leaderboard-row"><div class="leaderboard-row__rank">#'+(i+1)+'</div><div class="leaderboard-row__name">'+r.name+'</div><div class="leaderboard-row__stats">'+(r.won?('vittoria in '+r.turns+' turni'):'sconfitta')+'</div></div>';
    }).join('');
  });
}
function startDailyChallenge(name){
  document.getElementById('mode-daily-overlay').style.display = 'none';
  saveSavedName(name);
  newGame('bot', {name1:name, name2:'Computer', botDifficulty:'hard', seed: todayDateStr(), isDaily:true});
  showScreen('duel');
  renderAll();
  maybeAutoStartTutorial();
}

/* ===================== DECK BUILDER ===================== */

let deckBuilderSelection = null;
function openDeckBuilder(){
  deckBuilderSelection = customDeckPool ? customDeckPool.slice() : CARD_DEFS.map((c,i)=>i);
  document.getElementById('deckbuilder-overlay').style.display = 'flex';
  renderDeckBuilder();
}
function renderDeckBuilder(){
  const grid = document.getElementById('deckbuilder-grid');
  if(!grid.dataset.built){
    grid.innerHTML = CARD_DEFS.map((c,i)=>{
      return '<div class="picker-item" data-idx="'+i+'"><img src="'+imgSrc(i)+'"/><div class="picker-item__name">'+c.name+'</div></div>';
    }).join('');
    grid.dataset.built = '1';
  }
  Array.from(grid.children).forEach((el,i)=>{
    el.classList.toggle('is-deck-selected', deckBuilderSelection.includes(i));
  });
  const countEl = document.getElementById('deckbuilder-count');
  countEl.textContent = deckBuilderSelection.length + ' / 45 selezionate (minimo 15)';
  countEl.style.color = deckBuilderSelection.length>=15 ? 'var(--gold-bright)' : 'var(--red-bright)';
}
function updateDeckBuilderStatus(){
  const el = document.getElementById('deck-status-line');
  if(!el) return;
  if(customDeckPool){
    el.textContent = 'Mazzo personalizzato attivo: ' + customDeckPool.length + ' carte.';
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

/* ===================== ANDROID / BROWSER BACK BUTTON ===================== */

const BACK_UTILITY_OVERLAYS = ['rules-overlay','card-zoom-overlay','graveyard-overlay','leaderboard-overlay',
  'gallery-overlay','history-overlay','deckbuilder-overlay','picker-overlay','position-overlay','target-overlay'];
const BACK_LOBBY_OVERLAYS = ['mode-bot-overlay','mode-hotseat-overlay','mode-online-overlay','mode-daily-overlay'];

let lastBackPressTime = 0;

function isOverlayVisible(id){
  const el = document.getElementById(id);
  return el && getComputedStyle(el).display !== 'none';
}

function pushBackGuardState(){
  try{ history.pushState({triageGuard:true}, '', location.href); } catch(e){ /* ignore */ }
}

function showBackToast(msg){
  let el = document.getElementById('back-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'back-toast';
    el.className = 'back-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(showBackToast._t);
  showBackToast._t = setTimeout(()=>el.classList.remove('is-visible'), 2000);
}

function initBackButtonGuard(){
  pushBackGuardState();
  window.addEventListener('popstate', ()=>{
    const openUtility = BACK_UTILITY_OVERLAYS.find(isOverlayVisible);
    if(openUtility){
      document.getElementById(openUtility).style.display = 'none';
      pushBackGuardState();
      return;
    }
    const openLobby = BACK_LOBBY_OVERLAYS.find(isOverlayVisible);
    if(openLobby){
      document.getElementById(openLobby).style.display = 'none';
      document.getElementById('start-overlay').style.display = 'flex';
      pushBackGuardState();
      return;
    }
    // nothing special open: double-back-to-exit, so a single accidental
    // press never closes the game
    const now = Date.now();
    if(now - lastBackPressTime < 2000){
      // second press within the window: let the browser proceed normally
      return;
    }
    lastBackPressTime = now;
    showBackToast('Premi di nuovo Indietro per uscire dal gioco.');
    pushBackGuardState();
  });
}

function viewPerspective(){
  if(!state) return {me:0, opp:1};
  if(state.mode==='bot') return {me:0, opp:1};
  if(state.mode==='online'){
    if(viewerRole==='spectator') return {me:0, opp:1};
    return {me:mySeat, opp:1-mySeat};
  }
  return {me:state.current, opp:1-state.current};
}

function fxFieldRect(side, slot){
  const container = document.getElementById(side==='bottom' ? 'field-bottom' : 'field-top');
  if(!container) return null;
  const el = container.querySelector('[data-slot="'+slot+'"]');
  return el ? el.getBoundingClientRect() : null;
}

function processFxEvents(){
  if(!fxEvents || fxEvents.length===0) return;
  const events = fxEvents.splice(0, fxEvents.length);
  const persp = viewPerspective();
  events.forEach(ev=>{
    if(ev.type==='summon'){
      const side = ev.owner===persp.me ? 'bottom' : 'top';
      const rect = fxFieldRect(side, ev.slot);
      fxSummonFlash(rect, ev.rarity);
      showSummonVignette(ev.cardIdx);
      soundSummon(ev.rarity);
    } else if(ev.type==='support'){
      const side = ev.owner===persp.me ? 'bottom' : 'top';
      const zoneEl = document.getElementById(side==='bottom' ? 'support-zone-bottom' : 'support-zone-top');
      const rect = zoneEl ? zoneEl.getBoundingClientRect() : null;
      fxSupportActivate(rect, ev.cardIdx, ev.rarity);
      showSummonVignette(ev.cardIdx);
      soundSupport();
    } else if(ev.type==='clash'){
      const aSide = ev.aOwner===persp.me ? 'bottom' : 'top';
      const aRect = fxFieldRect(aSide, ev.aSlot);
      let dRect;
      if(ev.dSlot===null){
        const dSide = ev.dOwner===persp.me ? 'bottom' : 'top';
        const barEl = document.getElementById('lp-'+dSide+'-bar');
        dRect = barEl ? barEl.getBoundingClientRect() : null;
      } else {
        const dSide = ev.dOwner===persp.me ? 'bottom' : 'top';
        dRect = fxFieldRect(dSide, ev.dSlot);
      }
      fxCardClash(aRect, ev.aCardIdx, dRect, ev.dCardIdx);
      soundHit();
      vibrate(25);
    } else if(ev.type==='destroy'){
      const side = ev.owner===persp.me ? 'bottom' : 'top';
      const rect = fxFieldRect(side, ev.slot);
      fxDestroyBurst(rect);
      soundDestroy();
    } else if(ev.type==='draw'){
      fxDeckDraw();
    } else if(ev.type==='lp'){
      const side = ev.playerIdx===persp.me ? 'bottom' : 'top';
      const barEl = document.getElementById('lp-'+side+'-bar');
      const rect = barEl ? barEl.getBoundingClientRect() : null;
      if(ev.delta<0){ fxFloatNumber(rect, ev.delta, 'damage'); if(ev.delta<=-800) fxScreenFlash('rgba(208,90,90,0.22)'); }
      else if(ev.delta>0){ fxFloatNumber(rect, '+'+ev.delta, 'heal'); soundHeal(); }
    } else if(ev.type==='shake'){
      fxScreenShake();
      soundHit();
      vibrate(35);
    } else if(ev.type==='flash'){
      fxScreenFlash(ev.color);
    } else if(ev.type==='coinflip'){
      fxCoinFlip();
      soundCoin();
    } else if(ev.type==='reaction'){
      fxReactionPop(ev.emoji);
    } else if(ev.type==='gameover'){
      fxConfetti();
      const persp2 = viewPerspective();
      if(state.winnerIdx===persp2.me){ soundVictory(); vibrate([30,50,30,50,60]); }
      else if(state.winnerIdx===persp2.opp){ soundDefeat(); vibrate(150); }
    }
  });
}

function cardHTML(card, opts){
  opts = opts||{};
  const def = CARD_DEFS[card.idx];
  const atk = calcAtk(card, opts.ownerIdx, {});
  const dfn = calcDef(card);
  const posClass = card.position==='def' ? 'is-def' : 'is-atk';
  const cls = ['card', 'rarity-'+def.rarity];
  if(opts.small) cls.push('card--small');
  if(opts.selected) cls.push('is-selected');
  if(opts.dim) cls.push('is-dim');
  if(opts.attackable) cls.push('is-attackable');
  if(card.attacked) cls.push('is-spent');
  return '<div class="'+cls.join(' ')+' '+(opts.onField?posClass:'')+'" data-role="'+(opts.role||'')+'" data-slot="'+(opts.slot!==undefined?opts.slot:'')+'" data-hand="'+(opts.handIdx!==undefined?opts.handIdx:'')+'" data-cardidx="'+card.idx+'">'
    + '<div class="card__frame">'
    + '<img class="card__art" src="'+imgSrc(card.idx)+'" alt="'+def.name+'"/>'
    + '<div class="card__stats"><span class="atk">'+atk+'</span><span class="sep">/</span><span class="def">'+dfn+'</span></div>'
    + (opts.onField ? '<div class="card__pos">'+(card.position==='def'?'DIFESA':'ATTACCO')+'</div>' : '')
    + (def.effect!=='none' ? '<div class="card__fx-dot" title="'+EFFECT_INFO[def.effect].title+'">✦</div>' : '')
    + '</div>'
    + '<div class="card__name">'+def.name+(def.rarity==='epocale' ? ' <span class="card__epic-star" title="Arcano Epocale">★</span>' : '')+'</div>'
    + '</div>';
}

function emptySlotHTML(slot, opts){
  opts = opts||{};
  const cls = ['slot','slot--empty'];
  if(opts.targetable) cls.push('is-attackable');
  return '<div class="'+cls.join(' ')+'" data-role="'+(opts.role||'')+'" data-slot="'+slot+'"><span>—</span></div>';
}

function renderLog(){
  const el = document.getElementById('log');
  if(!el) return;
  el.innerHTML = state.log.map(m=>'<div class="log__line">'+m+'</div>').join('');
}

function renderAll(){
  if(!state) return;
  const persp = viewPerspective();
  const me = persp.me, opp = persp.opp;
  const P = state.players;
  const locked = uiLocked || (state.mode==='online' && !isMyOnlineTurn());
  const isSpectator = state.mode==='online' && viewerRole==='spectator';
  const myTurn = !locked && !isSpectator;

  document.getElementById('p-top-name').textContent = P[opp].name;
  document.getElementById('p-bottom-name').textContent = P[me].name;
  document.getElementById('turn-indicator').textContent = (state.phase==='draw' ? 'Turno ' + state.turnCount + ' · Pesca · ' : 'Turno ' + state.turnCount + ' · ') + P[state.current].name;
  document.getElementById('deck-count').textContent = state.deck.length;
  const deckPile = document.getElementById('deck-pile');
  const canDraw = myTurn && state.phase==='draw';
  deckPile.classList.toggle('is-drawable', canDraw);

  setLP('top', P[opp].lp);
  setLP('bottom', P[me].lp);

  const attackMode = selectedFieldSlot!==null;
  const canAct = state.phase==='action';

  // tribute bookkeeping for the currently selected hand card, if any
  let pendingTributeNeeded = 0;
  if(selectedHandIndex!==null && P[me].hand[selectedHandIndex]){
    pendingTributeNeeded = tributeCostFor(P[me].hand[selectedHandIndex].idx);
  }
  const tributeSelecting = pendingTributeNeeded>0 && selectedTributeSlots.length<pendingTributeNeeded;

  const topField = document.getElementById('field-top');
  topField.innerHTML = P[opp].field.map((c,i)=>{
    if(!c) return emptySlotHTML(i, {role:'opp-slot', targetable: attackMode && !P[opp].field.some(Boolean) });
    return cardHTML(c, {onField:true, ownerIdx:opp, role:'opp-card', slot:i, attackable: attackMode});
  }).join('');

  const bottomField = document.getElementById('field-bottom');
  bottomField.innerHTML = P[me].field.map((c,i)=>{
    if(!c) return emptySlotHTML(i, {role:'my-slot'});
    const selected = selectedFieldSlot===i || selectedTributeSlots.includes(i);
    const canReposition = myTurn && canAct && !attackMode
      && c.summonedTurn!==state.turnCount && !c.attacked
      && !state.positionChangedThisTurn[state.current+'_'+i+'_'+state.turnCount];
    let html = cardHTML(c, {onField:true, ownerIdx:me, role:'my-card', slot:i, selected: selected});
    if(canReposition){
      html = html.replace('</div><div class="card__name">', '<button class="card__reposition-btn" data-role="reposition-btn" data-slot="'+i+'" title="Cambia posizione">🔄</button></div><div class="card__name">');
    }
    return html;
  }).join('');

  const hand = document.getElementById('hand');
  if(isSpectator){
    hand.innerHTML = '<div class="spectator-note">👁 Stai osservando in sola lettura.</div>';
  } else {
    hand.innerHTML = P[me].hand.map((c,i)=>{
      const needsTribute = tributeCostFor(c.idx)>0;
      return cardHTML(c, {ownerIdx:me, role:'hand-card', handIdx:i, selected: selectedHandIndex===i, small:true, dim:false}) 
        .replace('<div class="card__name">', needsTribute ? '<div class="card__tribute-mark">T'+tributeCostFor(c.idx)+'</div><div class="card__name">' : '<div class="card__name">');
    }).join('');
  }

  document.getElementById('opp-hand-count').textContent = P[opp].hand.length + ' carte in mano';

  const summonBtns = document.getElementById('summon-actions');
  summonBtns.style.display = (selectedHandIndex!==null && !state.summonedThisTurn && myTurn && canAct && !tributeSelecting) ? 'flex' : 'none';

  const supportBtnWrap = document.getElementById('support-action');
  const selectedCardForSupport = (selectedHandIndex!==null && P[me].hand[selectedHandIndex]) ? P[me].hand[selectedHandIndex] : null;
  const canSupport = selectedCardForSupport && myTurn && canAct && !tributeSelecting
    && state.supportUsedThisTurn<2 && isSupportable(selectedCardForSupport.idx);
  supportBtnWrap.style.display = canSupport ? 'flex' : 'none';

  [['support-zone-bottom', state.current===me ? state.supportUsedThisTurn : 0],
   ['support-zone-top', state.current===opp ? state.supportUsedThisTurn : 0]].forEach(([id,used])=>{
    const zone = document.getElementById(id);
    if(!zone) return;
    Array.from(zone.children).forEach((slot,i)=>{ slot.classList.toggle('is-used', i<used); });
  });

  const directBtn = document.getElementById('btn-direct-attack');
  directBtn.style.display = (attackMode && !P[opp].field.some(Boolean)) ? 'inline-block' : 'none';

  const cancelBtn = document.getElementById('btn-cancel-attack');
  cancelBtn.style.display = attackMode ? 'inline-block' : 'none';

  const endBtn = document.getElementById('btn-end-turn');
  const canEndTurn = myTurn && canAct;
  endBtn.disabled = !canEndTurn;
  endBtn.style.opacity = canEndTurn ? '1' : '0.45';
  endBtn.style.display = isSpectator ? 'none' : 'inline-block';

  const tributeHint = document.getElementById('tribute-hint');
  if(tributeSelecting){
    tributeHint.style.display = 'block';
    tributeHint.textContent = 'Offri in Tributo ' + pendingTributeNeeded + ' tuoi mostri (' + selectedTributeSlots.length + '/' + pendingTributeNeeded + ') per evocare questa carta.';
  } else {
    tributeHint.style.display = 'none';
  }

  const reactionBar = document.getElementById('reaction-bar');
  if(reactionBar) reactionBar.classList.toggle('is-visible', state.mode==='online' && !isSpectator);

  const waitBanner = document.getElementById('online-wait-banner');
  if(waitBanner){
    if(state.mode==='online' && connectionLost){
      waitBanner.style.display = 'block';
      waitBanner.innerHTML = '⚠ Connessione persa. <button id="btn-reconnect-inline" class="btn-main btn-danger" style="padding:4px 10px; font-size:0.65rem; margin-left:6px;">Riconnetti</button>';
      const btn = document.getElementById('btn-reconnect-inline');
      if(btn) btn.onclick = retryOnlineConnection;
    } else if(isSpectator){
      waitBanner.style.display = 'block';
      waitBanner.textContent = '👁 Modalità osservatore — Turno ' + state.turnCount + ': ' + P[state.current].name;
    } else if(state.mode==='online' && !isMyOnlineTurn() && !state.over){
      waitBanner.style.display = 'block';
      waitBanner.textContent = 'In attesa della mossa di ' + P[opp].name + '...';
    } else if(state.mode==='bot' && uiLocked){
      waitBanner.style.display = 'block';
      waitBanner.textContent = 'Il computer sta pensando...';
    } else if(canDraw){
      waitBanner.style.display = 'block';
      waitBanner.textContent = '🂠 Tocca il mazzo per pescare la tua carta.';
    } else {
      waitBanner.style.display = 'none';
    }
  }

  renderLog();
  processFxEvents();
}

let vignetteTimer = null;
function showSummonVignette(cardIdx){
  const def = CARD_DEFS[cardIdx];
  const el = document.getElementById('summon-vignette');
  if(!el) return;
  el.innerHTML = '<img src="'+imgSrc(cardIdx)+'"/><div class="summon-vignette__text"><div class="summon-vignette__name">'+def.name+(def.rarity==='epocale'?' <span class="rarity-tag epocale">EPOCALE</span>':'')+'</div><div class="summon-vignette__scene">'+def.scene+'</div></div>';
  el.classList.remove('is-visible');
  void el.offsetWidth;
  el.classList.add('is-visible');
  clearTimeout(vignetteTimer);
  vignetteTimer = setTimeout(()=>el.classList.remove('is-visible'), 4200);
}

function setLP(side, value){
  const clamped = Math.max(0, value);
  document.getElementById('lp-'+side+'-value').textContent = clamped;
  const pct = Math.max(0, Math.min(100, (clamped/8000)*100));
  const bar = document.getElementById('lp-'+side+'-bar');
  bar.style.width = pct+'%';
  bar.classList.toggle('lp-low', clamped<=2400);
}

function showChangeover(){
  document.getElementById('changeover-name').textContent = state.players[state.current].name;
  document.getElementById('changeover-overlay').style.display = 'flex';
}
function hideChangeover(){ document.getElementById('changeover-overlay').style.display = 'none'; }

function showGameOver(){
  const el = document.getElementById('gameover-overlay');
  const text = document.getElementById('gameover-text');
  if(state.winnerIdx===-1){
    text.textContent = 'Pareggio! ' + state.overReason;
  } else {
    text.textContent = state.players[state.winnerIdx].name + ' vince il duello!\n' + state.overReason;
  }
  const rematchBtn = document.getElementById('btn-rematch');
  const isSpec = state.mode==='online' && viewerRole==='spectator';
  rematchBtn.style.display = isSpec ? 'none' : 'inline-block';
  el.style.display = 'flex';
}

function clearSelection(){ selectedHandIndex = null; selectedFieldSlot = null; selectedTributeSlots = []; }

function hideAllOverlays(){
  ['start-overlay','mode-bot-overlay','mode-hotseat-overlay','mode-online-overlay','changeover-overlay']
    .forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
}

function showScreen(id){
  document.getElementById('screen-duel').style.display = id==='duel' ? 'flex' : 'none';
  document.getElementById('screen-real').style.display = id==='real' ? 'flex' : 'none';
}

/* ---------------- mode menu wiring ---------------- */

function goBackToMenu(){
  ['mode-bot-overlay','mode-hotseat-overlay','mode-online-overlay'].forEach(id=>{
    document.getElementById(id).style.display='none';
  });
  document.getElementById('start-overlay').style.display='flex';
}

function setOnlineTab(which){
  const tabs = {create:'online-tab-create', join:'online-tab-join', spectate:'online-tab-spectate'};
  const panels = {create:'online-precreate', join:'online-prejoin', spectate:'online-prespectate'};
  Object.keys(tabs).forEach(k=>{
    document.getElementById(tabs[k]).classList.toggle('is-active', k===which);
    document.getElementById(panels[k]).style.display = (k===which) ? 'block' : 'none';
  });
}

const SAVED_NAME_KEY = 'arcanomachia_playername';
function getSavedName(){
  try{ return localStorage.getItem(SAVED_NAME_KEY) || ''; } catch(e){ return ''; }
}
function saveSavedName(name){
  try{ if(name) localStorage.setItem(SAVED_NAME_KEY, name); } catch(e){ /* ignore */ }
}

function prefillNames(){
  const saved = getSavedName();
  if(!saved) return;
  ['bot-player-name','hs-name1','online-name-create','online-name-join'].forEach(id=>{
    const el = document.getElementById(id);
    if(el && !el.value) el.value = saved;
  });
}

function openLeaderboard(){
  document.getElementById('leaderboard-overlay').style.display='flex';
  const list = document.getElementById('leaderboard-list');
  list.innerHTML = '<p style="text-align:center; color:var(--parchment-dim);">Caricamento...</p>';
  subscribeLeaderboard((rows, err)=>{
    if(err){ list.innerHTML = '<p style="text-align:center; color:var(--red-bright);">Impossibile caricare la classifica.</p>'; return; }
    if(!rows || rows.length===0){ list.innerHTML = '<p style="text-align:center; color:var(--parchment-dim);">Nessun duello ancora registrato.</p>'; return; }
    list.innerHTML = rows.map((r,i)=>{
      const total = (r.wins||0)+(r.losses||0);
      const pct = total>0 ? Math.round((r.wins||0)/total*100) : 0;
      return '<div class="leaderboard-row">'
        + '<div class="leaderboard-row__rank">#'+(i+1)+'</div>'
        + '<div class="leaderboard-row__name">'+r.name+'</div>'
        + '<div class="leaderboard-row__stats">'+(r.wins||0)+'V &middot; '+(r.losses||0)+'S &middot; '+pct+'%</div>'
        + '</div>';
    }).join('');
  });
}

function onlineError(msg){
  const el = document.getElementById('online-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function showOnlineLobbyWaiting(code){
  document.getElementById('online-precreate').style.display='none';
  document.getElementById('online-prejoin').style.display='none';
  document.getElementById('online-prespectate').style.display='none';
  document.getElementById('online-waiting').style.display='block';
  document.getElementById('online-code-display').textContent = code;
}

/* ---------------- real-card mode rendering ---------------- */

function realCardHTML(card, opts){
  opts=opts||{};
  const def = CARD_DEFS[card.idx];
  const atk = realCalcAtk(card, opts.ownerIdx, {});
  const dfn = realCalcDef(card);
  const posClass = card.position==='def' ? 'is-def' : 'is-atk';
  return '<div class="card '+posClass+'" data-role="real-card" data-owner="'+opts.ownerIdx+'" data-slot="'+opts.slot+'" data-cardidx="'+card.idx+'">'
    + '<div class="card__frame">'
    + '<img class="card__art" src="'+imgSrc(card.idx)+'" alt="'+def.name+'"/>'
    + '<div class="card__stats"><span class="atk">'+atk+'</span><span class="sep">/</span><span class="def">'+dfn+'</span></div>'
    + '<div class="card__pos">'+(card.position==='def'?'DIFESA':'ATTACCO')+'</div>'
    + '<button class="card__remove" data-role="real-remove" data-owner="'+opts.ownerIdx+'" data-slot="'+opts.slot+'">&times;</button>'
    + '</div>'
    + '<div class="card__name">'+def.name+'</div>'
    + '</div>';
}

function renderReal(){
  if(!realState) return;
  document.getElementById('real-name-0').textContent = realState.players[0].name;
  document.getElementById('real-name-1').textContent = realState.players[1].name;
  document.getElementById('real-lp-0').textContent = realState.players[0].lp;
  document.getElementById('real-lp-1').textContent = realState.players[1].lp;

  [0,1].forEach(pi=>{
    const el = document.getElementById('real-field-'+pi);
    el.innerHTML = realState.players[pi].field.map((c,i)=>{
      if(!c) return '<div class="slot slot--empty" data-role="real-empty" data-owner="'+pi+'" data-slot="'+i+'"><span>+</span></div>';
      return realCardHTML(c, {ownerIdx:pi, slot:i});
    }).join('');
  });

  renderRealLog();
}

function renderRealLog(){
  const el = document.getElementById('real-log');
  if(!el || !realState) return;
  el.innerHTML = realState.log.map(m=>'<div class="log__line">'+m+'</div>').join('');
}

/* card picker modal, reused for real-card mode "add card" flow */
let cardPickerCallback = null;
function openCardPicker(onPick){
  cardPickerCallback = onPick;
  const grid = document.getElementById('picker-grid');
  if(!grid.dataset.built){
    grid.innerHTML = CARD_DEFS.map((c,i)=>{
      return '<div class="picker-item" data-idx="'+i+'">'
        + '<img src="'+imgSrc(i)+'"/>'
        + '<div class="picker-item__name">'+c.name+'</div>'
        + '<div class="picker-item__stats">'+c.atk+'/'+c.def+'</div>'
        + '</div>';
    }).join('');
    grid.dataset.built = '1';
  }
  document.getElementById('picker-overlay').style.display='flex';
}
function closeCardPicker(){
  document.getElementById('picker-overlay').style.display='none';
  cardPickerCallback = null;
}

/* ---------------- events ---------------- */

let pendingRealAdd = null; // {ownerIdx, slot}
let realAttackPick = null; // {ownerIdx, slot} of chosen attacker

function wireEvents(){
  document.getElementById('hand').addEventListener('click', e=>{
    if(uiLocked || (state.mode==='online' && !isMyOnlineTurn())) return;
    if(state.phase!=='action') return;
    const el = e.target.closest('[data-role="hand-card"]');
    if(!el || state.summonedThisTurn) return;
    const idx = parseInt(el.getAttribute('data-hand'),10);
    selectedHandIndex = (selectedHandIndex===idx) ? null : idx;
    selectedFieldSlot = null;
    selectedTributeSlots = [];
    if(selectedHandIndex!==null) tutorialEvent('handSelect');
    renderAll();
  });

  document.getElementById('field-bottom').addEventListener('click', e=>{
    if(uiLocked || (state.mode==='online' && !isMyOnlineTurn())) return;

    const repoBtn = e.target.closest('[data-role="reposition-btn"]');
    if(repoBtn){
      const rslot = parseInt(repoBtn.getAttribute('data-slot'),10);
      const ok = changePosition(rslot);
      if(ok){ renderAll(); if(state.mode==='online') pushOnlineState(); }
      return;
    }

    const slotEl = e.target.closest('[data-slot]');
    if(!slotEl) return;
    const slot = parseInt(slotEl.getAttribute('data-slot'),10);

    if(selectedHandIndex!==null && !state.summonedThisTurn){
      const handCard = state.players[state.current].hand[selectedHandIndex];
      const needed = handCard ? tributeCostFor(handCard.idx) : 0;

      if(needed>0 && selectedTributeSlots.length<needed){
        // tribute-selection mode: tapping an owned monster toggles it
        if(!slotEl.classList.contains('slot--empty')){
          const already = selectedTributeSlots.indexOf(slot);
          if(already>=0){ selectedTributeSlots.splice(already,1); }
          else if(selectedTributeSlots.length<needed){ selectedTributeSlots.push(slot); }
          renderAll();
        }
        return;
      }

      if(slotEl.classList.contains('slot--empty') && !selectedTributeSlots.includes(slot)){
        if(pendingSummonPosition){
          const ok = playToField(selectedHandIndex, slot, pendingSummonPosition, selectedTributeSlots.slice());
          if(ok){
            selectedHandIndex = null; pendingSummonPosition = null; selectedTributeSlots = [];
            tutorialEvent('summon');
            renderAll();
            if(state.mode==='online') pushOnlineState();
          }
        }
      }
      return;
    }

    const card = state.players[state.current].field[slot];
    if(!card) return;
    if(card.position==='atk' && !card.attacked){
      selectedFieldSlot = (selectedFieldSlot===slot) ? null : slot;
      selectedHandIndex = null;
      if(selectedFieldSlot!==null) tutorialEvent('attackSelect');
      renderAll();
    } else if(card.attacked){
      flashHint('Ha già attaccato questo turno.');
    } else {
      flashHint('Le carte in Difesa non possono attaccare. Usa 🔄 per cambiarne la posizione.');
    }
  });

  document.getElementById('field-top').addEventListener('click', e=>{
    if(uiLocked || (state.mode==='online' && !isMyOnlineTurn())) return;
    if(selectedFieldSlot===null) return;
    const slotEl = e.target.closest('[data-slot]');
    if(!slotEl) return;
    const slot = parseInt(slotEl.getAttribute('data-slot'),10);
    const oppHasField = state.players[1-state.current].field.some(Boolean);
    if(!oppHasField) return;
    if(!state.players[1-state.current].field[slot]) return;
    resolveBattle(selectedFieldSlot, slot);
    selectedFieldSlot = null;
    tutorialEvent('battleResolved');
    renderAll();
    if(state.mode==='online') pushOnlineState();
  });

  document.getElementById('btn-pos-atk').addEventListener('click', ()=>{ pendingSummonPosition='atk'; flashHint('Scegli uno slot vuoto sul tuo campo.'); });
  document.getElementById('btn-pos-def').addEventListener('click', ()=>{ pendingSummonPosition='def'; flashHint('Scegli uno slot vuoto sul tuo campo.'); });

  document.getElementById('btn-activate-support').addEventListener('click', ()=>{
    if(selectedHandIndex===null) return;
    const ok = activateSupport(selectedHandIndex);
    if(ok){
      selectedHandIndex = null;
      renderAll();
      if(state.mode==='online') pushOnlineState();
    }
  });

  document.getElementById('btn-direct-attack').addEventListener('click', ()=>{
    if(selectedFieldSlot===null) return;
    resolveBattle(selectedFieldSlot, null);
    selectedFieldSlot = null;
    tutorialEvent('battleResolved');
    renderAll();
    if(state.mode==='online') pushOnlineState();
  });

  document.getElementById('btn-cancel-attack').addEventListener('click', ()=>{
    selectedFieldSlot = null;
    renderAll();
  });

  document.getElementById('btn-end-turn').addEventListener('click', ()=>{
    clearSelection();
    tutorialEvent('endTurn');
    endTurn();
  });

  document.getElementById('deck-pile').addEventListener('click', ()=>{
    if(uiLocked) return;
    if(state.mode==='online' && !isMyOnlineTurn()) return;
    if(state.phase!=='draw') return;
    const ok = performDraw();
    renderAll();
    if(ok && state.mode==='online') pushOnlineState();
    if(state.over) return;
  });

  document.getElementById('reaction-bar').addEventListener('click', e=>{
    const btn = e.target.closest('.reaction-btn');
    if(!btn) return;
    sendReaction(btn.getAttribute('data-emoji'));
    pushFx({type:'reaction', emoji: btn.getAttribute('data-emoji')});
    processFxEvents();
  });

  document.getElementById('btn-changeover-ready').addEventListener('click', ()=>{
    hideChangeover();
    afterChangeover();
    renderAll();
  });

  document.getElementById('btn-rules').addEventListener('click', ()=>{
    document.getElementById('rules-overlay').style.display = 'flex';
  });
  document.getElementById('btn-tutorial-start').addEventListener('click', ()=>{
    tutorialStart();
  });
  document.getElementById('btn-tutorial-skip').addEventListener('click', tutorialSkip);
  document.getElementById('btn-sound-toggle').addEventListener('click', ()=>{
    const nowOn = toggleSound();
    updateSoundButton();
    if(nowOn) soundClick();
  });
  document.getElementById('btn-graveyard').addEventListener('click', openGraveyard);
  document.getElementById('btn-close-graveyard').addEventListener('click', ()=>{
    document.getElementById('graveyard-overlay').style.display = 'none';
  });
  document.getElementById('btn-resume-yes').addEventListener('click', async ()=>{
    document.getElementById('resume-session-banner').style.display = 'none';
    document.getElementById('start-overlay').style.display = 'none';
    const ok = await resumeOnlineSession();
    if(!ok){ document.getElementById('start-overlay').style.display = 'flex'; }
  });
  document.getElementById('btn-resume-no').addEventListener('click', ()=>{
    clearOnlineSession();
    document.getElementById('resume-session-banner').style.display = 'none';
  });
  document.getElementById('btn-close-rules').addEventListener('click', ()=>{
    document.getElementById('rules-overlay').style.display = 'none';
  });
  document.getElementById('btn-rules-real').addEventListener('click', ()=>{
    document.getElementById('rules-overlay').style.display = 'flex';
  });

  document.getElementById('btn-new-game').addEventListener('click', ()=>{
    document.getElementById('gameover-overlay').style.display = 'none';
    if(onlineUnsub){ onlineUnsub(); onlineUnsub=null; }
    matchRef = null;
    viewerRole = 'player';
    clearOnlineSession();
    tutorialActive = false; tutorialStep = null;
    document.getElementById('tutorial-banner').classList.remove('is-visible');
    clearTutorialHighlights();
    showScreen('duel');
    document.getElementById('start-overlay').style.display = 'flex';
  });

  document.getElementById('btn-rematch').addEventListener('click', ()=>{
    document.getElementById('gameover-overlay').style.display = 'none';
    clearSelection();
    quickRematch();
    showScreen('duel');
    renderAll();
  });

  document.getElementById('btn-exit-real').addEventListener('click', ()=>{
    showScreen('duel');
    document.getElementById('start-overlay').style.display = 'flex';
  });

  /* ---- mode menu ---- */
  document.getElementById('btn-mode-bot').addEventListener('click', ()=>{
    document.getElementById('start-overlay').style.display='none';
    document.getElementById('mode-bot-overlay').style.display='flex';
    renderBotStats();
  });
  document.getElementById('btn-mode-hotseat').addEventListener('click', ()=>{
    document.getElementById('start-overlay').style.display='none';
    document.getElementById('mode-hotseat-overlay').style.display='flex';
  });
  document.getElementById('btn-mode-real').addEventListener('click', ()=>{
    document.getElementById('start-overlay').style.display='none';
    realNewSession('Giocatore 1','Giocatore 2');
    showScreen('real');
    renderReal();
  });
  document.getElementById('btn-mode-online').addEventListener('click', ()=>{
    document.getElementById('start-overlay').style.display='none';
    document.getElementById('mode-online-overlay').style.display='flex';
  });
  document.querySelectorAll('.btn-back-menu:not(#btn-exit-real)').forEach(b=>b.addEventListener('click', goBackToMenu));

  document.querySelectorAll('[data-difficulty]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const diff = b.getAttribute('data-difficulty');
      const name = document.getElementById('bot-player-name').value.trim() || 'Giocatore 1';
      document.getElementById('mode-bot-overlay').style.display='none';
      newGame('bot', {name1:name, name2:'Computer', botDifficulty:diff});
      showScreen('duel');
      renderAll();
      maybeAutoStartTutorial();
    });
  });

  document.getElementById('hotseat-form').addEventListener('submit', e=>{
    e.preventDefault();
    const n1 = document.getElementById('hs-name1').value.trim() || 'Giocatore 1';
    const n2 = document.getElementById('hs-name2').value.trim() || 'Giocatore 2';
    document.getElementById('mode-hotseat-overlay').style.display='none';
    newGame('hotseat', {name1:n1, name2:n2});
    showScreen('duel');
    renderAll();
    maybeAutoStartTutorial();
  });

  /* ---- online lobby ---- */
  document.getElementById('online-tab-create').addEventListener('click', ()=>{
    setOnlineTab('create');
  });
  document.getElementById('online-tab-join').addEventListener('click', ()=>{
    setOnlineTab('join');
  });
  document.getElementById('online-tab-spectate').addEventListener('click', ()=>{
    setOnlineTab('spectate');
  });
  document.getElementById('btn-online-create').addEventListener('click', async ()=>{
    document.getElementById('online-error').style.display='none';
    const name = document.getElementById('online-name-create').value.trim() || 'Giocatore 1';
    saveSavedName(name);
    document.getElementById('btn-online-create').disabled = true;
    await onlineCreate(name);
    document.getElementById('btn-online-create').disabled = false;
    showScreen('duel');
  });
  document.getElementById('btn-online-join').addEventListener('click', async ()=>{
    document.getElementById('online-error').style.display='none';
    const name = document.getElementById('online-name-join').value.trim() || 'Giocatore 2';
    const code = document.getElementById('online-code-input').value.trim();
    if(code.length<4){ onlineError('Inserisci il codice a 4 caratteri.'); return; }
    saveSavedName(name);
    document.getElementById('btn-online-join').disabled = true;
    showScreen('duel');
    await onlineJoin(code, name);
    document.getElementById('btn-online-join').disabled = false;
  });
  document.getElementById('btn-online-spectate').addEventListener('click', async ()=>{
    document.getElementById('online-error').style.display='none';
    const code = document.getElementById('online-spectate-code').value.trim();
    if(code.length<4){ onlineError('Inserisci il codice a 4 caratteri.'); return; }
    document.getElementById('btn-online-spectate').disabled = true;
    await onlineSpectate(code);
    document.getElementById('btn-online-spectate').disabled = false;
    showScreen('duel');
  });
  document.getElementById('btn-whatsapp-invite').addEventListener('click', ()=>{
    const code = document.getElementById('online-code-display').textContent.trim();
    const url = location.origin + location.pathname + '?code=' + code;
    const text = encodeURIComponent('🃏 Ti sfido ad ARCANOMACHIA! Unisciti alla mia partita con il codice ' + code + ', oppure apri direttamente questo link: ' + url);
    window.open('https://wa.me/?text=' + text, '_blank');
  });

  /* ---- leaderboard ---- */
  document.getElementById('btn-mode-leaderboard').addEventListener('click', ()=>{
    document.getElementById('start-overlay').style.display='none';
    openLeaderboard();
  });
  document.getElementById('btn-close-leaderboard').addEventListener('click', ()=>{
    document.getElementById('leaderboard-overlay').style.display='none';
    if(leaderboardUnsub){ leaderboardUnsub(); leaderboardUnsub=null; }
    document.getElementById('start-overlay').style.display='flex';
  });

  /* ---- daily challenge ---- */
  document.getElementById('btn-mode-daily').addEventListener('click', ()=>{
    document.getElementById('start-overlay').style.display='none';
    openDaily();
    const saved = getSavedName();
    if(saved) document.getElementById('daily-name-input').value = saved;
  });
  document.getElementById('btn-close-daily').addEventListener('click', ()=>{
    document.getElementById('mode-daily-overlay').style.display='none';
    document.getElementById('start-overlay').style.display='flex';
  });
  document.getElementById('btn-daily-start').addEventListener('click', ()=>{
    const name = document.getElementById('daily-name-input').value.trim() || 'Sfidante';
    startDailyChallenge(name);
  });

  /* ---- card gallery ---- */
  document.getElementById('btn-open-gallery').addEventListener('click', ()=>{
    document.getElementById('start-overlay').style.display='none';
    openGallery();
  });
  document.getElementById('btn-close-gallery').addEventListener('click', ()=>{
    document.getElementById('gallery-overlay').style.display='none';
    document.getElementById('start-overlay').style.display='flex';
  });
  document.querySelectorAll('.gallery-filter-btn').forEach(b=>{
    b.addEventListener('click', ()=>{
      galleryFilter = b.getAttribute('data-filter');
      document.querySelectorAll('.gallery-filter-btn').forEach(x=>x.classList.toggle('is-active', x===b));
      renderGallery();
    });
  });
  document.getElementById('gallery-grid').addEventListener('click', e=>{
    const item = e.target.closest('.picker-item');
    if(!item) return;
    openCardZoom(parseInt(item.getAttribute('data-idx'),10));
  });

  /* ---- duel history ---- */
  document.getElementById('btn-open-history').addEventListener('click', ()=>{
    document.getElementById('start-overlay').style.display='none';
    openHistory();
  });
  document.getElementById('btn-close-history').addEventListener('click', ()=>{
    document.getElementById('history-overlay').style.display='none';
    document.getElementById('start-overlay').style.display='flex';
  });

  /* ---- deck builder ---- */
  document.getElementById('btn-open-deckbuilder').addEventListener('click', ()=>{
    document.getElementById('start-overlay').style.display='none';
    openDeckBuilder();
  });
  document.getElementById('btn-close-deckbuilder').addEventListener('click', ()=>{
    document.getElementById('deckbuilder-overlay').style.display='none';
    document.getElementById('start-overlay').style.display='flex';
  });
  document.getElementById('deckbuilder-grid').addEventListener('click', e=>{
    const item = e.target.closest('.picker-item');
    if(!item) return;
    const idx = parseInt(item.getAttribute('data-idx'),10);
    const pos = deckBuilderSelection.indexOf(idx);
    if(pos>=0) deckBuilderSelection.splice(pos,1);
    else deckBuilderSelection.push(idx);
    renderDeckBuilder();
  });
  document.getElementById('btn-deckbuilder-fullset').addEventListener('click', ()=>{
    deckBuilderSelection = CARD_DEFS.map((c,i)=>i);
    renderDeckBuilder();
  });
  document.getElementById('btn-deckbuilder-save').addEventListener('click', ()=>{
    if(deckBuilderSelection.length<15){ flashHint && flashHint('Servono almeno 15 carte.'); return; }
    const isFull = deckBuilderSelection.length===45;
    saveCustomDeckPool(isFull ? null : deckBuilderSelection);
    updateDeckBuilderStatus();
    document.getElementById('deckbuilder-overlay').style.display='none';
    document.getElementById('start-overlay').style.display='flex';
  });

  /* ---- real-card mode ---- */
  document.getElementById('btn-real-add-0').addEventListener('click', ()=>realOpenAdd(0));
  document.getElementById('btn-real-add-1').addEventListener('click', ()=>realOpenAdd(1));

  ['real-field-0','real-field-1'].forEach(id=>{
    document.getElementById(id).addEventListener('click', e=>{
      const removeEl = e.target.closest('[data-role="real-remove"]');
      if(removeEl){
        const owner = parseInt(removeEl.getAttribute('data-owner'),10);
        const slot = parseInt(removeEl.getAttribute('data-slot'),10);
        realState.players[owner].field[slot] = null;
        renderReal();
        return;
      }
      const cardEl = e.target.closest('[data-role="real-card"]');
      if(cardEl){
        const owner = parseInt(cardEl.getAttribute('data-owner'),10);
        const slot = parseInt(cardEl.getAttribute('data-slot'),10);
        const card = realState.players[owner].field[slot];
        if(card.position!=='atk') { flashRealHint('Solo le carte in Attacco possono attaccare.'); return; }
        realAttackPick = {ownerIdx:owner, slot:slot};
        openRealTargetPicker();
      }
    });
  });

  document.getElementById('btn-real-endturn').addEventListener('click', ()=>{
    realState.turnCount++;
    [0,1].forEach(pi=>realState.players[pi].field.forEach(c=>{ if(c) c.attacked=false; }));
    realLog('--- Nuovo turno (#'+realState.turnCount+') ---');
    renderReal();
  });

  document.getElementById('real-lp-0-minus').addEventListener('click', ()=>{ realState.players[0].lp=Math.max(0,realState.players[0].lp-100); renderReal(); });
  document.getElementById('real-lp-0-plus').addEventListener('click', ()=>{ realState.players[0].lp+=100; renderReal(); });
  document.getElementById('real-lp-1-minus').addEventListener('click', ()=>{ realState.players[1].lp=Math.max(0,realState.players[1].lp-100); renderReal(); });
  document.getElementById('real-lp-1-plus').addEventListener('click', ()=>{ realState.players[1].lp+=100; renderReal(); });

  document.getElementById('btn-real-reset').addEventListener('click', ()=>{
    realNewSession(realState.players[0].name, realState.players[1].name);
    renderReal();
  });

  /* ---- card picker modal ---- */
  document.getElementById('picker-grid').addEventListener('click', e=>{
    const item = e.target.closest('.picker-item');
    if(!item) return;
    const idx = parseInt(item.getAttribute('data-idx'),10);
    closeCardPicker();
    if(pendingRealAdd){
      openPositionChoice(idx);
    }
  });
  document.getElementById('btn-picker-close').addEventListener('click', closeCardPicker);

  document.getElementById('btn-pick-pos-atk').addEventListener('click', ()=>confirmRealAdd('atk'));
  document.getElementById('btn-pick-pos-def').addEventListener('click', ()=>confirmRealAdd('def'));
  document.getElementById('btn-pick-pos-cancel').addEventListener('click', ()=>{ document.getElementById('position-overlay').style.display='none'; pendingRealAdd=null; });

  document.getElementById('btn-target-direct').addEventListener('click', ()=>{
    document.getElementById('target-overlay').style.display='none';
    realResolveBattle(realAttackPick.ownerIdx, realAttackPick.slot, 1-realAttackPick.ownerIdx, null);
    realAttackPick=null;
    renderReal();
  });
  document.getElementById('btn-target-cancel').addEventListener('click', ()=>{ document.getElementById('target-overlay').style.display='none'; realAttackPick=null; });
}

let pendingPickedCardIdx = null;
function realOpenAdd(ownerIdx){
  const slot = realState.players[ownerIdx].field.findIndex(s=>s===null);
  if(slot<0){ flashRealHint('Il campo di questo giocatore è pieno.'); return; }
  pendingRealAdd = {ownerIdx, slot};
  openCardPicker(null);
}
function openPositionChoice(idx){
  pendingPickedCardIdx = idx;
  document.getElementById('position-overlay').style.display='flex';
}
function confirmRealAdd(position){
  document.getElementById('position-overlay').style.display='none';
  if(pendingRealAdd && pendingPickedCardIdx!==null){
    realAddCard(pendingRealAdd.ownerIdx, pendingRealAdd.slot, pendingPickedCardIdx, position);
    renderReal();
  }
  pendingRealAdd = null; pendingPickedCardIdx = null;
}

function openRealTargetPicker(){
  const oppIdx = 1-realAttackPick.ownerIdx;
  const grid = document.getElementById('target-grid');
  const oppField = realState.players[oppIdx].field;
  if(!oppField.some(Boolean)){
    realResolveBattle(realAttackPick.ownerIdx, realAttackPick.slot, oppIdx, null);
    realAttackPick=null;
    renderReal();
    return;
  }
  grid.innerHTML = oppField.map((c,i)=>{
    if(!c) return '';
    return '<div class="picker-item" data-target-slot="'+i+'"><img src="'+imgSrc(c.idx)+'"/><div class="picker-item__name">'+CARD_DEFS[c.idx].name+'</div></div>';
  }).join('');
  document.getElementById('target-overlay').style.display='flex';
}
document.addEventListener('click', e=>{
  const t = e.target.closest('[data-target-slot]');
  if(t && realAttackPick){
    const slot = parseInt(t.getAttribute('data-target-slot'),10);
    document.getElementById('target-overlay').style.display='none';
    realResolveBattle(realAttackPick.ownerIdx, realAttackPick.slot, 1-realAttackPick.ownerIdx, slot);
    realAttackPick=null;
    renderReal();
  }
});

let hintTimer = null;
function flashHint(msg){
  const el = document.getElementById('hint');
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(()=>el.classList.remove('is-visible'), 2600);
}
let realHintTimer = null;
function flashRealHint(msg){
  const el = document.getElementById('real-hint');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  clearTimeout(realHintTimer);
  realHintTimer = setTimeout(()=>el.classList.remove('is-visible'), 2600);
}

function buildRulesModal(){
  const list = document.getElementById('rules-card-list');
  const tiers = [
    {key:'epocale', label:'Arcani Epocali', blurb:'Le 5 carte più rare e devastanti del mazzo.'},
    {key:'normale', label:'Arcani Normali', blurb:'Le altre 40 carte: la spina dorsale di ogni duello.'}
  ];
  let html = '';
  tiers.forEach(tier=>{
    html += '<h3><span class="rarity-tag '+tier.key+'">'+ (tier.key==='epocale'?'EPOCALE':'NORMALE') +'</span> ' + tier.label + '</h3>';
    html += '<p style="margin-top:-4px;">'+tier.blurb+'</p>';
    CARD_DEFS.forEach((c,i)=>{
      if(c.rarity!==tier.key) return;
      const fx = c.effect!=='none' ? EFFECT_INFO[c.effect] : null;
      html += '<div class="rules-row">'
        + '<img src="'+imgSrc(i)+'" class="rules-row__img"/>'
        + '<div class="rules-row__body">'
        + '<div class="rules-row__title">'+(c.secret?'❖':romanNumeral(i))+' — '+c.name+' <span class="rules-row__stats">'+c.atk+'/'+c.def+'</span></div>'
        + (fx ? '<div class="rules-row__fx"><b>'+fx.title+'.</b> '+fx.desc+'</div>' : '<div class="rules-row__fx rules-row__fx--none">Nessun effetto (carta base).</div>')
        + '<div class="rules-row__flavor">"'+c.flavor+'"</div>'
        + '</div></div>';
    });
  });
  list.innerHTML = html;
}

function romanNumeral(n){
  if(n===0) return '0';
  const vals=[[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let r='', num=n;
  for(const [v,s] of vals){ while(num>=v){ r+=s; num-=v; } }
  return r;
}

document.addEventListener('DOMContentLoaded', ()=>{
  wireEvents();
  wireLongPress();
  initBackButtonGuard();
  buildRulesModal();
  prefillNames();
  updateSoundButton();
  checkResumeSession();
  renderCardOfDay();
  updateDeckBuilderStatus();
  try{
    const params = new URLSearchParams(location.search);
    const codeParam = params.get('code');
    if(codeParam){
      document.getElementById('start-overlay').style.display='none';
      document.getElementById('mode-online-overlay').style.display='flex';
      setOnlineTab('join');
      document.getElementById('online-code-input').value = codeParam.toUpperCase();
    }
  } catch(e){ /* ignore malformed URLs */ }
});

/* ---------------- PWA installability + real offline caching ---------------- */
/* Registers sw.js, which must be uploaded in the SAME folder as this HTML file
   on GitHub Pages. Falls back gracefully (no error shown) if sw.js is missing,
   e.g. when the file is opened locally without hosting it yet. */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{ /* offline support simply won't be available yet */ });
  });
}

