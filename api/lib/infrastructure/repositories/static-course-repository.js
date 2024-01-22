import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import {
  ChallengeSummary as ChallengeSummary_Read,
  StaticCourse as StaticCourse_Read,
  StaticCourseSummary as StaticCourseSummary_Read,
} from '../../domain/readmodels/index.js';
import { StaticCourse } from '../../domain/models/index.js';
import { skillDatasource } from '../datasources/airtable/index.js';
import * as challengeRepository from './challenge-repository.js';
import { localizedChallengeRepository } from './index.js';

export async function findReadSummaries({ filter, page }) {
  const query = knex('static_courses')
    .select('id', 'name', 'createdAt', 'challengeIds', 'isActive')
    .orderBy('createdAt', 'desc');
  if (filter.isActive !== null) {
    query.where('isActive', filter.isActive);
  }
  const { results: staticCourses, pagination } = await fetchPage(query, page);

  const staticCoursesSummaries = staticCourses.map((staticCourse) => {
    return new StaticCourseSummary_Read({
      id: staticCourse.id,
      name: staticCourse.name || '',
      createdAt: staticCourse.createdAt,
      challengeCount: staticCourse.challengeIds.split(',').length,
      isActive: staticCourse.isActive,
    });
  });

  return { results: staticCoursesSummaries, meta: pagination };
}

export async function getRead(id, { baseUrl }) {
  const staticCourse = await knex('static_courses')
    .select('*')
    .where('id', id)
    .first();

  if (!staticCourse) return null;

  const localizedChallengeIds = staticCourse.challengeIds.split(',');
  const challengeSummaries = await findChallengeSummaries(localizedChallengeIds, { baseUrl });
  return new StaticCourse_Read({
    id: staticCourse.id,
    name: staticCourse.name,
    description: staticCourse.description,
    isActive: staticCourse.isActive,
    deactivationReason: staticCourse.deactivationReason || '',
    createdAt: staticCourse.createdAt,
    updatedAt: staticCourse.updatedAt,
    challengeSummaries,
  });
}

export async function get(id) {
  const staticCourse = await knex('static_courses')
    .select('*')
    .where('id', id)
    .first();
  if (staticCourse) {
    return new StaticCourse({
      id: staticCourse.id,
      name: staticCourse.name,
      description: staticCourse.description,
      challengeIds: staticCourse.challengeIds.split(','),
      isActive: staticCourse.isActive,
      deactivationReason: staticCourse.deactivationReason,
      createdAt: staticCourse.createdAt,
      updatedAt: staticCourse.updatedAt,
    });
  }
  return null;
}

export async function save(staticCourseForCreation) {
  const staticCourseDTO = staticCourseForCreation.toDTO();
  const serializedStaticCourseForDB = {
    id: staticCourseDTO.id,
    name: staticCourseDTO.name,
    description: staticCourseDTO.description,
    challengeIds: staticCourseDTO.challengeIds.join(','),
    isActive: staticCourseDTO.isActive,
    deactivationReason: staticCourseDTO.deactivationReason,
    createdAt: staticCourseDTO.createdAt,
    updatedAt: staticCourseDTO.updatedAt,
  };
  await knex('static_courses')
    .insert(serializedStaticCourseForDB)
    .onConflict('id')
    .merge();
  return serializedStaticCourseForDB.id;
}

async function findChallengeSummaries(localizedChallengeIds, dependencies) {
  const localizedChallenges = await localizedChallengeRepository.getMany({ ids: localizedChallengeIds });
  const challengeIds = localizedChallenges.map(({ challengeId }) => challengeId);
  const challengesFromAirtable = await challengeRepository.filter({ filter: { ids: challengeIds } });

  const skillIds = challengesFromAirtable.map(({ skillId }) => skillId);
  const skillsFromAirtable = await skillDatasource.filter({ filter: { ids: skillIds } });
  return localizedChallengeIds.map((localizedChallengeId, index) => {
    const localizedChallenge = localizedChallenges.find(({ id }) => id === localizedChallengeId);
    const locale = localizedChallenge.locale;
    const challengeFromAirtable = challengesFromAirtable.find((challengeFromAirtable) => localizedChallenge.challengeId === challengeFromAirtable.id);
    const previewUrl = localizedChallenge.isPrimary ?
      `${dependencies.baseUrl}/api/challenges/${challengeFromAirtable.id}/preview`
      : `${dependencies.baseUrl}/api/challenges/${challengeFromAirtable.id}/preview?locale=${locale}`;
    const correspondingSkill = skillsFromAirtable.find((skill) => skill.id === challengeFromAirtable.skillId);
    return new ChallengeSummary_Read({
      id: localizedChallengeId,
      instruction: challengeFromAirtable.translations[locale].instruction ?? '',
      skillName: correspondingSkill?.name ?? '',
      status: localizedChallenge.isPrimary ? challengeFromAirtable.status : getLocalizedChallengeStatus(challengeFromAirtable, localizedChallenge),
      index,
      previewUrl,
    });
  });
}

function getLocalizedChallengeStatus(challenge, localizedChallenge) {
  if (['proposé', 'périmé'].includes(challenge.status) || localizedChallenge.status === 'validé') {
    return challenge.status;
  }
  return localizedChallenge.status;
}
