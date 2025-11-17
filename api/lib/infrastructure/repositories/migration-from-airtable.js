import * as config from '../../config.js';
import { child } from '../logger.js';
import { getRequestId } from '../monitoring-tools.js';

const logger = child('airtable:migration', { event: 'migration-from-airtable' });

/**
 * @param {object[]} airtableDtos
 * @param {object[]} pgDtos
 * @param {(object, object) => string[]} compareFunc
 * @param {string} tableName
 */
export function compareDtosLists(airtableDtos, pgDtos, compareFunc, tableName) {
  const airtableIds = new Set(airtableDtos.map((airtableDtos) => airtableDtos.id));
  const pgIds = new Set(pgDtos.map((pgDtos) => pgDtos.id));

  const airtableOnlyIds = airtableIds.values().filter((id) => !pgIds.has(id)).toArray();
  const pgOnlyIds = pgIds.values().filter((id) => !airtableIds.has(id)).toArray();

  if (airtableOnlyIds.length !== 0 || pgOnlyIds.length !== 0) {
    logDifference(
      {
        tableName,
        airtableCount: airtableDtos.length,
        postgresCount: pgDtos.length,
        airtableOnlyIds,
        pgOnlyIds,
      },
      'difference between airtable and postgres dtos',
    );
    return;
  }

  const sortedAirtableDtos = airtableDtos.toSorted(byId);
  const sortedPgDtos = pgDtos.toSorted(byId);

  sortedAirtableDtos.forEach((airtableDto, i) => compareDtos(airtableDto, sortedPgDtos[i], compareFunc, tableName));
}

export function compareDtos(airtableDto, pgDto, compareFunc, tableName) {
  if (airtableDto == null && pgDto == null) return;
  if (airtableDto == null && pgDto != null) {
    logDifference({ tableName, entityId: pgDto.id }, 'airtable dto empty whereas postgres dto not empty');
    return;
  }
  if (airtableDto != null && pgDto == null) {
    logDifference({ tableName, entityId: airtableDto.id }, 'airtable dto not empty whereas postgres dto empty');
    return;
  }
  const diff = compareFunc(airtableDto, pgDto);
  if (diff.length === 0) return;
  logDifference({ diff, tableName, entityId: airtableDto.id }, 'difference between airtable and postgres dtos');
}

export function areArrayEquals(array1, array2, { sortFn, compareFn = (value1, value2) => value1 === value2 } = {}) {
  if (array1 == null && array2 == null) return true;
  if (array1 == null && array2 != null) return false;
  if (array1 != null && array2 == null) return false;
  if (array1.length !== array2.length) return false;
  const sortedArray2 = array2.toSorted(sortFn);
  return array1.toSorted(sortFn).every((value, i) => compareFn(value, sortedArray2[i]));
}

export function areNullableValuesEqual(value1, value2) {
  if (value1 == null && value2 == null) return true;
  return value1 === value2;
}

export function areNullableDatesEqual(date1, date2) {
  if (date1 == null && date2 == null) return true;
  if (date1 == null && date2 != null) return false;
  if (date1 != null && date2 == null) return false;
  return new Date(date1).getTime() === new Date(date2).getTime();
}

function byId(dto1, dto2) {
  return dto1.id < dto2.id ? -1 : +1;
}

function logDifference(data, msg) {
  const request_id = getRequestId();
  logger.warn({ request_id, ...data }, msg);
  if (config.migrationFromAirtable.throwOnPostgresDifference) {
    console.error(msg, data);
    throw new Error(msg);
  }
}
