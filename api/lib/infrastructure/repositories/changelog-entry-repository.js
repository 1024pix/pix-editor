import Airtable from 'airtable';
import * as config from '../../config.js';
import { ChangelogEntry } from '../../domain/models/ChangelogEntry.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areNullableValuesEqual, compareDtos, compareDtosLists } from './migration-from-airtable.js';

const AIRTABLE_NAME = 'Notes';

function _airtableClient() {
  return new Airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.editorBase);
}

export async function listByElementId(elementId) {
  const [airtableDtos, pgDtos] = await Promise.all([listByElementIdFromAirtable(elementId), knex.select('*').from('changelog_entries').where('elementId', elementId).orderBy('createdAt', 'asc')]);

  compareDtosLists(airtableDtos, pgDtos, compareChangelogEntryDtos, 'changelog_entries');

  return airtableDtos.map(toDomain);
}

async function listByElementIdFromAirtable(elementId) {
  const airtableRecords = await _airtableClient().table(AIRTABLE_NAME).select({
    filterByFormula: `AND(Record_Id = "${elementId}", Changelog = "oui")`,
    sort: [{ field: 'Date', direction: 'asc' }],
  }).all();

  return airtableRecords.map(airtableRecordToDto);
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
  const [airtableRecord] = await _airtableClient().table(AIRTABLE_NAME).create([airtableRecordToCreate]);

  const airtableDto = airtableRecordToDto(airtableRecord);

  const [pgDto] = await knex.insert({
    id: airtableDto.id,
    text: changelogEntry.text,
    author: changelogEntry.author,
    elementId: changelogEntry.elementId,
    elementType: changelogEntry.elementType,
  }).into('changelog_entries').returning('*');

  compareDtos(airtableDto, pgDto, compareChangelogEntryDtos, 'changelog_entries');

  return toDomain(airtableDto);
}

function toDomain(dto) {
  return new ChangelogEntry(dto);
}

function airtableRecordToDto(record) {
  return {
    id: record.id,
    text: record.get('Texte'),
    author: record.get('Auteur'),
    createdAt: record.get('Date'),
    elementId: record.get('Record_Id'),
    elementType: record.get("Type d'élément"),
  };
}

function compareChangelogEntryDtos(airtableDto, pgDto) {
  const diff = [];
  if (airtableDto.id !== pgDto.id) diff.push(`airtable id "${airtableDto.id}" != postgres id "${pgDto.id}"`);
  if (airtableDto.text !== pgDto.text) diff.push(`airtable text "${airtableDto.text}" != postgres text "${pgDto.text}"`);
  if (airtableDto.author !== pgDto.author) diff.push(`airtable author "${airtableDto.author}" != postgres author "${pgDto.author}"`);
  if (airtableDto.elementId !== pgDto.elementId) diff.push(`airtable elementId "${airtableDto.elementId}" != postgres elementId "${pgDto.elementId}"`);
  if (!areNullableValuesEqual(airtableDto.elementType, pgDto.elementType)) diff.push(`airtable elementType "${airtableDto.elementType}" != postgres elementType "${pgDto.elementType}"`);
  return diff;
}
