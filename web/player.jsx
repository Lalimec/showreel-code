// The reel as a live React component on the watch page: the same compositions, played by @remotion/player
// in placeholder mode. Built to docs/live/player.js with `npm run build:web`.
// The page owns the clock: one <audio> element plays the soundtrack, and the page seeks this player to the
// audio's frame, so the video, the live code and the sound can never drift apart. The player is muted and
// has no controls of its own.
import React, {useRef, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player} from '@remotion/player';
import {ReelV15, TOTAL15, FPS} from '../src/ReelV15';
import {ReelV15V} from '../src/ReelV15V';

const CUTS = {wide: {component: ReelV15, w: 1920, h: 1080}, vertical: {component: ReelV15V, w: 1080, h: 1920}};

const App = () => {
  const ref = useRef(null);
  const [cut, setCut] = useState('wide');
  useEffect(() => {
    if (ref.current) ref.current.mute();
    window.reelPlayer = ref.current;
    window.dispatchEvent(new Event('reelplayer'));
  }, [cut]);
  useEffect(() => { window.setReelCut = (c) => setCut(c); }, []);
  const c = CUTS[cut];
  return <Player ref={ref} component={c.component} durationInFrames={Math.round(TOTAL15 * FPS)} fps={FPS}
    compositionWidth={c.w} compositionHeight={c.h} controls={false} clickToPlay={false} initiallyMuted
    doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} acknowledgeRemotionLicense
    style={cut === 'wide' ? {width: '100%', height: '100%'} : {height: '100%', aspectRatio: '9 / 16', margin: '0 auto'}} />;
};

createRoot(document.getElementById('live')).render(<App />);
