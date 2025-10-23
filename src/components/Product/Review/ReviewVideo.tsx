import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import mux, { type MonitorOptions } from 'mux-embed';
import styles from './ReviewVideo.module.scss';
import VolumeOffIcon from '../../Icons/VolumeOffIcon';
import VolumeOnIcon from '../../Icons/VolumeOnIcon';
import { ReelsAudio } from '../../../utils/reelsAudio';

// --- событие, которое диспатчит ReelsLightbox при свайпе/клике ---
const UNMUTE_EVENT = 'reels:unmute_now';

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
  loop?: boolean;
};

// ===== платформы/политика автоплея =====
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
  return /Android/i.test(navigator.userAgent || '');
})();
const FORCE_MUTED_AUTOPLAY = isIOS || isAndroid;

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

  // 👇 даём возможность мобильному ролику «разрешить» звук после жеста
  const allowAudibleOnMobileRef = useRef(false);

  // ВАЖНО: для автоплея звук всегда стартует в mute
  const [isMuted, setIsMuted] = useState<boolean>(() => true);

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

  // поддерживаем loop
  useEffect(() => {
    loopRef.current = loop;
    const v = videoRef.current;
    if (v) {
      v.loop = loop;
      if (loop) v.setAttribute('loop', '');
      else v.removeAttribute('loop');
    }
  }, [loop]);

  // ===== НАСТОЙЧИВЫЙ АВТОПЛЕЙ (без load() при hls.js) =====
  const ensureAutoplay = useCallback(() => {
    const v = videoRef.current;
    if (!v || !activeRef.current) return;

    if (retryPlayTimer.current) return; // уже идёт попытка

    // Всегда стартуем мутно при автоплее на всех платформах
    if (autoPlay && !v.muted) {
      v.muted = true; v.setAttribute('muted', ''); setIsMuted(true);
    }

    let attempts = 0;
    const tryPlay = () => {
      if (!activeRef.current) { clearRetry(); return; }
      attempts++;

      const usingHlsJs = !!hlsRef.current;
      // Если используем нативный HLS (не hls.js) и readyState=0 — можно дернуть load(); для hls.js НЕ трогаем
      if (!usingHlsJs && v.readyState === 0) { try { v.load(); } catch {/* noop */} }

      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch((err: any) => {
          // политика автоплея — гарантированно уходим в muted и повторим 1-2 раза
          if (err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
            if (!v.muted) { v.muted = true; v.setAttribute('muted', ''); setIsMuted(true); }
          }
          if (attempts < 3) {
            retryPlayTimer.current = window.setTimeout(tryPlay, 150 * attempts);
          } else {
            clearRetry();
          }
          try { console.debug('[ReviewVideo] play() failed', err?.name || err); } catch {}
        });
      } else {
        clearRetry();
      }
    };

    tryPlay();
  }, [autoPlay, clearRetry]);

  // === Инициализация источника и событий ===
  // ВАЖНО: не включаем сюда isMuted/muted -> иначе при клике по звуку пересоздастся плеер и скинет таймлайн в 0
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const envKey = (import.meta as any).env?.VITE_MUX_DATA_ENV_KEY as string || '';

    // playsinline/attrs ДО назначения src
    try { (video as any).playsInline = true; } catch { }
    try { (video as any).webkitPlaysInline = true; } catch { }
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    if (autoPlay) {
      video.setAttribute('autoplay', '');
      video.setAttribute('muted', ''); // критично для десктоп-автоплея
      video.muted = true; // синхронизация проперти
      setIsMuted(true);
    } else {
      // если не автоплей — исходный muted из пропов
      video.muted = !!muted;
      if (video.muted) video.setAttribute('muted', ''); else video.removeAttribute('muted');
      setIsMuted(video.muted);
    }

    // запрет PiP/remote
    try { (video as any).disableRemotePlayback = true; } catch { }
    try { (video as any).disablePictureInPicture = true; } catch { }

    // loop на DOM
    video.loop = loopRef.current;
    if (video.loop) video.setAttribute('loop', '');

    // Подключаем источник + мониторинг
    const startMonitor = (extra?: Partial<MonitorOptions>) => {
      if (!envKey) return;
      try {
        mux.monitor(video, {
          debug: false,
          data: {
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
          },
          ...extra
        } as MonitorOptions);
        monitoredRef.current = true;
      } catch { }
    };

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
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (activeRef.current && autoPlay) ensureAutoplay();
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break;
          case Hls.ErrorTypes.MEDIA_ERROR: hls.recoverMediaError(); break;
          default:
            try { hls.destroy(); } catch { }
            video.src = hlsUrl;
            try { video.load(); } catch { }
        }
      });
    } else {
      video.src = hlsUrl;
      startMonitor();
    }

    // === события ===
    const onPlay = () => {
      setIsPlaying(true);
      if (activeRef.current) {
        window.dispatchEvent(new CustomEvent('reels:now_playing', { detail: video } as any));
      }
      emit('reels:play', { reviewId });
    };
    const onPause = () => { setIsPlaying(false); emit('reels:pause', { reviewId }); };
    const onEnded = () => {
      if (loopRef.current) {
        try { video.currentTime = 0; video.play?.().catch(() => { }); } catch { }
        return;
      }
      window.dispatchEvent(new CustomEvent('reels:ended', { detail: reviewId }));
      emit('reels:ended', { reviewId });
    };
    const onLoadedMeta = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onProgress = () => {
      try {
        const b = video.buffered;
        const end = b.length ? b.end(b.length - 1) : 0;
        setBufferedEnd(end);
      } catch { }
    };
    const onCanPlay = () => {
      if (activeRef.current && autoPlay && video.paused) ensureAutoplay();
    };

    const onSomeoneElsePlaying = (ev: Event) => {
      const el = (ev as CustomEvent<HTMLVideoElement>).detail;
      if (!el || el === video) return;
      if (!activeRef.current && !video.paused) video.pause();
    };

    const onPageHide = () => {
      wasPlayingBeforeHide.current = !video.paused;
      if (!video.paused) video.pause();
    };
    const onPageShow = () => {
      if (wasPlayingBeforeHide.current && autoPlay && activeRef.current) ensureAutoplay();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasPlayingBeforeHide.current = !video.paused;
        if (!video.paused) video.pause();
      } else if (wasPlayingBeforeHide.current && autoPlay && activeRef.current) {
        ensureAutoplay();
      }
    };

    // слушатель мгновенного анмьюта от лайтбокса
    const onUnmuteNow = (e: Event) => {
      const detail = (e as CustomEvent<{ reviewId: string }>).detail;
      if (!detail || detail.reviewId !== reviewId) return;
      if (!activeRef.current) return;
      allowAudibleOnMobileRef.current = true;
      userMutedRef.current = false;
      try {
        video.muted = false; video.removeAttribute('muted'); setIsMuted(false);
        const p = video.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch {}
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('loadedmetadata', onLoadedMeta);
    video.addEventListener('durationchange', onLoadedMeta);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('progress', onProgress);
    video.addEventListener('canplay', onCanPlay);
    window.addEventListener('reels:now_playing', onSomeoneElsePlaying as any);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibility, { passive: true });
    window.addEventListener(UNMUTE_EVENT, onUnmuteNow as any);

    // автоплей только если карточка активна
    if (activeRef.current && autoPlay) ensureAutoplay();

    return () => {
      clearRetry();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('loadedmetadata', onLoadedMeta);
      video.removeEventListener('durationchange', onLoadedMeta);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('canplay', onCanPlay);
      window.removeEventListener('reels:now_playing', onSomeoneElsePlaying as any);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener(UNMUTE_EVENT, onUnmuteNow as any);
      if (hlsRef.current) { try { hlsRef.current.destroy(); } catch { } hlsRef.current = null; }
      if (monitoredRef.current) { try { mux.destroyMonitor(video); } catch { } monitoredRef.current = false; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hlsUrl, reviewId, productId, reviewType, userId, autoPlay]); // <= НЕТ isMuted/ muted

  // активность карточки
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    activeRef.current = active;

    if (active) {
      if (autoPlay) ensureAutoplay();
    } else {
      if (!v.paused) v.pause();
    }
  }, [active, autoPlay, ensureAutoplay]);

  // синхронизация mute (отдельный маленький эффект — без пересоздания источника)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const forceMobileMuted = FORCE_MUTED_AUTOPLAY && autoPlay && !allowAudibleOnMobileRef.current;
    let targetMuted: boolean = autoPlay ? true : (!!muted || userMutedRef.current || forceMobileMuted);

    if (v.muted !== targetMuted) {
      v.muted = targetMuted;
      if (v.muted) v.setAttribute('muted', ''); else v.removeAttribute('muted');
      setIsMuted(v.muted);
    }
  }, [muted, autoPlay]);

  const poster =
    posterUrl ||
    (hlsUrl.startsWith('https://stream.mux.com/') && hlsUrl.includes('.m3u8')
      ? `https://image.mux.com/${hlsUrl.split('/').pop()!.split('.m3u8')[0]}/thumbnail.jpg?time=1`
      : undefined);

  // === управление пользователем (клики/тапы) ===
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      // прямой клик: это пользовательский жест
      ReelsAudio.unlock();
      allowAudibleOnMobileRef.current = true; // мобилке разрешаем звук после жеста
      v.play().then(() => {
        window.dispatchEvent(new CustomEvent('reels:now_playing', { detail: v } as any));
      }).catch((err) => { try { console.debug('[ReviewVideo] play() on toggle failed', err?.name || err); } catch {} });
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    const willMute = !v.muted;

    if (!willMute) {
      // включаем звук: это жест
      ReelsAudio.unlock();
      allowAudibleOnMobileRef.current = true; // больше не ремьютим автоплеем на мобилке
    }

    v.muted = willMute;
    if (v.muted) v.setAttribute('muted', ''); else v.removeAttribute('muted');
    setIsMuted(v.muted);
    userMutedRef.current = v.muted;

    if (!v.muted) {
      v.play?.().catch((err) => { try { console.debug('[ReviewVideo] play() after unmute failed', err?.name || err); } catch {} });
    }

    emit(v.muted ? 'reels:mute' : 'reels:unmute', { reviewId });
  }, [emit, reviewId]);

  // таймлайн
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

  const onVideoClick = () => { togglePlay(); };

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
        loop={loop}
      />

      {/* Top-right: mute/unmute */}
      <button
        type="button"
        aria-label={isMuted ? 'Turn sound on' : 'Mute sound'}
        aria-pressed={!isMuted}
        className={styles.muteBtn}
        onClick={toggleMute}
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
        onClick={togglePlay}
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
