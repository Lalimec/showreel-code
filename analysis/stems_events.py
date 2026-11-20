"""Cut the Demucs stems with a version's segment list (cues_<v>.json 'segs') and detect per-layer hits on that timeline.
python stems_events.py v7  -> src/events_v7.json (kick, snare, hat, melody, bass: times with strength > 0.35)"""
import json, sys, numpy as np, librosa, soundfile as sf, scipy.signal as ss
v = sys.argv[1]; SR = 44100
Q = json.load(open(f'src/cues_{v}.json'))
S = lambda t: int(round(t * SR))
def edit(y): return np.concatenate([y[:, S(g['a']):S(g['b'])] for g in Q['segs']], axis=1)
def onsets(x, lo=None, hi=None, delta=0.12, wait=0.06):
    if lo or hi:
        b, a = ss.butter(4, [f for f in [lo, hi] if f], btype='bandpass' if lo and hi else ('highpass' if lo else 'lowpass'), fs=SR)
        x = ss.filtfilt(b, a, x)
    env = librosa.onset.onset_strength(y=x.astype(np.float32), sr=SR, hop_length=256); env = env / (np.percentile(env, 99) + 1e-9)
    fr = librosa.onset.onset_detect(onset_envelope=env, sr=SR, hop_length=256, delta=delta, wait=int(wait * SR / 256), units='frames')
    return [round(float(t), 3) for t, f in zip(librosa.frames_to_time(fr, sr=SR, hop_length=256), fr) if env[f] > 0.35]
st = {}
for n in ['drums', 'bass', 'other']:
    y, _ = sf.read(f'music/stems/{n}.wav'); y = y.T if y.ndim > 1 else np.stack([y, y]); st[n] = edit(y).mean(axis=0)
ev = {'kick': onsets(st['drums'], hi=150), 'snare': onsets(st['drums'], lo=180, hi=2500), 'hat': onsets(st['drums'], lo=6000, delta=0.15, wait=0.04),
      'melody': onsets(st['other'], delta=0.15), 'bass': onsets(st['bass'], delta=0.2)}
json.dump(ev, open(f'src/events_{v}.json', 'w'))
print({k: len(x) for k, x in ev.items()})
