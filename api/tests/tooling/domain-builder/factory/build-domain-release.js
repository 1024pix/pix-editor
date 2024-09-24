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

buildDomainRelease.withContent = function({
  id = 123,
  frameworksFromRelease,
  areasFromRelease,
  competencesFromRelease,
  thematicsFromRelease,
  tubesFromRelease,
  skillsFromRelease,
  challengesFromRelease,
  tutorialsFromRelease,
  missionsFromRelease,
  createdAt = new Date('2020-01-01'),
}) {
  return buildDomainRelease({
    id,
    content: buildContentForRelease({
      frameworks: frameworksFromRelease,
      areas: areasFromRelease,
      competences: competencesFromRelease,
      thematics: thematicsFromRelease,
      tubes: tubesFromRelease,
      skills: skillsFromRelease,
      challenges: challengesFromRelease,
      tutorials: tutorialsFromRelease,
      missions: missionsFromRelease,
    }),
    createdAt,
  });
};
