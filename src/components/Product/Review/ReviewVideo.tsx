// src/components/Product/Review/ReviewVideo.tsx
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
  loop?: boolean;
};

// детект платформ
const isIOS = (() => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = (navigator as any).platform || '';
  const touchMac = /Mac/.test(platform) && 'ontouchend' in document;
  return /iP(hone|od|ad)/.test(platform) || /iPhone|iPad|iPod/.test(ua) || touchMac;
})();

declare global {
  interface Window { __reelsPlayers?: Map<string, HTMLVideoElement>; }
}

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
  const prevIdRef = useRef<string | null>(null);

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
  const clearRetry = () => { if (retryPlayTimer.current != null) { window.clearTimeout(retryPlayTimer.current); retryPlayTimer.current = null; } };

  // регистрируем этот <video> в глобальной карте, чтобы Lightbox мог управлять
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!window.__reelsPlayers) window.__reelsPlayers = new Map();
    if (prevIdRef.current && prevIdRef.current !== reviewId) {
      window.__reelsPlayers.delete(prevIdRef.current);
    }
    window.__reelsPlayers.set(reviewId, v);
    prevIdRef.current = reviewId;
    return () => { window.__reelsPlayers?.delete(reviewId); };
  }, [reviewId]);

  // активность
  useEffect(() => {
    activeRef.current = active;
    const v = videoRef.current;
    if (!v) return;
    if (!active && !v.paused) v.pause();
    if (active && ReelsAudio.isUnlocked() && !userMutedRef.current) {
      try {
        v.muted = false; v.removeAttribute('muted'); setIsMuted(false);
        const p = v.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch {}
    }
  }, [active]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const envKey = (import.meta.env.VITE_MUX_DATA_ENV_KEY as string) || '';

    const destroy = () => {
      clearRetry();
      if (hlsRef.current) { try { hlsRef.current.destroy(); } catch {} hlsRef.current = null; }
      if (monitoredRef.current) { try { mux.destroyMonitor(video); } catch {} monitoredRef.current = false; }
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
        mux.monitor(video, opts); monitoredRef.current = true;
      } catch {}
    };

    // inline для iOS
    try { (video as any).playsInline = true; } catch {}
    try { (video as any).webkitPlaysInline = true; } catch {}
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    if (autoPlay && isMuted) {
      video.setAttribute('muted', '');
      video.setAttribute('autoplay', '');
    }

    try { (video as any).disableRemotePlayback = true; } catch {}
    try { (video as any).disablePictureInPicture = true; } catch {}

    video.loop = !!loop;
    if (video.loop) video.setAttribute('loop', ''); else video.removeAttribute('loop');

    const onEnded = () => {
      if (video.loop) {
        try { video.currentTime = 0; video.play().catch(() => {}); } catch {}
        return;
      }
      window.dispatchEvent(new CustomEvent('reels:ended', { detail: reviewId } as any));
    };

    // подключаем источник
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.load();
      startMonitor();
    } else if (Hls.isSupported() && /\.m3u8(\?.*)?$/.test(hlsUrl)) {
      const hls = new Hls({
        enableWorker: true, lowLatencyMode: false,
        backBufferLength: 90, maxBufferLength: 30, capLevelToPlayerSize: true,
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
          case Hls.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break;
          case Hls.ErrorTypes.MEDIA_ERROR: hls.recoverMediaError(); break;
          default:
            try { hls.destroy(); } catch {}
            video.src = hlsUrl;
            try { video.load(); } catch {}
        }
      });
    } else {
      video.src = hlsUrl;
      startMonitor();
    }

    // первоначальный mute с учётом глобального unlock
    const globalSoundOn = ReelsAudio.isUnlocked();
    video.muted = !(globalSoundOn || !muted);
    if (video.muted) video.setAttribute('muted',''); else video.removeAttribute('muted');
    setIsMuted(video.muted);

    const notifyNowPlaying = () => {
      if (!activeRef.current) return;
      window.dispatchEvent(new CustomEvent('reels:now_playing', { detail: video } as any));
    };

    const tryAutoplay = async (withMutedFallback = true) => {
      if (!autoPlay) return;
      try {
        if (!video.muted && ReelsAudio.isUnlocked()) {
          await video.play();
        } else {
          if (!video.muted) { video.muted = true; video.setAttribute('muted',''); setIsMuted(true); }
          if (isIOS) video.setAttribute('autoplay', '');
          await video.play();
        }
        // если уже «разблокирован» глобально и пользователь сам не мутил — снимем mute
        if (ReelsAudio.isUnlocked() && !userMutedRef.current) {
          video.muted = false; video.removeAttribute('muted'); setIsMuted(false);
        }
        notifyNowPlaying();
      } catch {
        if (withMutedFallback) {
          if (!video.muted) { video.muted = true; video.setAttribute('muted',''); setIsMuted(true); }
          retryPlayTimer.current = window.setTimeout(() => { tryAutoplay(false).catch(() => {}); }, 80);
        }
      }
    };

    // listeners
    const onPlay = () => {
      setIsPlaying(true);
      notifyNowPlaying();
      if (ReelsAudio.isUnlocked() && !userMutedRef.current) {
        try { video.muted = false; video.removeAttribute('muted'); setIsMuted(false); } catch {}
      }
    };
    const onPause = () => setIsPlaying(false);
    const onLoadedMeta = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onProgress = () => {
      try {
        const b = video.buffered;
        const end = b.length ? b.end(b.length - 1) : 0;
        setBufferedEnd(end);
      } catch {}
    };
    const onCanPlay = () => {
      if (autoPlay && video.paused && isIOS && isMuted) {
        const p = video.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    };
    const onGlobalSoundOn = () => {
      if (!activeRef.current) return;
      if (!userMutedRef.current) {
        video.muted = false; video.removeAttribute('muted'); setIsMuted(false);
        const p = video.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    };
    const onSomeoneElsePlaying = (ev: Event) => {
      const el = (ev as CustomEvent<HTMLVideoElement>).detail;
      if (el && el !== video) { if (!video.paused) video.pause(); }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasPlayingBeforeHide.current = !video.paused;
        if (!video.paused) video.pause();
      } else if (wasPlayingBeforeHide.current && autoPlay) {
        const p = video.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    };

    video.addEventListener('ended', onEnded);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('loadedmetadata', onLoadedMeta);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('durationchange', onLoadedMeta);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('progress', onProgress);
    window.addEventListener('reels:sound_on', onGlobalSoundOn);
    window.addEventListener('reels:now_playing', onSomeoneElsePlaying as any);
    document.addEventListener('visibilitychange', onVisibility, { passive: true });

    onLoadedMeta(); onTimeUpdate(); onProgress();
    tryAutoplay().catch(() => {});

    return () => {
      clearRetry();
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('loadedmetadata', onLoadedMeta);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('durationchange', onLoadedMeta);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('progress', onProgress);
      window.removeEventListener('reels:sound_on', onGlobalSoundOn);
      window.removeEventListener('reels:now_playing', onSomeoneElsePlaying as any);
      document.removeEventListener('visibilitychange', onVisibility);
      destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hlsUrl, reviewId, productId, reviewType, userId, autoPlay, muted, loop]);

  const poster =
    posterUrl ||
    (hlsUrl.startsWith('https://stream.mux.com/') && hlsUrl.includes('.m3u8')
      ? `https://image.mux.com/${hlsUrl.split('/').pop()!.split('.m3u8')[0]}/thumbnail.jpg?time=1`
      : undefined);

  const togglePlay = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) {
      v.play().then(() => {
        window.dispatchEvent(new CustomEvent('reels:now_playing', { detail: v } as any));
      }).catch(() => {});
    } else {
      v.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    const willMute = !v.muted;
    v.muted = willMute;
    if (v.muted) v.setAttribute('muted',''); else v.removeAttribute('muted');
    setIsMuted(v.muted);
    userMutedRef.current = v.muted;
    if (!v.muted) {
      ReelsAudio.unlock();
      const p = v.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  }, []);

  const [durationState, setDurationState] = useState<number | null>(null);
  useEffect(() => setDurationState(duration || 0), [duration]);

  const onSeek = (t: number) => {
    const v = videoRef.current; const d = durationState ?? 0;
    if (!v || !Number.isFinite(d) || d <= 0) return;
    v.currentTime = Math.min(Math.max(0, t), d);
    setCurrentTime(v.currentTime);
  };

  const onRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) onSeek(next);
  };

  const onRangeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = 5; // seconds
    if (e.key === 'ArrowLeft') { e.preventDefault(); onSeek(currentTime - step); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); onSeek(currentTime + step); }
    else if (e.key === 'Home') { e.preventDefault(); onSeek(0); }
    else if (e.key === 'End') { e.preventDefault(); onSeek(durationState || 0); }
  };

  const onVideoClick = () => {
    ReelsAudio.unlock();
    const v = videoRef.current;
    if (v) { v.muted = false; v.removeAttribute('muted'); setIsMuted(false); }
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
        preload="metadata"
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
        onClick={() => { ReelsAudio.unlock(); onVideoClick(); }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault(); ReelsAudio.unlock(); onVideoClick();
          }
        }}
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
