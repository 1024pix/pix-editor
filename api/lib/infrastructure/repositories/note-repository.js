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
      challengeId,
    });
  });
}

export async function create(note) {
  const airtableRecordToCreate = {
    fields: {
      Statut: note.status,
      Texte: note.text,
      Auteur: note.author,
      Record_Id: note.challengeId,
      'Type d\'élément': 'épreuve',
      Changelog: 'non',
    },
  };
  const records = await _airtableClient().table(TABLE_NAME).create([airtableRecordToCreate]);

  return new Note({
    id: records[0].id,
    status: records[0].get('Statut'),
    text: records[0].get('Texte'),
    author: records[0].get('Auteur'),
    createdAt: records[0].get('Date'),
    challengeId: records[0].get('Record_Id'),
  });
}

export async function update(noteId, note) {
  const airtableRecordToUpdate = {
    id: noteId,
    fields: {
      Statut: note.status,
      Texte: note.text,
      Auteur: note.author,
      Record_Id: note.challengeId,
      'Type d\'élément': 'épreuve',
      Changelog: 'non',
    },
  };
  const [record] = await _airtableClient().table(TABLE_NAME).update([airtableRecordToUpdate]);

  return new Note({
    id: record.id,
    status: record.get('Statut'),
    text: record.get('Texte'),
    author: record.get('Auteur'),
    createdAt: record.get('Date'),
    challengeId: record.get('Record_Id'),
  });
}
