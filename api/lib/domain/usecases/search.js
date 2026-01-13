import { skillRepository, challengeRepository, localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import { NotFoundError } from '../errors.js';
import { SearchResult } from '../readmodels/index.js';

export async function search(filter, dependencies = { skillRepository, challengeRepository, localizedChallengeRepository }) {
  if (!filter) return [];

  if (filter.name.startsWith('@')) {
    const skills = await dependencies.skillRepository.search({
      filter: { name: filter.name },
      sort: [['name', 'asc'], ['version', 'desc']],
      page: { limit: 20 },
    });

    return skills.map((skill) => new SearchResult({
      type: 'skill',
      id: skill.id,
      title: skill.name,
      status: skill.status,
    }));
  }

  if (filter.name.startsWith('rec') || filter.name.startsWith('challenge')) {
    let localizedChallenge;
    try {
      localizedChallenge = await dependencies.localizedChallengeRepository.get({ id: filter.name });
    } catch (err) {
      if (err instanceof NotFoundError) return [];
      throw err;
    }

    const challenge = await dependencies.challengeRepository.get(localizedChallenge.challengeId);

    return [localizedChallengeToSearchResult(localizedChallenge, challenge)];
  }

  const localizedChallenges = await dependencies.localizedChallengeRepository.filter({
    filter: { search: filter.name },
    page: { limit: 20 },
  });
  if (localizedChallenges.length === 0) return [];

  const challenges = await dependencies.challengeRepository.getMany(localizedChallenges.map(({ challengeId }) => challengeId));
  const challengesById = Object.fromEntries(challenges.map((challenge) => [challenge.id, challenge]));

  return localizedChallenges.map((localizedChallenge) => localizedChallengeToSearchResult(localizedChallenge, challengesById[localizedChallenge.challengeId]));
}

function localizedChallengeToSearchResult(localizedChallenge, challenge) {
  return new SearchResult({
    type: 'challenge',
    id: localizedChallenge.id,
    title: challenge.translate(localizedChallenge.locale).instruction,
    status: challenge.status,
    locale: localizedChallenge.locale,
    isPrimary: localizedChallenge.isPrimary,
  });
}
