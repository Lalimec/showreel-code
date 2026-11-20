// Review stills: render PNG frames at the given times (seconds) from both cuts, to check cuts at full size.
//   npm run stills -- 6.28 6.48 12.38
// Writes stills/<cut>_<time>.png
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const times = process.argv.slice(2).map(Number).filter((t) => !Number.isNaN(t));
if (!times.length) { console.log('usage: npm run stills -- <seconds> [<seconds> ...]'); process.exit(1); }
const out = path.resolve('stills');
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.js')});
for (const id of ['ReelV15', 'ReelV15V']) {
  const composition = await selectComposition({serveUrl, id});
  for (const t of times) {
    const file = path.join(out, `${id}_${t.toFixed(2)}.png`);
    await renderStill({serveUrl, composition, frame: Math.round(t * composition.fps), output: file, imageFormat: 'png'});
    console.log(file);
  }
}
