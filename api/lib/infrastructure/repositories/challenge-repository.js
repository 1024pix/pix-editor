import { challengeDatasource } from '../datasources/airtable/index.js';

export async function filter(params = {}) {
  if (params.filter && params.filter.ids) {
    return challengeDatasource.filter(params);
  }
  if (params.filter && params.filter.search) {
    return challengeDatasource.search(params);
  }
  return challengeDatasource.list(params);
}

export function create(challenge) {
  return challengeDatasource.create(challenge);
}

export function update(challenge) {
  return challengeDatasource.update(challenge);
}

export async function getAllIdsIn(challengeIds) {
  return challengeDatasource.getAllIdsIn(challengeIds);
}
