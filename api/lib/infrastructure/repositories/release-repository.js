import {
  areaRepository,
  attachmentRepository,
  challengeRepository,
  competenceRepository,
  frameworkRepository,
  missionRepository,
  moduleRepository,
  skillRepository,
  thematicRepository,
  tubeRepository,
  tutorialRepository,
} from './index.js';
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
import { Content, Release } from '../../domain/models/release/index.js';

import { DomainTransaction } from '../../domain/DomainTransaction.js';

export function getCurrentContent() {
  return _getCurrentContent();
}

export async function create(getCurrentContent = _getCurrentContent) {
  const knexConn = DomainTransaction.getConnection();
  const content = await getCurrentContent();
  const release = await knexConn('releases').insert({ content }, ['id']);

  return release[0].id;
}

export async function getLatestRelease() {
  const knexConn = DomainTransaction.getConnection();
  const release = await knexConn('releases').select('id', 'content', 'createdAt').orderBy('createdAt', 'desc').limit(1);

  return _toDomain(release[0]);
}

export async function getLatestReleaseDate() {
  const knexConn = DomainTransaction.getConnection();
  const [createdAt] = await knexConn('releases').pluck('createdAt').orderBy('createdAt', 'desc').limit(1);

  return createdAt;
}

export async function getRelease(id) {
  const knexConn = DomainTransaction.getConnection();
  const release = await knexConn('releases').select('id', 'content', 'createdAt').where('id', id);

  return _toDomain(release[0]);
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
    modules,
  ] = await Promise.all([
    challengeRepository.list(),
    areaRepository.list(),
    attachmentRepository.list(),
    competenceRepository.list(),
    frameworkRepository.list(),
    skillRepository.list(),
    thematicRepository.list(),
    tubeRepository.list(),
    tutorialRepository.list(),
    getStaticCourses(),
    missionRepository.list(),
    moduleRepository.list(),
  ]);
  fillAlternativeQualityFieldsFromMatchingProto(challenges, skills);
  const translatedChallenges = challenges.flatMap((challenge) => [challenge, ...challenge.alternativeLocales.map((locale) => challenge.translate(locale))]);
  const transformChallenge = createChallengeTransformer({ attachments });
  const transformedChallenges = translatedChallenges.map(transformChallenge);
  const transformedTubes = tubeTransformer.transformTubes(tubes, challenges);

  const filteredTutorials = tutorialTransformer.filterTutorialsFields(tutorials);
  const transformedMissions = missionTransformer.transform({
    missions,
    challenges,
    tubes,
    thematics,
    skills,
  });

  const pixFrameworkCompetenceIds = competences.filter(({ origin }) => origin === 'Pix').map(({ id }) => id);

  return {
    frameworks: frameworkTransformer.forRelease(frameworks),
    areas: areaTransformer.forRelease(areas),
    competences: competenceTransformer.forRelease(competences),
    thematics: thematicTransformer.forRelease(thematics),
    tubes: transformedTubes,
    skills: skillTransformer.forRelease(skills, pixFrameworkCompetenceIds),
    challenges: transformedChallenges,
    tutorials: filteredTutorials,
    courses,
    missions: transformedMissions,
    modules,
  };
}

async function getStaticCourses() {
  const knexConn = DomainTransaction.getConnection();
  const staticCoursesDTO = await knexConn('static_courses')
    .select([
      'id',
      'name',
      'description',
      'isActive',
      'challengeIds',
    ])
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
