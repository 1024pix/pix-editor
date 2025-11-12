import Airtable from 'airtable';
import * as config from '../../config.js';
import { Note } from '../../domain/models/Note.js';

const TABLE_NAME = 'Notes';

function _airtableClient() {
  return new Airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.editorBase);
}

export async function listByChallengeId(challengeId) {
  const airtableRecords = await _airtableClient().table(TABLE_NAME).select({
    filterByFormula: `AND(Record_Id = "${challengeId}", Statut != "archive", Changelog = "non")`,
    sort: [{ field: 'Date', direction: 'asc' }],
  }).all();

  return airtableRecords.map((record) => {
    return new Note({
      id: record.id,
      status: record.get('Statut'),
      text: record.get('Texte'),
      author: record.get('Auteur'),
      createdAt: record.get('Date'),
    });
  });
}
