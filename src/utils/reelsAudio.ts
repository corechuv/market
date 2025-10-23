// src/utils/reelsAudio.ts
class ReelsAudioGate {
  private unlocked = false;
  private ac: AudioContext | null = null;

  constructor() {
    try { this.unlocked = localStorage.getItem('reels:sound_on') === '1'; } catch { }
    window.addEventListener('storage', (e) => {
      if (e.key === 'reels:sound_on') {
        this.unlocked = e.newValue === '1';
        this.broadcast();
      }
    });
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'visible' && this.unlocked) this.resumeContext();
      },
      { passive: true }
    );
  }

  private resumeContext() {
    try {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ac: AudioContext = this.ac ?? new AC();
      this.ac = ac;
      if (ac.state !== 'running') {
        ac.resume().catch(() => { });
      }
    } catch { }
  }

  unlock = () => {
    if (this.unlocked) { this.resumeContext(); this.broadcast(); return; }
    try {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) {
        const ac: AudioContext = this.ac ?? new AC();
        this.ac = ac;
        if (ac.state === 'suspended') ac.resume().catch(() => { });
        const src = ac.createBufferSource();
        src.buffer = ac.createBuffer(1, 1, 22050);
        src.connect(ac.destination);
        src.start(0);
      }
    } catch { }
    this.unlocked = true;
    try { localStorage.setItem('reels:sound_on', '1'); } catch { }
    this.broadcast();
  };

  // «вооружаем» глобальный анлок один раз
  armGlobalUnlock = () => {
    let onKey: ((e: KeyboardEvent) => void) | null = null;

    const doUnlock = () => {
      this.unlock();
      document.removeEventListener('pointerdown', doUnlock, true);
      if (onKey) document.removeEventListener('keydown', onKey, true);
    };

    onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') doUnlock();
    };

    document.addEventListener('pointerdown', doUnlock, { once: true, capture: true });
    document.addEventListener('keydown', onKey, { capture: true });
  };

  isUnlocked = () => this.unlocked;

  private broadcast() {
    window.dispatchEvent(new CustomEvent('reels:sound_on'));
  }
}

export const ReelsAudio = new ReelsAudioGate();
