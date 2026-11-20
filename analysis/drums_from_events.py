"""Play the reel's event data back as sound: the placeholder soundtrack (public/audio/events_drums.wav).

Two layers, both generated here, so the audio is original and can ship with the repo:

1. Hits (src/events_v7.json): a kick, snare and hat at every detected drum hit, a short pitched tone for
   each melody onset and a low note for each bass onset.
2. Effects (src/cues_v7.json): the moments in the music edit that aren't drum hits but that the scenes
   cut on: the intro swell, the intro burst, both drops, every stutter, the gap hits, the bell run under
   "Every trend, every face", the snare bursts, the breakdown pad, the riser into the second drop, the
   fast-run whoosh, the closing sweep and the final impact.

Every sound lands on a time the reel reacts to, so what you hear is exactly what the scenes are cut to.

    python analysis/drums_from_events.py
"""
import json
import shutil
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 44100
E = json.load(open('src/events_v7.json'))
Q = json.load(open('src/cues_v7.json'))
TOTAL = Q['total']
L = int((TOTAL + 1.5) * SR)
rng = np.random.default_rng(1)
bus = {k: np.zeros(L) for k in ('drums', 'tone', 'fx')}


def place(sig, t, gain, b='fx'):
    i = int(round(t * SR))
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), L - i)
    if n > 0:
        bus[b][i:i + n] += sig[:n] * gain


def ts(d):
    return np.arange(int(d * SR)) / SR


def env(d, k):
    return np.exp(-ts(d) * k)


def noise(d):
    return rng.uniform(-1, 1, int(d * SR))


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def sweep_filter(x, f0, f1, kind='band', width=0.6, blocks=96):
    """A filter whose centre glides from f0 to f1 (exponentially), applied in short overlapping blocks."""
    out = np.zeros_like(x)
    n = len(x)
    edges = np.linspace(0, n, blocks + 1).astype(int)
    for a, b in zip(edges[:-1], edges[1:]):
        c = f0 * (f1 / f0) ** (((a + b) / 2) / n)
        if kind == 'band':
            seg = bp(x[max(0, a - 2048):b], c * (1 - width / 2), min(c * (1 + width / 2), SR / 2 - 100))
        else:
            seg = lp(x[max(0, a - 2048):b], c)
        out[a:b] = seg[-(b - a):]
    return out


def tone(f, d, k=8.0, shape='sine'):
    t = ts(d)
    ph = 2 * np.pi * f * t
    w = np.sin(ph) if shape == 'sine' else (2 / np.pi) * np.arcsin(np.sin(ph)) if shape == 'tri' else np.tanh(3 * np.sin(ph))
    return w * env(d, k)


def bell(f, d=1.4):
    """A small FM bell: bright attack, inharmonic partial, long ring."""
    t = ts(d)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 3.2)
    s += 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 7)
    attack = np.minimum(1, t / 0.002)
    return s * attack


def stab(f, d=0.085):
    """A short chord stab for the stutters."""
    t = ts(d)
    s = sum(np.sign(np.sin(2 * np.pi * f * r * t)) * g for r, g in ((1, 1), (1.19, .7), (1.5, .8), (2, .4)))
    s = lp(s, 2600)
    return s * np.minimum(1, t / 0.003) * np.exp(-t * 18)


def impact(d=1.6, f0=60):
    t = ts(d)
    sub = np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 1.2) + 18) / SR) * np.exp(-t * 2.4)
    crash = hp(noise(d), 3000) * np.exp(-t * 3.5) * 0.55
    body = lp(noise(d), 900) * np.exp(-t * 9) * 0.8
    return sub + crash + body


def riser(d, f0=300, f1=6000):
    x = sweep_filter(noise(d), f0, f1, 'band', 0.5)
    t = ts(d)
    return x * (t / d) ** 2.2


def whoosh(d, f0=5000, f1=400):
    x = sweep_filter(noise(d), f0, f1, 'band', 0.7)
    t = ts(d)
    return x * np.sin(np.pi * t / d) ** 1.5


# ---------------- 1. hits ----------------
tk = ts(0.3)
kick = np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-tk * 30)) / SR) * env(0.3, 10)
snare = (noise(0.18) * 0.7 + np.sin(2 * np.pi * 185 * ts(0.18)) * 0.4) * env(0.18, 22)
hat = hp(noise(0.045), 7000) * env(0.045, 70)
bass = np.tanh(2 * np.sin(2 * np.pi * 55 * ts(0.25))) * env(0.25, 9)
for t in E['kick']:
    place(kick, t, 0.9, 'drums')
for t in E['snare']:
    place(snare, t, 0.35, 'drums')
for t in E['hat']:
    place(hat, t, 0.3, 'drums')
for t in E['bass']:
    place(bass, t, 0.3, 'drums')
# melody onsets: a soft pluck walking a pentatonic scale (generic, not the track's tune)
PENTA = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5]
for i, t in enumerate(E['melody']):
    place(tone(PENTA[(i * 3) % len(PENTA)], 0.16, 26, 'tri'), t, 0.14, 'tone')

# ---------------- 2. effects from the cue sheet ----------------
# intro swell, 0 to the first kick
d = 2.8
sw = sweep_filter(noise(d), 200, 4500, 'low') * (ts(d) / d) ** 2 * 0.55
pad = sum(np.sin(2 * np.pi * f * ts(d)) for f in (110, 164.81, 220, 261.63)) * (ts(d) / d) ** 1.5 * 0.12
place(sw + pad, 0.0, 1.0)
# intro burst: descending toms
for i, t in enumerate(Q['introBurst']):
    place(tone(220 * 0.86 ** i, 0.22, 14), t, 0.55)
# both drops and the final hit
place(impact(1.8), Q['drop'], 0.9)
place(impact(1.8), Q['drop2'], 0.95)
# stutters: chord stabs rising through each stutter
for key, root in (('stutter1', 220), ('stutter2', 246.94), ('stutter3', 220), ('stutter4', 196)):
    hits = Q[key]
    for i, t in enumerate(hits):
        place(stab(root * 2 ** (i / 24)), t, 0.45)
# gap hits: rim clicks
for t in Q['gapHits']:
    place(bp(noise(0.03), 1800, 4200) * env(0.03, 90), t, 0.6)
# the bell run under "Every trend, every face": one bell per hit, climbing
BELL = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 1567.98, 1318.51, 1567.98, 2093]
for i, t in enumerate(Q['bells']):
    place(bell(BELL[i % len(BELL)]), t, 0.3, 'tone')
# snare bursts: zaps that sweep up
for key in ('burst1', 'burst2', 'burst4'):
    hits = Q[key]
    for i, t in enumerate(hits):
        z = sweep_filter(noise(0.07), 900 + i * 400, 3000 + i * 600, 'band', 0.5) * env(0.07, 40)
        place(z, t, 0.5 + 0.06 * i)
# burst 3: a crash, then a filtered pad under the breakdown up to the riser
place(impact(1.2, 50), Q['burst3'], 0.6)
d = Q['riser'][0] - Q['breakdown']
pad = sum(np.sin(2 * np.pi * f * ts(d)) for f in (110, 130.81, 164.81, 220)) * 0.1
pad *= np.minimum(1, ts(d) / 0.4) * np.minimum(1, (d - ts(d)) / 0.2)
place(lp(pad, 1200), Q['breakdown'], 1.0)
# riser into the second drop, with rising blips on the riser hits
d = Q['drop2'] - Q['riser'][0] + 0.02
place(riser(d), Q['riser'][0], 0.5)
for i, t in enumerate(Q['riser']):
    place(tone(440 * 2 ** (i * 4 / 12), 0.12, 24, 'tri'), t, 0.35)
# fast run: a whoosh into it
place(whoosh(0.5), Q['fast'] - 0.42, 0.55)
# closing sweep down into the final impact, then the impact rings into the end card
d = Q['impact'] - Q['sweep']
place(whoosh(d, 7000, 250) * 1.2, Q['sweep'], 0.6)
dive = np.sin(2 * np.pi * np.cumsum(np.linspace(880, 110, int(d * SR))) / SR) * np.sin(np.pi * ts(d) / d) * 0.25
place(dive, Q['sweep'], 1.0)
place(impact(4.8, 55), Q['impact'], 1.1)
place(bell(220, 4.8), Q['impact'], 0.25, 'tone')

# ---------------- mix ----------------
mix = bus['drums'] * 1.0 + bus['tone'] * 1.0 + bus['fx'] * 0.9
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
fade = int(0.6 * SR)
end = int((TOTAL + 0.0) * SR)
mix[end - fade:end] *= np.linspace(1, 0, fade)
mix[end:] = 0
mix = mix[:end]
mix /= np.abs(mix).max() * 1.05
st = mix.astype(np.float32)
sf.write('public/audio/events_drums.wav', st, SR, subtype='PCM_16')
shutil.copy('public/audio/events_drums.wav', 'docs/assets/audio/events_drums.wav')
import subprocess
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'public/audio/events_drums.wav', '-c:a', 'libmp3lame', '-b:a', '192k', 'docs/assets/audio/soundtrack.mp3'], check=True)
print({k: len(v) for k, v in E.items()}, f"{TOTAL:.2f} s -> public/audio/events_drums.wav (+ docs copy)")
