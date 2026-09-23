// The 45 satirical tarot cards of "Il Triage degli Arcani".
// Artwork is served by the backend at /api/cards/{idx}/image (index = position here).

export type EffectKey =
  | "none"
  | "matto"
  | "mago"
  | "presagio"
  | "union"
  | "eremita"
  | "ciclo"
  | "morte"
  | "diavolo"
  | "torre"
  | "heal400"
  | "mondo"
  | "pericolo"
  | "fuhrer"
  | "inganno"
  | "sapienza"
  | "manodidio"
  | "fortuna"
  | "passioni"
  | "lunanera"
  | "madre";

export interface CardDef {
  name: string;
  atk: number;
  def: number;
  effect: EffectKey;
  rarity: "normale" | "epocale";
  flavor: string;
  scene: string;
}

export const EFFECT_INFO: Record<EffectKey, { title: string; desc: string }> = {
  none: { title: "", desc: "" },
  matto: {
    title: "Il Folle Immortale",
    desc: "Finché è l'unica carta sul tuo campo, non può essere distrutta in battaglia.",
  },
  mago: {
    title: "Prestigio",
    desc: "Alla evocazione, scambia permanentemente il suo ATK con la sua DEF.",
  },
  union: {
    title: "Unione",
    desc: "Se controlli almeno un'altra carta, questa ottiene +500 ATK.",
  },
  eremita: { title: "Illuminazione", desc: "Alla evocazione, pesca 1 carta." },
  morte: {
    title: "Mietitrice",
    desc: "Se distrugge un mostro in battaglia, l'avversario scarta una carta a caso dalla mano.",
  },
  diavolo: {
    title: "Tentazione",
    desc: "Alla evocazione, se l'avversario controlla un mostro con ATK ≤ 800, ne prendi il controllo (torna al proprietario dopo due cambi turno).",
  },
  torre: {
    title: "Crollo",
    desc: "Alla evocazione, distrugge tutti i mostri in campo (compreso questo). Il suo evocatore subisce 500 danni.",
  },
  heal400: {
    title: "Grazia Celeste",
    desc: "Alla evocazione, il suo controllore recupera 400 LP.",
  },
  mondo: {
    title: "Compimento",
    desc: "Alla evocazione, pesca 1 carta e recupera 200 LP.",
  },
  fuhrer: {
    title: "Solitario al Comando",
    desc: "Finché è l'unico mostro che controlli, il suo ATK raddoppia.",
  },
  inganno: {
    title: "Maschera",
    desc: "Alla evocazione, lancia una moneta: testa = +2000 ATK permanenti, croce = nessun effetto.",
  },
  manodidio: {
    title: "Intervento Divino",
    desc: "Alla evocazione, annulla l'effetto del mostro avversario più forte in campo.",
  },
  fortuna: { title: "Colpo di Fortuna", desc: "Alla evocazione, pesca 2 carte." },
  passioni: { title: "Impeto", desc: "Ottiene +300 ATK quando attacca." },
  lunanera: {
    title: "Eclissi",
    desc: "Alla evocazione, gli LP di entrambi i giocatori vengono dimezzati.",
  },
  madre: {
    title: "Istinto Materno",
    desc: "Alla evocazione, il suo controllore recupera 300 LP per ogni mostro che controlla.",
  },
  presagio: {
    title: "Presagio",
    desc: "Alla evocazione, riveli la prossima carta in cima al mazzo.",
  },
  ciclo: { title: "Ciclo", desc: "Alla evocazione, il suo controllore recupera 200 LP." },
  sapienza: {
    title: "Sapere Condiviso",
    desc: "Alla evocazione, il sapere non fa preferenze: entrambi i giocatori pescano una carta.",
  },
  pericolo: {
    title: "Contaminazione",
    desc: "Alla evocazione, il mostro avversario più forte in campo perde 500 ATK permanenti.",
  },
};

export const CARD_DEFS: CardDef[] = [
  { name: "Il Matto", atk: 0, def: 2200, effect: "matto", rarity: "normale", flavor: "Non ha nulla da perdere, quindi non perde mai il sorriso. O il cane.", scene: "Un campanello suona da nessuna parte. Il Matto fa un inchino a un pubblico che non esiste." },
  { name: "Il Mago", atk: 100, def: 2150, effect: "mago", rarity: "normale", flavor: "Sa tre trucchi. Il quarto è convincerti che ne sa cento.", scene: "Le carte si mescolano da sole. Nessuno ha visto come." },
  { name: "La Papessa", atk: 200, def: 2100, effect: "presagio", rarity: "normale", flavor: "Custodisce segreti che nemmeno lei ricorda più.", scene: "Un libro si apre su una pagina che prima non c'era." },
  { name: "L'Imperatrice", atk: 300, def: 2050, effect: "presagio", rarity: "normale", flavor: "Regna su un castello immaginario con polso fermissimo.", scene: "Il trono trema per un istante, poi torna immobile." },
  { name: "L'Imperatore", atk: 400, def: 2000, effect: "none", rarity: "normale", flavor: "Governa. Punto. Non fate domande.", scene: "Il silenzio cala nella stanza. Nessuno osa parlare per primo." },
  { name: "Il Papa", atk: 500, def: 1950, effect: "presagio", rarity: "normale", flavor: "Benedice tutto, giudica silenziosamente il resto.", scene: "Una campana suona in lontananza, tre volte, poi tace." },
  { name: "Gli Amanti", atk: 600, def: 1900, effect: "union", rarity: "normale", flavor: "Due cuori, un solo voto. Indovina chi lo esprime.", scene: "Due ombre si uniscono in una sola, per un attimo." },
  { name: "Il Carro", atk: 700, def: 1850, effect: "presagio", rarity: "normale", flavor: "Va dritto per la sua strada, anche quando la strada non esiste ancora.", scene: "Le ruote girano da sole, in una direzione che nessuno ha scelto." },
  { name: "La Giustizia", atk: 800, def: 1800, effect: "none", rarity: "normale", flavor: "Pesa tutto sulla bilancia, tranne le proprie colpe.", scene: "La bilancia oscilla, poi si ferma perfettamente in equilibrio." },
  { name: "L'Eremita", atk: 900, def: 1750, effect: "eremita", rarity: "normale", flavor: "Cammina da solo nella neve perché il wifi in compagnia non prende.", scene: "Una lanterna si accende in fondo al corridoio. Nessuno la tiene in mano." },
  { name: "La Ruota", atk: 1000, def: 1700, effect: "ciclo", rarity: "normale", flavor: "Gira, gira, gira. A volte ti porta su. Spesso no.", scene: "Il pavimento gira sotto i piedi di tutti, per un solo istante." },
  { name: "La Forza", atk: 1100, def: 1650, effect: "presagio", rarity: "normale", flavor: "Doma il leone con un sorriso e zero esitazioni.", scene: "Un ruggito lontano, poi una quiete innaturale." },
  { name: "L'Appeso", atk: 1200, def: 1600, effect: "none", rarity: "normale", flavor: "Vede il mondo capovolto e giura che così ha più senso.", scene: "Il mondo si capovolge per mezzo secondo. Poi torna com'era, forse." },
  { name: "La Morte", atk: 1300, def: 1550, effect: "morte", rarity: "epocale", flavor: "Non è la fine. È solo... una fine molto definitiva.", scene: "Le candele si spengono tutte insieme, senza vento." },
  { name: "La Temperanza", atk: 1400, def: 1500, effect: "none", rarity: "normale", flavor: "Mescola gli elementi con calma zen mentre tutti gli altri vanno nel panico.", scene: "Due liquidi si versano l'uno nell'altro senza mai mescolarsi davvero." },
  { name: "Il Diavolo", atk: 1500, def: 1450, effect: "diavolo", rarity: "epocale", flavor: "Offre un patto vantaggioso. Le clausole in piccolo sono, per l'appunto, in piccolo.", scene: "Un profumo di zolfo e di buoni propositi riempie la stanza." },
  { name: "La Torre", atk: 1600, def: 1400, effect: "torre", rarity: "epocale", flavor: "Quando crolla, crolla per tutti. Democraticamente distruttiva.", scene: "Un boato lontano. Qualcosa, da qualche parte, è appena crollato." },
  { name: "La Stella", atk: 1700, def: 1350, effect: "heal400", rarity: "normale", flavor: "Brilla nel buio e non chiede nulla in cambio. Merce rara, in questo mazzo.", scene: "Una singola luce si accende nel buio più totale." },
  { name: "La Luna", atk: 1800, def: 1300, effect: "none", rarity: "normale", flavor: "Illumina appena quel che basta per farti inciampare comunque.", scene: "L'ombra della luna scivola sul tavolo, anche se non c'è nessuna finestra." },
  { name: "Il Sole", atk: 1900, def: 1250, effect: "heal400", rarity: "normale", flavor: "Splende su tutti senza preferenze, come un raggio di ottimismo instancabile.", scene: "La stanza si scalda all'improvviso, come se fosse mezzogiorno." },
  { name: "Il Giudizio", atk: 2000, def: 1200, effect: "ciclo", rarity: "normale", flavor: "Chiama tutti a rapporto. Nessuno risponde volentieri.", scene: "Una tromba suona da lontano, e tutti si voltano insieme." },
  { name: "Il Mondo", atk: 2100, def: 1150, effect: "mondo", rarity: "normale", flavor: "Ha visto tutto, ha fatto tutto, ora si gode il traguardo.", scene: "Un cerchio si chiude. Qualcosa, finalmente, è completo." },
  { name: "La Perseveranza", atk: 2200, def: 1100, effect: "none", rarity: "normale", flavor: "Continua a camminare anche quando la lanterna si è spenta da un pezzo.", scene: "Un passo, poi un altro. La lanterna è vuota da un pezzo, ma nessuno si ferma." },
  { name: "Il Pericolo", atk: 2300, def: 1050, effect: "pericolo", rarity: "normale", flavor: "Non porta la mascherina per moda: il mestiere è letteralmente pericoloso. Chi le sta vicino ne esce indebolito.", scene: "Una nube tossica si allarga silenziosa. Chi la respira sente le braccia farsi più deboli." },
  { name: "Il Tempo", atk: 2400, def: 1000, effect: "none", rarity: "normale", flavor: "Passa comunque, che tu lo passi bene o no.", scene: "Un orologio ticchetta più forte per qualche secondo, poi torna normale." },
  { name: "Il Führer", atk: 2500, def: 950, effect: "fuhrer", rarity: "normale", flavor: "Si è auto-proclamato capo. Da solo. Ma quando parla lui, tacciono tutti.", scene: "Qualcuno si schiarisce la voce e tutti, inspiegabilmente, tacciono." },
  { name: "L'Inganno", atk: 2600, def: 900, effect: "inganno", rarity: "normale", flavor: "Non è quello che sembra. O forse sì. È un inganno: chi può dirlo davvero.", scene: "Qualcosa si muove nell'ombra. O forse è solo un'ombra." },
  { name: "La Sapienza", atk: 2700, def: 850, effect: "sapienza", rarity: "normale", flavor: "Ha letto tutti i libri e li condivide con chiunque, persino con l'avversario. Il sapere non fa preferenze.", scene: "Le pagine di mille libri sfogliano tutte insieme, da sole, e si aprono anche davanti all'avversario." },
  { name: "Il Seme", atk: 2800, def: 800, effect: "none", rarity: "normale", flavor: "Piccolo, silenzioso, destinato a diventare un problema molto più grande.", scene: "Qualcosa di piccolissimo cade a terra e nessuno ci fa caso. Ancora per poco." },
  { name: "L'Ascensione", atk: 2900, def: 750, effect: "union", rarity: "normale", flavor: "Salgono insieme, sperando che nessuno dei due guardi giù.", scene: "Due mani si stringono, in alto, dove nessuno può raggiungerle." },
  { name: "Il Vizio", atk: 3000, def: 700, effect: "ciclo", rarity: "normale", flavor: "Un abbraccio, due colpe, zero rimpianti.", scene: "Un brindisi silenzioso, un sorriso complice, nessun rimorso in vista." },
  { name: "La Montagna", atk: 3100, def: 650, effect: "presagio", rarity: "normale", flavor: "Non si scala da soli. O si può, ma poi te ne penti.", scene: "L'aria si fa più sottile. La vetta sembra più vicina di quanto sia davvero." },
  { name: "L'Arroganza", atk: 4200, def: 0, effect: "none", rarity: "normale", flavor: "Tutto attacco, zero difesa. Un ritratto fedele, a pensarci bene.", scene: "Un petto si gonfia d'orgoglio. Le difese, nel frattempo, restano a casa." },
  { name: "La Mano di Dio", atk: 3300, def: 550, effect: "manodidio", rarity: "normale", flavor: "Tocca, e ciò che era rotto guarisce. O segna un gol irregolare: dipende dai punti di vista.", scene: "Una luce calda tocca ciò che era spezzato. Qualcosa si ricompone." },
  { name: "La Fede", atk: 3400, def: 500, effect: "none", rarity: "normale", flavor: "Crede fermamente in qualcosa che nessun altro può vedere. Rispetto.", scene: "Nessuna prova, nessun dubbio. Solo una certezza tranquilla." },
  { name: "La Grazia", atk: 3500, def: 450, effect: "ciclo", rarity: "normale", flavor: "Danza tra le pagine di una storia che nessun altro saprebbe raccontare così bene.", scene: "Una melodia si alza da nessuno strumento in particolare." },
  { name: "La Fortuna", atk: 3600, def: 400, effect: "fortuna", rarity: "normale", flavor: "A volte basta essere nel posto giusto, vestiti nel modo giusto.", scene: "Una moneta cade, rotola, si ferma dalla parte giusta." },
  { name: "Il Cambiamento", atk: 3700, def: 350, effect: "presagio", rarity: "normale", flavor: "Porta tutto quello che ha, anche se non sa bene dove sta andando.", scene: "I bagagli sono già pronti. La destinazione, ancora no." },
  { name: "Il Baratto", atk: 3800, def: 300, effect: "none", rarity: "normale", flavor: "Ha un piano. Ha sempre un piano. Fidatevi, più o meno.", scene: "Due mani si stringono su un accordo che nessuno ha letto per intero." },
  { name: "Il Fuoco", atk: 3900, def: 250, effect: "none", rarity: "normale", flavor: "Brucia dentro anche quando fuori sembra tutto tranquillo.", scene: "Una scintilla, poi un calore che non si vede ma si sente." },
  { name: "Le Passioni", atk: 4000, def: 200, effect: "passioni", rarity: "normale", flavor: "Corre a testa alta verso qualcosa. Non importa cosa: l'importante è correre forte.", scene: "Il cuore accelera. Non importa il motivo, importa la corsa." },
  { name: "L'Afrohouse", atk: 4100, def: 150, effect: "presagio", rarity: "normale", flavor: "Alza il volume finché anche le stelle si mettono a ballare.", scene: "I bassi fanno tremare i bicchieri. Qualcuno, da qualche parte, alza le braccia." },
  { name: "La Luna Nera", atk: 4200, def: 100, effect: "lunanera", rarity: "epocale", flavor: "Quando appare, gli orologi si fermano. I punti vita, un po' meno.", scene: "La luce sparisce tutta insieme. Per un istante, il mondo trattiene il respiro." },
  { name: "La Buona Novella", atk: 4300, def: 50, effect: "presagio", rarity: "normale", flavor: "Porta notizie che cambiano tutto, puntualmente all'ultimo momento.", scene: "Una lettera arriva, sigillata, proprio mentre nessuno se lo aspettava più." },
  { name: "La Madre", atk: 4400, def: 0, effect: "madre", rarity: "epocale", flavor: "Protegge tutti, nutre tutti, non chiede mai nulla in cambio. La vera carta più potente del mazzo.", scene: "Le braccia si aprono, calde, prima ancora che qualcuno chieda aiuto." },
];

// Effects usable as a standalone "support" activation (goes to the graveyard).
export const SUPPORT_EFFECTS = new Set<EffectKey>([
  "eremita",
  "diavolo",
  "torre",
  "heal400",
  "mondo",
  "manodidio",
  "fortuna",
  "lunanera",
  "madre",
  "sapienza",
  "pericolo",
  "presagio",
  "ciclo",
]);

// Yu-Gi-Oh style tribute cost: ATK >= 3500 -> 2 tributes, ATK >= 2500 -> 1.
export function tributeCostFor(idx: number): number {
  const atk = CARD_DEFS[idx].atk;
  if (atk >= 3500) return 2;
  if (atk >= 2500) return 1;
  return 0;
}

export const STARTING_LP = 8000;
export const STARTING_HAND = 5;
export const HAND_LIMIT = 6;
export const MAX_FIELD_SLOTS = 3;
export const MAX_SUPPORT_PER_TURN = 2;

// ---- Eventi del Destino ----
// Ogni 3 turni un evento casuale colpisce entrambi i giocatori.
export const FATE_INTERVAL = 3;

export type FateKey =
  | "tempesta"
  | "marea"
  | "dono"
  | "eclissi"
  | "giudizio"
  | "furia"
  | "carestia"
  | "specchio";

export const FATE_EVENTS: Record<FateKey, { title: string; desc: string }> = {
  tempesta: {
    title: "Tempesta di Lame",
    desc: "Lame invisibili sferzano l'arena: tutti i mostri in campo perdono 300 ATK.",
  },
  marea: {
    title: "Marea di Sangue",
    desc: "Una marea scarlatta sommerge il campo: entrambi i duellanti perdono 500 LP.",
  },
  dono: {
    title: "Dono degli Dèi",
    desc: "Gli arcani sorridono: entrambi i duellanti recuperano 600 LP.",
  },
  eclissi: {
    title: "Eclissi Arcana",
    desc: "Il cielo si oscura e i destini si rimescolano: entrambi pescano 1 carta.",
  },
  giudizio: {
    title: "Giudizio Universale",
    desc: "Una sentenza cala dall'alto: il mostro più debole di ciascun giocatore viene distrutto.",
  },
  furia: {
    title: "Furia Occulta",
    desc: "Un'energia proibita infiamma i mostri: tutti in campo guadagnano 400 ATK.",
  },
  carestia: {
    title: "Carestia",
    desc: "Le riserve si prosciugano: entrambi scartano 1 carta a caso dalla mano.",
  },
  specchio: {
    title: "Specchio del Fato",
    desc: "Il destino pareggia i conti: gli LP più bassi salgono a metà di quelli più alti.",
  },
};
