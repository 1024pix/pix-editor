const _ = require('lodash');
const fs = require('fs');
const Airtable = require('airtable');
const random = require('js-crypto-random');
const { base62_encode } =  require('@samwen/base62-util');
const { parseString } = require('@fast-csv/parse');

async function findAndDuplicateSkill(base, idGenerator, persistentId) {
  const skill = (await base.select({
    fields: ['id persistant', 'Indice', 'Indice fr-fr', 'Indice en-us', 'Statut de l\'indice', 'Compétence', 'Comprendre', 'En savoir plus', 'Tags', 'Description', 'Statut de la description', 'Level', 'Tube', 'Status', 'Internationalisation', 'Version'],
    filterByFormula: `{id persistant} = '${persistentId}'`,
    maxRecords: 1,
  }).all())[0];

  const createdRecords = await base.create([{
    fields: {
      ...skill.fields,
      'id persistant': idGenerator('skill'),
      Version: skill.get('Version') + 1,
      Status: 'en construction',
    }
  }]);
  return createdRecords[0].getId();
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

function idGenerator(prefix) {
  const randomString = random.getRandomAsciiString(10);
  const randomBase62 = base62_encode(randomString);
  return `${prefix}${randomBase62}`;
}

async function findChallengesFromASkill(base, sourceSkillIdPersistent) {
  return base.select({
    fields: [
      'id persistant',
      'Timer',
      'Consigne',
      'Propositions',
      'Type d\'épreuve',
      'Bonnes réponses',
      'Bonnes réponses à afficher',
      'T1 - Espaces, casse & accents',
      'T2 - Ponctuation',
      'T3 - Distance d\'édition',
      'Scoring',
      'Statut',
      'Embed URL',
      'Embed title',
      'Embed height',
      'Format',
      'files',
      'Réponse automatique',
      'Langues',
      'Consigne alternative',
      'Focalisée',
      'Acquix',
      'Généalogie',
      'Type péda',
      'Auteur',
      'Déclinable',
      'Version prototype',
      'Version déclinaison',
      'Non voyant',
      'Daltonien',
      'Spoil',
      'Responsive',
      'Géographie',
    ],
    filterByFormula: `{Acquix (id persistant)} = '${sourceSkillIdPersistent}'`,
  }).all();
}

async function duplicateAssociatedSkillChallenges(base, idGenerator, challenges, destinationSkillId) {
  const duplicatedChallenges = challenges.map((challenge) => {
    return {
      fields: {
        ...challenge.fields,
        'id persistant': idGenerator('challenge'),
        'Acquix': [destinationSkillId],
        'Focalisée': true,
      }
    }
  });

  return base.create(duplicatedChallenges);
}

async function main() {
  const csv = fs.readFileSync('./file.csv', 'utf-8');
  const airtableClient = createAirtableClient();
  const baseSkills = getBaseSkills(airtableClient);
  const baseChallenges = getBaseChallenges(airtableClient);
  parseString(csv, { headers: true })
    .on('error', error => console.error(error))
    .on('data', async (row) => {
      try {
        const sourceSkillIdPersistent = row.idPersistant;
        const newSkillId = await findAndDuplicateSkill(baseSkills, idGenerator, sourceSkillIdPersistent);
        await duplicateAssociatedSkillChallenges(baseChallenges, idGenerator, sourceSkillIdPersistent, newSkillId);
      } catch (e) {
        console.error(e);
      }
    })
    .on('end', () => console.log('The end'));
}

if (process.env.NODE_ENV !== 'test') {
  main();
}

module.exports = {
  findChallengesFromASkill,
  findAndDuplicateSkill,
  duplicateAssociatedSkillChallenges,
};
