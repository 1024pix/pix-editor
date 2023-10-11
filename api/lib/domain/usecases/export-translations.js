import { Readable } from 'node:stream';
import csv from 'fast-csv';
import { releaseRepository } from '../../infrastructure/repositories/index.js';
import { extractFromChallenge } from '../../infrastructure/translations/challenge.js';
import { extractFromReleaseObject } from '../../infrastructure/translations/competence.js';

export async function exportTranslations(stream, dependencies = { releaseRepository }) {
  const release = await dependencies.releaseRepository.getLatestRelease();
  const csvStream = csv.format({ headers: true });
  csvStream.pipe(stream);

  function extractTagsFromObject(extractTagsFn, releaseContent, typeTag) {
    return (object) => {
      return {
        tags: [typeTag, ...extractTagsFn(object, releaseContent)],
        object,
      };
    };
  }

  function extractTags({ tags, translation: { key, value } }) {
    return {
      key,
      fr: value,
      tags: tags.join(),
    };
  }

  function extractTranslationsFromObject(extractFn) {
    return ({ tags, object }) => {
      return extractFn(object).map((translation) => {
        return { tags, translation };
      });
    };
  }

  const challengesStream = Readable.from(release.content.challenges)
    .filter((challenge) => challenge.locales.includes('fr'))
    .map(extractTagsFromObject(extractTagsFromChallenge, release.content, 'épreuve'))
    .flatMap(extractTranslationsFromObject(extractFromChallenge))
    .map(extractTags);

  const competencesStream = Readable.from(release.content.competences)
    .map(extractTagsFromObject(extractTagsFromCompetence, release.content, 'compétence'))
    .flatMap(extractTranslationsFromObject(extractFromReleaseObject))
    .filter(({ translation }) => translation.locale === 'fr')
    .map(extractTags);

  challengesStream.pipe(csvStream);
  competencesStream.pipe(csvStream);
}

function extractTagsFromChallenge(challenge, releaseContent) {
  const skill = releaseContent.skills.find(({ id }) => {
    return id === challenge.skillId;
  });
  return [
    ...extractTagsFromSkill(skill, releaseContent),
  ];
}

function extractTagsFromSkill(skill, releaseContent) {
  const tube = releaseContent.tubes.find(({ id }) => {
    return id === skill.tubeId;
  });
  return [
    skill.name,
    ...extractTagsFromTube(tube, releaseContent),
  ];
}

function extractTagsFromTube(tube, releaseContent) {
  const competence = releaseContent.competences.find(({ id }) => {
    return id === tube.competenceId;
  });
  return [
    tube.name,
    ...extractTagsFromCompetence(competence, releaseContent),
  ];
}

function extractTagsFromCompetence(competence, releaseContent) {
  const area = releaseContent.areas.find(({ id }) => {
    return id === competence.areaId;
  });
  return [
    competence.index,
    ...extractTagsFromArea(area, releaseContent),
  ];
}

function extractTagsFromArea(area, releaseContent) {
  const framework = releaseContent.frameworks.find(({ id }) => {
    return id === area.frameworkId;
  });
  return [
    area.code,
    framework.name,
  ];
}
