// Универсальная «разблокировка» аудио для iOS/Android/desktop.
// Держим флаг в памяти + localStorage, шлём событие для всех плееров.
class ReelsAudioGate {
  private unlocked = false;
  private ac: AudioContext | null = null;

  unlock = () => {
    if (this.unlocked) {
      // всё равно продублируем событие, чтобы новые плееры подхватили
      this.broadcast();
      return;
    }
    try {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      if (AC) {
        this.ac = this.ac || new AC();
        if (this.ac.state === 'suspended') this.ac.resume();
        // сыграем 1 сэмпл «тишины», чтобы iOS посчитал жест валидным для аудио
        const src = this.ac.createBufferSource();
        src.buffer = this.ac.createBuffer(1, 1, 22050);
        src.connect(this.ac.destination);
        src.start(0);
      }
    } catch { /* noop */ }
    this.unlocked = true;
    try { localStorage.setItem('reels:sound_on', '1'); } catch { /* noop */ }
    this.broadcast();
  };

  isUnlocked = () => {
    if (this.unlocked) return true;
    try { return localStorage.getItem('reels:sound_on') === '1'; } catch { return false; }
  };

  private broadcast() {
    window.dispatchEvent(new CustomEvent('reels:sound_on'));
  }
}

export const ReelsAudio = new ReelsAudioGate();
