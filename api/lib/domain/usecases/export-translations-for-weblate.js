import { pipeline, Readable } from 'node:stream';
import csv from 'fast-csv';
import _ from 'lodash';
import * as config from '../../config.js';
import { extractFromChallenge } from '../../infrastructure/translations/challenge.js';
import { localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import * as competenceTranslations from '../../infrastructure/translations/competence.js';
import * as thematicTranslations from '../../infrastructure/translations/thematic.js';
import * as skillTranslations from '../../infrastructure/translations/skill.js';
import * as areaTranslations from '../../infrastructure/translations/area.js';
import * as tubeTranslations from '../../infrastructure/translations/tube.js';
import { mergeStreams } from '../../infrastructure/utils/merge-stream.js';
import { logger } from '../../infrastructure/logger.js';
import { areLocalesEqual } from '../../infrastructure/utils/locale-utils.js';
import { Challenge } from '../models/index.js';

export async function exportTranslationsForWeblate({ stream, frameworkId, areaId, locale, release }) {
  const releaseContent = mapValues(release.content, (entities) => Object.fromEntries(entities.map((entity) => [entity.id, entity])));

  const localizedChallenges = Object.groupBy(
    await localizedChallengeRepository.list(),
    ({ challengeId }) => challengeId,
  );

  const areas = areaId
    ? [releaseContent.areas[areaId]]
    : release.content.areas.filter((area) => area.frameworkId === frameworkId);
  const areaIds = areas.map((area) => area.id);

  const competences = release.content.competences.filter((competence) => areaIds.includes(competence.areaId));
  const competenceIds = competences.map((competence) => competence.id);

  const thematics = release.content.thematics.filter((thematic) => competenceIds.includes(thematic.competenceId));

  const skills = release.content.skills.filter((skill) => competenceIds.includes(skill.competenceId) && skill.isActif);
  const skillIds = skills.map((skill) => skill.id);

  const tubeIds = skills.map((skill) => skill.tubeId);
  const tubes = release.content.tubes.filter((tube) => tubeIds.includes(tube.id));

  const validChallengesBySkillId = Map.groupBy(
    release.content.challenges.filter((challenge) => challenge.isValide),
    (challenge) => challenge.skillId,
  );

  const challenges = skillIds.flatMap((skillId) => {
    const skillValidChallenges = validChallengesBySkillId.get(skillId) ?? [];

    const localeChallenges = skillValidChallenges.filter((challenge) => challenge.hasLocale(locale));
    if (localeChallenges.length !== 0) {
      return localeChallenges;
    }

    return [];
  });

  const translationsStreams = mergeStreams(
    createTranslationsStream(
      areas,
      null,
      releaseContent,
      areaTranslations.extractFromReleaseObject,
      locale,
    ),
    createTranslationsStream(
      competences,
      null,
      releaseContent,
      competenceTranslations.extractFromReleaseObject,
      locale,
    ),
    createTranslationsStream(
      thematics,
      null,
      releaseContent,
      thematicTranslations.extractFromReleaseObject,
      locale,
    ),
    createTranslationsStream(
      tubes,
      null,
      releaseContent,
      tubeTranslations.extractFromReleaseObject,
      locale,
    ),
    createTranslationsStream(
      skills,
      null,
      releaseContent,
      skillTranslations.extractFromReleaseObject,
      locale,
    ),
    createTranslationsStream(
      challenges,
      (challenge, releaseContent) => extractMetadataFromChallenge(config.lcms.baseUrl, localizedChallenges, challenge, releaseContent),
      releaseContent,
      extractFromChallenge,
    ),
  );

  const csvLinesStream = translationsStreams.map(translationToCSVLine(locale));

  pipeline(csvLinesStream, csv.format({ headers: true }), stream, (error) => {
    if (!error) return;
    logger.error({ error }, 'Error while exporting translations from release');
  });
}

function createTranslationsStream(entities, extractMetadataFn, releaseContent, extractTranslationsFn, locale) {
  return Readable.from(entities)
    .map(extractMetadataFromObject(extractMetadataFn, releaseContent))
    .flatMap(extractTranslationsFromObject(extractTranslationsFn, [locale]));
}

function toDescription(localizedChallenges, challenge, baseUrl) {
  const primaryLocale = Challenge.getPrimaryLocale(challenge.locales);
  const primaryLocalePreviewUrl = `Preview ${primaryLocale.toUpperCase()}: ${baseUrl}/api/challenges/${challenge.id}/preview`;
  const alternativeLocalePreviewUrls = localizedChallenges[challenge.id]
    .filter(({ locale }) => !areLocalesEqual(locale, primaryLocale))
    .map(({ locale }) => {
      return `Preview ${locale.toUpperCase()}: ${baseUrl}/api/challenges/${challenge.id}/preview?locale=${locale}`;
    });
  const peURL = `Pix Editor: ${baseUrl}/challenge/${challenge.id}`;

  return [
    primaryLocalePreviewUrl,
    ...alternativeLocalePreviewUrls,
    peURL,
  ].join('\n');
}

function extractMetadataFromObject(extractMetadataFn, releaseContent) {
  return (object) => {
    if (!extractMetadataFn) {
      return { object };
    }
    const { description } = extractMetadataFn(object, releaseContent);

    return {
      description,
      object,
    };
  };
}

function translationToCSVLine(locale) {
  return ({ translation: { key, locale: translationLocale, value }, description }) => ({
    context: key,
    source: areLocalesEqual(locale, translationLocale) ? value : '',
    target: areLocalesEqual(locale, translationLocale) ? value : '',
    developer_comments: description,
  });
}

function extractTranslationsFromObject(extractFn, locales) {
  return ({ description, object }) => {
    return extractFn(object, locales).map((translation) => {
      return { description, translation };
    });
  };
}

function extractMetadataFromChallenge(baseUrl, localizedChallenges, challenge, _releaseContent) {
  return { description: toDescription(localizedChallenges, challenge, baseUrl) };
}

function mapValues(object, mapper) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, mapper(value)]));
}
