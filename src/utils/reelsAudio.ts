// src/utils/reelsAudio.ts
class ReelsAudioGate {
  private unlocked = false;
  private ac: AudioContext | null = null;

  constructor() {
    try { this.unlocked = localStorage.getItem('reels:sound_on') === '1'; } catch {}
    // синхронизация между вкладками
    window.addEventListener('storage', (e) => {
      if (e.key === 'reels:sound_on') {
        this.unlocked = e.newValue === '1';
        this.broadcast();
      }
    });
    // вернулись на вкладку — убедимся, что контекст живой
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.unlocked) this.resumeContext();
    }, { passive: true });
  }

  private resumeContext() {
    try {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      this.ac = this.ac || new AC();
      if (this.ac.state !== 'running') {
        this.ac.resume().catch(() => {});
      }
    } catch {}
  }

  unlock = () => {
    if (this.unlocked) { this.resumeContext(); this.broadcast(); return; }
    try {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) {
        this.ac = this.ac || new AC();
        if (this.ac.state === 'suspended') this.ac.resume().catch(() => {});
        const src = this.ac.createBufferSource();
        src.buffer = this.ac.createBuffer(1, 1, 22050);
        src.connect(this.ac.destination);
        src.start(0);
      }
    } catch {}
    this.unlocked = true;
    try { localStorage.setItem('reels:sound_on', '1'); } catch {}
    this.broadcast();
  };

  // Один раз «вооружаем» глобальный анлок на первый жест пользователя
  armGlobalUnlock = () => {
    const doUnlock = () => {
      this.unlock();
      document.removeEventListener('pointerdown', doUnlock, true);
      document.removeEventListener('keydown', onKey, true);
    };
    const onKey = (e: KeyboardEvent) => {
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