const { resolve } = require('path');
const { performance } = require('perf_hooks');
const { readFile, utils: xlsxUtils } = require('xlsx');

const enableShuffledOnChallenges = async () => {
  const excludes = await readExcludes();
  console.log(excludes);
};

async function readExcludes() {
  const excludesFile = resolve(__dirname, 'excludes.xlsx');
  const wb = readFile(excludesFile);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const excludes = xlsxUtils.sheet_to_json(ws, { header: [undefined, 'skillName'], range: 1 });
  return excludes;
}

async function main() {
  const startTime = performance.now();
  console.log(`Script ${__filename} has started`);
  await enableShuffledOnChallenges();
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  console.log(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  const isLaunchedFromCommandLine = require.main === module;
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    }
  }
})();

module.exports = {
  enableShuffledOnChallenges,
};
