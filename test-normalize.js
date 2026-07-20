import assert from 'node:assert/strict';

function normalizeAlgorithm(alg) {
  if (!alg) return '';
  return alg
    .replace(/\(\s*/g, ' ')
    .replace(/\s*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const cases = [
  ["U (R U' R')", "U R U' R'"],
  ["(R U R')", "R U R'"],
  ["(U' R U R') U2 (R U' R')", "U' R U R' U2 R U' R'"],
  ["M U (L F' L') U' M'", "M U L F' L' U' M'"],
  ['', ''],
];

for (const [input, expected] of cases) {
  assert.equal(normalizeAlgorithm(input), expected, input);
}

console.log(`✓ ${cases.length} algorithm-normalization checks passed`);
