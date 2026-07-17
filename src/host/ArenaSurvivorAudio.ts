import type { ArenaSurvivorState } from "../protocol.js";

interface AudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const MUSIC_STEP_SECONDS = 0.32;
const FROSTFIRE_MELODY = [293.66, 349.23, 392, 440, 392, 523.25, 440, 349.23] as const;
const FROSTFIRE_BASS = [73.42, 65.41, 87.31, 73.42] as const;

export class ArenaSurvivorAudio {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private schedulingTimer: number | null = null;
  private nextStepAt = 0;
  private stepIndex = 0;
  private playRequested = false;
  private unlockListenersAttached = false;

  private readonly handleUnlock = (): void => {
    if (!this.playRequested) {
      return;
    }

    const context = this.ensureContext();

    if (!context) {
      return;
    }

    void context.resume().then(() => {
      this.beginScheduling();
    }).catch(() => {
      // Audio may remain blocked until a later host interaction.
    });
  };

  attachUnlockListeners(): void {
    if (this.unlockListenersAttached) {
      return;
    }

    window.addEventListener("pointerdown", this.handleUnlock, { passive: true });
    window.addEventListener("keydown", this.handleUnlock);
    this.unlockListenersAttached = true;
  }

  syncState(state: ArenaSurvivorState | null): void {
    const shouldPlay =
      state?.visualTheme === "frostfire-saga" &&
      state.result.outcome === "running";

    if (shouldPlay === this.playRequested) {
      return;
    }

    this.playRequested = shouldPlay;

    if (shouldPlay) {
      this.start();
    } else {
      this.stop();
    }
  }

  destroy(): void {
    this.stop();

    if (this.unlockListenersAttached) {
      window.removeEventListener("pointerdown", this.handleUnlock);
      window.removeEventListener("keydown", this.handleUnlock);
      this.unlockListenersAttached = false;
    }

    if (this.context) {
      void this.context.close();
      this.context = null;
      this.masterGain = null;
    }
  }

  private start(): void {
    const context = this.ensureContext();

    if (!context) {
      return;
    }

    if (context.state === "running") {
      this.beginScheduling();
      return;
    }

    void context.resume().then(() => {
      this.beginScheduling();
    }).catch(() => {
      // The unlock listeners will retry after the next host interaction.
    });
  }

  private stop(): void {
    if (this.schedulingTimer !== null) {
      window.clearInterval(this.schedulingTimer);
      this.schedulingTimer = null;
    }

    if (this.context && this.masterGain) {
      const now = this.context.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(0.0001, now, 0.08);
    }
  }

  private beginScheduling(): void {
    if (!this.playRequested || !this.context || !this.masterGain || this.schedulingTimer !== null) {
      return;
    }

    const now = this.context.currentTime;
    this.nextStepAt = now + 0.06;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.12, now + 0.45);
    this.scheduleWindow();
    this.schedulingTimer = window.setInterval(() => this.scheduleWindow(), 100);
  }

  private scheduleWindow(): void {
    if (!this.context || !this.playRequested) {
      return;
    }

    const scheduleUntil = this.context.currentTime + 0.75;

    while (this.nextStepAt < scheduleUntil) {
      this.scheduleStep(this.nextStepAt, this.stepIndex);
      this.nextStepAt += MUSIC_STEP_SECONDS;
      this.stepIndex += 1;
    }
  }

  private scheduleStep(time: number, step: number): void {
    const melodyFrequency = FROSTFIRE_MELODY[step % FROSTFIRE_MELODY.length];
    this.scheduleTone(melodyFrequency, time, 0.42, "triangle", 0.16, 1600);

    if (step % 2 === 1) {
      this.scheduleTone(melodyFrequency * 2, time + 0.04, 0.72, "sine", 0.055, 2600);
    }

    if (step % 4 === 0) {
      const bassFrequency = FROSTFIRE_BASS[Math.floor(step / 4) % FROSTFIRE_BASS.length];
      this.scheduleTone(bassFrequency, time, MUSIC_STEP_SECONDS * 3.6, "sine", 0.2, 520);
      this.scheduleTone(bassFrequency * 1.5, time + 0.02, 0.9, "triangle", 0.05, 760);
    }

    if (step % 4 === 2) {
      this.scheduleTone(146.83, time, 0.12, "sine", 0.12, 420);
    }
  }

  private scheduleTone(
    frequency: number,
    time: number,
    duration: number,
    type: OscillatorType,
    level: number,
    filterFrequency: number
  ): void {
    if (!this.context || !this.masterGain) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFrequency, time);
    filter.Q.setValueAtTime(0.7, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(level, time + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.03);
  }

  private ensureContext(): AudioContext | null {
    if (this.context && this.masterGain) {
      return this.context;
    }

    const AudioContextCtor =
      window.AudioContext ?? (window as AudioWindow).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    this.context = new AudioContextCtor();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.0001;
    this.masterGain.connect(this.context.destination);
    return this.context;
  }
}
