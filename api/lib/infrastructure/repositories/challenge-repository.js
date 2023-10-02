import { Challenge } from '../../domain/models/Challenge.js';
import { challengeDatasource } from '../datasources/airtable/index.js';
import { translationRepository } from './index.js';

export async function filter(params = {}) {
  let challengeDtos;
  if (params.filter && params.filter.ids) {
    challengeDtos = await challengeDatasource.filter(params);
  } else if (params.filter && params.filter.search) {
    challengeDtos = await challengeDatasource.search(params);
  } else {
    challengeDtos = await challengeDatasource.list(params);
  }
  return Promise.all(challengeDtos.map(async (challengeDto) => {
    const translations = await translationRepository.listByPrefix(`challenge.${challengeDto.id}.`);
    return toDomain(challengeDto, translations);
  }));
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

function toDomain(challengeDto, translations) {
  const formattedTranslations = translations.map(({ key, value }) => [ key.split('.').at(-1), value ]);
  return new Challenge({
    ...challengeDto,
    ...Object.fromEntries(formattedTranslations),
  });
}
