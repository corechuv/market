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
};

export const ReviewVideo: React.FC<Props> = ({
  hlsUrl,
  posterUrl,
  reviewId,
  productId,
  reviewType,
  userId,
  autoPlay = false,
  muted = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const monitoredRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(!!muted);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);

  const wasPlayingBeforeHide = useRef(false);
  const retryPlayTimer = useRef<number | null>(null);

  const clearRetry = () => {
    if (retryPlayTimer.current != null) {
      window.clearTimeout(retryPlayTimer.current);
      retryPlayTimer.current = null;
    }
  };

  // ---- Init / teardown HLS + mux
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const envKey = (import.meta.env.VITE_MUX_DATA_ENV_KEY as string) || "";

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

    // iOS inline
    (video as any).playsInline = true;
    (video as any).webkitPlaysInline = true;

    // Attach source
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.load();
      startMonitor();
    } else if (Hls.isSupported() && /\.m3u8(\?.*)?$/.test(hlsUrl)) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        capLevelToPlayerSize: true,
        // autoStartLoad оставляем true, чтобы метаданные подтянулись для длины
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
    } else {
      video.src = hlsUrl;
      startMonitor();
    }

    // ---- Инициализация mute/звук с учётом глобального флага
    const globalSoundOn = ReelsAudio.isUnlocked();
    video.muted = !(globalSoundOn || !muted);
    setIsMuted(video.muted);

    // Унифицированная попытка автоплея
    const tryAutoplay = async (withMutedFallback = true) => {
      if (!autoPlay) return;
      try {
        // если глобально звук разблокирован — пытаемся со звуком
        if (!video.muted && ReelsAudio.isUnlocked()) {
          await video.play();
        } else {
          // иначе — пробуем тихо
          if (!video.muted) {
            video.muted = true;
            setIsMuted(true);
          }
          await video.play();
        }
        notifyNowPlaying();
      } catch {
        // если даже тихо не получилось — отложим и попробуем чуть позже (канареечный подход)
        if (withMutedFallback) {
          retryPlayTimer.current = window.setTimeout(() => {
            tryAutoplay(false).catch(() => { });
          }, 200);
        }
      }
    };

    // listeners
    const onPlay = () => {
      setIsPlaying(true);
      notifyNowPlaying();
    };
    const onPause = () => setIsPlaying(false);
    const onLoadedMeta = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onProgress = () => {
      try {
        const b = video.buffered;
        const end = b.length ? b.end(b.length - 1) : 0;
        setBufferedEnd(end);
      } catch { /* noop */ }
    };

    // Глобальный «включи звук»
    const onGlobalSoundOn = () => {
      if (!video) return;
      // включаем звук и делаем дополнительный play() — критично для Safari/Chrome
      video.muted = false;
      setIsMuted(false);
      const p = video.play?.();
      if (p && typeof p.catch === 'function') p.catch(() => { });
    };

    // Только один плеер воспроизводит
    const onSomeoneElsePlaying = (ev: Event) => {
      const el = (ev as CustomEvent<HTMLVideoElement>).detail;
      if (el && el !== video) {
        if (!video.paused) video.pause();
      }
    };

    // Visibility
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasPlayingBeforeHide.current = !video.paused;
        if (!video.paused) video.pause();
      } else {
        if (wasPlayingBeforeHide.current && autoPlay) {
          // мягко восстановим, учитывая глобальный звук
          if (ReelsAudio.isUnlocked()) {
            video.muted = false;
            setIsMuted(false);
          }
          const p = video.play?.();
          if (p && typeof p.catch === 'function') p.catch(() => { });
        }
      }
    };

    const notifyNowPlaying = () => {
      window.dispatchEvent(new CustomEvent('reels:now_playing', { detail: video } as any));
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('loadedmetadata', onLoadedMeta);
    video.addEventListener('durationchange', onLoadedMeta);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('progress', onProgress);
    window.addEventListener('reels:sound_on', onGlobalSoundOn);
    window.addEventListener('reels:now_playing', onSomeoneElsePlaying as any);
    document.addEventListener('visibilitychange', onVisibility, { passive: true });
    // Media Session (системные кнопки)
    if ('mediaSession' in navigator) {
      try {
        const ms: any = (navigator as any).mediaSession;

        // ✅ без optional chaining после new
        const MediaMetadataCtor = (window as any).MediaMetadata;
        if (typeof MediaMetadataCtor === 'function') {
          ms.metadata = new MediaMetadataCtor({
            title: `Review ${reviewId}`,
            artist: userId || '',
          });
        }

        // Остальное можно оставить с optional chaining
        ms.setActionHandler?.('play', () => {
          ReelsAudio.unlock();
          video.play().catch(() => { });
        });
        ms.setActionHandler?.('pause', () => {
          video.pause();
        });
      } catch {
        // noop
      }
    }

    // init now
    onLoadedMeta(); onTimeUpdate(); onProgress();
    tryAutoplay().catch(() => { });

    return () => {
      clearRetry();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('loadedmetadata', onLoadedMeta);
      video.removeEventListener('durationchange', onLoadedMeta);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('progress', onProgress);
      window.removeEventListener('reels:sound_on', onGlobalSoundOn);
      window.removeEventListener('reels:now_playing', onSomeoneElsePlaying as any);
      document.removeEventListener('visibilitychange', onVisibility);
      destroy();
    };
  }, [hlsUrl, reviewId, productId, reviewType, userId, autoPlay, muted]);

  // Синхронизация, если родитель меняет muted проп
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const globalSoundOn = ReelsAudio.isUnlocked();
    v.muted = globalSoundOn ? false : !!muted;
    setIsMuted(v.muted);
  }, [muted]);

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
      }).catch(() => { });
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    if (!v.muted) {
      // Пользователь явно включил звук — запомним и обязательно дернём play()
      ReelsAudio.unlock();
      const p = v.play?.();
      if (p && typeof p.catch === 'function') p.catch(() => { });
    }
  }, []);

  const onKeyDownBtn = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      ensureSoundUnlockedLocal();
      togglePlay();
    }
  };

  const onSeek = (t: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(duration) || duration <= 0) return;
    v.currentTime = Math.min(Math.max(0, t), duration);
    setCurrentTime(v.currentTime);
  };

  const onRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) onSeek(next);
  };

  const onRangeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = 5; // seconds
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeek(currentTime - step);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeek(currentTime + step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSeek(duration);
    }
  };

  const onVideoClick = () => {
    ensureSoundUnlockedLocal();
    togglePlay();
  };

  const playedPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (Math.min(bufferedEnd, duration) / duration) * 100 : 0;

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
        playsInline
        preload="metadata"
        muted={isMuted}
        controls={false}
        controlsList="nodownload noplaybackrate noremoteplayback"
        onClick={onVideoClick}
      />

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
        {isMuted ? (
          <VolumeOffIcon className={styles.icon} />
        ) : (
          <VolumeOnIcon className={styles.icon} />
        )}
      </button>

      <button
        type="button"
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
        className={`${styles.centerBtn} ${isPlaying ? styles.hidden : ''}`}
        onClick={() => { ensureSoundUnlockedLocal(); togglePlay(); }}
        onKeyDown={onKeyDownBtn}
      >
        <span className={styles.visuallyHidden}>
          {isPlaying ? 'Pause' : 'Play'}
        </span>
        {!isPlaying && (
          <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
            <path d="M8 5v14l11-7-11-7z" />
          </svg>
        )}
      </button>

      <div className={styles.bottomBar} role="group" aria-label="Video timeline">
        <div className={styles.timeLeft} aria-label="Current time">{fmt(currentTime)}</div>

        <div className={styles.progressWrap}>
          <div className={styles.track}>
            <div className={styles.buffered} style={{ width: `${bufferedPct}%` }} aria-hidden="true" />
            <div className={styles.played} style={{ width: `${playedPct}%` }} aria-hidden="true" />
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, duration)}
            step={0.01}
            value={Math.min(currentTime, duration || 0)}
            onChange={onRangeChange}
            onKeyDown={onRangeKeyDown}
            className={styles.scrubber}
            aria-label="Seek"
          />
        </div>

        <div className={styles.timeRight} aria-label="Duration">
          {duration ? fmt(duration) : '0:00'}
        </div>
      </div>
    </div>
  );
};
