import { Readable, pipeline } from 'node:stream';
import csv from 'fast-csv';
import _ from 'lodash';
import { releaseRepository } from '../../infrastructure/repositories/index.js';
import { extractFromChallenge } from '../../infrastructure/translations/challenge.js';
import * as competenceTranslations from '../../infrastructure/translations/competence.js';
import * as skillTranslations from '../../infrastructure/translations/skill.js';
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

  const frenchChallenges = release.content.challenges
    .filter((challenge) => challenge.locales.includes('fr'));

  const translationsStreams =  mergeStreams(
    createTranslationsStream(release.content.competences, extractTagsFromCompetence, releaseContent, 'competence',competenceTranslations.extractFromReleaseObject),
    createTranslationsStream(release.content.skills, extractTagsFromSkill, releaseContent, 'acquis', skillTranslations.extractFromReleaseObject),
    createTranslationsStream(frenchChallenges, extractTagsFromChallenge, releaseContent, 'epreuve', extractFromChallenge),
  );

  const csvLinesStream = translationsStreams
    .filter(({ translation }) => translation.locale === 'fr')
    .filter(keepPixFramework)
    .map(translationAndTagsToCSVLine);

  pipeline(
    csvLinesStream,
    csv.format({ headers: true }),
    stream,
    (error) => {
      logger.error({ error }, 'Error while exporting translations from release');
    },
  );
}

function createTranslationsStream(entities, extractTagsFn, releaseContent, typeTag, extractTranslationsFn) {
  return Readable.from(entities)
    .map(extractTagsFromObject(extractTagsFn, releaseContent, typeTag))
    .flatMap(extractTranslationsFromObject(extractTranslationsFn));
}

function keepPixFramework({ tags }) {
  return tags.includes('Pix');
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
