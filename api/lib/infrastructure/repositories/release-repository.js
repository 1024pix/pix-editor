import {
  areaDatasource,
  attachmentDatasource,
  challengeDatasource,
  competenceDatasource,
  frameworkDatasource,
  skillDatasource,
  thematicDatasource,
  tubeDatasource,
  tutorialDatasource,
} from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as challengeRepository from './challenge-repository.js';
import * as airtableSerializer from '../serializers/airtable-serializer.js';
import {
  challengeTransformer,
  competenceTransformer,
  skillTransformer,
  tubeTransformer,
  tutorialTransformer,
} from '../transformers/index.js';
import * as tablesTranslations from '../translations/index.js';
import * as competenceTranslations from '../translations/competence.js';
import { Content, Release } from '../../domain/models/release/index.js';

import { knex } from '../../../db/knex-database-connection.js';

export function getCurrentContent() {
  return _getCurrentContent();
}

export async function create(getCurrentContent = _getCurrentContent) {
  const content = await getCurrentContent();
  const release = await knex('releases')
    .insert({ content }, ['id']);

  return release[0].id;
}

export async function getLatestRelease() {
  const release = await knex('releases')
    .select('id', 'content', 'createdAt')
    .orderBy('createdAt', 'desc')
    .limit(1);

  return _toDomain(release[0]);
}

export async function getRelease(id) {
  const release = await knex('releases')
    .select('id', 'content', 'createdAt')
    .where('id', id);

  return _toDomain(release[0]);
}

export async function serializeEntity({ type, entity, translations }) {
  const { updatedRecord, model } = airtableSerializer.serialize({
    airtableObject: entity,
    tableName: type
  });

  if (model === attachmentDatasource.path()) {
    const [rawChallenge] = await challengeRepository.filter({ filter: { ids: [updatedRecord.challengeId] } });
    const attachments = await attachmentDatasource.filterByChallengeId(updatedRecord.challengeId);
    const transformChallenge = challengeTransformer.createChallengeTransformer({ attachments });
    const challenge = transformChallenge(rawChallenge);

    return { updatedRecord: challenge, model: challengeDatasource.path() };
  }

  tablesTranslations[type]?.hydrateReleaseObject?.(updatedRecord, translations);

  return { updatedRecord, model };
}

function _toDomain(releaseDTO) {
  if (!releaseDTO) {
    return null;
  }
  return new Release({
    id: releaseDTO.id,
    content: Content.buildForRelease(releaseDTO.content),
    createdAt: releaseDTO.createdAt,
  });
}

async function _getCurrentContent() {
  const challenges = await challengeRepository.list();
  const [currentContentFromAirtable, currentContentFromPG] = await Promise.all([
    _getCurrentContentFromAirtable(challenges),
    _getCurrentContentFromPG(challenges),
  ]);
  return {
    ...currentContentFromAirtable,
    ...currentContentFromPG
  };
}

async function _getCurrentContentFromAirtable(challenges) {
  const [
    areas,
    attachments,
    competences,
    frameworks,
    skills,
    thematics,
    tubes,
    tutorials,
    translations,
  ] = await Promise.all([
    areaDatasource.list(),
    attachmentDatasource.list(),
    competenceDatasource.list(),
    frameworkDatasource.list(),
    skillDatasource.list(),
    thematicDatasource.list(),
    tubeDatasource.list(),
    tutorialDatasource.list(),
    translationRepository.listByPrefix(competenceTranslations.prefix),
  ]);
  const transformChallenge = challengeTransformer.createChallengeTransformer({ attachments, withLocalizedChallenges: true });
  const transformedChallenges = challenges.flatMap(transformChallenge);
  const transformedTubes = tubeTransformer.transform({ tubes, skills, challenges: transformedChallenges, thematics });
  const filteredCompetences = competenceTransformer.filterCompetencesFields(competences);
  const filteredSkills = skillTransformer.filterSkillsFields(skills);
  const filteredTutorials = tutorialTransformer.filterTutorialsFields(tutorials);

  filteredCompetences.forEach((competence) => competenceTranslations.hydrateReleaseObject(competence, translations));

  return {
    frameworks,
    areas,
    competences: filteredCompetences,
    thematics,
    tubes: transformedTubes,
    skills: filteredSkills,
    challenges: transformedChallenges,
    tutorials: filteredTutorials,
  };
}

async function _getCurrentContentFromPG(airtableChallenges) {
  const staticCoursesDTO = await knex('static_courses')
    .select(['id', 'name', 'description', 'isActive', 'challengeIds'])
    .orderBy('id');
  return {
    courses: staticCoursesDTO.map(({ id, name, description, isActive, challengeIds }) => {
      const challenges = challengeIds.replaceAll(' ', '').split(',');
      const competences = challenges.map((challengeId) => {
        return airtableChallenges.find((airtableChallenge) => airtableChallenge.id === challengeId).competenceId;
      });
      return {
        id,
        name,
        description,
        isActive,
        challenges,
        competences,
      };
    }),
  };
}
