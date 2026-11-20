// Media slots. Every clip, still, screenshot, atlas and the soundtrack go through these components.
// Placeholder mode (the default in this public repo, where the media isn't included) draws each slot as a
// labelled block instead: striped and moving for video, crossed for stills. The timing, layout and motion
// around the slots stay exactly as they are, so a render shows the structure the data builds.
//   npx remotion render src/index.js ReelV15 out/placeholder.mp4                       (placeholders)
//   npx remotion render src/index.js ReelV15 out/reel.mp4 --props='{"placeholder":false}'  (with your own public/ media)
import React from 'react';
import {OffthreadVideo, Img, Audio, staticFile, getInputProps, useCurrentFrame} from 'remotion';

// getInputProps() is only available while rendering; in a <Player> on a web page it throws, so read it safely.
const readProps = () => { try { return typeof window === 'undefined' ? {} : getInputProps(); } catch (e) { return {}; } };
export const PH = readProps().placeholder !== false;

const TONES = [['#FF4A1C', '#FFF'], ['#2B50FF', '#FFF'], ['#151413', '#EFEAE0'], ['#D9D0BF', '#151413'], ['#B9B0A0', '#151413'], ['#6E675C', '#EFEAE0']];
const tone = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return TONES[h % TONES.length]; };
const base = (p) => String(p).split('/').pop();

// a labelled block in place of a still or a video
export const PhBox = ({label, video = false, style}) => {
  const frame = useCurrentFrame();
  const [bg, fg] = tone(String(label));
  const {objectFit, objectPosition, ...rest} = style || {};
  const stripes = video
    ? {backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,.14) 0 14px, transparent 14px 28px)`, backgroundPosition: `${(frame * 2) % 40}px 0`}
    : {backgroundImage: `linear-gradient(to top right, transparent calc(50% - 1px), rgba(255,255,255,.25) 50%, transparent calc(50% + 1px)), linear-gradient(to top left, transparent calc(50% - 1px), rgba(255,255,255,.25) 50%, transparent calc(50% + 1px))`};
  return <div style={{width: '100%', height: '100%', display: 'block', position: 'relative', overflow: 'hidden', background: bg, ...stripes, ...rest}}>
    <div style={{position: 'absolute', left: 6, right: 6, bottom: 6, font: '500 11px/1.2 "DM Mono", Consolas, monospace', color: fg, letterSpacing: '.04em', textTransform: 'uppercase', overflowWrap: 'anywhere'}}>
      {video ? '▶ ' : ''}{base(label)}</div>
  </div>;
};

// a video slot (src is the path under public/)
export const PhVideo = ({src, style, ...rest}) => PH
  ? <PhBox label={src} video style={style} />
  : <OffthreadVideo src={staticFile(src)} style={style} {...rest} />;

// a still slot
export const PhImg = ({src, style, ...rest}) => PH
  ? <PhBox label={src} style={style} />
  : <Img src={staticFile(src)} style={style} {...rest} />;

// a URL for CSS backgrounds, <img> and SVG <feImage>: in placeholder mode a small SVG with the slot's name
export const asset = (path, neutral = false) => {
  if (!PH) return staticFile(path);
  if (neutral) return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#808080"/></svg>');
  const [bg, fg] = tone(path);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="${bg}"/><path d="M0 0L400 300M400 0L0 300" stroke="${fg}" stroke-opacity=".3"/><text x="10" y="288" font-family="Consolas,monospace" font-size="14" fill="${fg}">${base(path)}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
};

// the soundtrack: in placeholder mode, a drum track synthesised from the reel's own event data (analysis/drums_from_events.py)
export const PhAudio = ({src}) => <Audio src={staticFile(PH ? 'audio/events_drums.wav' : src)} />;
