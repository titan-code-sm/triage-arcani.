# PRD — Il Triage degli Arcani

## Problema originale
L'utente aveva creato un gioco di carte di tarocchi ("Il Triage degli Arcani") come pagina web HTML con un'altra AI (hostato su GitHub Pages). Ha chiesto di ricrearlo come app mobile nativa "ancora più bella, stile Yu-Gi-Oh". Lingua: italiano.

## Architettura
- **Frontend**: Expo Router (React Native), SDK 57. Tema dark occulto (crimson + oro antico), font Cinzel (display) + Plus Jakarta Sans (body). Reanimated per animazioni, expo-audio per SFX sintetizzati.
- **Backend**: FastAPI + MongoDB (motor). Serve le 45 definizioni carte (`/api/cards`) e le 45 immagini JPEG estratte dal gioco originale (`/api/cards/{idx}/image`, cache immutabile). Registra storico duelli e statistiche per device_id.
- **Motore di gioco**: portato fedelmente dall'originale in TypeScript puro (`src/game/`): engine.ts (regole), bot.ts (IA 3 difficoltà), cards.ts (45 carte + effetti + costi tributo).

## Persona utente
Giocatore di carte collezionabili che vuole duellare rapidamente contro un'IA o un amico in locale, con l'estetica drammatica di Yu-Gi-Oh e l'umorismo satirico dei tarocchi originali.

## Requisiti core (statici)
- 8000 LP a testa, mano iniziale 5, limite mano 6, 3 slot mostro + 2 slot supporto.
- Evocazione normale/tributo (ATK≥2500 = 1 tributo, ATK≥3500 = 2), posizione Attacco/Difesa, cambio posizione.
- Zona Supporto: max 2 attivazioni/turno per effetti supportabili.
- Battaglia: mostro vs mostro (ATK/DEF), attacco diretto, danni, distruzione.
- 21 effetti carta fedeli all'originale (matto, mago, torre, lunanera, madre, diavolo, ecc.).
- IA con 3 difficoltà (Novizio/Adepto/Incubo).
- Modalità: vs IA (bot) e locale 2 giocatori (hotseat con schermata passa-dispositivo).

## Implementato (2026-06)
- ✅ Arena/Home: titolo Cinzel, carta del giorno deterministica, selettore difficoltà, avvio duello bot/hotseat, statistiche locali, toggle audio.
- ✅ Schermata Duello: arena completa Yu-Gi-Oh, LP bar animate, mano scrollabile, campi mostri/supporto, mazzo tappabile, bottom sheet azioni carta, targeting attacco, tributi, log duello, animazioni (shake/flash/ghost distruzione/floaters danni/coin flip), game over con rivincita.
- ✅ Galleria: griglia 2 colonne, filtri (Tutte/Normali/Epocali), modale dettaglio carta con effetto/flavor/scene.
- ✅ Storico: statistiche (vittorie/sconfitte/winrate) + lista duelli, con fallback locale offline.
- ✅ Backend: 45 carte + immagini servite, POST/GET duelli, GET stats.
- ✅ SFX sintetizzati (14 suoni), font custom, navigazione a tab (NativeTabs iOS26 / JS Tabs altrove).

## Implementato (2026-06)
- ✅ Arena/Home, Duello vs IA/locale, Galleria, Storico (vedi sopra).
- ✅ **Sfida Online (Firebase Firestore)**: tab Online con nickname, creazione stanza con nome, lista realtime delle stanze aperte, join, duello sincronizzato via documento Firestore (onSnapshot), gestione abbandono e rivincita. Nessun login (solo nickname). Config web in EXPO_PUBLIC_FIREBASE_* nel frontend/.env.
- ✅ **Eventi del Destino**: ogni 3 turni un evento casuale colpisce entrambi i giocatori (Tempesta di Lame, Marea di Sangue, Dono degli Dèi, Eclissi Arcana, Giudizio Universale, Furia Occulta, Carestia, Specchio del Fato), con overlay animato. Attivi in tutte le modalità (bot/locale/online).
- ✅ **UI**: tasto Esci + Cronaca durante il duello, testi con numberOfLines/clamp per non uscire dai bordi (nome LP, badge turno), fix bordo pannello game over.

## BLOCCO ESTERNO (azione utente richiesta)
- L'online richiede che l'utente imposti le **regole di sicurezza Firestore** del progetto `gioco-arcano` per consentire lettura/scrittura pubblica sulla collezione `rooms` (verificato: attualmente PERMISSION_DENIED). Regole da incollare in Firebase Console → Firestore Database → Regole:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} { allow read, write: if true; }
  }
}
```

## Backlog prioritizzato
- P1: Deck builder (mazzo custom, l'originale lo aveva).
- P1: Tutorial in-battle guidato per nuovi giocatori.
- P2: Sfida giornaliera con classifica.
- P2: Modalità online (l'originale usava Firebase; qui richiederebbe backend WebSocket).

## Prossimi task
- Validazione end-to-end del flusso duello via testing agent.
- Eventuali fix da report testing.
