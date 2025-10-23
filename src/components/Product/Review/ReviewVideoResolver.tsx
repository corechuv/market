// ReviewVideoResolver.tsx
import React from 'react';
import { resolveMuxUrlMaybe, type MuxResolve, type MuxWaitingStatus } from '../../../services/muxApi';
import { ReviewVideo } from './ReviewVideo';
import Preloader from '../../UI/Preloader/Preloader';

type ReviewType = 'plain' | 'reel';

export function ReviewVideoResolver(props: {
  url: string;
  posterUrl?: string;
  reviewId: string;
  productId: string;
  reviewType: ReviewType;
  userId?: string | null;
  autoPlay?: boolean;
  muted?: boolean;
  active?: boolean;
}) {
  const [state, setState] = React.useState<MuxResolve>({ status: 'loading' as MuxWaitingStatus });
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (cancelled) return;
      setState({ status: 'loading' as MuxWaitingStatus });
      try {
        const res = await resolveMuxUrlMaybe(props.url);
        if (cancelled) return;
        if (res.status === 'ready') {
          setState({ status: 'ready', hlsUrl: res.hlsUrl, posterUrl: res.posterUrl });
        } else {
          setState({ status: res.status });
          if (!cancelled && res.status !== 'errored') {
            timerRef.current = window.setTimeout(run, 2500);
          }
        }
      } catch {
        if (!cancelled) setState({ status: 'errored' });
      }
    }

    run();
    return () => { cancelled = true; if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [props.url]);

  if (state.status !== 'ready') {
    return (
      <div style={{ aspectRatio: '9/16', display: 'grid', placeItems: 'center', background: '#111', color: '#aaa', borderRadius: 8 }}>
        {state.status === 'errored' ? 'Video error' : <Preloader overlay sweepDeg={240} label="Processing..." />}
      </div>
    );
  }

  return (
    <ReviewVideo
      hlsUrl={state.hlsUrl}
      posterUrl={state.posterUrl ?? props.posterUrl}
      reviewId={props.reviewId}
      productId={props.productId}
      reviewType={props.reviewType}
      userId={props.userId}
      autoPlay={props.autoPlay}
      muted={props.muted}
      active={props.active}
    />
  );
}
