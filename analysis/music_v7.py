"""v7 music edit (owner's picks, 2026-11-11): no separate tools loop. The original plays straight through to the sweep,
with phrases that already repeat played twice more in place:
  - the 125-BPM two-bar unit orig 18.17 -> 22.01 (3.84 s), twice more after itself;
  - the ~133-BPM unit after the second drop orig 33.206 -> 36.82 (3.614 s), twice more after itself;
then the sweep is cut on the downbeat (orig 50.196) where the final hit lands. Tempo never steps down.
Writes public/audio/music_v7.wav, src/cues_v7.json (all cues remapped, plus the inserted copies) and
the segment list so the stems can be cut the same way (events_v7.json via stems_v7.py)."""
import json
import numpy as np, librosa, soundfile as sf
SR = 44100
y, _ = librosa.load('public/audio/music.mp3', sr=SR, mono=False)
if y.ndim == 1: y = np.stack([y, y])
G0, G1 = 18.17, 22.01; D0, D1 = 33.206, 36.82; END = 50.1963
SEGS = [(0, G1), (G0, G1), (G0, G1), (G1, D1), (D0, D1), (D0, D1), (D1, END - 0.003)]
S = lambda t: int(round(t * SR)); XF = S(0.006)
def fade(x, i=0.003, o=0.003):
    x = x.copy(); n, m = S(i), S(o)
    if n: x[:, :n] *= np.linspace(0, 1, n)
    if m: x[:, -m:] *= np.linspace(1, 0, m)
    return x
def join(a, b):
    w = np.linspace(0, 1, XF); mid = a[:, -XF:] * np.cos(w * np.pi / 2) + b[:, :XF] * np.sin(w * np.pi / 2)
    return np.concatenate([a[:, :-XF], mid, b[:, XF:]], axis=1)
out = None; starts = []
for k, (a, b) in enumerate(SEGS):
    seg = y[:, max(0, S(a) - XF // 2):S(b) + XF // 2]
    starts.append(0.0 if out is None else out.shape[1] / SR - XF / 2 / SR)
    out = seg if out is None else join(out, seg)
out = fade(out, 0, 0.004)
impact = out.shape[1] / SR
imp = 4.0 * fade(y[:, S(65.93):S(70.2)], 0.002, 0.5)
hit = y[:, S(6.375):S(6.375 + 1.2)].copy(); hit *= np.exp(-np.linspace(0, 1.2, hit.shape[1]) * 3.2); hit = fade(hit, 0.002, 0.05)
imp[:, S(0.02):S(0.02) + hit.shape[1]] += 0.9 * hit
i0 = S(impact - 0.02); end = i0 + imp.shape[1] + S(1.0)
mix = np.zeros((2, end)); mix[:, :out.shape[1]] += out; mix[:, i0:i0 + imp.shape[1]] += imp
pk = np.abs(mix).max(); mix = mix / pk * 0.97 if pk > 0.99 else mix
sf.write('public/audio/music_v7.wav', mix.T, SR)
segs = [{'a': a, 'b': b, 'at': round(s, 4)} for (a, b), s in zip(SEGS, starts)]
PRIMARY = [0, 3, 6]                      # the straight-through pieces: every original cue maps through these
def m(t):
    for k in PRIMARY:
        g = segs[k]
        if g['a'] - 1e-6 <= t < g['b'] + 1e-6: return round(t - g['a'] + g['at'], 3)
    return None
prev = json.load(open('src/cues_v3.json'))
cues = {}
for k, v in prev.items():
    if k.endswith('B') or k in ('brake', 'B_OFF', 'impact', 'total', 'beats', 'downbeats'): continue
    if isinstance(v, list): cues[k] = [x for x in (m(t) for t in v) if x is not None]
    else: cues[k] = m(v)
grid = list(np.arange(6.66 - 0.48 * 13, 33.0, 0.48))
ramp = []
for st, p, en in [(33.228, 0.4515, 36.82), (36.833, 0.44, 44.0)]:
    t = st
    while t < en: ramp.append(t); p2 = p; t += p2; p = max(0.40, p - (0.006 if st > 36 else 0)) if st > 36 else p
fast = [43.9929 + n * 0.38815 for n in range(16)]
base = sorted([b for b in grid if b > 0.3] + ramp + fast)
beats = [m(b) for b in base if m(b) is not None]
ins = {'g': [segs[1]['at'], segs[2]['at']], 'd': [segs[4]['at'], segs[5]['at']]}
for k, (a, b) in [('g', (G0, G1)), ('d', (D0, D1))]:
    for st in ins[k]: beats += [round(x - a + st, 3) for x in base if a <= x < b]
cues.update({'total': round(end / SR, 3), 'impact': round(impact, 3), 'segs': segs, 'insG': ins['g'], 'insD': ins['d'],
             'beats': sorted(beats), 'gUnit': G1 - G0, 'dUnit': D1 - D0, 'sweep': m(49.818), 'fast': m(43.993),
             'ratioHits': [m(x) for x in [20.097, 20.335, 20.573, 20.817, 20.933, 21.055, 21.293, 21.415, 21.537, 21.775, 21.865, 21.954]],
             'preBells': [m(x) for x in [11.215, 11.459, 11.575, 11.697, 11.819, 11.935, 12.167]]})
json.dump(cues, open('src/cues_v7.json', 'w'), indent=0)
print('total', cues['total'], 'impact', cues['impact'], 'insG', ins['g'], 'insD', ins['d'], 'burst2', cues['burst2'][0], 'drop2', cues['drop2'], 'fast', cues['fast'])
