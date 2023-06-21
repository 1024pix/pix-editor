const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const { performance } = require('perf_hooks');
const { disconnect } = require('../../db/knex-database-connection');
const releaseRepository = require('../../lib/infrastructure/repositories/release-repository');
const logger = require('../../lib/infrastructure/logger');
const argv = require('yargs/yargs')(process.argv.slice(2))
  .version(false)
  .usage('Usage: $0 [options]')
  .option('file', {
    alias: 'f',
    describe: 'Destination file',
    nargs: 1,
    requiresArg: true,
  })
  .option('createRelease', {
    alias: 'c',
    describe: 'Create a release beforehand',
    requiresArg: false,
  })
  .demandOption(['file'], 'Please provide a destination file to dump the release into')
  .example('$0 -f release.txt', 'Dump the latest release in the given destination file')
  .example('$0 -f release.txt --createRelease', 'Create a release then dump it in the given destination file')
  .help('h')
  .alias('h', 'help')
  .argv;

const getLatestRelease = async ({ shouldCreateRelease, destFile }) => {
  if (shouldCreateRelease) {
    logger.info('Creating release...');
    await releaseRepository.create();
    logger.info('Release created.');
  }
  logger.info('Fetching latest release...');
  const release = await releaseRepository.getLatestRelease();
  fs.writeFileSync(destFile, JSON.stringify(release));
  logger.info('Latest release fetched.');
  return true;
};

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const destFile = argv.file;
  const shouldCreateRelease = Boolean(argv.c);
  await getLatestRelease({ shouldCreateRelease, destFile });
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

module.exports = { printLatestRelease: getLatestRelease };
