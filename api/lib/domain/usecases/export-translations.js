import { pipeline, Readable } from 'node:stream';
import csv from 'fast-csv';
import _ from 'lodash';
import { extractFromChallenge } from '../../infrastructure/translations/challenge.js';
import * as competenceTranslations from '../../infrastructure/translations/competence.js';
import * as thematicTranslations from '../../infrastructure/translations/thematic.js';
import * as skillTranslations from '../../infrastructure/translations/skill.js';
import * as areaTranslations from '../../infrastructure/translations/area.js';
import * as tubeTranslations from '../../infrastructure/translations/tube.js';
import { mergeStreams } from '../../infrastructure/utils/merge-stream.js';
import { logger } from '../../infrastructure/logger.js';
import { areLocalesEqual } from '../../infrastructure/utils/locale-utils.js';
import { Challenge } from '../models/index.js';

export async function exportTranslations(stream, filters, dependencies) {
  const release = dependencies.release;
  const releaseContent = mapValues(release.content, (entities) => Object.fromEntries(entities.map((entity) => [entity.id, entity])));

  const localizedChallenges = Object.groupBy(
    await dependencies.localizedChallengeRepository.list(),
    ({ challengeId }) => challengeId,
  );

  const areas = filters.areaId
    ? [releaseContent.areas[filters.areaId]]
    : release.content.areas.filter((area) => area.frameworkId === filters.frameworkId);
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

    for (const locale of filters.locales) {
      const localeChallenges = skillValidChallenges.filter((challenge) => challenge.hasLocale(locale));
      if (localeChallenges.length !== 0) {
        return localeChallenges;
      }
    }

    return [];
  });

  const translationsStreams = mergeStreams(
    createTranslationsStream(
      areas,
      extractMetadataFromArea,
      releaseContent,
      'domaine',
      areaTranslations.extractFromReleaseObject,
      filters.locales,
    ),
    createTranslationsStream(
      competences,
      extractMetadataFromCompetence,
      releaseContent,
      'competence',
      competenceTranslations.extractFromReleaseObject,
      filters.locales,
    ),
    createTranslationsStream(
      thematics,
      extractMetadataFromThematic,
      releaseContent,
      'thematique',
      thematicTranslations.extractFromReleaseObject,
      filters.locales,
    ),
    createTranslationsStream(
      tubes,
      extractMetadataFromTube,
      releaseContent,
      'sujet',
      tubeTranslations.extractFromReleaseObject,
      filters.locales,
    ),
    createTranslationsStream(
      skills,
      extractMetadataFromSkill,
      releaseContent,
      'acquis',
      skillTranslations.extractFromReleaseObject,
      filters.locales,
    ),
    createTranslationsStream(
      challenges,
      (challenge, releaseContent) => extractMetadataFromChallenge(dependencies.baseUrl, localizedChallenges, challenge, releaseContent),
      releaseContent,
      'epreuve',
      extractFromChallenge,
    ),
  );

  const csvLinesStream = translationsStreams.map(translationAndTagsToCSVLine(filters.locales));

  pipeline(csvLinesStream, csv.format({ headers: true }), stream, (error) => {
    if (!error) return;
    logger.error({ error }, 'Error while exporting translations from release');
  });
}

function createTranslationsStream(entities, extractMetadataFn, releaseContent, typeTag, extractTranslationsFn, locales) {
  return Readable.from(entities)
    .map(extractMetadataFromObject(extractMetadataFn, releaseContent, typeTag))
    .flatMap(extractTranslationsFromObject(extractTranslationsFn, locales));
}

function toTag(tagName) {
  return _.deburr(tagName).replaceAll(' ', '_').replaceAll('@', '');
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

function translationAndTagsToCSVLine(locales) {
  return ({ translation: { key, locale: translationLocale, value }, tags, description }) => ({
    key,
    ...Object.fromEntries(locales.map((locale) => [locale, areLocalesEqual(locale, translationLocale) ? value : ''])),
    tags: tags.join(),
    description,
  });
}

function extractTranslationsFromObject(extractFn, locales) {
  return ({ description, tags, object }) => {
    return extractFn(object, locales).map((translation) => {
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

function extractMetadataFromTube(tube, releaseContent) {
  return {
    tags: extractTagsFromTube(tube, releaseContent),
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

function extractMetadataFromThematic(thematic, releaseContent) {
  return {
    tags: extractTagsFromThematic(thematic, releaseContent),
    description: '',
  };
}

function extractTagsFromChallenge(challenge, releaseContent) {
  return [toTag(challenge.status), ...extractTagsFromSkill(releaseContent.skills[challenge.skillId], releaseContent)];
}

function extractTagsFromSkill(skill, releaseContent) {
  if (skill === undefined) return [];
  return [toTag(skill.name), ...extractTagsFromTube(releaseContent.tubes[skill.tubeId], releaseContent)];
}

function extractTagsFromTube(tube, releaseContent) {
  return [toTag(tube.name), ...extractTagsFromCompetence(releaseContent.competences[tube.competenceId], releaseContent)];
}

function extractTagsFromThematic(thematic, releaseContent) {
  return extractTagsFromCompetence(releaseContent.competences[thematic.competenceId], releaseContent);
}

function extractTagsFromCompetence(competence, releaseContent) {
  return [toTag(competence.index), ...extractTagsFromArea(releaseContent.areas[competence.areaId], releaseContent)];
}

function extractTagsFromArea(area, releaseContent) {
  return [toTag(area.code), toTag(releaseContent.frameworks[area.frameworkId].name)];
}

function mapValues(object, mapper) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, mapper(value)]));
}
