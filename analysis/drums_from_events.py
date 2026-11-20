"""Play the reel's event data back as sound: a drum machine driven by src/events_v7.json.

Kick, snare and hat are synthesised at their detected times, with a short tone for each melody
onset and a low note for each bass onset. The result is the placeholder soundtrack
(public/audio/events_drums.wav): it's original audio, so it can ship with the repo, and you hear
exactly the hits the scenes are reacting to.

    python analysis/drums_from_events.py
"""
import json
import numpy as np
import soundfile as sf

SR = 44100
E = json.load(open('src/events_v7.json'))
Q = json.load(open('src/cues_v7.json'))
out = np.zeros(int((Q['total'] + 1) * SR))
rng = np.random.default_rng(1)


def place(sig, t, gain):
    i = int(t * SR)
    n = min(len(sig), len(out) - i)
    if n > 0:
        out[i:i + n] += sig[:n] * gain


def env(n, k):
    return np.exp(-np.arange(n) / SR * k)


tk = np.arange(int(0.3 * SR)) / SR
kick = np.sin(2 * np.pi * np.cumsum(48 + 110 * np.exp(-tk * 30)) / SR) * env(len(tk), 10)
snare = (rng.uniform(-1, 1, int(0.18 * SR)) * 0.7 + np.sin(2 * np.pi * 185 * np.arange(int(0.18 * SR)) / SR) * 0.4) * env(int(0.18 * SR), 22)
hat = np.diff(np.concatenate([[0], rng.uniform(-1, 1, int(0.04 * SR))])) * env(int(0.04 * SR), 80)
tm = np.arange(int(0.12 * SR)) / SR
blip = np.sin(2 * np.pi * 880 * tm) * env(len(tm), 30)
tb = np.arange(int(0.25 * SR)) / SR
bass = np.tanh(2 * np.sin(2 * np.pi * 55 * tb)) * env(len(tb), 9)

for t in E['kick']:
    place(kick, t, 0.9)
for t in E['snare']:
    place(snare, t, 0.35)
for t in E['hat']:
    place(hat, t, 0.18)
for t in E['melody']:
    place(blip, t, 0.12)
for t in E['bass']:
    place(bass, t, 0.3)

out /= np.abs(out).max() * 1.1
sf.write('public/audio/events_drums.wav', out.astype(np.float32), SR)
print({k: len(v) for k, v in E.items()}, f"{Q['total']:.2f} s -> public/audio/events_drums.wav")
