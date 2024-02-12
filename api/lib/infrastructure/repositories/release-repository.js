import _ from 'lodash';
import {
  attachmentDatasource,
  challengeDatasource,
  frameworkDatasource,
  thematicDatasource,
  tubeDatasource,
  tutorialDatasource,
} from '../datasources/airtable/index.js';
import {
  areaRepository,
  challengeRepository,
  competenceRepository,
  missionRepository,
  skillRepository,
} from './index.js';
import * as airtableSerializer from '../serializers/airtable-serializer.js';
import {
  createChallengeTransformer,
  competenceTransformer,
  skillTransformer,
  tubeTransformer,
  tutorialTransformer,
} from '../transformers/index.js';
import * as tablesTranslations from '../translations/index.js';
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
    const attachments = await attachmentDatasource.filterByLocalizedChallengeId(updatedRecord.challengeId);
    const transformChallenge = createChallengeTransformer({ attachments });
    const challenge = transformChallenge(rawChallenge);

    return { updatedRecord: challenge, model: challengeDatasource.path() };
  }

  if (!tablesTranslations[type]?.toDomain) return { updatedRecord, model };

  return {
    updatedRecord: {
      ...updatedRecord,
      ...tablesTranslations[type].toDomain(translations, updatedRecord),
    },
    model,
  };
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
    _getCurrentContentFromPG(),
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
  ] = await Promise.all([
    areaRepository.list(),
    attachmentDatasource.list(),
    competenceRepository.list(),
    frameworkDatasource.list(),
    skillRepository.list(),
    thematicDatasource.list(),
    tubeDatasource.list(),
    tutorialDatasource.list(),
  ]);
  const translatedChallenges = challenges.flatMap((challenge) => [
    challenge,
    ...challenge.alternativeLocales.map((locale) => challenge.translate(locale))
  ]);
  const transformChallenge = createChallengeTransformer({ attachments });
  const transformedChallenges = translatedChallenges.map(transformChallenge);
  const transformedTubes = tubeTransformer.transform({ tubes, skills, challenges: transformedChallenges, thematics });
  const filteredCompetences = competenceTransformer.filterCompetencesFields(competences);
  const filteredSkills = skillTransformer.filterSkillsFields(skills);
  const filteredTutorials = tutorialTransformer.filterTutorialsFields(tutorials);

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

async function _getCurrentContentFromPG() {
  const staticCoursesDTO = await knex('static_courses')
    .select(['id', 'name', 'description', 'isActive', 'challengeIds'])
    .orderBy('id');
  const missions = await missionRepository.list();

  return {
    courses: staticCoursesDTO.map(({ id, name, description, isActive, challengeIds }) => {
      const challenges = challengeIds.replaceAll(' ', '').split(',');
      return {
        id,
        name,
        description,
        isActive,
        challenges,
      };
    }),
    missions,
  };
}
