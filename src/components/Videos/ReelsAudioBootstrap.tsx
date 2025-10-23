// src/components/Videos/ReelsAudioBootstrap.tsx
import { useEffect } from 'react';
import { ReelsAudio } from '../../utils/reelsAudio';

export default function ReelsAudioBootstrap() {
  useEffect(() => {
    ReelsAudio.armGlobalUnlock(); // первый tap/keydown мгновенно разблокирует звук
  }, []);
  return null;
}
