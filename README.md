# Showreel 2026: Remotion source

The source code of my 2026 showreel. It's a 70-second edit written in Remotion (React), where the music data decides the timing. Every cut, type change, zoom and grid step is placed on a musical event read from data files, not keyframed by hand.

This repository holds the code and the data files. The media (AI-generated clips, tool screenshots, gameplay recordings and the music) is not included: some of it is private work material and the track is not licensed for publishing. The folder layout the code expects is listed under [Media](#media-not-included).

## What it renders

Two cuts of the same reel, from the same scenes and the same data:

| Composition | Size | Length |
|---|---|---|
| `ReelV15` | 1920 × 1080, 30 fps | 70.3 s |
| `ReelV15V` | 1080 × 1920, 30 fps | 70.3 s |

The reel runs through 20 scenes (`src/ReelV15.jsx`, bottom of the file): an opening where Bauhaus shapes turn into the name, AI trend clips laid out as rows and growing grids, kinetic type on the bell run, ads shown in every ratio, the tools I built (Ad Studio, Ad Cloner, AI Studio and others) with a scripted cursor clicking through them, game ads made from real recorded gameplay, a card wall that re-renders from one text table, a three-number stack, and the end card.

Visual system: light paper ground, big kinetic type in Bricolage Grotesque using its variable width and weight axes, Anton for stacked lines, DM Mono for corner labels, and shape-morph wipes (a circle that grows and leaves as a rotating rounded square) on the section cuts.

## What drives the output

### 1. The music edit and the section map: `src/cues_v7.json`

Written by `analysis/music_v7.py`.

- **`segs`**: which ranges of the original track play where. The two-bar 125-BPM unit and the ~133-BPM unit each play twice more in place, and the track is cut on the downbeat at the sweep.
- **Section times** on the edited timeline: `drop`, `stutter1`–`stutter4`, `gap`, `bells`, `burst1`–`burst4`, `breakdown`, `riser`, `drop2`, `fast`, `sweep`, `impact`, `total`.
- **The beat grid**: `beats`, plus the inserted units `insG` / `insD` with their lengths.

Every scene starts and ends on a cue. For example `<Sc a={Q.drop} b={Q.gap}><Trends /></Sc>` runs the trend scene from the drop to the gap. The total length comes from `Q.total`. Change the cue sheet and the whole edit re-times.

### 2. Per-instrument hits: `src/events_v7.json`

Written by `analysis/stems_events.py`. The track is split into stems (drums, bass, other) with Demucs. The same segment edit is applied to each stem, and onsets are detected per band:

| Layer | Source |
|---|---|
| `kick` | drums stem, below 150 Hz |
| `snare` | drums stem, 180–2500 Hz |
| `hat` | drums stem, above 6 kHz |
| `melody` | other stem |
| `bass` | bass stem |

The scenes read these hits through three small helpers:

- **`decay(E.kick, t)`**: a pulse that jumps to 1 on each hit and falls off exponentially. It drives zoom, scale, the variable font width and the fisheye.
- **`idx(hits, t)`**: how many hits have passed. It drives steps, such as which background colour, how many grid columns or which word is showing.
- **`lastHit`**: the most recent hit.

For example, in the opening the name's letters narrow to 82% width on every kick and spring back to 100%. In the faces scene, cuts follow `E.melody` onsets. The trend grid grows on each stutter hit, from 5 × 1 to 7 × 2, 9 × 3 and 11 × 4 tiles.

### 3. Hand-tapped accents: `STEPS` in `ReelV15.jsx`

I tapped the moments I wanted the big hits on while listening. The taps are corrected for reaction time and snapped to the nearest detected kick (`snap()`), and they drive the held zoom steps.

### 4. Curated clips: `src/v12_clips.json`

The AI trend clips come from an archive of 5,816 generated videos. The clips were rated, and only the best takes per concept are listed here, grouped by concept with a role (`var`, …). Scenes pick clips by index (`poolClip(i)`, `CLIPS[id].clips`), so a different curation fills the same grids without touching the scene code.

### 5. Recorded gameplay: `src/gp_aos.json`, `gp_ar.json`, `gp_wsv.json`

The game ads use real play sessions recorded in a headless mobile browser with Playwright (`tools/gameplay/lib.mjs`). Every tap and drag is logged with its time, coordinates and a label, and the recording is trimmed and encoded with FFmpeg. In the reel, `GameAd14` plays each recording sped up by a per-game rate (4× for Age of Steam, 3× for Aether Realms, 3.2× for WordSquare Versus). The finger replays every recorded tap and drag at the same rate: it glides to the next recorded point, presses on it and follows drags along their path. On top run the UA overlays: a hook banner, timed format beats (a FAIL flash with a screen shake, TRY AGAIN, +1 CARD, the words scored in WordSquare, a win flash) and an end card that slides up with a PLAY FREE button pulsing on the beat. WordSquare also stores the words that fill the square, so every row and column on screen is a real word.

### 6. Layout data: `src/moon_index.json`, `src/bgs_covers.json`

- **`moon_index.json`**: the card atlas for the Moonrakers card wall: how many cards, columns, and tall and square rows, with cell sizes. One tile component cuts any card from it.
- **`bgs_covers.json`**: the cover list for the Board Game Salon mosaic.

### 7. Tables inside the scene code

- **`P`**: the palette.
- **`RAT`**: the ratios an ad is shown in (9:16, 4:5, 1:1, 16:9).
- **`ADS`**: which rendered ad and caption appears where.
- **`TR5` / `POOL` / `VSETS`**: which concepts fill which scene.
- **`WIPES`**: the cue, colour and origin of each shape-morph wipe.

## Export to video

```bash
npm install
npm run render            # ReelV15  -> out/reel.mp4           (H.264, audio from public/audio/music_v7.wav)
npm run render:vertical   # ReelV15V -> out/reel_vertical.mp4
npm run stills -- 6.28 6.48 12.38   # PNG stills of both cuts at those seconds, for checking cuts at full size
```

`npm run studio` opens Remotion Studio to scrub the timeline.

The audio and the event data are made before rendering:

```bash
python analysis/music_v7.py        # edit the track -> public/audio/music_v7.wav + src/cues_v7.json
demucs public/audio/music.mp3     # stems of the original track -> music/stems/{drums,bass,other}.wav
python analysis/stems_events.py v7 # cut the stems with the same segment list, detect hits -> src/events_v7.json
```

## Media (not included)

`staticFile()` paths the code expects under `public/`:

```
public/
  audio/music_v7.wav          the edited track
  fonts/                      Bricolage Grotesque (OFL) and other local fonts
  v/, v12/                    curated AI clips and rendered ads (mp4)
  i/                          stills, posters, the fisheye displacement map
  assets2/, assets3/          tool screenshots, gameplay recordings, card atlases, covers
```

Built with Remotion 4, React 18, librosa, Demucs, Playwright and FFmpeg. Code written with Claude Code.
