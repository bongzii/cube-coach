#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const BASE_URL = 'https://puzzle-generator.robiningelbrecht.be/cube';
const OUTPUT_DIR = path.join(__dirname, '../public/f2l');
const RATE_LIMIT_MS = 120; // 300ms between requests
const MAX_RETRIES = 3;

// Default parameters for the puzzle generator
// No `view` and no `rotations` are set, so the API returns its DEFAULT 3D
// perspective orientation (the same look as ...?cube[case]=... with no rotation
// params). Custom rotations are intentionally omitted so every F2L case renders
// in this standard, un-tilted orientation.
const defaultParams = {
  size: 200,
  'cube[mask]': 'F2L',
};

// Each F2L slot view is rendered FLAT (no x tilt) with a distinct Y rotation so
// the cube spins to face that slot. `fr` uses the default front view (no rotation
// param, since the API 500s on y=0). 90-degree steps clockwise: FR front, BR
// right, BL back, FL left. The four buttons (Left/Center/Right/Back) are now
// functional and visibly change the orientation.
const VIEWS = [
  { slot: 'fr', y: undefined },      // Center - default front (no rotation)
  { slot: 'fl', y: 270 },            // Left
  { slot: 'br', y: 90 },             // Right
  { slot: 'bl', y: 180 },            // Back
];

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper: sleep for rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: download a single SVG
function downloadSVG(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      res.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete partial file
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// Helper: normalize algorithm by removing parentheses
function normalizeAlgorithm(alg) {
  if (!alg) return '';
  
  let result = alg;
  // Remove all parentheses, keeping a space so adjacent moves stay separated
  result = result.replace(/\s*\(\s*/g, ' ');
  result = result.replace(/\s*\)\s*/g, ' ');

  // Normalize whitespace
  result = result.replace(/\s+/g, ' ');

  // Attach a trailing repetition count directly to its move (e.g. `R' 2` -> `R'2`)
  // so the puzzle-generator (which doesn't accept spaced counts) can parse it.
  result = result.replace(/([UuFfRrDdLlBbMESxyz]'?)\s+(\d)/g, '$1$2');

  return result.trim();
}

// Build URL for a case from its scramble, viewed from a given y-rotation.
// We render the case state via `cube[algorithm]=<scramble>` (state AFTER the scramble)
// rather than `cube[case]=<solution alg>`. The API limits `cube[case]` to <=4 moves,
// but `cube[algorithm]` accepts full-length scrambles, so every F2L case can be rendered.
function buildScrambleUrl(scramble, yRotation) {
  const params = new URLSearchParams();

  // Add default parameters
  Object.entries(defaultParams).forEach(([key, value]) => {
    params.append(key, value);
  });

  // Per-view y rotation (slot orientation)
  if (yRotation !== null && yRotation !== undefined) {
    params.append('rotations[0][axis]', 'y');
    params.append('rotations[0][value]', String(yRotation));
  }

  // Normalize the scramble before adding it
  const normalized = normalizeAlgorithm(scramble);
  params.append('cube[algorithm]', normalized);

  return `https://puzzle-generator.robiningelbrecht.be/cube?${params.toString()}`;
}

// F2L setup scrambles (state that produces each case). Generated from the TS
// data files via scripts/f2lScrambles.gen.cjs (run `node` on the extractor).
const SCRAMBLES = require('./f2lScrambles.gen.cjs');

// Main generation function
async function generateAllImages() {
  console.log('Starting F2L image generation...');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Total cases: ${Object.keys(SCRAMBLES).length}`);
  console.log(`Views per case: ${VIEWS.length} (${VIEWS.map(v => v.slot).join(', ')})`);
  console.log('');

  // Remove stale single-variant files from previous runs
  for (const f of fs.readdirSync(OUTPUT_DIR)) {
    if (/^\d+\.svg$/.test(f)) fs.unlinkSync(path.join(OUTPUT_DIR, f));
  }

  let successCount = 0;
  let failCount = 0;
  const failedCases = [];

  const caseIds = Object.keys(SCRAMBLES).map(k => parseInt(k)).sort((a, b) => a - b);

  for (let i = 0; i < caseIds.length; i++) {
    const caseId = caseIds[i];
    const scrambles = SCRAMBLES[caseId];

    if (!scrambles || scrambles.length === 0) {
      console.log(`[${i + 1}/${caseIds.length}] Case ${caseId}: No scrambles available, skipping`);
      failCount++;
      continue;
    }

    // Use the first setup scramble to render the case state
    const scramble = scrambles[0];

    for (const view of VIEWS) {
      const outputPath = path.join(OUTPUT_DIR, `${caseId}-${view.slot}.svg`);
      const url = buildScrambleUrl(scramble, view.y);

      let retries = 0;
      let downloaded = false;

      while (retries <= MAX_RETRIES && !downloaded) {
        try {
          await downloadSVG(url, outputPath);

          // Verify file was created and has content
          const stats = fs.statSync(outputPath);
          if (stats.size > 0) {
            successCount++;
            downloaded = true;
          } else {
            throw new Error('File is empty');
          }
        } catch (error) {
          retries++;
          if (retries <= MAX_RETRIES) {
            console.log(`[${i + 1}/${caseIds.length}] Case ${caseId} (${view.slot}): ✗ Failed (${error.message}), retrying in 1s...`);
            await sleep(1000);
          } else {
            console.log(`[${i + 1}/${caseIds.length}] Case ${caseId} (${view.slot}): ✗ Failed after ${MAX_RETRIES + 1} attempts: ${error.message}`);
            failCount++;
          }
        }
      }
    }

    // Rate limiting delay
    if (i < caseIds.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  // Summary
  console.log('\n========== GENERATION COMPLETE ==========');
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  process.exit(failCount > 0 ? 1 : 0);
}

// Run generation
generateAllImages().catch(console.error);