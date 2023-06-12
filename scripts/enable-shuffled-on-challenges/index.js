const Airtable = require('airtable');
const { resolve } = require('path');
const { performance } = require('perf_hooks');
const { readFile, utils: xlsxUtils } = require('xlsx');

const enableShuffledOnChallenges = async ({ airtableClient }) => {
  const excludedSkillIds = await readExcludes({ airtableClient });
  console.log(excludedSkillIds);
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
      console.error(`Skill "${exclude.skillName}" from excludes not found in Airtable`);
    }
    return hasSkillId;
  }).flatMap(({ skillIds }) => skillIds);
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

  console.log(`Script ${__filename} has started`, {
    airtableApiKey,
    airtableBase,
  });

  const airtableClient = createAirtableClient({ apiKey: airtableApiKey, base: airtableBase });
  await enableShuffledOnChallenges({ airtableClient });

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
