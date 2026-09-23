// Sound effects engine: synthesized tones bundled as tiny wav files, played
// through expo-audio. Preference persisted via the shared storage util.

import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";

import { storage } from "@/src/utils/storage";

const SOUND_PREF_KEY = "arcani_sound_enabled";

const players: Record<string, AudioPlayer> = {
  tap: createAudioPlayer(require("../../assets/sfx/tap.wav")),
  select: createAudioPlayer(require("../../assets/sfx/select.wav")),
  draw: createAudioPlayer(require("../../assets/sfx/draw.wav")),
  phase: createAudioPlayer(require("../../assets/sfx/phase.wav")),
  support: createAudioPlayer(require("../../assets/sfx/support.wav")),
  hit: createAudioPlayer(require("../../assets/sfx/hit.wav")),
  destroy: createAudioPlayer(require("../../assets/sfx/destroy.wav")),
  tribute: createAudioPlayer(require("../../assets/sfx/tribute.wav")),
  summon: createAudioPlayer(require("../../assets/sfx/summon.wav")),
  summonEpic: createAudioPlayer(require("../../assets/sfx/summon_epic.wav")),
  heal: createAudioPlayer(require("../../assets/sfx/heal.wav")),
  coin: createAudioPlayer(require("../../assets/sfx/coin.wav")),
  victory: createAudioPlayer(require("../../assets/sfx/victory.wav")),
  defeat: createAudioPlayer(require("../../assets/sfx/defeat.wav")),
};

let soundEnabled = true;

function play(name: keyof typeof players, volume = 1) {
  if (!soundEnabled) return;
  try {
    const p = players[name];
    p.volume = volume;
    p.seekTo(0);
    p.play();
  } catch {
    // audio not available — silent fallback
  }
}

export function useSfx() {
  const [enabled, setEnabledState] = useState(soundEnabled);

  useEffect(() => {
    storage.getItem<boolean>(SOUND_PREF_KEY, true).then((v) => {
      soundEnabled = v ?? true;
      setEnabledState(soundEnabled);
    });
  }, []);

  const setEnabled = (v: boolean) => {
    soundEnabled = v;
    setEnabledState(v);
    void storage.setItem(SOUND_PREF_KEY, v);
  };

  return {
    enabled,
    setEnabled,
    toggle: () => setEnabled(!soundEnabled),
    tap: () => play("tap", 0.5),
    select: () => play("select", 0.9),
    draw: () => play("draw", 0.9),
    phase: () => play("phase", 0.9),
    support: () => play("support", 0.9),
    hit: () => play("hit", 1),
    destroy: () => play("destroy", 1),
    tribute: () => play("tribute", 1),
    summon: (epic = false) => play(epic ? "summonEpic" : "summon", 1),
    heal: () => play("heal", 0.9),
    coin: () => play("coin", 0.9),
    victory: () => play("victory", 1),
    defeat: () => play("defeat", 1),
  };
}

export type Sfx = ReturnType<typeof useSfx>;
