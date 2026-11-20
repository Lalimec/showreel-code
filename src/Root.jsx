import React from 'react';
import {Composition} from 'remotion';
import {ReelV15, TOTAL15, FPS} from './ReelV15';
import {ReelV15V} from './ReelV15V';

// Two cuts of the same reel from the same data: 16:9 and 9:16.
export const Root = () => (
  <>
    <Composition id="ReelV15" component={ReelV15} durationInFrames={Math.round(TOTAL15 * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="ReelV15V" component={ReelV15V} durationInFrames={Math.round(TOTAL15 * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
