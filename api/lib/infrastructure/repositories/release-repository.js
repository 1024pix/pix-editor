import _ from 'lodash';
import {
  attachmentDatasource,
  challengeDatasource,
  frameworkDatasource,
  tutorialDatasource,
} from '../datasources/airtable/index.js';
import {
  areaRepository,
  challengeRepository,
  competenceRepository,
  missionRepository,
  skillRepository,
  thematicRepository,
  tubeRepository,
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
import { Challenge, Skill } from '../../domain/models/index.js';

import { knex } from '../../../db/knex-database-connection.js';
import { logger } from '../logger.js';

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
  const [
    challenges,
    areas,
    attachments,
    competences,
    frameworks,
    skills,
    thematics,
    tubes,
    tutorials,
    courses,
    missions,
  ] = await Promise.all([
    challengeRepository.list(),
    areaRepository.list(),
    attachmentDatasource.list(),
    competenceRepository.list(),
    frameworkDatasource.list(),
    skillRepository.list(),
    thematicRepository.list(),
    tubeRepository.list(),
    tutorialDatasource.list(),
    getStaticCourses(),
    missionRepository.listActive(),
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
  const transformedMissions = transformMissions({ missions, challenges, tubes, thematics, skills });

  return {
    frameworks,
    areas,
    competences: filteredCompetences,
    thematics,
    tubes: transformedTubes,
    skills: filteredSkills,
    challenges: transformedChallenges,
    tutorials: filteredTutorials,
    courses,
    missions: transformedMissions,
  };
}

async function getStaticCourses() {
  const staticCoursesDTO = await knex('static_courses')
    .select(['id', 'name', 'description', 'isActive', 'challengeIds'])
    .orderBy('id');

  return staticCoursesDTO.map(({ id, name, description, isActive, challengeIds }) => {
    const challenges = challengeIds.replaceAll(' ', '').split(',');
    return {
      id,
      name,
      description,
      isActive,
      challenges,
    };
  });
}

function transformMissions({ missions, challenges, tubes, thematics, skills }) {
  return missions.map((mission) => {
    const thematicIds = mission.thematicIds?.split(',') ?? [];
    const content = {
      dareChallenges: [],
      steps: []
    };

    thematicIds.forEach((thematicId, index) => {
      const thematic = thematics.find((thematic) => thematic.id === thematicId);

      if (!thematic) {
        logger.warn({ mission }, 'No thematic found for mission');
        return;
      }

      const missionTubes = tubes.filter((tube) => thematic?.tubeIds?.includes(tube.id));
      if (missionTubes.length === 0) {
        logger.warn({ mission }, 'No tubes found for mission');
        return;
      }

      if (index < thematicIds.length - 1) {
        content.steps.push({
          tutorialChallenges: _getChallengeIdsForActivity(mission.status, missionTubes, skills, challenges, '_di'),
          trainingChallenges: _getChallengeIdsForActivity(mission.status, missionTubes, skills, challenges, '_en'),
          validationChallenges: _getChallengeIdsForActivity(mission.status, missionTubes, skills, challenges, '_va'),
        });
      } else {
        content.dareChallenges = _getChallengeIdsForActivity(mission.status, missionTubes, skills, challenges, '_de');
      }
    });
    return { ...mission, content };
  });
}

const SCHOOL_PLAYABLE_CHALLENGE_STATUSES = [Challenge.STATUSES.VALIDE, Challenge.STATUSES.PROPOSE];
const SCHOOL_PLAYABLE_SKILL_STATUSES = [Skill.STATUSES.ACTIF, Skill.STATUSES.EN_CONSTRUCTION];

function _getChallengeIdsForActivity(missionStatus, missionTubes, skills, challenges, activityPostfix) {
  const activityTube = missionTubes.find(({ name }) => name.endsWith(activityPostfix));

  if (!activityTube) {
    logger.warn({ missionTubes }, `No tubes found for postFix ${activityPostfix} in mission tubes`);
    return [];
  }

  const activitySkills = skills
    .filter((skill) => skill.tubeId === activityTube.id)
    .filter((skill) => SCHOOL_PLAYABLE_SKILL_STATUSES.includes(skill.status.toLowerCase()))
    .sort(_byLevel);

  if (!activitySkills) {
    logger.warn({ activityTube }, 'No skills found for activityTube');
    return [];
  }

  return activitySkills.map((activitySkill) => {
    const alternatives = challenges
      .filter((challenge) => activitySkill.id === challenge.skillId)
      .filter((challenge) => SCHOOL_PLAYABLE_CHALLENGE_STATUSES.includes(challenge.status.toLowerCase()))
      .filter((challenge) => (missionStatus === Mission.status.VALIDATED && challenge.status === Challenge.STATUSES.VALIDE) || missionStatus !== Mission.status.VALIDATED);

    if (alternatives.length === 0) {
      logger.warn({ activitySkill }, 'No challenges found for activitySkill');
    }
    return alternatives.sort(_byAlternativeVersion).map(({ id }) => id);
  }).filter((activitySkills) => activitySkills.length > 0);
}

const _byLevel = (skillA, skillB) => skillA.level - skillB.level;
const _byAlternativeVersion = (challengeA, challengeB) => (challengeA.alternativeVersion ?? 0) - (challengeB.alternativeVersion ?? 0);
