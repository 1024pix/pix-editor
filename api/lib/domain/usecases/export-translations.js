import { Readable, pipeline } from 'node:stream';
import csv from 'fast-csv';
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
  return tagName.replaceAll('é', 'e').replaceAll(' ', '_').replaceAll('@', '-');
}

function extractTagsFromObject(extractTagsFn, releaseContent, typeTag) {
  return (object) => {
    return {
      tags: [typeTag, ...extractTagsFn(object, releaseContent)],
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
    ...extractTagsFromSkill(releaseContent.skills[challenge.skillId], releaseContent),
    toTag(challenge.status),
  ];
}

function extractTagsFromSkill(skill, releaseContent) {
  if (skill === undefined) return [];
  return [
    toTag(`acquis${skill.name}`),
    ...extractTagsFromTube(releaseContent.tubes[skill.tubeId], releaseContent),
  ];
}

function extractTagsFromTube(tube, releaseContent) {
  return [
    toTag(`sujet${tube.name}`),
    ...extractTagsFromCompetence(releaseContent.competences[tube.competenceId], releaseContent),
  ];
}

function extractTagsFromCompetence(competence, releaseContent) {
  return [
    toTag(`competence-${competence.index}`),
    ...extractTagsFromArea(releaseContent.areas[competence.areaId], releaseContent),
  ];
}

function extractTagsFromArea(area, releaseContent) {
  return [
    toTag(`domaine-${area.code}`),
    toTag(`referentiel-${releaseContent.frameworks[area.frameworkId].name}`),
  ];
}
