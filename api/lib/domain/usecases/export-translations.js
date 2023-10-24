import { Readable, pipeline } from 'node:stream';
import csv from 'fast-csv';
import _ from 'lodash';
import { releaseRepository } from '../../infrastructure/repositories/index.js';
import { extractFromChallenge } from '../../infrastructure/translations/challenge.js';
import { extractFromReleaseObject } from '../../infrastructure/translations/competence.js';
import { mergeStreams } from '../../infrastructure/utils/merge-stream.js';
import { logger } from '../../infrastructure/logger.js';

export async function exportTranslations(stream, dependencies = { releaseRepository }) {
  const release = await dependencies.releaseRepository.getLatestRelease();

  const releaseContent = Object.fromEntries(
    Object.entries(release.content)
      .map(([collection, entities]) => [
        collection,
        Object.fromEntries(entities.map((entity) => [entity.id, entity])),
      ]),
  );

  const challengesStream = Readable.from(release.content.challenges)
    .filter((challenge) => challenge.locales.includes('fr'))
    .map(extractTagsFromObject(extractTagsFromChallenge, releaseContent, 'epreuve'))
    .flatMap(extractTranslationsFromObject(extractFromChallenge))
    .map(translationAndTagsToCSVLine);

  const competencesStream = Readable.from(release.content.competences)
    .map(extractTagsFromObject(extractTagsFromCompetence, releaseContent, 'competence'))
    .flatMap(extractTranslationsFromObject(extractFromReleaseObject))
    .filter(({ translation }) => translation.locale === 'fr')
    .map(translationAndTagsToCSVLine);

  pipeline(
    mergeStreams(competencesStream, challengesStream),
    csv.format({ headers: true }),
    stream,
    (error) => {
      logger.error({ error }, 'Error while exporting translations from release');
    },
  );
}

function toTag(tagName) {
  return _(tagName).deburr().replaceAll(' ', '_').replaceAll('@', '');
}

function extractTagsFromObject(extractTagsFn, releaseContent, typeTag) {
  return (object) => {
    const hierarchyTags = extractTagsFn(object, releaseContent).reverse();
    const tags = hierarchyTags.map((_, index) => {
      return hierarchyTags.slice(0,hierarchyTags.length - index).join('-');
    });

    return {
      tags: [typeTag, ...tags],
      object,
    };
  };
}

function translationAndTagsToCSVLine({ translation: { key, value }, tags }) {
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

function extractTagsFromChallenge(challenge, releaseContent) {
  return [
    toTag(challenge.status),
    ...extractTagsFromSkill(releaseContent.skills[challenge.skillId], releaseContent),
  ];
}

function extractTagsFromSkill(skill, releaseContent) {
  if (skill === undefined) return [];
  return [
    toTag(skill.name),
    ...extractTagsFromTube(releaseContent.tubes[skill.tubeId], releaseContent),
  ];
}

function extractTagsFromTube(tube, releaseContent) {
  return [
    toTag(tube.name),
    ...extractTagsFromCompetence(releaseContent.competences[tube.competenceId], releaseContent),
  ];
}

function extractTagsFromCompetence(competence, releaseContent) {
  return [
    toTag(competence.index),
    ...extractTagsFromArea(releaseContent.areas[competence.areaId], releaseContent),
  ];
}

function extractTagsFromArea(area, releaseContent) {
  return [
    toTag(area.code),
    toTag(releaseContent.frameworks[area.frameworkId].name),
  ];
}
