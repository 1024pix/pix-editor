import { Readable, pipeline } from 'node:stream';
import csv from 'fast-csv';
import _ from 'lodash';
import { extractFromChallenge } from '../../infrastructure/translations/challenge.js';
import * as competenceTranslations from '../../infrastructure/translations/competence.js';
import * as skillTranslations from '../../infrastructure/translations/skill.js';
import * as areaTranslations from '../../infrastructure/translations/area.js';
import { mergeStreams } from '../../infrastructure/utils/merge-stream.js';
import { logger } from '../../infrastructure/logger.js';

export async function exportTranslations(stream, dependencies) {
  const release = await dependencies.releaseRepository.getLatestRelease();
  const rawLocalizedChallenges = await dependencies.localizedChallengeRepository.list();
  const localizedChallenges = _.groupBy(rawLocalizedChallenges, 'challengeId');

  const releaseContent = Object.fromEntries(
    Object.entries(release.content)
      .map(([collection, entities]) => [
        collection,
        Object.fromEntries(entities.map((entity) => [entity.id, entity])),
      ]),
  );

  const localeToExtract = 'fr';

  const filteredValidedChallenges = release.content.challenges
    .filter((challenge) => challenge.locales.includes(localeToExtract) && challenge.status === 'validé');

  const translationsStreams = mergeStreams(
    createTranslationsStream(release.content.competences, extractMetadataFromCompetence, releaseContent, 'competence', competenceTranslations.extractFromReleaseObject),
    createTranslationsStream(release.content.areas, extractMetadataFromArea, releaseContent, 'domaine', areaTranslations.extractFromReleaseObject),
    createTranslationsStream(release.content.skills, extractMetadataFromSkill, releaseContent, 'acquis', skillTranslations.extractFromReleaseObject),
    createTranslationsStream(filteredValidedChallenges, _.curry(extractMetadataFromChallenge)(dependencies.baseUrl, localizedChallenges), releaseContent, 'epreuve', extractFromChallenge),
  );

  const csvLinesStream = translationsStreams
    .filter(({ translation }) => translation.locale === localeToExtract)
    .filter(keepPixFramework)
    .map(translationAndTagsToCSVLine);

  pipeline(
    csvLinesStream,
    csv.format({ headers: true }),
    stream,
    (error) => {
      if (!error) return;
      logger.error({ error }, 'Error while exporting translations from release');
    },
  );
}

function createTranslationsStream(entities, extractMetadataFn, releaseContent, typeTag, extractTranslationsFn) {
  return Readable.from(entities)
    .map(extractMetadataFromObject(extractMetadataFn, releaseContent, typeTag))
    .flatMap(extractTranslationsFromObject(extractTranslationsFn));
}

function keepPixFramework({ tags }) {
  return tags.includes('Pix');
}

function toTag(tagName) {
  return _(tagName).deburr().replaceAll(' ', '_').replaceAll('@', '');
}

function toDescription(localizedChallenges, challenge, baseUrl) {
  const primaryLocalePreviewUrl = `Prévisualisation FR: ${baseUrl}/api/challenges/${challenge.id}/preview`;
  const alternativeLocalePreviewUrls = localizedChallenges[challenge.id]
    .filter(({ locale }) => locale !== 'fr')
    .map(({ locale }) => {
      return `Prévisualisation ${locale.toUpperCase()}: ${baseUrl}/api/challenges/${challenge.id}/preview?locale=${locale}`;
    });
  const peURL = `Pix Editor: ${baseUrl}/challenge/${challenge.id}`;

  return [primaryLocalePreviewUrl, ...alternativeLocalePreviewUrls, peURL].join('\n');
}

function extractMetadataFromObject(extractMetadataFn, releaseContent, typeTag) {
  return (object) => {
    const { tags: hierarchyTags, description } = extractMetadataFn(object, releaseContent);
    const tags = hierarchyTags.reverse().map((_, index) => {
      return hierarchyTags.slice(0, hierarchyTags.length - index).join('-');
    });

    return {
      tags: [typeTag, ...tags],
      description,
      object,
    };
  };
}

function translationAndTagsToCSVLine({ translation: { key, value }, tags, description }) {
  return {
    key,
    fr: value,
    tags: tags.join(),
    description,
  };
}

function extractTranslationsFromObject(extractFn) {
  return ({ description, tags, object }) => {
    return extractFn(object).map((translation) => {
      return { description, tags, translation };
    });
  };
}

function extractMetadataFromChallenge(baseUrl, localizedChallenges, challenge, releaseContent) {
  return {
    tags: extractTagsFromChallenge(challenge, releaseContent),
    description: toDescription(localizedChallenges, challenge, baseUrl),
  };
}

function extractMetadataFromSkill(skill, releaseContent) {
  return {
    tags: extractTagsFromSkill(skill, releaseContent),
    description: '',
  };
}

function extractMetadataFromArea(area, releaseContent) {
  return {
    tags: extractTagsFromArea(area, releaseContent),
    description: '',
  };
}

function extractMetadataFromCompetence(competence, releaseContent) {
  return {
    tags: extractTagsFromCompetence(competence, releaseContent),
    description: '',
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
