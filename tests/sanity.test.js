// tests/sanity.test.js
const { spawn } = require('child_process');

const sanityTests = [
  'GolfSqueez.test.js',
  'ExploreBookingPage.test.js',
  'RestaurantSqueez.test.js',
  'WhiteLabelBookingPage.test.js'
];

const regressionTests = [];
const allFilesToRun = [...sanityTests, ...regressionTests];

console.log('🚀 Starting test execution...\n');

const results = [];
const startTime = Date.now();

async function runTest(testFile) {
  return new Promise((resolve) => {
    const testStart = Date.now();
    console.log(`▶️  Running: ${testFile}`);
    
    const testProcess = spawn(
      'npx',
      ['playwright', 'test', testFile, '--headed'],
      { stdio: 'inherit', shell: true }
    );

    testProcess.on('close', (code) => {
      const duration = ((Date.now() - testStart) / 1000).toFixed(1);
      const status = code === 0 ? '✅' : '❌';
      results.push({ file: testFile, passed: code === 0, duration });
      console.log(`${status} ${testFile} (${duration}s)\n`);
      resolve();
    });
  });
}

(async () => {
  for (const testFile of allFilesToRun) {
    await runTest(testFile);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach(({ file, passed, duration }) => {
    console.log(`${passed ? '✅' : '❌'} ${file.padEnd(35)} ${duration}s`);
  });
  
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Total Time: ${totalTime}s`);
  console.log('='.repeat(60));
  
  process.exit(failed > 0 ? 1 : 0);
})();