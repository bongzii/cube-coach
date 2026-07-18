const defaultParams = {
  size: 200,
  view: 'top',
  'cube[mask]': 'F2L',
  'rotations[0][axis]': 'y',
  'rotations[0][value]': 45,
  'rotations[1][axis]': 'x',
  'rotations[1][value]': -34,
};

function normalizeAlgorithm(alg) {
  if (!alg) return '';
  return alg
    .replace(/\s*\(\s*/g, ' ')
    .replace(/\s*\)\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCaseUrl(algorithm) {
  const params = new URLSearchParams();
  Object.entries(defaultParams).forEach(([key, value]) => {
    params.append(key, value);
  });
  const normalizedAlg = normalizeAlgorithm(algorithm);
  params.append('cube[case]', normalizedAlg);
  return 'https://puzzle-generator.robiningelbrecht.be/cube?' + params.toString();
}

// Test with various algorithms from F2L data
const testAlgorithms = [
  "U (R U' R')",
  "(R U R')",
  "(U' R U R') U2 (R U' R')",
  "(R U R') U (R' F R F')",
  "(r U' R' U) (R U r')",
  "(U') (R U2 M' U' R' U) (R U r')",
  "(U) R (F R U R' U' F') R'",
  "(R U' R' U2) (R U' l U' R' U l')",
  "R' D' R U' R' D R (U R U' R')",
  "y U' (L' U L)"
];

testAlgorithms.forEach((alg, i) => {
  const normalized = normalizeAlgorithm(alg);
  console.log(`${(i+1).toString().padStart(2)}: '${alg}' → '${normalized}'`);
});

// Test a few to verify they work with the API
console.log("\nTesting a few URLs:");
testAlgorithms.slice(0, 3).forEach((alg, i) => {
  const url = buildCaseUrl(alg);
  console.log(`${(i+1)}. ${url}`);
});
