// Showreel v15 = v14 with the tool screens and name redesigned as Ad Studio (tools/make_v15.py). v14 (~70 s, music v7); built on v12/v13. Owner's direction 2026-11-11: light paper ground, flat, no shadows/glow/glitch/Truchet;
// big kinetic type in Bricolage Grotesque (variable width), Anton for stacked lines, DM Mono corner labels; shape-morph wipes
// at the cuts; Bauhaus shapes; trends as compositions; curated clips (curation/ratings_*.json -> prep_v12.py -> v12_clips.json).
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Img, Sequence, Loop, staticFile, useCurrentFrame, interpolate, Easing, delayRender, continueRender} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadMono} from '@remotion/google-fonts/DMMono';
import {PH, PhVideo, PhImg, PhAudio, asset} from './media';
import Q from './cues_v7.json';
import E from './events_v7.json';
import CLIPS from './v12_clips.json';
import MOON from './moon_index.json';
import GP_AOS from './gp_aos.json';
import GP_AR from './gp_ar.json';
import GP_WSV from './gp_wsv.json';
import BGS_COVERS from './bgs_covers.json';
const {fontFamily: SANS} = loadInter('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']});
const {fontFamily: ANTON} = loadAnton('normal', {weights: ['400'], subsets: ['latin']});
const {fontFamily: DMMONO} = loadMono('normal', {weights: ['500'], subsets: ['latin', 'latin-ext']});
export const FPS = 30;
export const TOTAL15 = Math.floor(Q.total * 10) / 10;
const C = {cream: '#EFEAE0', orange: '#FF4A1C', ink: '#151413', sand: '#B9B0A0'};
const sans = (size, color, w = 700) => ({font: `${w} ${size}px/1.15 ${SANS}`, color, letterSpacing: '-0.01em'});
const f = (s) => Math.round(s * FPS);
const EO = Easing.bezier(0.16, 1, 0.3, 1), EIO = Easing.bezier(0.65, 0, 0.35, 1), EI = Easing.bezier(0.7, 0, 0.84, 0);
const lerp = (t, a, b, from, to, e = EO) => interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const beatsIn = (a, b) => Q.beats.filter((x) => x >= a - 0.005 && x < b - 0.005);
const lastHit = (hits, abs) => { let l = -99; for (const h of hits) { if (h <= abs + 1e-4) l = h; } return l; };
const decay = (hits, abs, k = 9) => { const l = lastHit(hits, abs); return l < -9 ? 0 : Math.exp(-(abs - l) * k); };
const idx = (hits, abs) => hits.filter((h) => h <= abs + 1e-4).length - 1;
const D = (n, B = false) => (B ? Q.B_OFF : 0) + 6.66 + n * 1.92;      // phrase downbeats
const Clip = ({name, from = 0.3, style, loop}) => {
  const v = <PhVideo muted src={`v/${name}.mp4`} startFrom={f(from)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}} />;
  return loop ? <Loop durationInFrames={f(loop)}>{v}</Loop> : v;
};
const Still = ({src, style}) => <PhImg src={`i/${src}`} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}} />;
// content that swaps at each time in `times` (absolute); render(i) gets the item index
const Swap = ({at, times, end, render}) => <>{times.map((t0, i) => {
  const t1 = i + 1 < times.length ? times[i + 1] : end;
  return <Sequence key={i} from={f(t0 - at)} durationInFrames={Math.max(1, f(t1) - f(t0))} layout="none">{render(i)}</Sequence>;
})}</>;
// slice glitch on top of any layer: copies of `render()` in horizontal strips, shifted and tinted, right after a hit
const hash = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const Cursor = ({abs, clicks, gs = 1, zs = 1}) => {
  // clicks: [{t, x, y}] in window coordinates; the cursor glides in the 0.3 s before each click
  const ts = clicks.map((c) => c.t), n = ts.filter((t) => t <= abs + 1e-4).length;
  let x, y;
  if (n >= clicks.length) ({x, y} = clicks[clicks.length - 1]);
  else {
    const tgt = clicks[n], from = n === 0 ? {x: tgt.x + 1100, y: tgt.y + 700} : clicks[n - 1];
    const k = lerp(abs, tgt.t - 0.42, tgt.t - 0.13, 0, 1, EIO);
    x = from.x + (tgt.x - from.x) * k; y = from.y + (tgt.y - from.y) * k;
  }
  const last = lastHit(clicks.map((c) => c.t), abs), press = decay(clicks.map((c) => c.t), abs, 14);
  const ring = abs - last, lc = clicks.find((c) => c.t === last);
  return <>
    {lc && ring < 0.35 && <div style={{position: 'absolute', left: lc.x - 10 - ring * 140, top: lc.y - 10 - ring * 140, width: 20 + ring * 280, height: 20 + ring * 280, borderRadius: '50%', border: `${6 * (1 - ring / 0.35)}px solid ${C.orange}`, opacity: 1 - ring / 0.35}} />}
    <svg style={{position: 'absolute', left: x - 4, top: y - 2, transform: `scale(${(1 - 0.15 * press) * gs / zs})`, transformOrigin: '4px 2px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.5))'}} width="44" height="56" viewBox="0 0 22 28">
      <path d="M2 1.5 L2 21.5 L7 16.8 L10.4 24.6 L13.6 23.2 L10.3 15.6 L17 15.4 Z" fill="#fff" stroke="#141414" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  </>;
};
const L154 = 0.38815;
const PASSES = [Q.fast, Q.fast + 8 * L154];
const PBe = PASSES.map((p) => Array.from({length: 8}, (_, n) => p + n * L154));
const PUb = [Q.burst4, Q.burst4.map((x) => x + 8 * L154)];
const unitBeats = (st, unit) => Array.from({length: 8}, (_, i) => st + (i * unit) / 8);   // the 8 beats of an inserted 2-bar unit
const GB = Q.insG.map((s) => unitBeats(s, Q.gUnit));      // the two extra 125-BPM units
const DB = Q.insD.map((s) => unitBeats(s, Q.dUnit));      // the two extra ~133-BPM units
const FEED = GB[1][4];
const LIST_T = E.kick.filter((x) => x >= Q.insD[1] + Q.dUnit - 0.05 && x < Q.stutter4[0] - 0.1).filter((x, j, a) => j === 0 || x - a[j - 1] > 0.3).slice(0, 4);
const snap = (ts) => ts.map((t) => E.kick.reduce((b, k) => (Math.abs(k - t) < Math.abs(b - t) ? k : b), E.kick[0]));
// accent groups the owner tapped (his big taps minus ~0.11 s reaction, snapped to kicks), as v7 times: held zoom steps
const STEPS = snap([3.81, 4.26, 4.75, 5.26, 8.66, 9.03, 9.51, 9.98, 10.32, 16.26, 16.73, 17.21, 17.69, 31.66, 32.12, 32.61, 33.06, 41.18, 41.53, 41.94, 42.4, 56.61, 56.95]);

// one big word per hit, centred, landing with overshoot (the trailer's BUY / YOUR / LUCK)
const RAT = [['9:16', 9 / 16], ['4:5', 4 / 5], ['1:1', 1], ['16:9', 16 / 9]];
const ADS = {
  td: {render: 'ad_tinydesk', rfrom: 6, cap: 'SAME SONG'},
  pd: {render: 'ad_petdance', rfrom: 4, cap: 'WITH YOUR PET'},
  pk: {render: 'ad_paintingkiss', rfrom: 2, cap: 'BECOMES THIS'},
};
const Pill = ({text, size, style}) => <div style={{position: 'absolute', left: '50%', transform: 'translateX(-50%)', padding: `${size * 0.28}px ${size * 0.6}px`, borderRadius: size, background: '#141414', whiteSpace: 'nowrap', ...sans(size, '#fff', 800), letterSpacing: '0.01em', ...style}}>{text}</div>;
const Brand = ({size}) => <div style={{position: 'absolute', left: size * 0.6, top: size * 0.5, padding: `${size * 0.15}px ${size * 0.45}px`, borderRadius: 6, background: '#C8FF3D', ...sans(size * 0.8, C.ink, 800)}}>Recastly</div>;
const RatioAd = ({ad, ratio, w, h}) => {
  const A = ADS[ad], cs = Math.max(12, Math.min(w, h) * 0.075);
  if (ratio < 0.6) return <Clip name={A.render} from={A.rfrom} />;     // 9:16 = the real render
  const wide = ratio >= 1;
  let body;
  if (ad === 'td') {
    const half = wide ? {width: w / 2, height: h} : {width: w, height: h / 2};
    body = <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: wide ? 'row' : 'column'}}>
      <div style={{...half, overflow: 'hidden'}}><Clip name="td_a" from={0.4} style={{objectPosition: '50% 35%'}} /></div>
      <div style={{...half, overflow: 'hidden'}}><Clip name="td_b" from={0.4} style={{objectPosition: '50% 35%'}} /></div>
    </div>;
  } else if (ad === 'pd') {
    body = <Clip name="pd_0" from={0.5} style={{objectPosition: '72% 50%'}} />;
  } else {
    const card = wide ? h * 0.62 : w * 0.36;
    body = <>
      <div style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: wide ? w * 0.5 : w}}><Clip name="pk_r0" from={0.3} style={{objectPosition: '50% 30%'}} /></div>
      {wide && <div style={{position: 'absolute', left: 0, top: 0, width: w * 0.5, height: h, background: '#EDE7DD'}} />}
      <div style={{position: 'absolute', left: wide ? w * 0.25 - card / 2 : w * 0.06, top: wide ? h / 2 - card / 2 : h - card - h * 0.14, width: card, height: card, padding: card * 0.04, background: '#fff', borderRadius: 6, transform: 'rotate(-4deg)', boxShadow: '0 12px 30px -10px rgba(0,0,0,.6)'}}>
        <Still src="pk_img0.jpg" /></div>
    </>;
  }
  return <>{body}<Brand size={cs * 0.7} /><Pill text={A.cap} size={cs} style={{bottom: h * 0.07}} /></>;
};
const Placement = ({label, ratio, ad, h = 560, chrome}) => {
  const w = h * ratio;
  return (
    <div style={{width: w, height: h, borderRadius: 18, overflow: 'hidden', position: 'relative', background: '#000', boxShadow: '0 30px 70px -30px #000'}}>
      <RatioAd ad={ad} ratio={ratio} w={w} h={h} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, padding: '12px 16px', background: 'linear-gradient(rgba(0,0,0,.6), transparent)', ...sans(22, '#fff', 700)}}>{chrome}</div>
      <div style={{position: 'absolute', left: 14, bottom: 14, right: 14, display: 'flex', alignItems: 'center', gap: 10}}>
        <span style={{...sans(18, '#fff', 600), opacity: 0.9}}>Sponsored</span>
        <span style={{marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, background: '#fff', ...sans(18, C.ink, 800)}}>Install</span>
      </div>
    </div>
  );
};
const Hand = ({x, y, press}) => (
  <svg style={{position: 'absolute', left: x - 18, top: y - 6, transform: `scale(${1 - 0.18 * press})`, transformOrigin: '18px 6px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.5))'}} width="64" height="78" viewBox="0 0 32 39">
    <path d="M10 2c1.7 0 3 1.3 3 3v11l1-.1V12c0-1.7 1.3-3 3-3s3 1.3 3 3v4l1 .1V14c0-1.6 1.3-2.8 2.9-2.8S27 12.4 27 14v3.6l.6.1c1.4.4 2.4 1.7 2.4 3.2V27c0 6.6-5.4 12-12 12h-1.5C11 39 7 36 5 31.5l-3.4-7.6c-.7-1.6 0-3.4 1.6-4.1 1.4-.6 3-.1 3.8 1.2L7 23V5c0-1.7 1.3-3 3-3z" fill="#fff" stroke="#141414" strokeWidth="1.4" />
  </svg>
);
const GAMEADS = [
  {clip: 'ar_phone', name: 'Aether Realms', icon: 'ar_cover.webp', color: '#2E9BFF', hook: 'One wrong card loses it all.', fail: 'DEFEAT', win: 'VICTORY!', path: [[150, 470], [90, 520], [210, 520]]},
  {clip: 'aos_phone', name: 'Age of Steam', icon: 'bgs-1.webp', color: '#E85D3A', hook: 'Can you link all 3 cities?', fail: 'DEAD END', win: 'ALL LINKED!', path: [[110, 260], [170, 330], [200, 420]], bar: true},
  {clip: 'wsv', name: 'WordSquare Versus', icon: 'wsv-1.webp', color: '#8A5CF6', hook: 'Beat them to the word!', fail: 'TOO SLOW', win: 'YOU WIN!', path: [[90, 300], [150, 300], [210, 300]], timer: true, pos: '22% 50%'},
];
const GameAd = ({g, abs, t0, beats}) => {
  // timeline relative to the drop: 0 hook, taps on beats, fail flash, retry, win flash, end card
  const T0 = t0, fail = T0 + 1.2, win = T0 + 2.2, end = T0 + 2.9;
  const tap = beats.filter((b) => b >= T0 + 0.4 && b < end);
  const ti = Math.max(0, idx(tap, abs)), pt = g.path[ti % g.path.length], prev = g.path[Math.max(0, ti - 1) % g.path.length];
  const k = lerp(abs, (tap[ti] ?? T0) - 0.3, tap[ti] ?? T0, 0, 1, EIO);
  const press = decay(tap, abs, 16);
  const hookS = lerp(abs, T0, T0 + 0.25, 0.4, 1);
  const flashF = abs >= fail && abs < fail + 0.6, flashW = abs >= win && abs < win + 0.8;
  const ec = lerp(abs, end, end + 0.35, 0, 1, EIO);
  const prog = abs < win ? lerp(abs, T0 + 0.5, fail, 0, 1 / 3) : lerp(abs, win - 0.6, win, 1 / 3, 1);
  const timer = lerp(abs, T0, win, 1, 0.08, Easing.linear);
  return (
    <div style={{width: 330, height: 690, borderRadius: 40, overflow: 'hidden', border: '7px solid #000', background: '#000', position: 'relative', boxShadow: `12px 12px 0 ${C.ink}`}}>
      <Clip name={g.clip} loop={7.9} style={{objectPosition: g.pos || '50% 50%'}} />
      <div style={{position: 'absolute', left: 12, right: 12, top: 34, padding: '14px 12px', borderRadius: 14, background: '#FFD400', transform: `scale(${hookS})`, ...sans(30, C.ink, 800), textAlign: 'center', lineHeight: 1.1}}>{g.hook}</div>
      {g.bar && <div style={{position: 'absolute', left: 30, right: 30, top: 150, height: 22, borderRadius: 11, background: 'rgba(0,0,0,.6)', overflow: 'hidden'}}><div style={{width: `${prog * 100}%`, height: '100%', background: '#3BD16F'}} /><div style={{position: 'absolute', inset: 0, textAlign: 'center', ...sans(16, '#fff', 800), lineHeight: '22px'}}>CITIES {Math.round(prog * 3)}/3</div></div>}
      {g.timer && <svg style={{position: 'absolute', right: 22, top: 150}} width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="28" stroke="rgba(0,0,0,.5)" strokeWidth="10" fill="none" /><circle cx="35" cy="35" r="28" stroke={timer < 0.3 ? '#FF3B30' : '#fff'} strokeWidth="10" fill="none" strokeDasharray={176} strokeDashoffset={176 * (1 - timer)} transform="rotate(-90 35 35)" /></svg>}
      {abs < end && <Hand x={prev[0] + (pt[0] - prev[0]) * k} y={prev[1] + (pt[1] - prev[1]) * k} press={press} />}
      {flashF && <div style={{position: 'absolute', inset: 0, background: 'rgba(255,40,40,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{...sans(54, '#fff', 800), transform: `rotate(-6deg) scale(${lerp(abs, fail, fail + 0.15, 1.6, 1)})`, textShadow: '0 4px 0 #900'}}>{g.fail}</div></div>}
      {flashW && <div style={{position: 'absolute', inset: 0, background: 'rgba(255,200,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{...sans(50, '#fff', 800), transform: `scale(${lerp(abs, win, win + 0.2, 1.8, 1)})`, textShadow: '0 4px 0 #B07800'}}>{g.win}</div></div>}
      <div style={{position: 'absolute', inset: 0, background: C.cream, transform: `translateY(${(1 - ec) * 100}%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
        <div style={{width: 160, height: 160, borderRadius: 36, overflow: 'hidden', boxShadow: '0 20px 40px -20px rgba(0,0,0,.5)'}}><Still src={g.icon} /></div>
        <div style={{...sans(32, C.ink, 800), textAlign: 'center', width: 280}}>{g.name}</div>
        <div style={{...sans(26, '#F5A300', 800)}}>★★★★★</div>
        <div style={{padding: '16px 46px', borderRadius: 999, background: g.color, ...sans(28, '#fff', 800), transform: `scale(${1 + 0.06 * decay(beats, abs)})`}}>INSTALL</div>
      </div>
    </div>
  );
};

// ======================= v12 look =======================
const P = {paper: '#EFEAE0', ink: '#151413', orange: '#FF4A1C', blue: '#2B50FF', sand: '#D9D0BF', mute: '#6E675C', white: '#FFFFFF'};
const fontHandle = typeof window !== 'undefined' ? delayRender('bricolage') : null;
if (typeof window !== 'undefined') {
  const faces = [new FontFace('Brico', `url(${staticFile('fonts/brico-latin.woff2')}) format('woff2')`, {weight: '200 800', stretch: '75% 100%'}),
    ...[['Heavy', 900], ['Bold', 700], ['Medium', 500], ['Book', 400]].map(([n, w]) => new FontFace('Blender', `url(${staticFile(`fonts/BlenderPro-${n}.woff2`)}) format('woff2')`, {weight: String(w)}))];
  Promise.allSettled(faces.map((ff) => ff.load().then((x) => document.fonts.add(x)))).then(() => continueRender(fontHandle));
}
const BR = (size, color = P.ink, wght = 800, wdth = 100) => ({fontFamily: 'Brico', fontSize: size, fontWeight: wght, fontStretch: `${wdth}%`, lineHeight: 0.9, letterSpacing: '-0.035em', color, whiteSpace: 'nowrap',
  fontVariationSettings: `"wdth" ${wdth}, "wght" ${wght}, "opsz" 96`});
const MONO = (size, color = P.mute) => ({fontFamily: DMMONO, fontSize: size, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color, whiteSpace: 'nowrap'});
const V = (name) => `v12/${name}`;
const Vid = ({name, from = 0, style}) => <PhVideo muted src={`${name}.mp4`} startFrom={f(from)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}} />;
const Pic = ({src, style}) => <PhImg src={src} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}} />;
const poster = (clip) => `v12/posters/${clip}.jpg`;
const pop = (abs, t, d = 0.14, k = 2) => lerp(abs, t, t + d, 0, 1, Easing.out(Easing.back(k)));
const tc = (abs) => { const s = Math.floor(abs), fr = Math.floor((abs - s) * 30); return `00:${String(s).padStart(2, '0')}:${String(fr).padStart(2, '0')}`; };
// frame chrome: tiny mono labels in the corners (section, timecode, context, tempo)
const Hud = ({abs, tl, bl, br, color = P.mute}) => <>
  <div style={{position: 'absolute', left: 44, top: 36, ...MONO(18, color)}}>{tl}</div>
  <div style={{position: 'absolute', right: 44, top: 36, ...MONO(18, color)}}>{tc(abs)}</div>
  {bl && <div style={{position: 'absolute', left: 44, bottom: 34, ...MONO(18, color)}}>{bl}</div>}
  {br && <div style={{position: 'absolute', right: 44, bottom: 34, ...MONO(18, color)}}>{br}</div>}
</>;
// fisheye: a radial displacement map, scale driven per frame
const Fish = ({id, scale}) => <svg width="0" height="0" style={{position: 'absolute'}}><filter id={id} x="-10%" y="-10%" width="120%" height="120%">
  <feImage href={asset('i/fishmap.png', true)} preserveAspectRatio="none" result="m" />
  <feDisplacementMap in="SourceGraphic" in2="m" scale={scale} xChannelSelector="R" yChannelSelector="G" /></filter></svg>;
// shape-morph wipe at a cut: grows from a point before t, then shrinks away as a rounded square after t
const Wipe = ({abs, t, color = P.orange, x = 960, y = 540, from = 'circle'}) => {
  if (abs < t - 0.17 || abs > t + 0.22) return null;
  const pin = lerp(abs, t - 0.17, t, 0, 1, EI), pout = lerp(abs, t, t + 0.22, 0, 1, EO);
  const s = abs < t ? pin * 2500 : (1 - pout) * 2500, r = abs < t ? 50 : 50 - 38 * pout;
  return <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: `${r}%`, background: color, transform: `rotate(${abs < t ? 0 : 45 * pout}deg)`}} />;
};
const BAUHAUS = ['circle', 'square', 'quarter', 'half', 'tri', 'pill'];
const Shape = ({kind, color, size}) => {
  const s = size;
  if (kind === 'circle') return <div style={{width: s, height: s, borderRadius: '50%', background: color}} />;
  if (kind === 'square') return <div style={{width: s, height: s, background: color}} />;
  if (kind === 'quarter') return <div style={{width: s, height: s, borderTopLeftRadius: s, background: color}} />;
  if (kind === 'half') return <div style={{width: s, height: s / 2, marginTop: s / 2, borderTopLeftRadius: s / 2, borderTopRightRadius: s / 2, background: color}} />;
  if (kind === 'pill') return <div style={{width: s, height: s * 0.5, marginTop: s * 0.25, borderRadius: s, background: color}} />;
  return <svg width={s} height={s} viewBox="0 0 10 10"><path d="M5 0L10 10H0Z" fill={color} /></svg>;
};
const SHAPE_COLORS = [P.orange, P.blue, P.ink, P.sand];

// ======================= 1 · open: shapes become the name =======================
const Open = () => {
  const abs = useCurrentFrame() / FPS;
  const NAME = 'Cemil', lt = (i) => 0.32 + i * 0.4;
  const k1 = E.kick.find((x) => x > 2.5) ?? 2.815;
  const acc = STEPS.filter((x) => x > 3.4 && x < Q.drop).slice(0, 4);
  const ai = idx(acc, abs);
  const BGS = [P.paper, P.orange, P.blue, P.sand, P.orange], FG = [P.ink, P.ink, P.paper, P.ink, P.ink];
  const kp = decay(E.kick.filter((x) => x >= k1 - 0.01), abs, 8);
  const wdth = abs < k1 ? 100 : 82 + 18 * (1 - kp);
  const fish = 150 * decay(acc, abs, 9) + 60 * decay(Q.introBurst, abs, 14);
  const zoom = lerp(abs, Q.drop - 0.3, Q.drop, 1, 9, EI);
  return <AbsoluteFill style={{background: BGS[ai + 1]}}>
    <Fish id="fo" scale={fish} />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom})`, transformOrigin: '30% 52%', filter: 'url(#fo)'}}>
      {NAME.split('').map((ch, i) => {
        const t = lt(i), sh = 1 - lerp(abs, t - 0.02, t + 0.1, 0, 1, EI), lp = pop(abs, t, 0.18, 2.2);
        const jit = decay(Q.introBurst, abs, 16) * (hash(i, lastHit(Q.introBurst, abs)) - 0.5) * 14;
        return <div key={i} style={{position: 'relative', display: 'inline-block'}}>
          <span style={{...BR(520, FG[ai + 1], 800, wdth), display: 'inline-block', opacity: abs >= t ? 1 : 0, transform: `scale(${0.55 + 0.45 * lp}) rotate(${jit}deg)`}}>{ch}</span>
          {abs < t + 0.1 && abs > t - 0.5 && <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) scale(${pop(abs, t - 0.36, 0.2) * sh})`}}>
            <Shape kind={BAUHAUS[i % 6]} color={SHAPE_COLORS[i % 3]} size={240} /></div>}
        </div>;
      })}
    </div>
    <Hud abs={abs} tl="01 · cemil" bl={abs >= k1 + 0.45 ? 'technical designer · ai video & tools' : ''} br="showreel 2026" color={ai >= 1 && ai <= 1 ? P.paper : P.mute} />
  </AbsoluteFill>;
};

// ======================= 2 · trends: five tiles, a staircase on the falling kicks, then the grid grows on the stutter =======================
const TR5 = [['9443_0', 'Dark alley'], ['8558_0', 'Giant hand'], ['9319_0', 'Giant head'], ['10584_0', 'Drift'], ['9582_0', 'Backrooms']];
const POOL = ['9443', '8558', '9319', '10584', '9582', '10494', '9833', '9502', '7974', '9915', '8894', '10563', '10543', '9805', '10716', '10069', '10490', '8130', '10553', '9828'];
const poolClip = (i) => { const tag = POOL[i % POOL.length], n = (CLIPS[tag]?.clips.length || 1); return `${tag}_${Math.floor(i / POOL.length) % n}`; };
const Trends = () => {
  const at = Q.drop, abs = at + useCurrentFrame() / FPS;
  const DESC = E.kick.filter((x) => x > Q.drop + 0.15 && x < Q.stutter1[0] - 0.1).slice(0, 4);
  const esc = [...Q.stutter1, ...Q.stutter2], ei = idx(esc, abs);
  const LAY = [[5, 1], [7, 2], [9, 3], [11, 4], [11, 4], [11, 4], [11, 4], [11, 4], [11, 4]];
  if (ei < 0) {
    return <AbsoluteFill style={{background: P.paper}}>
      {TR5.map(([c, lab], j) => {
        const p = pop(abs, at + j * 0.05, 0.16, 1.8), step = j === 0 ? 0 : 64 * lerp(abs, DESC[j - 1] ?? 99, (DESC[j - 1] ?? 99) + 0.12, 0, 1, Easing.out(Easing.back(2)));
        return <div key={c} style={{position: 'absolute', left: 225 + j * 300, top: 170 + step + (j ? 0 : 0), width: 270}}>
          <div style={{width: 270, height: 480, borderRadius: 14, overflow: 'hidden', transform: `scale(${0.7 + 0.3 * p})`}}><Vid name={V(c)} /></div>
          <div style={{marginTop: 16, ...MONO(18, P.ink)}}>{lab}</div>
        </div>;
      })}
      <Hud abs={abs} tl="02 · every trend" br="125 bpm" />
    </AbsoluteFill>;
  }
  const [cols, rows] = LAY[Math.min(ei + 1, LAY.length - 1)], n = cols * rows;
  const W = 1760, H = 860, g = 10, w = (W - (cols - 1) * g) / cols, h = (H - (rows - 1) * g) / rows;
  const wave = ei >= 3 ? ei - 3 : -1;                       // stutter2: every hit flips a diagonal band of tiles
  return <AbsoluteFill style={{background: P.paper}}>
    {Array.from({length: n}, (_, i) => {
      const c = i % cols, r = Math.floor(i / cols), d = (c + r) * 0.012, p = pop(abs, esc[Math.min(ei, 2)] + d, 0.12, 2);
      const flipped = wave >= 0 && (c + r) % 5 <= wave, fp = flipped ? decay([esc[3 + ((c + r) % 5)]], abs, 14) : 0;
      return <div key={i} style={{position: 'absolute', left: 80 + c * (w + g), top: 130 + r * (h + g), width: w, height: h, borderRadius: Math.min(12, w * 0.06), overflow: 'hidden', transform: `scale(${(0.6 + 0.4 * p) * (1 + 0.06 * fp)})`}}>
        <Pic src={poster(poolClip(i + (flipped ? 37 : 0)))} />
      </div>;
    })}
    <div style={{position: 'absolute', right: 44, top: 36, ...MONO(18, P.orange)}}>{`×${n}`}</div>
    <div style={{position: 'absolute', left: 44, top: 36, ...MONO(18)}}>02 · every trend</div>
  </AbsoluteFill>;
};

// ======================= 3 · "Every trend." as type; the pre-bell hits kick its letters =======================
const TypeTrend = () => {
  const at = Q.gap, abs = at + useCurrentFrame() / FPS;
  const hits = Q.preBells, hi = idx(hits, abs);
  const kp = decay(E.kick, abs, 9);
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', left: 110, top: 150}}>
      <div style={{...BR(330, P.ink, 800, 100 - 18 * kp), transform: `scale(${0.6 + 0.4 * pop(abs, Q.gapHits[0], 0.14, 2.4)})`, transformOrigin: '0 100%', opacity: abs >= Q.gapHits[0] ? 1 : 0}}>Every</div>
      <div style={{display: 'flex', marginTop: 10, opacity: abs >= Q.gapHits[1] ? 1 : 0}}>
        {'trend.'.split('').map((ch, i) => {
          const mine = hits.filter((_, k) => k % 6 === i), jump = decay(mine, abs, 10);
          return <span key={i} style={{...BR(330, P.orange, 800, 100), display: 'inline-block', marginRight: '-0.035em', transform: `translateY(${-50 * jump}px) scale(${0.6 + 0.4 * pop(abs, Q.gapHits[1] + i * 0.02, 0.14, 2.4)})`, transformOrigin: '50% 100%'}}>{ch}</span>;
        })}
      </div>
    </div>
    <Hud abs={abs} tl="03 · every trend" br={hi >= 0 ? `hit ${hi + 1}/${hits.length}` : ''} />
  </AbsoluteFill>;
};

// ======================= 4 · the bell: 4x4 grid on the first bell, one tile flips per eighth, gone when the bell stops =======================
const BELL_END = 14.35;
// v14 bell: vertical 3:4 cells (the clips are vertical), twenty different concepts, and on every bell hit one ad swaps in,
// jumps forward and the camera pushes toward it; the grid leaves when the bell stops (14.35)
const BELL_SET = ['9443_0', '8558_0', '10054_0', '10584_0', '9582_0', '10545_0', '9833_0', '7478_1', '9502_0', '9915_0', '8894_0', '9345_0',
  '10563_2', '10716_1', '9938_0', '10543_0', '8842_0', '10069_0', '10589_0', '9319_0', '10490_0', '8130_0', '10553_0', '9828_0'];
const Bell = () => {
  const at = Q.bells[0], abs = at + useCurrentFrame() / FPS;
  const hits = Q.bells.filter((t) => t < BELL_END - 0.1), flips = hits.slice(1);
  const POS = [7, 2, 10, 4, 1, 9, 5, 11];
  const cols = 6, rows = 2, cw = 280, ch = 373, g = 14, W = cols * cw + (cols - 1) * g, H = rows * ch + (rows - 1) * g, x0 = (1920 - W) / 2, y0 = (1080 - H) / 2 + 20;
  const land = pop(abs, at, 0.16, 1.8), n = idx(flips, abs), f0 = n >= 0 ? flips[n] : -9, fp = n >= 0 ? POS[n % POS.length] : -1;
  // focus: a fast jump at the hit, held a little, then settles before the next hit
  const foc = n >= 0 ? lerp(abs, f0, f0 + 0.07, 0, 1, EO) * (1 - lerp(abs, f0 + 0.14, f0 + 0.24, 0, 0.55, EIO)) : 0;
  const fx = fp >= 0 ? x0 + (fp % cols) * (cw + g) + cw / 2 : 960, fy = fp >= 0 ? y0 + Math.floor(fp / cols) * (ch + g) + ch / 2 : 540;
  const cam = 1 + 0.16 * foc, tx = (960 - fx) * 0.75 * foc, ty = (540 - fy) * 0.75 * foc;
  const clipOf = (p) => { let v = -1; flips.forEach((t, j) => { if (POS[j % POS.length] === p && t <= abs + 1e-4) v = j; }); return v < 0 ? {name: BELL_SET[p], t: at} : {name: BELL_SET[12 + v], t: flips[v]}; };
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${cam})`, transformOrigin: `${fx}px ${fy}px`}}>
      {Array.from({length: cols * rows}, (_, p) => {
        const c = clipOf(p), me = p === fp, s = me ? 1 + 0.55 * foc : 1 - 0.06 * foc;
        return <div key={p} style={{position: 'absolute', left: x0 + (p % cols) * (cw + g), top: y0 + Math.floor(p / cols) * (ch + g), width: cw, height: ch, borderRadius: 14, overflow: 'hidden',
          transform: `scale(${(0.8 + 0.2 * land) * s})`, zIndex: me ? 3 : 1, boxSizing: 'border-box', border: me && foc > 0.05 ? `${7 * foc}px solid ${P.orange}` : 'none', background: P.sand}}>
          <Sequence key={c.name} from={f(c.t - at)} layout="none"><Vid name={V(c.name)} from={0.4} /></Sequence>
        </div>;
      })}
    </div>
    <Hud abs={abs} tl="04 · every trend, every face" br={`${Math.max(1, n + 2)}/${hits.length}`} />
  </AbsoluteFill>;
};

// ======================= 5 · "Every face." one template, many people, cut on the kicks; the burst flips shapes over them =======================
const Faces = () => {
  const at = BELL_END, abs = at + useCurrentFrame() / FPS;
  const kk = E.kick.filter((x) => x >= at + 0.05 && x < Q.burst1[0] - 0.05);
  const k = Math.max(0, idx(kk, abs) + 1);
  const set = CLIPS['10563'].clips, B = Q.burst1;
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', left: 110, top: 300, ...BR(200, P.ink, 800, 100), transform: `scale(${0.6 + 0.4 * pop(abs, at + 0.05, 0.16, 2.2)})`, transformOrigin: '0 100%'}}>Every</div>
    <div style={{position: 'absolute', left: 110, top: 490, ...BR(200, P.orange, 800, 100), transform: `scale(${0.6 + 0.4 * pop(abs, at + 0.2, 0.16, 2.2)})`, transformOrigin: '0 100%'}}>face.</div>
    {[0, 1, 2, 3].map((j) => {
      const c = set[(j + k) % set.length], bi = B.filter((x) => x <= abs).length, cover = bi > 0 && (j + bi) % 2 === 0;
      return <div key={j} style={{position: 'absolute', left: 820 + j * 262, top: 250, width: 240, height: 427, borderRadius: 14, overflow: 'hidden', background: P.sand}}>
        <Sequence from={0} layout="none" key={c}><Vid name={V(c)} /></Sequence>
        {cover && <div style={{position: 'absolute', inset: 0, background: SHAPE_COLORS[(j + bi) % 3], display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Shape kind={BAUHAUS[(j + bi) % 6]} color={P.paper} size={190} /></div>}
      </div>;
    })}
    <Hud abs={abs} tl="05 · one template, every face" bl="pet dance · 8 variants" />
  </AbsoluteFill>;
};

// ======================= 6 · finished ads, then every ratio on the hi-hat pattern =======================
const AdsV12 = () => {
  const at = Q.burst1[Q.burst1.length - 1], abs = at + useCurrentFrame() / FPS;
  const phase = abs < D(7) ? 0 : 1;
  const RH = 250, GAP = 26, widths = RAT.map(([, r]) => RH * r), X0 = 1880 - (widths.reduce((a, b) => a + b, 0) + 3 * GAP);
  const xs = widths.map((_, i) => X0 + widths.slice(0, i).reduce((a, b) => a + b, 0) + i * GAP);
  return <AbsoluteFill style={{background: P.paper}}>
    {phase === 0 && [['ad_tinydesk', 4.4, 'compare'], ['ad_petdance', 5.4, 'montage'], ['ad_paintingkiss', 1, 'reveal']].map(([n, fr, lab], i) => {
      const ta = beatsIn(D(6), D(7))[i] ?? at, p = pop(abs, ta, 0.2, 1.6);
      const cuts = [ta, ...E.melody.filter((x) => x > ta + 0.15 && x < D(7) - 0.05)].filter((x, j, a) => j === 0 || x - a[j - 1] > 0.18);
      return abs >= ta && <div key={n} style={{position: 'absolute', left: 860 + i * 350, top: 170 + (1 - p) * 300}}>
        <div style={{width: 310, height: 551, borderRadius: 34, overflow: 'hidden', border: `6px solid ${P.ink}`, transform: `scale(${1 + 0.04 * decay(cuts, abs, 14)})`}}>
          <Swap at={at} times={cuts} end={D(7)} render={(j) => <Clip name={n} from={fr + ((j * 1.7 + i) % 6)} />} /></div>
        <div style={{...MONO(18, P.ink), marginTop: 18, textAlign: 'center'}}>{lab}</div>
      </div>;
    })}
    {phase === 1 && RAT.map(([lab, r], c) => {
      const hits = Q.ratioHits.slice(c * 3, c * 3 + 3);
      return <React.Fragment key={lab}>
        {abs >= hits[0] && <div style={{position: 'absolute', left: xs[c], width: widths[c], top: 110, textAlign: 'center', ...MONO(24, P.orange), transform: `scale(${1 + 0.3 * decay([hits[0]], abs, 14)})`}}>{lab}</div>}
        {['td', 'pd', 'pk'].map((ad, row) => {
          const ta = hits[row]; if (abs < ta) return null;
          return <div key={ad} style={{position: 'absolute', left: xs[c], top: 160 + row * (RH + GAP), width: widths[c], height: RH, borderRadius: 12, overflow: 'hidden', background: '#000', transform: `scale(${0.55 + 0.45 * pop(abs, ta, 0.13, 2.4)})`}}>
            <Sequence from={f(ta - at)} layout="none"><RatioAd ad={ad} ratio={r} w={widths[c]} h={RH} /></Sequence></div>;
        })}
      </React.Fragment>;
    })}
    <div style={{position: 'absolute', left: 110, top: 330}}>
      <div style={{...BR(170, P.ink), transform: `scale(${0.6 + 0.4 * pop(abs, phase ? D(7) : at + 0.05, 0.16, 2)})`, transformOrigin: '0 100%'}} key={'a' + phase}>{['Finished', 'Every'][phase]}</div>
      <div style={{...BR(170, P.orange), marginTop: 6, transform: `scale(${0.6 + 0.4 * pop(abs, (phase ? D(7) : at + 0.05) + 0.12, 0.16, 2)})`, transformOrigin: '0 100%'}} key={'b' + phase}>{['ads.', 'ratio.'][phase]}</div>
    </div>
    <Hud abs={abs} tl={phase ? '06 · every ratio' : '06 · finished ads'} br={phase ? '9:16 · 4:5 · 1:1 · 16:9' : 'compare · montage · reveal'} />
  </AbsoluteFill>;
};

// ======================= 7 · "I build the tools." then Ad Studio: one click per beat, the view zooms to the click =======================
const STEP_NAMES = ['trends', 'templates', 'batch', 'generate', 'review', 'launch'];
const AdStudioV15 = () => {
  const at = Q.insG[0], abs = at + useCurrentFrame() / FPS, [g0, g1] = GB, winT = g0[4];
  const ae = [{t: g0[5], x: 119, y: 208, s: 'v15/t1_templates.png'}, {t: g0[6], x: 931, y: 274, s: 'v15/t2_menu.png'}, {t: g0[7], x: 1073, y: 336, s: 'v15/t3_batch.png'}, {t: g1[0], x: 1103, y: 671.6, s: 'v15/t4_generating.png'},
    {t: g1[1], x: 119, y: 326, s: 'v15/t5_review.png'}, {t: g1[2], x: 959, y: 452, s: 'v15/t6_approved.png'}, {t: g1[3], x: 119, y: 355, s: 'v15/t7_launch.png'}];
  const SN = [0, 1, 1, 2, 3, 4, 4, 5];      // which step name is on screen after each click (the menu and the Approve click keep their screen's name)
  const ci = idx(ae.map((c) => c.t), abs), scr = ['v15/t0_trends.png', ...ae.map((c) => c.s)][ci + 1];
  const words = ['I', 'build', 'the', 'tools.'], wi = idx(g0.slice(0, 4), abs);
  if (abs < winT) {
    const kp = decay(g0.slice(0, 4), abs, 10);
    return <AbsoluteFill style={{background: wi % 2 ? P.orange : P.paper}}>
      {wi >= 0 && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{...BR(wi === 3 ? 470 : 560, wi % 2 ? P.paper : P.ink, 800, 75 + 25 * (1 - kp)), transform: `scale(${0.7 + 0.3 * pop(abs, g0[wi], 0.12, 2.4)})`}}>{words[wi]}</div></div>}
      <Hud abs={abs} tl="07 · tools" color={wi % 2 ? P.paper : P.mute} />
    </AbsoluteFill>;
  }
  const c = ae[Math.max(0, ci)], z = ci < 0 ? 0 : lerp(abs, c.t, c.t + 0.14, 0, 1, EO) * (1 - lerp(abs, c.t + 0.16, c.t + 0.30, 0, 1, EIO)), slam = lerp(abs, winT - 0.1, winT, 0, 1, EI);
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', left: 110, top: 300}}>
      <div style={{...BR(150, P.ink), transform: `scale(${0.6 + 0.4 * pop(abs, winT, 0.16, 2)})`, transformOrigin: '0 100%'}}>Ad</div>
      <div style={{...BR(150, P.orange), marginTop: 4, transform: `scale(${0.6 + 0.4 * pop(abs, winT + 0.1, 0.16, 2)})`, transformOrigin: '0 100%'}}>Studio</div>
      <div style={{...MONO(20, P.ink), marginTop: 40}}>from a trend to live ad sets</div>
    </div>
    <div style={{position: 'absolute', left: 700, top: 160, width: 1140, height: 712, borderRadius: 16, overflow: 'hidden', background: P.ink, transform: `translateY(${(1 - slam) * 900}px)`}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${c.x}px ${c.y}px`, transform: `scale(${1 + 0.16 * z})`}}>
        <Pic src={`i/${scr}`} style={{objectPosition: '50% 0%'}} />
        <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: 0.35 * decay(ae.map((q) => q.t), abs, 16)}} />
        <Cursor abs={abs} clicks={ae} gs={0.8} zs={1 + 0.16 * z} />
      </div>
    </div>
    <div style={{position: 'absolute', left: 700, top: 900, display: 'flex', gap: 22}}>
      {STEP_NAMES.map((s, i) => <div key={s} style={{...MONO(18, i <= SN[ci + 1] ? P.orange : P.mute)}}>{(i ? '→ ' : '') + s}</div>)}
    </div>
    <Hud abs={abs} tl="07 · ad studio" br="125 bpm" />
  </AbsoluteFill>;
};

// ======================= 8 · live on every feed: eight finished 4:5 ads, two per beat, then the Ad Cloner =======================
const PLATS = ['Reels', 'TikTok', 'Feed', 'Stories', 'Shorts', 'Reels', 'Feed', 'TikTok'];
const FEED14 = Array.from({length: 8}, (_, i) => `ads/f14_${i}`);
const FEED_END = 29.70;     // second half of the section belongs to the Ad Cloner
const Feed = () => {
  const at = FEED, abs = at + useCurrentFrame() / FPS;
  const T = beatsIn(FEED, FEED_END - 0.05).slice(0, 4);
  const ti = (i) => T[Math.floor(i / 2)] + (i % 2) * 0.06;
  const n = Array.from({length: 8}, (_, i) => ti(i)).filter((x) => x <= abs + 1e-4).length;
  const cw = 230, ch = 288, gx = 24;
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', left: 110, top: 300}}>
      <div style={{...BR(128, P.ink), transform: `scale(${0.6 + 0.4 * pop(abs, at, 0.16, 2)})`, transformOrigin: '0 100%'}}>Live on</div>
      <div style={{...BR(128, P.orange), marginTop: 4, transform: `scale(${0.6 + 0.4 * pop(abs, at + 0.1, 0.16, 2)})`, transformOrigin: '0 100%'}}>every feed.</div>
    </div>
    {Array.from({length: 8}, (_, i) => {
      const col = Math.floor(i / 2), row = i % 2, x = 800 + col * (cw + gx), y = 150 + row * (ch + 66), t = ti(i), on = abs >= t;
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: cw}}>
        <div style={{width: cw, height: ch, borderRadius: 14, border: `3px solid ${P.ink}`, overflow: 'hidden', background: P.paper, transform: `scale(${on ? 0.7 + 0.3 * pop(abs, t, 0.14, 2.2) : 1})`}}>
          {on && <Sequence from={f(t - at)} layout="none"><Vid name={FEED14[i]} /></Sequence>}</div>
        <div style={{...MONO(16, on ? P.ink : P.mute), marginTop: 10, textAlign: 'center'}}>{PLATS[i]}</div>
      </div>;
    })}
    <div style={{position: 'absolute', left: 116, top: 640, ...BR(110, P.orange, 800, 80), fontVariantNumeric: 'tabular-nums'}}>{n}/8</div>
    <Hud abs={abs} tl="08 · every feed" br="reels · tiktok · shorts · feed" />
  </AbsoluteFill>;
};

// ======================= 8b · Ad Cloner: the same ad, every face (faces blurred, the owner's own stays sharp) =======================
// v3 images: p<k>_c<n>.jpg = person k (0 = Cemil) in ad concept n; refA/a0..a7 = gas-station reference and its clones
const AC3 = (n) => `assets3/adclone/v3/${n}.jpg`;
const AC_CONCEPTS = {1: 'Paparazzi Mode', 2: 'Golden Hour', 4: 'Birthday Icon', 6: 'Y2K Christmas', 9: 'Winter Edit'};
const AdCloner = () => {
  const at = FEED_END, abs = at + useCurrentFrame() / FPS;
  const B = beatsIn(at - 0.05, Q.burst2[0] - 0.05);                       // 29.70 30.18 30.66 31.14 31.62
  const ph = abs < B[2] ? 0 : abs < B[4] ? 1 : 2;
  const card = (src, x, y, w, t, key, label) => { const p = pop(abs, t, 0.1, 2.2), on = abs >= t;
    return <div key={key} style={{position: 'absolute', left: x, top: y, width: w}}>
      <div style={{width: w, height: w * 1.25, borderRadius: 10, overflow: 'hidden', transform: `scale(${0.55 + 0.45 * p})`, opacity: on ? 1 : 0}}><Pic src={src} /></div>
      {label && <div style={{...MONO(15, P.ink), marginTop: 8, opacity: on ? 1 : 0}}>{label}</div>}</div>; };
  const concept = abs < B[3] ? 1 : 2;
  const lab = ph === 0 ? 'one ad → 8 faces' : ph === 1 ? `same ad · every face · ${AC_CONCEPTS[concept]}` : '11 faces × 10 ad concepts = 110 ads';
  let body;
  if (ph === 0) {
    const t = Array.from({length: 8}, (_, j) => B[0] + 0.12 * (j + 1));
    body = <>{card(AC3('refA'), 700, 330, 250, at, 'ref', 'reference ad')}
      <div style={{position: 'absolute', left: 968, top: 440, ...BR(64, P.orange), opacity: abs >= t[0] - 0.05 ? 1 : 0}}>→</div>
      {Array.from({length: 8}, (_, j) => card(AC3('a' + j), 1040 + (j % 4) * 196, 250 + Math.floor(j / 4) * 252, 180, t[j], 'a' + j))}</>;
  } else if (ph === 1) {
    // left: the ad template (Cemil's own version); right: the same ad for ten other people; on the next beat every tile switches concept
    const t = Array.from({length: 10}, (_, j) => B[2] + 0.045 * (j + 1)), flip = (j) => B[3] + 0.03 * j;
    body = <>{card(AC3(`p0_c${concept}`), 700, 330, 250, B[2], 'tpl' + concept, 'ad template')}
      <div style={{position: 'absolute', left: 968, top: 440, ...BR(64, P.orange), opacity: abs >= t[0] - 0.05 ? 1 : 0}}>→</div>
      {Array.from({length: 10}, (_, j) => { const c = abs >= flip(j) ? 2 : 1;
        return card(AC3(`p${j + 1}_c${c}`), 1040 + (j % 5) * 158, 280 + Math.floor(j / 5) * 214, 146, c === 2 ? flip(j) : t[j], `g${j}_${c}`); })}</>;
  } else {
    // the matrix: columns are people, rows are ad concepts
    const rows = [1, 2, 4, 6, 9], cols = 11, w = 140, g = 8, W = cols * w + (cols - 1) * g, x0 = (1920 - W) / 2, h = w * 1.25, y0 = (1080 - (rows.length * h + (rows.length - 1) * g)) / 2 - 10;
    body = rows.flatMap((n, r) => Array.from({length: cols}, (_, k) => { const t = B[4] + ((k + r) / (cols + rows.length)) * 0.26;
      return card(AC3(`p${k}_c${n}`), x0 + k * (w + g), y0 + r * (h + g), w, t, `m${r}_${k}`); }));
  }
  return <AbsoluteFill style={{background: P.paper}}>
    {ph < 2 && <div style={{position: 'absolute', left: 110, top: 300}}>
      <div style={{...BR(128, P.ink), transform: `scale(${0.6 + 0.4 * pop(abs, at, 0.16, 2)})`, transformOrigin: '0 100%'}}>Ad</div>
      <div style={{...BR(128, P.orange), marginTop: 4, transform: `scale(${0.6 + 0.4 * pop(abs, at + 0.1, 0.16, 2)})`, transformOrigin: '0 100%'}}>Cloner.</div>
    </div>}
    {body}
    <div key={lab} style={{position: 'absolute', left: ph < 2 ? 114 : 44, top: ph < 2 ? 640 : 1010, ...MONO(20, P.ink)}}>{lab}</div>
    <Hud abs={abs} tl="08b · ad cloner" br="nano banana · gemini · batch" />
  </AbsoluteFill>;
};

// ======================= 11 · game ads, three real UA formats on real recorded gameplay =======================
// fail/retry puzzle (Board Game Salon · Age of Steam), card-combo (Aether Realms), beat-the-clock (WordSquare)
const GA_W = 330, GA_H = 330 * (844 / 390), GA_K = GA_W / 390;
const ADS14 = [
  {id: 'aos', ev: GP_AOS.events, rate: 4, from: 0, name: 'Board Game Salon', sub: 'Age of Steam + 29 more', color: '#C8102E', hook: ['ONLY 1% FIND', 'THE BEST ROUTE'], hookBg: '#FFD400', hookFg: C.ink,
    beats: [{t: 2.08, kind: 'fail', text: 'FAIL'}, {t: 2.3, kind: 'tag', text: 'TRY AGAIN'}, {t: 2.47, kind: 'win', text: 'PERFECT!'}]},
  {id: 'ar', ev: GP_AR.events, rate: 3, from: 0, name: 'Aether Realms', sub: 'deck-building strategy', color: '#5B3FD9', hook: ['PICK THE CARDS', 'THAT WIN'], hookBg: '#FFFFFF', hookFg: '#1A1240',
    beats: [{t: 1.36, kind: 'tag', text: '+1 CARD'}, {t: 1.8, kind: 'tag', text: '+1 CARD'}, {t: 2.62, kind: 'win', text: 'COMBO x3!'}]},
  {id: 'wsv_unity', icon: 'wsv', ev: GP_WSV.events, rate: 3.2, from: 0, name: 'WordSquare Versus', sub: 'word race', color: '#7C5CFF', hook: ['BEAT THE', 'CLOCK!'], hookBg: '#FF6FB5', hookFg: '#FFFFFF',
    beats: [{t: 0.95, kind: 'pts', text: 'SHOW!'}, {t: 1.38, kind: 'pts', text: 'SNOW!'}, {t: 1.81, kind: 'pts', text: 'NONE!'}, {t: 2.1, kind: 'pts', text: 'HOPE!'}, {t: 2.37, kind: 'pts', text: 'OPEN!'}, {t: 2.5, kind: 'pts', text: 'ONES!'}, {t: 2.64, kind: 'win', text: 'NEW BEST!'}]},
];
const Badge = ({top, big}) => <div style={{padding: '6px 12px', borderRadius: 8, background: '#000', color: '#fff', fontFamily: SANS, lineHeight: 1.05, minWidth: 116}}>
  <div style={{fontSize: 9, fontWeight: 500}}>{top}</div><div style={{fontSize: 17, fontWeight: 700}}>{big}</div></div>;
const GameAd14 = ({a, abs, t0, endAt, beats}) => {
  const u = abs - t0, vt = Math.max(0, u - 0.15) * a.rate;           // seconds into the recording
  // finger: glide to each recorded tap/drag, press on it
  const ev = a.ev.map((e) => ({t: e.t / a.rate + 0.15, x: (e.x ?? e.x2) * GA_K, y: (e.y ?? e.y2) * GA_K, x1: (e.x1 ?? e.x) * GA_K, y1: (e.y1 ?? e.y) * GA_K, drag: e.type === 'drag', dur: (e.dur || 0) / a.rate}));
  const n = ev.filter((e) => e.t <= u + 1e-4).length, cur = ev[Math.min(n, ev.length - 1)], prev = ev[Math.max(0, n - 1)];
  let hx, hy;
  if (cur.drag && u >= cur.t && u < cur.t + cur.dur) { const k = (u - cur.t) / cur.dur; hx = cur.x1 + (cur.x - cur.x1) * k; hy = cur.y1 + (cur.y - cur.y1) * k; }
  else { const tgt = n < ev.length ? ev[n] : prev, st = n > 0 ? prev : {x: tgt.x1 + 60, y: tgt.y1 + 80}; const k = lerp(u, tgt.t - 0.22, tgt.t - 0.02, 0, 1, EIO);
    hx = (st.x ?? tgt.x) + ((tgt.drag ? tgt.x1 : tgt.x) - (st.x ?? tgt.x)) * k; hy = (st.y ?? tgt.y) + ((tgt.drag ? tgt.y1 : tgt.y) - (st.y ?? tgt.y)) * k; }
  const press = decay(ev.map((e) => e.t), u, 16);
  const end = lerp(abs, endAt, endAt + 0.3, 0, 1, EIO), hookP = pop(u, 0, 0.18, 2.2);
  const shake = a.beats.filter((b) => b.kind === 'fail').reduce((s, b) => s + (u > b.t && u < b.t + 0.25 ? Math.sin((u - b.t) * 90) * 8 * (1 - (u - b.t) / 0.25) : 0), 0);
  return <div style={{width: GA_W + 14, height: GA_H + 14, borderRadius: 44, background: '#000', padding: 7, boxSizing: 'border-box', transform: `translateX(${shake}px)`}}>
    <div style={{position: 'relative', width: GA_W, height: GA_H, borderRadius: 38, overflow: 'hidden', background: '#000'}}>
      <PhVideo muted src={`assets3/gameplay/${a.id}.mp4`} playbackRate={a.rate} startFrom={f(a.from)} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
      {/* hook */}
      <div style={{position: 'absolute', left: 14, right: 14, top: 40, padding: '10px 8px', borderRadius: 12, background: a.hookBg, textAlign: 'center', transform: `scale(${0.4 + 0.6 * hookP}) rotate(${-2 * hookP}deg)`, opacity: u < 2.0 ? 1 : 1 - lerp(u, 2.0, 2.15, 0, 1)}}>
        {a.hook.map((l) => <div key={l} style={{fontFamily: SANS, fontWeight: 900, fontSize: 25, lineHeight: 1.05, color: a.hookFg, letterSpacing: '-0.01em'}}>{l}</div>)}</div>
      {/* format beats */}
      {a.beats.map((b) => { const nx = a.beats.find((c) => c.t > b.t), on = u >= b.t && u < Math.min(b.t + 0.5, nx ? nx.t : 99); if (!on) return null; const p = pop(u, b.t, 0.12, 2.6);
        if (b.kind === 'fail') return <div key={b.t} style={{position: 'absolute', inset: 0, background: 'rgba(230,30,40,.38)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, color: '#fff', lineHeight: 0.9, transform: `scale(${2 - p})`}}>✕</div>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: '#fff', WebkitTextStroke: '3px #8A0010', transform: `rotate(-6deg) scale(${p})`}}>{b.text}</div></div>;
        if (b.kind === 'pts') return <div key={b.t} style={{position: 'absolute', right: 26, top: 300 - (u - b.t) * 120, fontFamily: SANS, fontWeight: 900, fontSize: 46, color: a.color, WebkitTextStroke: '2.5px #fff', whiteSpace: 'nowrap', transform: `scale(${p})`}}>{b.text}</div>;
        if (b.kind === 'tag') return <div key={b.t} style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center'}}><span style={{padding: '8px 18px', borderRadius: 999, background: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 26, color: C.ink, display: 'inline-block', transform: `scale(${p})`}}>{b.text}</span></div>;
        return <div key={b.t} style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,210,0,.22)'}}>
          <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 50, color: '#FFD400', WebkitTextStroke: '3px #6B3A00', transform: `scale(${2.2 - 1.2 * p}) rotate(-4deg)`}}>{b.text}</div></div>; })}
      {/* finger */}
      {u < endAt - t0 && <Hand x={hx} y={hy} press={press} />}
      {/* end card */}
      <div style={{position: 'absolute', inset: 0, background: '#F7F4EE', transform: `translateY(${(1 - end) * 100}%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
        <div style={{width: 128, height: 128, borderRadius: 30, overflow: 'hidden', background: '#fff'}}><PhImg src={`assets3/gameplay/icon_${a.icon || a.id}.png`} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 28, color: C.ink, textAlign: 'center'}}>{a.name}</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 16, color: '#6E675C', marginTop: -8}}>{a.sub}</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 20, color: '#F5A300'}}>★★★★★</div>
        <div style={{padding: '14px 44px', borderRadius: 999, background: a.color, fontFamily: SANS, fontWeight: 900, fontSize: 26, color: '#fff', transform: `scale(${1 + 0.07 * decay(beats, abs)})`}}>PLAY FREE</div>
        <div style={{display: 'flex', gap: 8, marginTop: 4}}><Badge top="Download on the" big="App Store" /><Badge top="GET IT ON" big="Google Play" /></div>
      </div>
    </div></div>;
};
const GameAdsV14 = () => {
  const at = Q.riser[0], abs = at + useCurrentFrame() / FPS;
  const beats = beatsIn(Q.drop2, Q.insD[0]), inAds = abs >= Q.drop2 - 0.01;
  return <AbsoluteFill style={{background: inAds ? P.paper : P.orange}}>
    {!inAds && <div style={{position: 'absolute', left: 110, top: 120}}>
      {['Game', 'ads.'].map((w, i) => <div key={w} style={{fontFamily: ANTON, fontSize: 380, lineHeight: 0.86, color: i ? P.paper : P.ink, textTransform: 'uppercase',
        opacity: abs >= Q.riser[i * 2] ? 1 : 0, transform: `translateX(${(1 - pop(abs, Q.riser[i * 2], 0.12, 2)) * -200}px)`}}>{w}</div>)}
    </div>}
    {inAds && <>
      {ADS14.map((a, i) => {
        const ta = Q.drop2 + i * 0.06, p = pop(abs, ta, 0.2, 1.6), endAt = Q.drop2 + 2.85 + i * 0.12;
        return <div key={a.id} style={{position: 'absolute', left: 700 + i * 390, top: 160 + (1 - p) * 300}}>
          <Sequence from={f(ta - at)} layout="none"><GameAd14 a={a} abs={abs} t0={ta} endAt={endAt} beats={beats} /></Sequence></div>;
      })}
      <div style={{position: 'absolute', left: 110, top: 330}}>
        {['Hook,', 'fail, win,', 'install.'].map((w, i) => <div key={w} style={{...BR(110, i === 1 ? P.orange : P.ink), opacity: abs >= Q.drop2 + i * 0.12 ? 1 : 0}}>{w}</div>)}
      </div>
    </>}
    <Hud abs={abs} tl="11 · game ads" br="ua formats · real gameplay of my games" color={inAds ? P.mute : P.ink} />
  </AbsoluteFill>;
};

// ======================= 9 · statics: words on the burst, then the descending staircase, then the stack =======================
const StaticsV12 = () => {
  const at = Q.burst2[0], abs = at + useCurrentFrame() / FPS, bu = Q.burst2;
  const stairs = Array.from({length: 7}, (_, i) => at + (25.96 - 24.387) + i * 0.24);
  const st3 = Q.stutter3, si = idx(st3, abs);
  const STATS = ['ads/st08.jpg', 'ads/st09.jpg', 'ads/st10.jpg', 'ads/st59.jpg', 'ads/st48.jpg', 'ads/gas_2.jpg', 'ads/gas_top.jpg', 'ads/st60.jpg', 'ads/st11.jpg', 'ads/st08.jpg'];
  const SRC = (i) => STATS[(i - 3) % STATS.length];
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', left: 110, top: 300}}>
      <div style={{...BR(170, P.ink), opacity: abs >= bu[0] ? 1 : 0, transform: `scale(${0.6 + 0.4 * pop(abs, bu[0], 0.14, 2.4)})`, transformOrigin: '0 100%'}}>Statics,</div>
      <div style={{display: 'flex', gap: 30, marginTop: 6}}>
        <div style={{...BR(170, P.orange), opacity: abs >= bu[3] ? 1 : 0, transform: `scale(${0.6 + 0.4 * pop(abs, bu[3], 0.14, 2.4)})`, transformOrigin: '0 100%'}}>every</div>
        <div style={{...BR(170, P.orange), opacity: abs >= bu[6] ? 1 : 0, transform: `scale(${0.6 + 0.4 * pop(abs, bu[6], 0.14, 2.4)})`, transformOrigin: '0 100%'}}>format.</div>
      </div>
    </div>
    {stairs.map((t, i) => {
      if (abs < t) return null;
      const p = pop(abs, t, 0.12, 1.8);
      const stack = si >= 0 ? lerp(abs, st3[Math.min(si, 3)], st3[Math.min(si, 3)] + 0.1, 0, 1, EO) * Math.min(1, (si + 1) / 4) : 0;
      const x = 1000 + i * 120, y = 60 + i * 96, sx = 1360, sy = 300;
      return <div key={i} style={{position: 'absolute', left: x + (sx - x) * stack, top: y + (sy - y) * stack - (1 - p) * 120, width: 300, height: 400, borderRadius: 14, overflow: 'hidden',
        transform: `rotate(${(i % 2 ? 4 : -4) * (1 - stack) + (i - 3) * 2 * stack}deg) scale(${0.7 + 0.3 * p})`}}><Pic src={SRC(i + 3)} /></div>;
    })}
    <Hud abs={abs} tl="09 · statics" br={abs >= stairs[0] ? `${Math.min(7, idx(stairs, abs) + 1)}/7 formats` : ''} />
  </AbsoluteFill>;
};

// ======================= 10 · the breakdown closes the AI part: the archive, 5,816 videos =======================
const Archive = () => {
  const at = Q.burst3, abs = at + useCurrentFrame() / FPS;
  const kk = E.kick.filter((x) => x >= at - 0.03 && x < Q.riser[0] - 0.05), ki = Math.max(0, idx(kk, abs));
  const count = abs < at ? 0 : Math.round(5816 * Math.pow((ki + 1) / kk.length, 1.4));
  const N = 24 * 14, rev = (i) => at + 0.05 + hash(i, 3) * (kk[kk.length - 2] - at);
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', left: 110, top: 250, ...BR(300, P.ink, 800, 90), fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.04 * decay(kk, abs, 12)})`, transformOrigin: '0 100%'}}>{count.toLocaleString('en-US')}</div>
    <div style={{position: 'absolute', left: 116, top: 560, ...BR(100, P.orange)}}>AI videos</div>
    <div style={{position: 'absolute', left: 120, top: 680, ...MONO(22, P.ink)}}>in my archive</div>
    <div style={{position: 'absolute', left: 1040, top: 200, width: 768, height: 448, backgroundImage: `url(${asset('i/mosaic.jpg')})`, backgroundSize: '768px 448px',
      WebkitMaskImage: 'none'}}>
      <svg width="768" height="448" style={{position: 'absolute', inset: 0}}>
        {Array.from({length: N}, (_, i) => abs < rev(i) ? <rect key={i} x={(i % 24) * 32} y={Math.floor(i / 24) * 32} width="32" height="32" fill={P.paper} /> : null)}
      </svg>
    </div>
    <Hud abs={abs} tl="10 · archive" bl="every tile is one video" />
  </AbsoluteFill>;
};

// ======================= 11 · game ads (Anton, stacked), then three UA ads =======================
const GameAdsV12 = () => {
  const at = Q.riser[0], abs = at + useCurrentFrame() / FPS;
  const beats = beatsIn(Q.drop2, Q.insD[0]);
  const inAds = abs >= Q.drop2 - 0.01;
  return <AbsoluteFill style={{background: inAds ? P.paper : P.orange}}>
    {!inAds && <div style={{position: 'absolute', left: 110, top: 120}}>
      {['Game', 'ads.'].map((w, i) => <div key={w} style={{fontFamily: ANTON, fontSize: 380, lineHeight: 0.86, color: i ? P.paper : P.ink, textTransform: 'uppercase',
        opacity: abs >= Q.riser[i * 2] ? 1 : 0, transform: `translateX(${(1 - pop(abs, Q.riser[i * 2], 0.12, 2)) * -200}px)`}}>{w}</div>)}
    </div>}
    {inAds && <>
      {GAMEADS.map((g, i) => {
        const ta = Q.drop2 + i * 0.06, p = pop(abs, ta, 0.2, 1.6);
        return <div key={g.name} style={{position: 'absolute', left: 760 + i * 380, top: 190 + (1 - p) * 300}}>
          <Sequence from={f(ta - at)} layout="none"><GameAd g={g} abs={abs} t0={Q.drop2} beats={beats} /></Sequence></div>;
      })}
      <div style={{position: 'absolute', left: 110, top: 330}}>
        {['Hook,', 'fail, win,', 'install.'].map((w, i) => <div key={w} style={{...BR(120, i === 1 ? P.orange : P.ink), opacity: abs >= Q.drop2 + i * 0.12 ? 1 : 0}}>{w}</div>)}
      </div>
    </>}
    <Hud abs={abs} tl="11 · game ads" br="ua formats, my own games" color={inAds ? P.mute : P.ink} />
  </AbsoluteFill>;
};

// ======================= 12 · one template, every variation (variation sets switch every two beats) =======================
const VSETS = [['10716', 'tiny desk'], ['9443', 'dark alley'], ['10584', 'drift'], ['10069', 'knights']];
const Variations = () => {
  const at = Q.insD[0], abs = at + useCurrentFrame() / FPS, d = DB[0];
  const si = Math.min(3, Math.max(0, Math.floor(idx(d, abs) / 2))), t0 = d[si * 2];
  const set = CLIPS[VSETS[si][0]].clips;
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', left: 110, top: 300}}>
      <div style={{...BR(130, P.ink), transform: `scale(${0.6 + 0.4 * pop(abs, at, 0.16, 2)})`, transformOrigin: '0 100%'}}>Creative</div>
      <div style={{...BR(130, P.orange), marginTop: 4, transform: `scale(${0.6 + 0.4 * pop(abs, at + 0.1, 0.16, 2)})`, transformOrigin: '0 100%'}}>Studio</div>
      <div style={{...MONO(20, P.ink), marginTop: 40}}>one template · every variation</div>
    </div>
    {Array.from({length: 8}, (_, i) => {
      const ta = t0 + i * (Q.dUnit / 32), c = set[i % set.length];
      return abs >= ta && <div key={si + '_' + i} style={{position: 'absolute', left: 760 + (i % 4) * 270, top: 170 + Math.floor(i / 4) * 370, width: 250, height: 350, borderRadius: 14, overflow: 'hidden', transform: `scale(${0.6 + 0.4 * pop(abs, ta, 0.1, 2)})`}}>
        <Sequence from={f(ta - at)} layout="none"><Vid name={V(c)} /></Sequence></div>;
    })}
    <Hud abs={abs} tl="12 · creative studio" bl={`${VSETS[si][1]} · ${set.length} variants`} br={`set ${si + 1}/4`} />
  </AbsoluteFill>;
};

// ======================= 13 · AI Studio: Generate on beat 1, UGC and app ads land on the eighths =======================
const UGC = ['7413_0', '10117_0', '10754_0', '9805_0', '10144_0', '7413_1', '10117_1', '10754_1', '9805_1', '10144_1', '7413_2', '10117_2'];
const AIStudioV12 = () => {
  const at = Q.insD[1], abs = at + useCurrentFrame() / FPS, d = DB[1];
  const pops = Array.from({length: 12}, (_, i) => d[2] + (i * Q.dUnit) / 16);
  const slam = lerp(abs, at - 0.1, at, 0, 1, EI);
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', left: 110, top: 300}}>
      <div style={{...BR(150, P.ink), transform: `scale(${0.6 + 0.4 * pop(abs, at, 0.16, 2)})`, transformOrigin: '0 100%'}}>AI</div>
      <div style={{...BR(150, P.orange), marginTop: 4, transform: `scale(${0.6 + 0.4 * pop(abs, at + 0.1, 0.16, 2)})`, transformOrigin: '0 100%'}}>Studio</div>
      <div style={{...MONO(20, P.ink), marginTop: 40}}>bulk image & video</div>
      <div style={{...MONO(20, P.ink), marginTop: 10}}>{'used daily by a 10‑person team'}</div>
    </div>
    {abs < pops[0] && <div style={{position: 'absolute', left: 700, top: 160, width: 1140, height: 712, borderRadius: 16, overflow: 'hidden', background: P.ink, transform: `translateY(${(1 - slam) * 900}px)`}}>
      <Pic src="i/v15/studio_ws.png" /><Cursor abs={abs} clicks={[{t: d[1], x: 236, y: 678}]} gs={0.8} /></div>}
    {UGC.map((c, i) => {
      const ta = pops[i]; if (abs < ta) return null;
      return <div key={c} style={{position: 'absolute', left: 700 + (i % 6) * 192, top: 170 + Math.floor(i / 6) * 350, width: 180, height: 320, borderRadius: 14, overflow: 'hidden', transform: `scale(${0.6 + 0.4 * pop(abs, ta, 0.1, 2)})`}}>
        <Sequence from={f(ta - at)} layout="none"><Vid name={V(c)} /></Sequence></div>;
    })}
    <Hud abs={abs} tl="13 · ai studio" bl="ugc · app ads · food" />
  </AbsoluteFill>;
};

// ======================= 14 · the tools, one per kick =======================
const ToolsList = () => {
  const at = Q.insD[1] + Q.dUnit, abs = at + useCurrentFrame() / FPS;
  // the first name is already there before its kick (no empty frames), and pops on the kick
  const names = ['AI Studio', 'Ad Studio', 'Creative Studio', 'Board Game Salon'], i = Math.max(0, idx(LIST_T, abs));
  const kp = decay(LIST_T, abs, 10);
  return <AbsoluteFill style={{background: i % 2 ? P.blue : P.paper}}>
    {i >= 0 && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{...BR(i >= 2 ? 230 : 300, i % 2 ? P.paper : P.ink, 800, 78 + 22 * (1 - kp)), transform: `scale(${0.7 + 0.3 * pop(abs, LIST_T[i], 0.12, 2.4)})`}}>{names[i]}</div></div>}
    <Hud abs={abs} tl="14 · tools" color={i % 2 ? P.paper : P.mute} />
  </AbsoluteFill>;
};

// ======================= 15 · gameplay, hard cuts on the stutter =======================
const PLAY12 = ['ar_skirmish', 'aos', 'ffp', 'compile', 'wsv', 'bgs_lib', 'ar_march', 'aos', 'ffp', 'ar_skirmish', 'compile', 'wsv'];
const PlayV12 = () => {
  const at = Q.stutter4[0], abs = at + useCurrentFrame() / FPS;
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', left: 120, top: 120, right: 120, bottom: 120, borderRadius: 18, overflow: 'hidden'}}>
      <Swap at={at} times={Q.stutter4} end={Q.stutter4[Q.stutter4.length - 1] + 0.3} render={(i) => <Clip name={PLAY12[i]} from={1} />} /></div>
    <Hud abs={abs} tl="15 · games i build" br={`${Math.max(1, idx(Q.stutter4, abs) + 1)}/${Q.stutter4.length}`} />
  </AbsoluteFill>;
};

// ======================= 16 · the other work, one per eighth =======================
const AR1 = ['ar_038coral_whisperer', 'ar_042oceanic_drifter', 'ar_049lumen_mender'], AR2 = ['ar_070sylvan_colossus', 'ar_062canopy_stalker', 'ar_110ember_wing'];
const WORKS = [['assets2/tile-studio/old_shot_215.png', 'Tile Studio · tile designer'], ['assets2/hexforge/ui_old_283.png', 'Hexforge · hex mask'], [AR1, 'Aether Realms · cards', 'cards'],
  ['assets2/creature-craft/ui_overview.jpg', 'Creature Craft'], ['assets3/misc-projects/movie-storyboard-test/download_(2).jpg', 'CineCast AI · storyboard'], ['assets2/aether-realms/mockup_1.jpg', 'Aether Realms · physical mock-up'],
  ['i/bgs/game_hansa_teutonica.png', 'Board Game Salon · Hansa Teutonica'], [AR2, 'Aether Realms · cards', 'cards'], ['i/bgs/library.png', 'Board Game Salon · library'],
  ['assets2/tile-studio/old_shot_208.png', 'Tile Studio'], ['assets2/bgs-tools/rules_finder_shelf.jpg', 'Rules Finder'],
  ['assets2/wimmelbilder/rec/gen', 'Infinite Wimmelbilder · generating', 'vid', 1.2], ['assets2/wimmelbilder/rec/gen', 'Infinite Wimmelbilder · generating', 'vid', 1.2],
  ['assets2/wimmelbilder/rec/d1', 'Infinite Wimmelbilder · stitched', 'vid', 0], ['assets2/wimmelbilder/rec/d2', 'Infinite Wimmelbilder · explore', 'vid', 0]];
const WorksV12 = () => {
  const at = Q.stutter4[Q.stutter4.length - 1] + 0.03, abs = at + useCurrentFrame() / FPS;
  const bb = beatsIn(at, Q.fast - 0.05), T = []; bb.forEach((b, i) => { T.push(b); if (bb[i + 1]) T.push((b + bb[i + 1]) / 2); });
  const k = Math.max(0, idx(T, abs)), w = WORKS[k % WORKS.length];
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', left: 110, top: 300}}>
      <div style={{...BR(140, P.ink), transform: `scale(${0.6 + 0.4 * pop(abs, at + 0.02, 0.16, 2)})`, transformOrigin: '0 100%'}}>Games</div>
      <div style={{...BR(140, P.orange), marginTop: 4, transform: `scale(${0.6 + 0.4 * pop(abs, at + 0.12, 0.16, 2)})`, transformOrigin: '0 100%'}}>& tools.</div>
    </div>
    <div style={{position: 'absolute', left: 700, top: 160, width: 1140, height: 712, borderRadius: 16, overflow: 'hidden', background: P.sand, transform: `scale(${1 + 0.03 * decay(T, abs, 14)})`}}>
      {w[2] === 'vid' ? <Sequence from={f((T[WORKS.findIndex((x) => x[0] === w[0])] ?? at) - at)} layout="none"><Vid name={w[0]} from={w[3]} /></Sequence> : w[2] === 'cards' ? <div style={{position: 'absolute', inset: 0, background: P.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28}}>{w[0].map((c, j) => <div key={c} style={{width: 300, height: 415, borderRadius: 14, overflow: 'hidden', transform: `translateY(${(1 - pop(abs, (T[k] ?? at) + j * 0.04, 0.12, 2)) * 60}px)`}}><Pic src={`assets3/aether-cards/${c}.jpg`} /></div>)}</div> : <Pic src={w[0]} key={k} />}</div>
    <div style={{position: 'absolute', left: 700, top: 900, ...MONO(20, P.ink)}}>{w[1]}</div>
    <Hud abs={abs} tl="16 · games & tools" br={`${String(k + 1).padStart(2, '0')}/${T.length}`} />
  </AbsoluteFill>;
};

// ======================= 17 · everything on one wall: doubles on every beat of the fast run, closes on the sweep =======================
const WALL = [...WORKS.filter((w) => !w[2]).map((w) => w[0]), 'assets2/wimmelbilder/dino_line.jpg', 'assets2/wimmelbilder/lab_line.jpg', 'assets2/hexforge/hex_city.png', 'assets2/hexforge/art_volcano.jpg', 'assets2/creature-craft/creature_01.jpg', 'assets2/aether-realms/mockup_5.jpg',
  'assets2/tile-studio/map_germany.jpg', 'i/v15/t0_trends.png', 'i/v15/studio_ws.png', 'i/bgs/game_twilight_struggle.png', 'i/bgs/game_kelp.png', 'i/bgs/game_galactic_cruise.png', 'ads/st59.jpg', 'ads/st60.jpg', 'ads/st11.jpg', 'ads/st50.jpg', 'ads/st09.jpg',
  ...Object.values(CLIPS).flatMap((v) => v.clips.slice(0, 2)).map(poster)];
const Wall = () => {
  const at = Q.fast, abs = at + useCurrentFrame() / FPS;
  const b0 = PBe[0], k = Math.max(0, idx(b0, abs));
  const LAY = [[1, 1], [2, 1], [2, 2], [4, 2], [4, 4], [8, 4], [8, 8], [16, 8]];
  const [cols, rows] = LAY[Math.min(k, 7)], n = cols * rows, W = 1760, H = 900, g = n > 32 ? 4 : 10, w = (W - (cols - 1) * g) / cols, h = (H - (rows - 1) * g) / rows;
  const close = lerp(abs, Q.sweep, Q.impact, 0, 1, EI);
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', inset: 0, transform: `scale(${1 - 0.9 * close}) rotate(${-25 * close}deg)`, borderRadius: `${50 * close}%`, overflow: 'hidden'}}>
      {Array.from({length: n}, (_, i) => <div key={i} style={{position: 'absolute', left: 80 + (i % cols) * (w + g), top: 90 + Math.floor(i / cols) * (h + g), width: w, height: h, borderRadius: Math.min(12, w * 0.06), overflow: 'hidden',
        transform: `scale(${0.7 + 0.3 * pop(abs, b0[k] + (i % 7) * 0.008, 0.1, 2)})`}}><Pic src={WALL[(i * 7 + k) % WALL.length]} /></div>)}
    </div>
    <div style={{position: 'absolute', right: 70, bottom: 50, ...BR(170, P.orange, 800, 80), opacity: 1 - close}}>×{n}</div>
    <Hud abs={abs} tl="17 · everything" br="154 bpm" />
  </AbsoluteFill>;
};


// ======================= 17 · Moonrakers as a system: card-text variables -> auto-styled text -> on the card -> edit once -> every card =======================
// the game's own look: navy ground, BlenderPro, its SVG icons and term colours (from the Moonrakers DB glossary)
const PB = [...PBe[0], ...PBe[1]];                     // the 16 beats of the fast run
const MR = {navy: '#1b1b33', mute: '#8b89a8', thruster: '#ffcd5c', reactor: '#57caf6', white: '#ffffff'};
const BP = (size, color = MR.white, w = 500) => ({fontFamily: 'Blender, Brico, sans-serif', fontSize: size, fontWeight: w, color, lineHeight: 1.12});
const MOON_A = (kind, lang) => asset(`assets3/moon/atlas_${kind}_${lang}.jpg`);
const MoonTile = ({i, w, h, lang, kind = 'tall'}) => {
  const rows = kind === 'tall' ? MOON.tallRows : MOON.sqRows;
  const c = i % MOON.cols, r = Math.floor(i / MOON.cols) % rows;
  return <div style={{width: '100%', height: '100%', backgroundImage: `url(${MOON_A(kind, lang)})`, backgroundSize: `${MOON.cols * w}px ${rows * h}px`, backgroundPosition: `${-c * w}px ${-r * h}px`}} />;
};
// the owner's EN -> TR glitch: for 0.16 s horizontal strips jump between the two languages
const GFlip = ({abs, t, en, tr}) => {
  if (abs < t) return en;
  if (abs > t + 0.16) return tr;
  const fr = Math.floor((abs - t) * 60);
  return <div style={{position: 'absolute', inset: 0}}>{tr}{[0, 1, 2, 3, 4, 5].map((k) => {
    const top = (hash(k, fr + t) * 90) | 0, hgt = 4 + ((hash(k + 9, fr) * 14) | 0), dx = (hash(k + 3, fr) - 0.5) * 40;
    return <div key={k} style={{position: 'absolute', inset: 0, clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - hgt)}% 0)`, transform: `translateX(${dx}px)`}}>{hash(k, fr) > 0.4 ? en : tr}</div>;
  })}</div>;
};
// Naka (hero 15), the real Turkish card text with its variables, as the TTC data stores it
const NAKA_RAW = [['{<style:thruster>}', 'tag'], ['{[[thruster]]}', 'thruster'], [' İtici', 'txt'], ['{</style>}', 'tag'], [' olarak oyna, bu kart dahil olmak üzere zaten oynanan her ', 'txt'],
  ['{<style:thruster>}', 'tag'], ['{[[thruster]]}', 'thruster'], [' İtici', 'txt'], ['{</style>}', 'tag'], [' kartı için ', 'txt'], ['{<style:reactor>}', 'tag'], ['+1 Aksiyon', 'txt'], ['{</style>}', 'tag'], [' kazan.', 'txt']];
const MIcon = ({name}) => <img src={asset(`assets3/moon-tool/icons/${name}.svg`)} style={{height: '1.0em', verticalAlign: '-0.14em', margin: '0 0.12em'}} />;
// Aether Realms card build: artwork, then frame, icons, text, layer by layer, with the digital version's parallax
// (pointer -> tilt of the whole card + each layer shifted by its depth: art -6, frame +2, text +3, icons +4/5 px per 245 px of card width)
const AR_CARDS = ['glade_mimic', 'sylvan_colossus', 'swamp_oracle'], AR_L = ['01_art', '02_frame', '03_icons', '04_text'], AR_DEPTH = [-6, 2, 4.5, 3];
const ParaCard = ({px, py = 0, w, h, layers, depths, pops = []}) => {
  const k = (w / 245) * 2.2;
  return <div style={{width: w, height: h, perspective: 900}}>
    <div style={{position: 'relative', width: w, height: h, borderRadius: w * 0.05, overflow: 'hidden', transform: `rotateY(${px * 7}deg) rotateX(${-py * 6}deg)`}}>
      {layers.map((src, i) => <div key={src} style={{position: 'absolute', inset: 0, transform: `translate(${px * depths[i] * k}px, ${py * depths[i] * k * 0.6 - (1 - (pops[i] ?? 1)) * 40}px) scale(${i === 0 ? 1.06 : 1})`, opacity: pops[i] ?? 1}}>
        <PhImg src={src} style={{width: '100%', height: '100%', display: 'block'}} /></div>)}
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${50 + px * 45}% ${35 + py * 40}%, rgba(255,255,255,.22), rgba(255,255,255,0) 55%)`, mixBlendMode: 'screen'}} />
    </div></div>;
};
const ARBuild = ({abs, step, t}) => {
  const t0 = t - step * (L154 / 2 + 0.02);
  const px = Math.sin((abs - t0) * 3.2 - 0.6) * 0.85, py = Math.cos((abs - t0) * 2.1) * 0.5;
  return <div style={{position: 'absolute', inset: 0, background: P.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36}}>
    {AR_CARDS.map((c, j) => <ParaCard key={c} px={px} py={py} w={310} h={310 * 1360 / 982} depths={AR_DEPTH}
      layers={AR_L.slice(0, step + 1).map((l) => `assets3/ar-build/${c}/${l}.png`)} pops={AR_L.slice(0, step + 1).map((_, i) => (i === step ? pop(abs, t + j * 0.03, 0.12, 1.8) : 1))} />)}
  </div>;
};
// ======================= 16 · games & tools, one project each, the tools' own screens; Moonrakers continues in the same frame =======================
const COVER = (i) => `assets3/bgs-covers/jpg/${BGS_COVERS[((i % BGS_COVERS.length) + BGS_COVERS.length) % BGS_COVERS.length]}`;
const WIN = {x: 700, y: 160, w: 1140, h: 712};
const GT_TITLE = ({abs, at, still}) => <div style={{position: 'absolute', left: 110, top: 300}}>
  <div style={{...BR(140, P.ink), transform: still ? 'none' : `scale(${0.6 + 0.4 * pop(abs, at + 0.02, 0.16, 2)})`, transformOrigin: '0 100%'}}>Games</div>
  <div style={{...BR(140, P.orange), marginTop: 4, transform: still ? 'none' : `scale(${0.6 + 0.4 * pop(abs, at + 0.12, 0.16, 2)})`, transformOrigin: '0 100%'}}>& tools.</div>
</div>;
// slots on the eighths: [kind, payload, label]; consecutive slots of one project share its label
const WORKS14 = [['pic', 'assets3/clean/tile_draw1.jpg', 'Tile Studio · tile designer'], ['pic', 'assets3/clean/tile_215.png', 'Tile Studio · tile designer'],
  ['pic', 'assets2/hexforge/ui_old_283.png', 'Hexforge · hex mask over the art'],
  ['ar', 0, 'Aether Realms · card build'], ['ar', 1, 'Aether Realms · card build'], ['ar', 2, 'Aether Realms · card build'], ['ar', 3, 'Aether Realms · card build'],
  ['pic', 'assets2/creature-craft/ui_overview.jpg', 'Creature Craft'], ['pic', 'assets3/misc-projects/movie-storyboard-test/download_(2).jpg', 'CineCast AI · storyboard'],
  ['covers', 0, 'Board Game Salon · AI vector covers'], ['covers', 1, 'Board Game Salon · AI vector covers'], ['covers', 2, 'Board Game Salon · AI vector covers'],
  ['pic', 'assets3/clean/rules_project.jpg', 'Rules Finder'],
  ['vid', 'assets2/wimmelbilder/rec/gen', 'Infinite Wimmelbilder · generating'], ['vid', 'assets2/wimmelbilder/rec/gen', 'Infinite Wimmelbilder · generating']];
// Board Game Salon covers: four in a row, each swapping on the sixteenths, staggered
const Covers = ({abs, t0}) => {
  const n = Math.max(0, Math.floor((abs - t0) / (L154 / 4)));
  return <div style={{position: 'absolute', inset: 0, background: P.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
    {[0, 1, 2, 3].map((j) => { const k = Math.max(0, Math.floor((abs - t0 - j * 0.03) / (L154 / 4))), p = pop(abs, t0 + k * (L154 / 4) + j * 0.03, 0.08, 1.6);
      return <div key={j} style={{width: 255, height: 340, borderRadius: 10, overflow: 'hidden', transform: `translateY(${(1 - p) * 18}px)`}}><Pic src={COVER(j * 7 + k * 3)} /></div>; })}
  </div>;
};
const WorksV14 = () => {
  const at = Q.stutter4[Q.stutter4.length - 1] + 0.03, abs = at + useCurrentFrame() / FPS;
  const bb = beatsIn(at, Q.fast - 0.05), T = []; bb.forEach((b, i) => { T.push(b); if (bb[i + 1]) T.push((b + bb[i + 1]) / 2); });
  const k = Math.min(WORKS14.length - 1, Math.max(0, idx(T, abs))), [kind, val, label] = WORKS14[k];
  const first = WORKS14.findIndex((w) => w[2] === label), tStart = first === 0 ? at : T[first];
  let body;
  if (kind === 'pic') body = <Pic src={val} key={k} />;
  else if (kind === 'vid') body = <Sequence from={f(tStart - at)} layout="none"><Vid name={val} from={1.2} /></Sequence>;
  else if (kind === 'covers') body = <Covers abs={abs} t0={tStart} />;
  else body = <ARBuild abs={abs} step={val} t={T[k]} />;
  return <AbsoluteFill style={{background: P.paper}}>
    <GT_TITLE abs={abs} at={at} />
    <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 16, overflow: 'hidden', background: P.sand, transform: `scale(${1 + 0.025 * decay(T, abs, 14)})`}}>{body}</div>
    <div key={label} style={{position: 'absolute', left: WIN.x, top: 900, ...MONO(20, P.ink)}}>{label}</div>
    <Hud abs={abs} tl="16 · games & tools" />
  </AbsoluteFill>;
};

// ======================= 17 · Moonrakers TR in the same frame: variables -> auto-styled text -> EN/TR card -> one edit, every card =======================
const MoonSys = () => {
  const at = Q.fast, abs = at + useCurrentFrame() / FPS, h = L154 / 2;
  // the three styled spans resolve on the eighths after one and a half beats of raw code
  const RES = [PB[2], PB[2] + h, PB[3]], CARD = PB[3] + h, FLIP = PB[4], BATCH = PB[5];
  const lab = abs < PB[2] ? 'card text · variables' : abs < CARD ? 'variables → styles + icons' : abs < BATCH ? 'en → tr' : 'one edit · every card';
  const reveal = lerp(abs, at, at + 0.28, 0, 1, Easing.linear);
  let shown = Math.floor(reveal * NAKA_RAW.reduce((n, [x]) => n + x.length, 0));
  const raw = <div style={{position: 'absolute', left: 56, top: 70, width: 640, fontFamily: DMMONO, fontSize: 25, lineHeight: 1.55, color: MR.white}}>
    {NAKA_RAW.map(([x, kd], j) => { const part = x.slice(0, Math.max(0, shown)); shown -= x.length; return <span key={j} style={{color: kd === 'tag' ? MR.mute : kd === 'thruster' ? MR.thruster : MR.white, background: kd === 'thruster' ? 'rgba(255,205,92,.16)' : 'none'}}>{part}</span>; })}</div>;
  // a span shows its raw tokens until its eighth, then pops into the game's style with its icon
  const span = (j, rawTxt, color, kids) => abs < RES[j]
    ? <span style={{fontFamily: DMMONO, fontSize: '0.5em', color: MR.mute, background: 'rgba(255,205,92,.16)'}}>{rawTxt}</span>
    : <span style={{display: 'inline-block', color, fontWeight: 700, transform: `scale(${0.5 + 0.5 * pop(abs, RES[j], 0.12, 2.6)})`}}>{kids}</span>;
  const line = <div style={{position: 'absolute', left: 56, top: 70, width: 640, ...BP(44)}}>
    {span(0, '{<style:thruster>}{[[thruster]]} İtici{</style>}', MR.thruster, <><MIcon name="Thruster" />İtici</>)} olarak oyna, bu kart dahil olmak üzere zaten oynanan her{' '}
    {span(1, '{<style:thruster>}{[[thruster]]} İtici{</style>}', MR.thruster, <><MIcon name="Thruster" />İtici</>)} kartı için {span(2, '{<style:reactor>}+1 Aksiyon{</style>}', MR.reactor, '+1 Aksiyon')} kazan.</div>;
  let inner;
  if (abs < BATCH) {
    const cw = 330, ch = cw / 0.698, p = pop(abs, CARD, 0.16, 1.5);
    inner = <>
      {abs < PB[2] ? raw : line}
      {abs >= CARD && <div style={{position: 'absolute', left: 760, top: (712 - ch) / 2, width: cw, height: ch, borderRadius: 14, overflow: 'hidden', transform: `translateX(${(1 - p) * 260}px) scale(${1 + 0.05 * decay([FLIP + 0.04], abs, 10)})`}}>
        <ParaCard px={Math.sin((abs - CARD) * 3.2) * 0.85} py={Math.cos((abs - CARD) * 2.1) * 0.4} w={cw} h={ch} depths={[0]} layers={[abs < FLIP + 0.04 ? 'assets3/moon/hero_15_en.jpg' : 'assets3/moon/hero_15_tr.jpg']} />
        {abs >= FLIP + 0.04 && abs < FLIP + 0.2 && <div style={{position: 'absolute', inset: 0}}><GFlip abs={abs} t={FLIP + 0.04} en={<Pic src="assets3/moon/hero_15_en.jpg" />} tr={<Pic src="assets3/moon/hero_15_tr.jpg" />} /></div>}</div>}
      {abs >= CARD && <div style={{position: 'absolute', left: 760, top: 18, ...BP(22, MR.mute, 500), letterSpacing: '0.16em'}}>{abs < FLIP + 0.04 ? 'EN' : 'TR'}</div>}
    </>;
  } else {   // twelve cards re-render at once
    const n = 12, cols = 6, ch = 300, cw = ch * 0.698, gap = 14, W = cols * cw + (cols - 1) * gap, x0 = (1140 - W) / 2, y0 = (712 - (2 * ch + gap)) / 2;
    inner = Array.from({length: n}, (_, i) => {
      const d = (i % cols) + Math.floor(i / cols), p = pop(abs, BATCH + d * 0.01, 0.1, 2);
      return <div key={i} style={{position: 'absolute', left: x0 + (i % cols) * (cw + gap), top: y0 + Math.floor(i / cols) * (ch + gap), width: cw, height: ch, borderRadius: 8, overflow: 'hidden', transform: `scale(${0.75 + 0.25 * p})`}}>
        <GFlip abs={abs} t={BATCH + 0.12 + d * 0.025} en={<MoonTile i={i * 13 + 5} w={cw} h={ch} lang="en" />} tr={<MoonTile i={i * 13 + 5} w={cw} h={ch} lang="tr" />} /></div>;
    });
  }
  const beatsHere = PB.slice(0, 6);
  return <AbsoluteFill style={{background: P.paper}}>
    <GT_TITLE abs={abs} at={at} still />
    <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 16, overflow: 'hidden', background: MR.navy, transform: `scale(${1 + 0.025 * decay(beatsHere, abs, 14)})`}}>{inner}</div>
    <div key={lab} style={{position: 'absolute', left: WIN.x, top: 900, ...MONO(20, P.ink)}}>Moonrakers TR · {lab}</div>
    <Hud abs={abs} tl="16 · games & tools" />
  </AbsoluteFill>;
};

// ======================= 18 · finale: three real numbers, a mosaic storm, four verbs, the name =======================
const NUMS = [['4×', 'faster ad production', 'with AI pipelines', 'performance within 5–10% of hand-made', P.orange], ['~90%', 'of AI-remixed ads', 'usable as delivered', 'ad remix pipeline', P.ink],
  ['−40%', 'live-ops asset', 'delivery time', 'n8n + scripts automation', P.blue], ['5,816', 'AI videos', 'in the archive', '', P.orange], ['20', 'parametric After', 'Effects templates', '', P.ink],
  ['40', 'AI models wired', 'into AI Studio', '', P.blue], ['20+', 'custom tools', 'built and maintained', '', P.orange], ['30', 'board games', 'implemented digitally', '', P.ink],
  ['1,000+', 'board-game cards', 'localised EN → TR', '', P.blue], ['73', 'cards in my own', 'game, Aether Realms', '', P.orange]];
// arrivals: three on the beats, then the rest on the sixteenths; earlier rows squeeze to make room
const NUM_T = [PB[6], PB[7], PB[8], ...Array.from({length: 7}, (_, j) => PB[8] + L154 / 2 + (j * L154) / 4)];
const numLay = (n, i) => n <= 3 ? {x: 110, y: 110 + i * 290, s: 1} : n <= 5 ? {x: 110, y: (1080 - n * 210) / 2 + 20 + i * 210, s: 0.72}
  : {x: i < 5 ? 110 : 1010, y: 150 + (i % 5) * 168, s: 0.52};
const WORDS = ['Seedance', 'Kling', 'Runway', 'Nano Banana', 'ComfyUI', 'After Effects', 'Photoshop', 'Blender', 'Unity', 'Remotion', 'Claude Code', 'n8n', 'AWS', 'Cloudflare', 'Firebase',
  'Play Console', 'App Store Connect', 'agentic workflows', 'batch editing', 'variables → styles', 'team training', 'workshops', 'tutorials', 'knowledge transfer', 'tool development', 'maintenance', 'brief → delivery'];
const PROJ = [['assets3/clean/tile_215.png', 'Tile Studio'], ['i/v15/studio_ws.png', 'AI Studio'], ['assets3/clean/ar_mockup5.jpg', 'Aether Realms'], ['covers', 'Board Game Salon'],
  ['assets2/hexforge/ui_old_283.png', 'Hexforge'], ['assets3/clean/cs1.jpg', 'Creative Studio'], ['assets2/creature-craft/ui_overview.jpg', 'Creature Craft'], ['assets2/wimmelbilder/rec_gen_2.5.jpg', 'Infinite Wimmelbilder'],
  ['assets3/clean/wsv1.jpg', 'WordSquare Versus'], ['assets3/misc-projects/movie-storyboard-test/download.jpg', 'CineCast'], ['assets3/clean/rules_project.jpg', 'Rules Finder']];
const CHANGES = Array.from({length: 10}, (_, s2) => (s2 === 0 ? Array.from({length: 12}, (_, c) => c) : Array.from({length: 12}, (_, c) => c).filter((c) => (c * 5 + s2 * 3) % 12 < 3)));
const MOSAIC = (() => {
  const out = {}, cur = {}; let wi = 0, pi = 0;
  CHANGES.forEach((cells, s2) => cells.forEach((c) => {
    const img = (c + s2) % 2 === 1;
    if (img) { const shown = Object.values(cur).filter((m) => m.img).map((m) => m.i); while (shown.includes(pi % PROJ.length)) pi++; out[c + '_' + s2] = {img, i: pi % PROJ.length}; pi++; }
    else { out[c + '_' + s2] = {img, i: wi % WORDS.length}; wi++; }
    cur[c] = out[c + '_' + s2];
  }));
  return out;
})();
const CELLBG = [[P.orange, P.paper], [P.blue, P.paper], [P.sand, P.ink], [P.paper, P.ink]];
const Finale = () => {
  const at = PB[6], abs = at + useCurrentFrame() / FPS;
  const close = lerp(abs, Q.sweep, Q.impact, 0, 1, EI);
  if (abs < PB[10] + L154 / 2) {      // numbers: one, two, three, then more and more, the earlier ones squeeze
    const n = NUM_T.filter((t) => t <= abs + 1e-4).length, m = lerp(abs, NUM_T[n - 1], NUM_T[n - 1] + 0.1, 0, 1, EO);
    return <AbsoluteFill style={{background: P.paper}}>
      {NUMS.slice(0, n).map(([num, a1, a2, sub, c], i) => {
        const A = i < n - 1 ? numLay(n - 1, i) : numLay(n, i), B = numLay(n, i), x = A.x + (B.x - A.x) * m, y = A.y + (B.y - A.y) * m, sc = A.s + (B.s - A.s) * m;
        const p = pop(abs, NUM_T[i], 0.12, 1.8);
        return <div key={num} style={{position: 'absolute', left: x, top: y, height: 260, display: 'flex', alignItems: 'center', gap: 44, transformOrigin: '0 0', transform: `scale(${sc}) translateX(${(1 - p) * -140}px)`}}>
          <div style={{...BR(230, c, 800, 88)}}>{num}</div>
          <div><div style={{...BR(66, P.ink, 750, 85), lineHeight: 1}}>{a1}<br />{a2}</div>{sub && <div style={{...MONO(19, P.mute), marginTop: 14, opacity: sc > 0.8 ? 1 : 0}}>{sub}</div>}</div></div>;
      })}
      <Hud abs={abs} tl="19 · numbers" />
    </AbsoluteFill>;
  }
  if (abs < PB[12]) {     // mosaic: words and projects swap in on eighths, then sixteenths
    const L = L154, slots = [PB[10] + L / 2, PB[11], PB[11] + L / 4, PB[11] + L / 2, PB[11] + (3 * L) / 4];
    const k = Math.max(0, idx(slots, abs)), cols = 4, rows = 3, gx = 10, x0 = 40, y0 = 40;
    const cw = (1920 - 2 * x0 - (cols - 1) * gx) / cols, ch = (1080 - 2 * y0 - (rows - 1) * gx) / rows;
    const ver = (c) => { let v = 0; for (let s2 = 1; s2 <= k; s2++) if (CHANGES[s2].includes(c)) v = s2; return v; };
    return <AbsoluteFill style={{background: P.paper}}>
      {Array.from({length: 12}, (_, c) => {
        const v = ver(c), m = MOSAIC[c + '_' + v], p = pop(abs, slots[v], 0.1, 2);
        const left = x0 + (c % cols) * (cw + gx), top = y0 + Math.floor(c / cols) * (ch + gx);
        let body;
        if (m.img) { const [src, name] = PROJ[m.i];
          const [bg, fg] = [[P.sand, P.ink], [P.blue, P.paper], [P.orange, P.paper]][m.i % 3];
          body = <div style={{position: 'absolute', inset: 0, background: bg}}>
            {src === 'covers' ? <div style={{position: 'absolute', left: 18, top: 16, right: 18, bottom: 64, display: 'flex', justifyContent: 'center', gap: 12}}>{[0, 1].map((j) => <div key={j} style={{width: 186, height: 248, borderRadius: 8, overflow: 'hidden'}}><Pic src={COVER(Math.floor((abs - PB[10]) / (L154 / 4)) * 2 + j * 5)} /></div>)}</div>
              : <div style={{position: 'absolute', left: 18, top: 18, right: 18, bottom: 64, borderRadius: 8, overflow: 'hidden'}}><Pic src={src} style={{objectPosition: '50% 30%'}} /></div>}
            <div style={{position: 'absolute', left: 20, bottom: 16, ...BR(36, fg, 800, 85)}}>{name}</div></div>; }
        else { const word = WORDS[m.i], parts = word.length > 11 && word.includes(' ') ? [word.slice(0, word.indexOf(' ')), word.slice(word.indexOf(' ') + 1)] : [word], [bg, fg] = CELLBG[m.i % 4];
          const size = Math.min(104, (cw - 50) / (Math.max(...parts.map((x) => x.length)) * 0.47));
          body = <div style={{position: 'absolute', inset: 0, background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>{parts.map((x) => <div key={x} style={{...BR(size, fg, 800, 85), lineHeight: 0.95}}>{x}</div>)}</div>; }
        return <div key={c + '_' + v} style={{position: 'absolute', left, top, width: cw, height: ch, borderRadius: 14, overflow: 'hidden', transform: `scale(${0.75 + 0.25 * p})`}}>{body}</div>;
      })}
    </AbsoluteFill>;
  }
  // four verbs, one per beat; the last one closes into a circle on the sweep
  const VERBS = [['Make.', P.paper, P.ink], ['Build.', P.blue, P.paper], ['Ship.', P.orange, P.paper], ['Scale.', P.paper, P.ink]];
  const i = Math.max(0, Math.min(3, idx(PB.slice(12), abs))), [w, bg, fg] = VERBS[i];
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', inset: 0, background: bg, borderRadius: `${50 * close}%`, transform: `scale(${1 - 0.9 * close}) rotate(${-20 * close}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div key={i} style={{...BR(430, fg, 800, lerp(abs, PB[12 + i], PB[12 + i] + 0.3, 75, 95)), transform: `scale(${0.7 + 0.3 * pop(abs, PB[12 + i], 0.12, 2)})`}}>{w}</div>
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 34, ...MONO(20, bg === P.paper ? P.mute : P.paper), opacity: 1 - close}}>technical designer · mobile marketing · next to ua</div>
  </AbsoluteFill>;
};

// ======================= 18 · end card on the final hit =======================
const EndV12 = () => {
  const abs = Q.impact + useCurrentFrame() / FPS;
  const s = lerp(abs, Q.impact, Q.impact + 0.3, 1.25, 1, EO), wd = lerp(abs, Q.impact, Q.impact + 0.5, 75, 100, EO);
  return <AbsoluteFill style={{background: P.paper}}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{...BR(560, P.ink, 800, wd), transform: `scale(${s})`}}>Cemil</div></div>
    <div style={{position: 'absolute', left: 44, bottom: 34, ...MONO(22, P.ink), opacity: abs > Q.impact + 0.4 ? 1 : 0}}>technical designer · ai video & tools</div>
    <div style={{position: 'absolute', right: 44, bottom: 30, ...BR(64, P.orange, 800, 90), opacity: abs > Q.impact + 0.8 ? 1 : 0}}>cemil.al</div>
    <div style={{position: 'absolute', left: 44, top: 36, ...MONO(18)}}>showreel 2026</div>
  </AbsoluteFill>;
};

// ======================= composition =======================
const Kick = ({a, k = 0.6, children}) => {
  const abs = a + useCurrentFrame() / FPS;
  return <AbsoluteFill style={{transform: `scale(${1 + 0.02 * k * decay(E.kick, abs, 13)})`}}>{children}</AbsoluteFill>;
};
const Sc = ({a, b, k, children}) => <Sequence from={f(a)} durationInFrames={Math.max(1, f(b) - f(a))}><Kick a={a} k={k}>{children}</Kick></Sequence>;
const WIPES = [[Q.drop, P.orange, 'circle', 576, 560], [Q.gap, P.blue], [BELL_END, P.orange], [Q.burst1[Q.burst1.length - 1], P.blue], [Q.insG[0], P.orange], [FEED, P.blue],
  [Q.burst2[0], P.orange], [Q.burst3, P.blue], [Q.insD[0], P.orange], [Q.stutter4[0], P.blue], [PB[6], P.orange]];
const Wipes = () => { const abs = useCurrentFrame() / FPS; return <>{WIPES.map(([t, c, s, x, y]) => <Wipe key={t} abs={abs} t={t} color={c} x={x} y={y} />)}</>; };
export const ReelV15 = () => (
  <AbsoluteFill style={{background: P.paper}}>
    <PhAudio src="audio/music_v7.wav" />
    <Sc a={0} b={Q.drop} k={0.3}><Open /></Sc>
    <Sc a={Q.drop} b={Q.gap}><Trends /></Sc>
    <Sc a={Q.gap} b={Q.bells[0]}><TypeTrend /></Sc>
    <Sc a={Q.bells[0]} b={BELL_END}><Bell /></Sc>
    <Sc a={BELL_END} b={Q.burst1[Q.burst1.length - 1]}><Faces /></Sc>
    <Sc a={Q.burst1[Q.burst1.length - 1]} b={Q.insG[0]}><AdsV12 /></Sc>
    <Sc a={Q.insG[0]} b={FEED}><AdStudioV15 /></Sc>
    <Sc a={FEED} b={FEED_END}><Feed /></Sc>
    <Sc a={FEED_END} b={Q.burst2[0]}><AdCloner /></Sc>
    <Sc a={Q.burst2[0]} b={Q.burst3}><StaticsV12 /></Sc>
    <Sc a={Q.burst3} b={Q.riser[0]}><Archive /></Sc>
    <Sc a={Q.riser[0]} b={Q.insD[0]}><GameAdsV14 /></Sc>
    <Sc a={Q.insD[0]} b={Q.insD[1]}><Variations /></Sc>
    <Sc a={Q.insD[1]} b={Q.insD[1] + Q.dUnit}><AIStudioV12 /></Sc>
    <Sc a={Q.insD[1] + Q.dUnit} b={Q.stutter4[0]}><ToolsList /></Sc>
    <Sc a={Q.stutter4[0]} b={Q.stutter4[Q.stutter4.length - 1] + 0.03}><PlayV12 /></Sc>
    <Sc a={Q.stutter4[Q.stutter4.length - 1] + 0.03} b={Q.fast}><WorksV14 /></Sc>
    <Sc a={Q.fast} b={PB[6]}><MoonSys /></Sc>
    <Sc a={PB[6]} b={Q.impact}><Finale /></Sc>
    <Sc a={Q.impact} b={TOTAL15} k={0.2}><EndV12 /></Sc>
    <Wipes />
  </AbsoluteFill>
);
