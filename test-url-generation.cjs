const https = require('https');

function normalizeAlgorithm(alg) {
  if (!alg) return '';
  
  let result = alg;
  // Remove all parentheses
  result = result.replace(/\s*\(\s*/g, ' ');
  result = result.replace(/\s*\)\s*/g, '');
  
  // Normalize whitespace
  result = result.replace(/\s+/g, ' ');
  
  return result.trim();
}

function downloadSVG(url, outputPath) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
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
      const fs = require('fs');
      fs.unlink(outputPath, () => {});
      reject(err);
    });
    
    file.on('error', (err) => {
      const fs = require('fs');
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

const fs = require('fs');
const path = require('path');

// Test a few cases from the F2L data
testCases = [
  { id: 1, algorithm: "U (R U' R')" },
  { id: 2, algorithm: "y U' (L' U L)" },
  { id: 3, algorithm: "(R U R')" },
  { id: 4, algorithm: "(U' R U R') U2 (R U' R')" },
  { id: 5, algorithm: "U' (R U R') U' R U2 R'" }
];

async function testDownloads() {
  console.log('Testing F2L image generation with normalized algorithms...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const testCase of testCases) {
    const outputDir = path.join(__dirname, 'test-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const normalizedAlg = normalizeAlgorithm(testCase.algorithm);
    console.log(`Testing Case ${testCase.id}: '${testCase.algorithm}'`);
    console.log(`  Normalized: '${normalizedAlg}'`);
    
    const outputPath = path.join(outputDir, `${testCase.id}.svg`);
    const defaultParams = {
      size: 200,
      view: 'top',
      'cube[mask]': 'F2L',
      'rotations[0][axis]': 'y',
      'rotations[0][value]': 45,
      'rotations[1][axis]': 'x',
      'rotations[1][value]': -34,
    };
    
    const params = new URLSearchParams();
    Object.entries(defaultParams).forEach(([key, value]) => {
      params.append(key, value);
    });
    params.append('cube[case]', normalizedAlg);
    
    const url = `https://puzzle-generator.robiningelbrecht.be/cube?${params.toString()}`;
    
    try {
      console.log(`  URL: ${url}\n`);
      console.log(`  Attempting download...`);
      
      await downloadSVG(url, outputPath);
      
      const stats = fs.statSync(outputPath);
      if (stats.size > 0) {
        console.log(`  ✓ SUCCESS: Downloaded ${stats.size} bytes`);
        successCount++;
      } else {
        console.log(`  ✗ FAILED: File is empty`);
        failCount++;
        fs.unlinkSync(outputPath);
      }
    } catch (error) {
      console.log(`  ✗ FAILED: ${error.message}\n`);
      failCount++;
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    }
    
    console.log('');
  }
  
  console.log('========== TEST SUMMARY ==========');
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  // Clean up test directory
  console.log('\nCleaning up test-output directory...');
  const testDir = path.join(__dirname, 'test-output');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
}

testDownloads().catch(console.error);
