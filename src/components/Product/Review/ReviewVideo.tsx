// ReviewVideo.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import mux, { type MonitorOptions } from 'mux-embed';
import styles from './ReviewVideo.module.scss';
import VolumeOffIcon from '../../Icons/VolumeOffIcon';
import VolumeOnIcon from '../../Icons/VolumeOnIcon';
import { ReelsAudio } from '../../../utils/reelsAudio';

type ReviewType = 'plain' | 'reel';

type Props = {
  hlsUrl: string;
  posterUrl?: string;
  reviewId: string;
  productId: string;
  reviewType: ReviewType;
  userId?: string | null;
  autoPlay?: boolean;
  muted?: boolean;
  active?: boolean;
  /** Зациклить ролик (по умолчанию true) */
  loop?: boolean;
};

// === платформы/политика автоплея ===
const isIOS = (() => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = (navigator as any).platform || '';
  const hasDoc = typeof document !== 'undefined';
  const touchMac = /Mac/.test(platform) && (hasDoc ? ('ontouchend' in document) : false);
  return /iP(hone|od|ad)/.test(platform) || /iPhone|iPad|iPod/.test(ua) || touchMac;
})();
const isAndroid = (() => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Android/i.test(ua);
})();
const FORCE_MUTED_AUTOPLAY = isIOS || isAndroid;

// синхронный «мостик жеста» из Lightbox → плеер (в рамках жеста)
const UNMUTE_EVENT = 'reels:unmute_now';

export const ReviewVideo: React.FC<Props> = ({
  hlsUrl,
  posterUrl,
  reviewId,
  productId,
  reviewType,
  userId,
  autoPlay = false,
  muted = false,
  active = false,
  loop = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const monitoredRef = useRef(false);
  const userMutedRef = useRef(false);
  const activeRef = useRef<boolean>(active);
  const loopRef = useRef<boolean>(loop);

  // iOS требует muted на DOM уже к первому paint
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const global = ReelsAudio.isUnlocked();
    return !(global || !muted);
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);

  const wasPlayingBeforeHide = useRef(false);
  const retryPlayTimer = useRef<number | null>(null);

  const clearRetry = useCallback(() => {
    if (retryPlayTimer.current != null) {
      window.clearTimeout(retryPlayTimer.current);
      retryPlayTimer.current = null;
    }
  }, []);

  const emit = useCallback((name: string, detail?: any) => {
    try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch { /* noop */ }
  }, []);

  // держим loop в актуальном состоянии
  useEffect(() => {
    loopRef.current = loop;
    const v = videoRef.current;
    if (v) {
      v.loop = loop;
      if (loop) v.setAttribute('loop', '');
      else v.removeAttribute('loop');
    }
  }, [loop]);

  // Универсальный безопасный запуск воспроизведения (вынесено на верхний уровень — это было источником ошибки)
  const playSafely = useCallback(async (preferAudible: boolean) => {
    const v = videoRef.current;
    if (!v) return;

    // На мобилках всегда стартуем muted — гарантированно разрешено
    if (FORCE_MUTED_AUTOPLAY) {
      if (!v.muted) {
        v.muted = true; v.setAttribute('muted', ''); setIsMuted(true);
      }
      try { await v.play(); } catch { /* noop */ }
      return;
    }

    // Desktop: если звук разблокирован и пользователь не глушил — пробуем сразу со звуком
    if (preferAudible && ReelsAudio.isUnlocked() && !userMutedRef.current) {
      try {
        v.muted = false; v.removeAttribute('muted'); setIsMuted(false);
        await v.play();
        return;
      } catch {
        // fallback ниже
      }
    }

    // Fallback: muted autoplay
    if (!v.muted) {
      v.muted = true; v.setAttribute('muted', ''); setIsMuted(true);
    }
    try { await v.play(); } catch { /* noop */ }
  }, []);

  // Инициализация источника, мониторинг, события плеера
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const envKey = (import.meta.env.VITE_MUX_DATA_ENV_KEY as string) || '';

    const destroy = () => {
      clearRetry();
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch { /* noop */ }
        hlsRef.current = null;
      }
      if (monitoredRef.current) {
        try { mux.destroyMonitor(video); } catch { /* noop */ }
        monitoredRef.current = false;
      }
    };

    const baseData = {
      env_key: envKey,
      player_name: 'dashedo-react-hls',
      player_init_time: performance.now(),
      video_id: reviewId,
      video_title: `Review ${reviewId}`,
      video_stream_type: 'on-demand' as const,
      viewer_user_id: userId || undefined,
      custom_1: productId,
      custom_2: reviewType,
      custom_3: reviewId,
    };

    const startMonitor = (extra?: Partial<MonitorOptions>) => {
      if (!envKey) return;
      try {
        const opts: MonitorOptions = { debug: false, data: baseData, ...extra } as MonitorOptions;
        mux.monitor(video, opts);
        monitoredRef.current = true;
      } catch { /* noop */ }
    };

    // iOS inline + нужные атрибуты заранее
    try { (video as any).playsInline = true; } catch { /* noop */ }
    try { (video as any).webkitPlaysInline = true; } catch { /* noop */ }
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    if (autoPlay && isMuted) {
      video.setAttribute('muted', '');
      video.setAttribute('autoplay', '');
    }

    // запрет PiP/Remote Playback — best effort
    try { (video as any).disableRemotePlayback = true; } catch { /* noop */ }
    try { (video as any).disablePictureInPicture = true; } catch { /* noop */ }

    // loop сразу на DOM
    video.loop = loopRef.current;
    if (video.loop) video.setAttribute('loop', '');

    const onPageHide = () => {
      wasPlayingBeforeHide.current = !video.paused;
      if (!video.paused) video.pause();
    };
    const onPageShow = () => {
      if (wasPlayingBeforeHide.current && autoPlay) {
        if (!FORCE_MUTED_AUTOPLAY && ReelsAudio.isUnlocked()) {
          video.muted = false;
          video.removeAttribute('muted');
          setIsMuted(false);
        }
        video.play().catch(() => { /* noop */ });
      }
    };

    // если нативный loop не сработал (MSE), перезапускаем сами
    const onEnded = () => {
      if (loopRef.current) {
        try {
          video.currentTime = 0;
          const p = video.play?.(); if (p && typeof p.catch === 'function') p.catch(() => { /* noop */ });
        } catch { /* noop */ }
        return; // не шлём reels:ended
      }
      window.dispatchEvent(new CustomEvent('reels:ended', { detail: reviewId }));
      emit('reels:ended', { reviewId });
    };

    // Подключаем источник
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.load();
      startMonitor();
    } else if (Hls.isSupported() && /\.m3u8(\?.*)?$/.test(hlsUrl)) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 20,
        maxMaxBufferLength: 60,
        startPosition: 0,
        capLevelToPlayerSize: true,
        fragLoadingRetryDelay: 500,
        manifestLoadingTimeOut: 20000,
      });
      hlsRef.current = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(hlsUrl);
        startMonitor({
          hlsjs: hls,
          player_software_name: 'hls.js',
          player_software_version: Hls.version,
        });
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad(); break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError(); break;
          default:
            try { hls.destroy(); } catch { /* noop */ }
            video.src = hlsUrl;
            try { video.load(); } catch { /* noop */ }
        }
      });
    } else {
      video.src = hlsUrl;
      startMonitor();
    }

    // mute по стору «глобального звука»
    const globalSoundOn = ReelsAudio.isUnlocked();
    video.muted = !(globalSoundOn || !muted);
    if (video.muted) video.setAttribute('muted', ''); else video.removeAttribute('muted');
    setIsMuted(video.muted);

    const notifyNowPlaying = () => {
      if (!activeRef.current) return;
      const v = videoRef.current;
      if (!v) return;
      window.dispatchEvent(new CustomEvent('reels:now_playing', { detail: v } as any));
    };

    // Автоплей (первичная попытка)
    const tryAutoplay = async (withMutedFallback = true) => {
      if (!autoPlay) return;
      try {
        if (FORCE_MUTED_AUTOPLAY) {
          if (!video.muted) {
            video.muted = true;
            video.setAttribute('muted', '');
            setIsMuted(true);
          }
          if (isIOS) video.setAttribute('autoplay', '');
          await video.play();
          notifyNowPlaying();
          return;
        }
        if (!video.muted && ReelsAudio.isUnlocked()) {
          await video.play();
        } else {
          if (!video.muted) {
            video.muted = true;
            video.setAttribute('muted', '');
            setIsMuted(true);
          }
          await video.play();
        }
        notifyNowPlaying();
      } catch {
        if (withMutedFallback) {
          if (!video.muted) {
            video.muted = true;
            video.setAttribute('muted', '');
            setIsMuted(true);
          }
          retryPlayTimer.current = window.setTimeout(() => {
            tryAutoplay(false).catch(() => { /* noop */ });
          }, 50);
        }
      }
    };

    // === события ===
    const onPlay = () => {
      setIsPlaying(true);
      notifyNowPlaying();
      emit('reels:play', { reviewId });

      // Если звук уже «разблокирован» и пользователь не мутил вручную — снимаем mute.
      if (activeRef.current && !userMutedRef.current && ReelsAudio.isUnlocked()) {
        try {
          video.muted = false;
          video.removeAttribute('muted');
          setIsMuted(false);
        } catch { /* noop */ }
      }
    };

    const onPause = () => { setIsPlaying(false); emit('reels:pause', { reviewId }); };
    const onLoadedMeta = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onProgress = () => {
      try {
        const b = video.buffered;
        const end = b.length ? b.end(b.length - 1) : 0;
        setBufferedEnd(end);
      } catch { /* noop */ }
    };

    const onCanPlay = () => {
      if (autoPlay && video.paused && isIOS && isMuted) {
        const p = video.play?.(); if (p && typeof p.catch === 'function') p.catch(() => { /* noop */ });
      }
    };

    const onGlobalSoundOn = () => {
      const v = videoRef.current;
      if (!v) return;
      if (!activeRef.current) return;
      if (!v.paused && !userMutedRef.current) {
        v.muted = false;
        v.removeAttribute('muted');
        setIsMuted(false);
        const p = v.play?.(); if (p && typeof p.catch === 'function') p.catch(() => { /* noop */ });
      }
    };

    const onSomeoneElsePlaying = (ev: Event) => {
      const v = videoRef.current;
      if (!v) return;
      const el = (ev as CustomEvent<HTMLVideoElement>).detail;
      if (!el || el === v) return;
      if (!activeRef.current && !v.paused) v.pause();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasPlayingBeforeHide.current = !video.paused;
        if (!video.paused) video.pause();
      } else {
        if (wasPlayingBeforeHide.current && autoPlay) {
          if (!FORCE_MUTED_AUTOPLAY && ReelsAudio.isUnlocked()) {
            video.muted = false;
            video.removeAttribute('muted');
            setIsMuted(false);
          }
          const p = video.play?.();
          if (p && typeof p.catch === 'function') p.catch(() => { /* noop */ });
        }
      }
    };

    // ГЛАВНОЕ: синхронный анмьют по жесту (из Lightbox)
    const onUnmuteNow = (ev: Event) => {
      const detail = (ev as CustomEvent<any>).detail || {};
      if (detail.reviewId && detail.reviewId !== reviewId) return;
      if (!activeRef.current) return;
      try {
        video.muted = false;
        video.removeAttribute('muted');
        setIsMuted(false);
        const p = video.play?.(); if (p && typeof p.catch === 'function') p.catch(() => { /* noop */ });
      } catch { /* noop */ }
    };

    // подписки
    video.addEventListener('ended', onEnded);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('loadedmetadata', onLoadedMeta);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('durationchange', onLoadedMeta);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('progress', onProgress);
    window.addEventListener('reels:sound_on', onGlobalSoundOn);
    window.addEventListener('reels:now_playing', onSomeoneElsePlaying as any);
    window.addEventListener(UNMUTE_EVENT, onUnmuteNow as any);
    document.addEventListener('visibilitychange', onVisibility, { passive: true });

    onLoadedMeta(); onTimeUpdate(); onProgress();
    // первичная попытка автоплея при инициализации
    tryAutoplay().catch(() => { /* noop */ });

    return () => {
      clearRetry();
      video.removeEventListener('ended', onEnded);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);

      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('loadedmetadata', onLoadedMeta);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('durationchange', onLoadedMeta);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('progress', onProgress);
      window.removeEventListener('reels:sound_on', onGlobalSoundOn);
      window.removeEventListener('reels:now_playing', onSomeoneElsePlaying as any);
      window.removeEventListener(UNMUTE_EVENT, onUnmuteNow as any);
      document.removeEventListener('visibilitychange', onVisibility);
      destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hlsUrl, reviewId, productId, reviewType, userId, isMuted, muted, autoPlay]);

  // Следим за сменой active без пересоздания плеера
  useEffect(() => {
    activeRef.current = active;
    const v = videoRef.current;
    if (!v) return;
    if (!active && !v.paused) v.pause();
  }, [active]);

  // При изменении active/autoPlay — инициируем воспроизведение «безопасно»
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) {
      if (autoPlay) {
        // На десктопе попытаемся сразу со звуком, если это уже разрешено
        playSafely(true).catch(() => { /* noop */ });
      }
    } else {
      if (!v.paused) v.pause();
    }
  }, [active, autoPlay, playSafely]);

  // Синхронизация muted пропа (с учётом моб. автоплея)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const globalSoundOn = ReelsAudio.isUnlocked();
    const forceMutedForMobileAutoplay = FORCE_MUTED_AUTOPLAY && autoPlay;
    const targetMuted = forceMutedForMobileAutoplay ? true : (globalSoundOn ? false : !!muted);
    v.muted = targetMuted;
    if (v.muted) v.setAttribute('muted', ''); else v.removeAttribute('muted');
    setIsMuted(v.muted);
  }, [muted, autoPlay]);

  const poster =
    posterUrl ||
    (hlsUrl.startsWith('https://stream.mux.com/') && hlsUrl.includes('.m3u8')
      ? `https://image.mux.com/${hlsUrl.split('/').pop()!.split('.m3u8')[0]}/thumbnail.jpg?time=1`
      : undefined);

  const ensureSoundUnlockedLocal = useCallback(() => {
    ReelsAudio.unlock();
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => {
        window.dispatchEvent(new CustomEvent('reels:now_playing', { detail: v } as any));
      }).catch(() => { /* noop */ });
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const willMute = !v.muted;
    v.muted = willMute;
    if (v.muted) v.setAttribute('muted', ''); else v.removeAttribute('muted');
    setIsMuted(v.muted);
    userMutedRef.current = v.muted;
    if (!v.muted) {
      ReelsAudio.unlock();
      const p = v.play?.(); if (p && typeof p.catch === 'function') p.catch(() => { /* noop */ });
    }
    emit(v.muted ? 'reels:mute' : 'reels:unmute', { reviewId });
  }, [emit, reviewId]);

  const [durationState, setDurationState] = useState<number | null>(null);
  useEffect(() => setDurationState(duration || 0), [duration]);

  const onSeek = (t: number) => {
    const v = videoRef.current;
    const d = durationState ?? 0;
    if (!v || !Number.isFinite(d) || d <= 0) return;
    v.currentTime = Math.min(Math.max(0, t), d);
    setCurrentTime(v.currentTime);
    emit('reels:seek', { reviewId, time: v?.currentTime ?? 0 });
  };

  const onRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) onSeek(next);
  };

  const onRangeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = 5;
    if (e.key === 'ArrowLeft') { e.preventDefault(); onSeek(currentTime - step); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); onSeek(currentTime + step); }
    else if (e.key === 'Home') { e.preventDefault(); onSeek(0); }
    else if (e.key === 'End') { e.preventDefault(); onSeek(durationState || 0); }
  };

  const onVideoClick = () => {
    ensureSoundUnlockedLocal();
    window.dispatchEvent(new CustomEvent(UNMUTE_EVENT, { detail: { reviewId } }));
    togglePlay();
  };

  const playedPct = (durationState || 0) > 0 ? (currentTime / (durationState || 1)) * 100 : 0;
  const bufferedPct = (durationState || 0) > 0 ? (Math.min(bufferedEnd, durationState || 0) / (durationState || 1)) * 100 : 0;

  const fmt = (sec: number) => {
    if (!Number.isFinite(sec)) return '0:00';
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
    const sss = String(ss).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${sss}` : `${mm}:${sss}`;
  };

  return (
    <div className={styles.container}>
      <video
        ref={videoRef}
        className={styles.video}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        preload={active ? 'auto' : 'metadata'}
        muted={isMuted}
        controls={false}
        controlsList="nodownload noplaybackrate noremoteplayback"
        onClick={onVideoClick}
        onTouchStart={() => ReelsAudio.unlock()}
        loop={loop}
      />

      {/* Top-right: mute/unmute */}
      <button
        type="button"
        aria-label={isMuted ? 'Turn sound on' : 'Mute sound'}
        aria-pressed={!isMuted}
        className={styles.muteBtn}
        onClick={() => { ReelsAudio.unlock(); window.dispatchEvent(new CustomEvent(UNMUTE_EVENT, { detail: { reviewId } })); toggleMute(); }}
      >
        <span className={styles.visuallyHidden}>
          {isMuted ? 'Sound off' : 'Sound on'}
        </span>
        {isMuted ? <VolumeOffIcon className={styles.icon} /> : <VolumeOnIcon className={styles.icon} />}
      </button>

      {/* Center play btn */}
      <button
        type="button"
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
        className={`${styles.centerBtn} ${isPlaying ? styles.hidden : ''}`}
        onClick={() => { ReelsAudio.unlock(); window.dispatchEvent(new CustomEvent(UNMUTE_EVENT, { detail: { reviewId } })); togglePlay(); }}
      >
        <span className={styles.visuallyHidden}>
          {isPlaying ? 'Pause' : 'Play'}
        </span>
        {!isPlaying && (
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title" shapeRendering="geometricPrecision">
            <title id="title">Play</title>
            <path
              d="M22 20.5 Q22 18 24.1 19.35 L33.9 25.65 Q36 27 33.9 28.35 L24.1 34.65 Q22 36 22 33.5 Z"
              fill="white"
              fillOpacity="0.92"
              transform="translate(27 27) scale(2.4) translate(-27 -27)" />
          </svg>
        )}
      </button>

      {/* Bottom bar */}
      <div className={styles.bottomBar} role="group" aria-label="Video timeline">
        <div className={styles.timeLeft} aria-label="Current time">{fmt(currentTime)}</div>

        <div className={styles.progressWrap} onWheel={(e) => e.stopPropagation()}>
          <div className={styles.track}>
            <div className={styles.buffered} style={{ width: `${bufferedPct}%` }} aria-hidden="true" />
            <div className={styles.played} style={{ width: `${playedPct}%` }} aria-hidden="true" />
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, durationState || 0)}
            step={0.01}
            value={Math.min(currentTime, durationState || 0)}
            onChange={onRangeChange}
            onKeyDown={onRangeKeyDown}
            onWheel={(e) => e.stopPropagation()}
            className={styles.scrubber}
            aria-label="Seek"
          />
        </div>

        <div className={styles.timeRight} aria-label="Duration">
          {durationState ? fmt(durationState) : '0:00'}
        </div>
      </div>
    </div>
  );
};
