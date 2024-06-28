import 'dotenv/config';
import prompt from 'prompt';
import yargs from 'yargs/yargs';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { logger } from '../../lib/infrastructure/logger.js';
import { disconnect } from '../../db/knex-database-connection.js';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

const JOBS_FOLDER = fileURLToPath(new URL('../../lib/infrastructure/scheduled-jobs', import.meta.url));
const jobChoices = {};
fs.readdirSync(JOBS_FOLDER).forEach((file) => {
  if (file.endsWith('job-processor.js')) {
    const regex = /(.*)-job-processor.js$/;
    const [, jobName] = file.match(regex);
    jobChoices[jobName] = new URL(`${JOBS_FOLDER}/${file}`, import.meta.url);
  }
});

const argv = yargs(process.argv.slice(2))
  .version(false)
  .usage('Usage: $0 [options]')
  .option('job', {
    alias: 'j',
    describe: 'Job name',
    choices: Object.keys(jobChoices),
    nargs: 1,
    requiresArg: true,
  })
  .option('args', {
    alias: 'a',
    describe: 'JSON args for job (will be JSON.parsed and passed on to the job)',
    nargs: 1,
    requiresArg: false,
  })
  .demandOption(['job'], 'Please provide a job name to run')
  .example('$0 -f check-urls', 'Run the "check-url" job')
  .example('$0 -f release -a \'{"data": { "slackNotification": false } }\'', 'Run the "release" job with arguments')
  .help('h')
  .alias('h', 'help')
  .argv;

async function runJob({ jobName, jsonJobArgs }) {
  const fileToRun = jobChoices[jobName];
  logger.info(`About to run job "${jobName}" with args "${jsonJobArgs}", launching this file : ${fileToRun}...`);
  await sleep(); // Need to wait here because logger doesn't pop on terminal right away and overlap with prompt
  console.log('🌸🌸🌸 Do you wish to continue ? (Y/N) 🌸🌸🌸');
  const { answer } = await prompt.get(['answer']);
  if (answer !== 'Y') {
    logger.info('Canceling job execution.');
    return;
  }
  logger.info('Executing job...');
  const jobModule = await importModule(fileToRun);
  const args = JSON.parse(jsonJobArgs);
  await jobModule.default(args);
  logger.info('Done.');
}

function sleep() {
  return new Promise((resolve) => setInterval(resolve, 500));
}

async function importModule(filePath) {
  try {
    const module = await import(filePath);
    return module;
  } catch (error) {
    logger.error(`Dynamic import of ${filePath} failed`);
    throw error;
  }
}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const jobName = argv.job;
  const jsonJobArgs = argv.args;
  await runJob({ jobName, jsonJobArgs });
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
