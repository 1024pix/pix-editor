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

async function main() {
  const csv = fs.readFileSync('./file.csv', 'utf-8');
  const base = getBaseSkills();
    parseString(csv, { headers: true })
    .on('error', error => console.error(error))
    .on('data', row => {
      findAndDuplicateSkill(base, idGenerator, row.idPersistant).catch((e)=> console.error(e))
    })
    .on('end', () => console.log('test'));
}

if (process.env.NODE_ENV !== 'test') {
  main();
}

module.exports = {
  findAndDuplicateSkill
};
