import { Challenge } from '../../domain/models/Challenge.js';
import { challengeDatasource } from '../datasources/airtable/index.js';

export async function filter(params = {}) {
  let challengeDtos;
  if (params.filter && params.filter.ids) {
    challengeDtos = await challengeDatasource.filter(params);
  } else if (params.filter && params.filter.search) {
    challengeDtos = await challengeDatasource.search(params);
  } else {
    challengeDtos = await challengeDatasource.list(params);
  }
  return challengeDtos.map(toDomain);
}

export function create(challenge) {
  return challengeDatasource.create(challenge);
}

export function update(challenge) {
  return challengeDatasource.update(challenge);
}

export async function getAllIdsIn(challengeIds) {
  const challengeDtos = await challengeDatasource.getAllIdsIn(challengeIds);
  return challengeDtos.map(toDomain);
}

function toDomain(challengeDto) {
  return new Challenge(challengeDto);
}
