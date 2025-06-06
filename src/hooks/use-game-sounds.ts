import { useCallback, useEffect, useState } from 'react';
import type * as Tone from 'tone';

type ToneLib = typeof import('tone');

export function useGameSounds() {
  const [tone, setTone] = useState<ToneLib | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    import('tone').then(loadedTone => {
      setTone(loadedTone);
      setIsLoaded(true);
    });
  }, []);

  const playSound = useCallback(async (soundType: 'gachaSpin' | 'stickerReveal' | 'correctAnswer' | 'incorrectAnswer' | 'rewardFanfare' | 'click') => {
    if (!tone || !isLoaded) return;

    await tone.start(); // Ensure AudioContext is started

    switch (soundType) {
      case 'gachaSpin': {
        const synth = new tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.1 },
        }).toDestination();
        const filter = new tone.AutoFilter("4n").toDestination().start();
        filter.baseFrequency = 200;
        filter.octaves = 3;
        synth.connect(filter);
        synth.triggerAttackRelease("0.6n");
        setTimeout(() => { synth.dispose(); filter.dispose(); }, 700);
        break;
      }
      case 'stickerReveal': {
        const synth = new tone.PolySynth(tone.Synth, {
          oscillator: { type: 'triangle8' },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.2 },
          volume: -10,
        }).toDestination();
        synth.triggerAttackRelease(['C5', 'E5', 'G5'], '8n');
        setTimeout(() => synth.dispose(), 500);
        break;
      }
      case 'correctAnswer': {
        const synth = new tone.Synth({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 },
          volume: -10,
        }).toDestination();
        synth.triggerAttackRelease('C5', '8n', '+0');
        synth.triggerAttackRelease('E5', '8n', '+0.1');
        synth.triggerAttackRelease('G5', '8n', '+0.2');
        setTimeout(() => synth.dispose(), 500);
        break;
      }
      case 'incorrectAnswer': {
        const synth = new tone.Synth({
          oscillator: { type: 'square' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 },
          volume: -15,
        }).toDestination();
        synth.triggerAttackRelease('C3', '4n');
        setTimeout(() => synth.dispose(), 300);
        break;
      }
      case 'rewardFanfare': {
        const synth = new tone.PolySynth(tone.Synth, {
            volume: -8,
        }).toDestination();
        const now = tone.now();
        synth.triggerAttackRelease("C4", "8n", now);
        synth.triggerAttackRelease("E4", "8n", now + 0.2);
        synth.triggerAttackRelease("G4", "8n", now + 0.4);
        synth.triggerAttackRelease("C5", "4n", now + 0.6);
        setTimeout(() => synth.dispose(), 1000);
        break;
      }
      case 'click': {
        const synth = new tone.MembraneSynth({
            pitchDecay: 0.01,
            octaves: 2,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.1, sustain: 0.01, release: 0.1, attackCurve: "exponential" },
            volume: -10,
        }).toDestination();
        synth.triggerAttackRelease("C4", "32n");
        setTimeout(() => synth.dispose(), 200);
        break;
      }
    }
  }, [tone, isLoaded]);

  return { playSound, isSoundLoaded: isLoaded };
}
