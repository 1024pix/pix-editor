import * as config from '../../config.js';
import { child } from '../logger.js';

const logger = child('airtable:migration', {
  event: 'migration-from-airtable',
});

/**
 * @param {object[]} airtableDtos
 * @param {object[]} pgDtos
 * @param {(object, object) => string[]} compareFunc
 */
export function compareDtosLists(airtableDtos, pgDtos, compareFunc) {
  if (airtableDtos.length !== pgDtos.length) {
    logger.warn(
      {
        airtableCount: airtableDtos.length,
        postgresCount: pgDtos.length,
      },
      'difference between airtable and postgres dtos count',
    );
    if (config.migrationFromAirtable.throwOnPostgresDifference) {
      console.error('difference between airtable and postgres dtos count', {
        airtableCount: airtableDtos.length,
        postgresCount: pgDtos.length,
      });
      throw new Error('difference between airtable and postgres dtos count');
    }
    return;
  }
  const sortedAirtableDtos = airtableDtos.toSorted(byId);
  const sortedPgDtos = pgDtos.toSorted(byId);
  sortedAirtableDtos.forEach((airtableDto, i) => compareDtos(airtableDto, sortedPgDtos[i], compareFunc));
}

export function compareDtos(airtableDto, pgDto, compareFunc) {
  if (airtableDto == null && pgDto == null) return;
  if (airtableDto == null && pgDto != null) {
    logger.warn('airtable dto empty whereas postgres dto not empty');
    if (config.migrationFromAirtable.throwOnPostgresDifference) {
      console.error('airtable dto empty whereas postgres dto not empty');
      throw new Error('airtable dto empty whereas postgres dto not empty');
    }
    return;
  }
  if (airtableDto != null && pgDto == null) {
    logger.warn('airtable dto not empty whereas postgres dto empty');
    if (config.migrationFromAirtable.throwOnPostgresDifference) {
      console.error('airtable dto not empty whereas postgres dto empty');
      throw new Error('airtable dto not empty whereas postgres dto empty');
    }
    return;
  }
  const diff = compareFunc(airtableDto, pgDto);
  if (diff.length === 0) return;
  logger.warn({ diff }, 'difference between airtable and postgres dtos');
  if (config.migrationFromAirtable.throwOnPostgresDifference) {
    console.error('difference between airtable and postgres dtos', diff);
    throw new Error('difference between airtable and postgres dtos');
  }
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
