import Airtable from 'airtable';
import * as config from '../../config.js';
import { ChangelogEntry } from '../../domain/models/ChangelogEntry.js';
import { knex } from '../../../db/knex-database-connection.js';

const AIRTABLE_NAME = 'Notes';

function _airtableClient() {
  return new Airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.editorBase);
}

export async function listByElementId(elementId) {
  const airtableRecords = await _airtableClient().table(AIRTABLE_NAME).select({
    filterByFormula: `AND(Record_Id = "${elementId}", Changelog = "oui")`,
    sort: [{ field: 'Date', direction: 'asc' }],
  }).all();

  return airtableRecords.map((record) => {
    return new ChangelogEntry({
      id: record.id,
      text: record.get('Texte'),
      author: record.get('Auteur'),
      createdAt: record.get('Date'),
      elementId: record.get('Record_Id'),
      elementType: record.get("Type d'élément"),
    });
  });
}

export async function create(changelogEntry) {
  const airtableRecordToCreate = {
    fields: {
      Texte: changelogEntry.text,
      Auteur: changelogEntry.author,
      Record_Id: changelogEntry.elementId,
      'Type d\'élément': changelogEntry.elementType,
      Changelog: 'oui',
    },
  };
  const [record] = await _airtableClient().table(AIRTABLE_NAME).create([airtableRecordToCreate]);

  await knex.insert({
    id: record.id,
    text: changelogEntry.text,
    author: changelogEntry.author,
    elementId: changelogEntry.elementId,
    elementType: changelogEntry.elementType,
  }).into('changelog_entries');

  return new ChangelogEntry({
    id: record.id,
    text: record.get('Texte'),
    author: record.get('Auteur'),
    createdAt: record.get('Date'),
    elementId: record.get('Record_Id'),
    elementType: record.get("Type d'élément"),
  });
}
