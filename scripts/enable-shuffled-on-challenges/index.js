const Airtable = require('airtable');
const { resolve } = require('path');
const { performance } = require('perf_hooks');
const { createLogger, format, transports } = require('winston');
const { readFile, utils: xlsxUtils, writeFileXLSX } = require('xlsx');

const logger = createLogger({
  format: format.combine(
    format.colorize(),
    format.simple(),
  ),
  transports: [
    new transports.Console(),
  ]
});

const enableShuffledOnChallenges = async ({ airtableClient, dryRun }) => {
  const excludedSkillIds = await readExcludes({ airtableClient });
  
  const challengesToBeShuffled = await listChallengesToBeShuffled({ airtableClient, excludedSkillIds });

  if (!dryRun) {
    // FIXME
  }

  _writeReport(challengesToBeShuffled);
};

/**
 * @param {{
 *   airtableClient: Airtable.Base
 * }} config
 */
async function readExcludes({ airtableClient }) {
  const excludesFile = resolve(__dirname, 'excludes.xlsx');
  const wb = readFile(excludesFile);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const excludes = xlsxUtils.sheet_to_json(ws, { header: [undefined, 'skillName'], range: 1 });

  const airtableSkills = await airtableClient.table('Acquis').select({ fields:['Nom'] }).all();

  return excludes.map(({ skillName }) => {
    return {
      skillIds: airtableSkills.filter(
        (skill) => skillName.localeCompare(skill.get('Nom'), 'fr', { sensitivity: 'base' }) === 0
      ).map((skill) => skill.getId()),
      skillName,
    };
  }).filter((exclude) => {
    const hasSkillId = exclude.skillIds.length > 0;
    if (!hasSkillId) {
      logger.error(`Skill "${exclude.skillName}" from excludes not found in Airtable`);
    }
    return hasSkillId;
  }).flatMap(({ skillIds }) => skillIds);
}

/**
 * @param {{
 *   airtableClient: Airtable.Base
 *   excludedSkillIds: string[]
 * }} config
 */
async function listChallengesToBeShuffled({ airtableClient, excludedSkillIds }) {
  let airtableChallenges = await airtableClient.table('Epreuves').select({
    fields: ['Acquix', 'shuffled'],
    filterByFormula: 'OR({Type d\'épreuve} = \'QCU\', {Type d\'épreuve} = \'QCM\')',
  }).all();

  let prevLength = airtableChallenges.length;
  airtableChallenges = airtableChallenges.filter(
    (challenge) => challenge.get('Acquix')?.every((skillId) => !excludedSkillIds.includes(skillId) ?? true)
  );
  logger.info(`Excluded ${prevLength - airtableChallenges.length} from a total of ${prevLength} QCU/QCM challenges`);

  prevLength = airtableChallenges.length;
  airtableChallenges = airtableChallenges.filter(
    (challenge) => !challenge.get('shuffled')
  );
  logger.info(`${prevLength - airtableChallenges.length} of ${prevLength} challenges are already shuffled`);

  return airtableChallenges;
}

function _writeReport(challenges) {
  const wb = xlsxUtils.book_new();

  const ws = xlsxUtils.aoa_to_sheet([
    ['ID Épreuve'],
    ...challenges.map((challenge) => [challenge.getId()]),
  ]);

  xlsxUtils.book_append_sheet(wb, ws, 'Challenges');

  writeFileXLSX(wb, resolve(__dirname, 'report.xlsx'));
}

function createAirtableClient({ apiKey, base }) {
  return new Airtable({ apiKey }).base(base);
}

async function main() {
  const startTime = performance.now();

  const {
    AIRTABLE_API_KEY: airtableApiKey,
    AIRTABLE_BASE: airtableBase,
  } = process.env;

  const dryRun = process.env.DRY_RUN !== 'false';

  logger.info(`Script ${__filename} has started`, {
    airtableApiKey,
    airtableBase,
    dryRun,
  });

  const airtableClient = createAirtableClient({ apiKey: airtableApiKey, base: airtableBase });
  await enableShuffledOnChallenges({ airtableClient, dryRun });

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

(async () => {
  const isLaunchedFromCommandLine = require.main === module;
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      logger.error(error);
      process.exitCode = 1;
    }
  }
})();

module.exports = {
  enableShuffledOnChallenges,
};
