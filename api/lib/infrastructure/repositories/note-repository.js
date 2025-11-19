import Airtable from 'airtable';
import * as config from '../../config.js';
import { Note } from '../../domain/models/Note.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areNullableValuesEqual, compareDtos, compareDtosLists } from './migration-from-airtable.js';

const TABLE_NAME = 'Notes';

function _airtableClient() {
  return new Airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.editorBase);
}

export async function listByChallengeId(challengeId) {
  const [airtableDtos, pgDtos] = await Promise.all([listByChallengeIdFromAirtable(challengeId), knex.select('*').from('notes').where('challengeId', challengeId).orderBy('createdAt', 'asc')]);

  compareDtosLists(airtableDtos, pgDtos, compareNoteDtos, 'notes');

  return airtableDtos.map(toDomain);
}

async function listByChallengeIdFromAirtable(challengeId) {
  const airtableRecords = await _airtableClient().table(TABLE_NAME).select({
    filterByFormula: `AND(Record_Id = "${challengeId}", Statut != "archive", Changelog = "non")`,
    sort: [{ field: 'Date', direction: 'asc' }],
  }).all();

  return airtableRecords.map(airtableRecordToDto);
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
  const [airtableRecord] = await _airtableClient().table(TABLE_NAME).create([airtableRecordToCreate]);

  const airtableDto = airtableRecordToDto(airtableRecord);

  const [pgDto] = await knex.insert({
    id: airtableDto.id,
    status: note.status,
    text: note.text,
    author: note.author,
    challengeId: note.challengeId,
  }).into('notes').returning('*');

  compareDtos(airtableDto, pgDto, compareNoteDtos, 'notes');

  return toDomain(airtableDto);
}

export async function update(noteId, note) {
  const airtableRecordToUpdate = {
    id: noteId,
    fields: {
      Statut: note.status,
      Texte: note.text,
      Auteur: note.author,
      Record_Id: note.challengeId,
    },
  };
  const [airtableRecord] = await _airtableClient().table(TABLE_NAME).update([airtableRecordToUpdate]);

  const airtableDto = airtableRecordToDto(airtableRecord);

  const [pgDto] = await knex('notes').update({
    status: note.status,
    text: note.text,
    author: note.author,
    challengeId: note.challengeId,
    updatedAt: knex.fn.now(),
  }).where('id', noteId).returning('*');

  compareDtos(airtableDto, pgDto, compareNoteDtos, 'notes');

  return toDomain(airtableDto);
}

function toDomain(dto) {
  return new Note(dto);
}

function airtableRecordToDto(record) {
  return {
    id: record.id,
    status: record.get('Statut'),
    text: record.get('Texte'),
    author: record.get('Auteur'),
    createdAt: record.get('Date'),
    challengeId: record.get('Record_Id'),
  };
}

function compareNoteDtos(airtableDto, pgDto) {
  const diff = [];
  if (airtableDto.id !== pgDto.id) diff.push(`airtable id "${airtableDto.id}" != postgres id "${pgDto.id}"`);
  if (airtableDto.text !== pgDto.text) diff.push(`airtable text "${airtableDto.text}" != postgres text "${pgDto.text}"`);
  if (!areNullableValuesEqual(airtableDto.status, pgDto.status)) diff.push(`airtable status "${airtableDto.status}" != postgres status "${pgDto.status}"`);
  if (airtableDto.author !== pgDto.author) diff.push(`airtable author "${airtableDto.author}" != postgres author "${pgDto.author}"`);
  if (airtableDto.challengeId !== pgDto.challengeId) diff.push(`airtable challengeId "${airtableDto.challengeId}" != postgres challengeId "${pgDto.challengeId}"`);
  return diff;
}
