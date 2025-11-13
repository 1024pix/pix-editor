import Airtable from 'airtable';
import * as config from '../../config.js';
import { ChangelogEntry } from '../../domain/models/ChangelogEntry.js';

const TABLE_NAME = 'Notes';

function _airtableClient() {
  return new Airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.editorBase);
}

export async function listByElementId(elementId) {
  const airtableRecords = await _airtableClient().table(TABLE_NAME).select({
    filterByFormula: `AND(Record_Id = "${elementId}", Statut != "archive", Changelog = "oui")`,
    sort: [{ field: 'Date', direction: 'asc' }],
  }).all();

  return airtableRecords.map((record) => {
    return new ChangelogEntry({
      id: record.id,
      status: record.get('Statut'),
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
      Statut: changelogEntry.status,
      Texte: changelogEntry.text,
      Auteur: changelogEntry.author,
      Record_Id: changelogEntry.elementId,
      'Type d\'élément': changelogEntry.elementType,
      Changelog: 'oui',
    },
  };
  const records = await _airtableClient().table(TABLE_NAME).create([airtableRecordToCreate]);

  return new ChangelogEntry({
    id: records[0].id,
    status: records[0].get('Statut'),
    text: records[0].get('Texte'),
    author: records[0].get('Auteur'),
    createdAt: records[0].get('Date'),
    elementId: records[0].get('Record_Id'),
    elementType: records[0].get("Type d'élément"),
  });
}
