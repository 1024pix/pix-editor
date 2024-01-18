import _ from 'lodash';
import {
  areaDatasource,
  attachmentDatasource,
  challengeDatasource,
  frameworkDatasource,
  thematicDatasource,
  tubeDatasource,
  tutorialDatasource,
} from '../datasources/airtable/index.js';
import {
  challengeRepository,
  competenceRepository,
  localizedChallengeRepository,
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
    const attachments = await attachmentDatasource.filterByChallengeId(updatedRecord.challengeId);
    const transformChallenge = createChallengeTransformer({ attachments });
    const challenge = transformChallenge(rawChallenge);

    return { updatedRecord: challenge, model: challengeDatasource.path() };
  }

  if (!tablesTranslations[type]?.toDomain) return { updatedRecord, model };

  return {
    updatedRecord:{
      ...updatedRecord,
      ...tablesTranslations[type].toDomain(translations),
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
    localizedChallenges,
  ] = await Promise.all([
    areaDatasource.list(),
    attachmentDatasource.list(),
    competenceRepository.list(),
    frameworkDatasource.list(),
    skillRepository.list(),
    thematicDatasource.list(),
    tubeDatasource.list(),
    tutorialDatasource.list(),
    localizedChallengeRepository.list(),
  ]);
  const transformChallenge = createChallengeTransformer({ attachments, localizedChallenges });
  const transformedChallenges = challenges.flatMap(transformChallenge);
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

async function _getCurrentContentFromPG(airtableChallenges) {
  const staticCoursesDTO = await knex('static_courses')
    .select(['id', 'name', 'description', 'isActive', 'challengeIds'])
    .orderBy('id');
  const missions = await missionRepository.list();

  return {
    courses: await Promise.all(staticCoursesDTO.map(async ({ id, name, description, isActive, challengeIds }) => {
      const localizedChallengeIds = challengeIds.replaceAll(' ', '').split(',');
      const localizedChallenges = await localizedChallengeRepository.getMany({ ids: localizedChallengeIds });
      const competences = _.uniq(localizedChallenges.map(({ challengeId }) => {
        return airtableChallenges.find((airtableChallenge) => airtableChallenge.id === challengeId).competenceId;
      }));
      return {
        id,
        name,
        description,
        isActive,
        challenges: localizedChallengeIds,
        competences,
      };
    })),
    missions
  };
}
