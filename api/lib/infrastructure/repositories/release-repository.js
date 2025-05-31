import { attachmentDatasource, tutorialDatasource, } from '../datasources/airtable/index.js';
import {
  areaRepository,
  challengeRepository,
  competenceRepository,
  frameworkRepository,
  missionRepository,
  skillRepository,
  thematicRepository,
  tubeRepository,
} from './index.js';
import * as airtableSerializer from '../serializers/airtable-serializer.js';
import {
  areaTransformer,
  competenceTransformer,
  createChallengeTransformer,
  fillAlternativeQualityFieldsFromMatchingProto,
  frameworkTransformer,
  missionTransformer,
  skillTransformer,
  thematicTransformer,
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

export async function getLatestReleaseDate() {
  const [createdAt] = await knex('releases')
    .pluck('createdAt')
    .orderBy('createdAt', 'desc')
    .limit(1);

  return createdAt;
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
    frameworkRepository.list(),
    skillRepository.list(),
    thematicRepository.list(),
    tubeRepository.list(),
    tutorialDatasource.list(),
    getStaticCourses(),
    missionRepository.list(),
  ]);
  const frameworksForRelease = frameworks.map(frameworkTransformer.transformForRelease);
  const areasForRelease = areas.map(areaTransformer.transformForRelease);
  const competencesForRelease = competences.map(competenceTransformer.transformForRelease);
  const thematicsForRelease = thematics.map(thematicTransformer.transformForRelease);
  fillAlternativeQualityFieldsFromMatchingProto(challenges, skills);
  const translatedChallenges = challenges.flatMap((challenge) => [
    challenge,
    ...challenge.alternativeLocales.map((locale) => challenge.translate(locale))
  ]);
  const transformChallenge = createChallengeTransformer({ attachments });
  const transformedChallenges = translatedChallenges.map(transformChallenge);
  const transformedTubes = tubeTransformer.transform({ tubes, skills, challenges: transformedChallenges, thematics });

  const filteredSkills = skillTransformer.filterSkillsFields(skills);
  const filteredTutorials = tutorialTransformer.filterTutorialsFields(tutorials);
  const transformedMissions = missionTransformer.transform({ missions, challenges, tubes, thematics, skills });

  return {
    frameworks: frameworksForRelease,
    areas: areasForRelease,
    competences: competencesForRelease,
    thematics: thematicsForRelease,
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
