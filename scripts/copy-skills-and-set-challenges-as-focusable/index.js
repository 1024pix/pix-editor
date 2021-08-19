const _ = require('lodash');
const fs = require('fs');
const Airtable = require('airtable');
const random = require('js-crypto-random');
const { base62_encode } =  require('@samwen/base62-util');
const { parseString } = require('@fast-csv/parse');
const axios = require('axios');
const getToken = require('../common/token');
const ProgressBar = require('progress');
const bluebird = require('bluebird');
const { USEFUL_SKILL_FIELDS, USEFUL_CHALLENGE_FIELDS } = require('./airtable-fields');

async function main() {
  const csv = fs.readFileSync('./file.csv', 'utf-8');
  const airtableClient = createAirtableClient();
  const baseSkills = getBaseSkills(airtableClient);
  const baseChallenges = getBaseChallenges(airtableClient);
  const baseAttachments = getBaseAttachments(airtableClient);
  const token = await getToken();

  const rows = await getRows(csv);

  const bar = new ProgressBar('[:bar] :percent', {
    total: rows.length,
    width: 50,
  });

  bluebird.mapSeries(async (row) => {
    try {
      const sourceSkillIdPersistent = row.idPersistant;
      const skill = await findSkill(baseSkills, sourceSkillIdPersistent);
      const newSkill = await duplicateSkill(baseSkills, idGenerator, skill);
      const challenges = await findChallengesFromASkill(baseChallenges, sourceSkillIdPersistent);
      const duplicatedChallenges = await Promise.all(challenges.map(async (challenge) => {
        const newAttachmentsIds = await cloneAttachmentsFromAChallenge(baseAttachments, token, challenge.get('id persistant'));
        return prepareNewChallenge(challenge, newSkill.getId(), newAttachmentsIds, idGenerator);
      }));
      await bulkCreate(baseChallenges, duplicatedChallenges);
      await archiveChallenges(baseChallenges, challenges);
      await archiveSkill(baseSkills, skill);
      await activateSkill(baseSkills, newSkill);
    } catch (e) {
      console.log('row error: ', row);
      console.error(e);
    }
    bar.tick();
  });
}

function createAirtableClient() {
  return new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE);
}

function getBaseSkills(table) {
  return table('Acquis');
}

function getBaseChallenges(table) {
  return table('Epreuves');
}

function getBaseAttachments(table) {
  return table('Attachments');
}

function getRows(csvData) {
  return new Promise((resolve, reject) => {
    const rows = [];

    parseString(csvData, { headers: true })
      .on('error', (error) => {
        console.error(error);
        reject(error);
      })
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', () => resolve(rows));
  });
}

async function findSkill(base, persistentId) {
  const foundSkills = await base.select({
    fields: USEFUL_SKILL_FIELDS,
    filterByFormula: `{id persistant} = '${persistentId}'`,
    maxRecords: 1,
  }).all();
  return foundSkills[0];
}

async function duplicateSkill(base, idGenerator, skill) {
  const createdSkills = await base.create([{
    fields: {
      ...skill.fields,
      'id persistant': idGenerator('skill'),
      Version: skill.get('Version') + 1,
      Status: 'en construction',
    }
  }]);
  return createdSkills[0];
}

async function findChallengesFromASkill(base, sourceSkillIdPersistent) {
  return base.select({
    fields: USEFUL_CHALLENGE_FIELDS,
    filterByFormula: `AND({Acquix (id persistant)} = '${sourceSkillIdPersistent}', OR({Statut} = 'validé', {Statut} = 'validé sans test', {Statut} = 'pré-validé'))`,
  }).all();
}

async function cloneAttachmentsFromAChallenge(base, token, challengePersistentId, clock = Date) {
  const attachments = await base.select({
    fields: [
      'filename',
      'size',
      'alt',
      'url',
      'mimeType',
      'type',
    ],
    filterByFormula : `{challengeId persistant} = '${challengePersistentId}'`
  }).all();

  const duplicatedAttachments = await Promise.all(attachments.map((attachment) => {
    return cloneAndPrepareAttachment(attachment, token, clock);
  }));

  const newAttachments = await bulkCreate(base, duplicatedAttachments);

  return newAttachments.map((attachment) => attachment.getId());
}

async function cloneAndPrepareAttachment(attachment, token, clock) {
  const attachmentUrl = await cloneFile(token, attachment.get('url'), attachment.getId(), attachment.get('filename'), clock);
  return {
    fields: {
      ...attachment.fields,
      url: attachmentUrl,
    }
  };
}

async function cloneFile(token, originalUrl, randomString, filename, clock = Date) {
  const parsedUrl = new URL(originalUrl);
  const newUrl = parsedUrl.protocol + '//' + parsedUrl.hostname + '/' + randomString + clock.now() + '/' + encodeURIComponent(filename);

  const config = {
    headers: {
      'X-Auth-Token': token,
      'X-Copy-From': process.env.BUCKET_NAME + parsedUrl.pathname,
    }
  };

  try {
    await axios.put(newUrl, null, config);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  return newUrl;
}

function prepareNewChallenge(challenge, destinationSkillId, newAttachmentsId, idGenerator) {
  return {
    fields: {
      ...challenge.fields,
      'id persistant': idGenerator('challenge'),
      'Acquix': [destinationSkillId],
      'Focalisée': true,
      'files': newAttachmentsId,
    }
  };
}

function idGenerator(prefix) {
  const randomString = random.getRandomAsciiString(10);
  const randomBase62 = base62_encode(randomString);
  return `${prefix}${randomBase62}`;
}

function archiveSkill(base, skill) {
  return changeSkillStatus(base, skill, 'archivé');
}

function activateSkill(base, skill) {
  return changeSkillStatus(base, skill, 'actif');
}

function changeSkillStatus(base, skill, status) {
  const updatedSkill = {
    id: skill.getId(),
    fields: {
      'Status': status,
    },
  };

  return base.update([updatedSkill]);
}

function archiveChallenges(base, challenges) {
  const archivedChallenges = challenges.map((challenge) => {
    return {
      id: challenge.getId(),
      fields: {
        'Statut': 'archivé',
      },
    };
  });

  return bulkUpdate(base, archivedChallenges);
}

async function bulkCreate(base, records) {
  return bulkOnBase(base, 'create', records);
}

async function bulkUpdate(base, records) {
  return bulkOnBase(base, 'update', records);
}

async function bulkOnBase(base, method, records) {
  const recordsChunk = _.chunk(records, 10);
  const promises = recordsChunk.map(async (records) => {
    return base[method](records);
  });
  const newRecords = await Promise.all(promises);
  return newRecords.flat();
}

if (process.env.NODE_ENV !== 'test') {
  main();
} else {
  module.exports = {
    archiveChallenges,
    archiveSkill,
    activateSkill,
    bulkCreate,
    bulkUpdate,
    cloneAttachmentsFromAChallenge,
    duplicateSkill,
    findChallengesFromASkill,
    findSkill,
    prepareNewChallenge,
  };
}
