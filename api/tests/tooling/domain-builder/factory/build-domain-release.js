import { Release } from '../../../../lib/domain/models/release/index.js';
import { buildContentForRelease } from './build-content-for-release.js';

export const buildDomainRelease = function({
  id = 123,
  content = buildContentForRelease(),
  createdAt = new Date('2020-01-01'),
} = {}) {
  return new Release({
    id,
    content,
    createdAt,
  });
};

buildDomainRelease.withChallengesFromRelease = function({ id, challengesFromRelease, createdAt }) {
  return buildDomainRelease({
    id,
    content: buildContentForRelease({ challenges: challengesFromRelease }),
    createdAt,
  });
};
