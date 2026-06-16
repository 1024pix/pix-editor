import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { fetchPage } from '../utils/knex-utils.js';
import {
  ChallengeSummary as ChallengeSummary_Read,
  StaticCourse as StaticCourse_Read,
  StaticCourseSummary as StaticCourseSummary_Read,
  StaticCourseTag as StaticCourseTag_Read,
} from '../../domain/readmodels/index.js';
import { StaticCourse } from '../../domain/models/index.js';
import { CourseForReplication } from '../../domain/models/replication/index.js';
import * as challengeRepository from './challenge-repository.js';
import * as localizedChallengeRepository from './localized-challenge-repository.js';
import * as skillRepository from './skill-repository.js';
import _ from 'lodash';
import { escapeLikeWildcards } from './sql-utils.js';

export async function findReadSummaries({ filter, page }) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('static_courses')
    .select({
      id: 'static_courses.id',
      name: 'static_courses.name',
      createdAt: 'static_courses.createdAt',
      challengeIds: 'static_courses.challengeIds',
      isActive: 'static_courses.isActive',
      tags: knexConn.raw(`
        json_agg(
          json_build_object('id', "static_course_tags"."id", 'label', "static_course_tags"."label")
          ORDER BY "static_course_tags"."label" ASC
        )`),
    })
    .leftJoin('static_courses_tags_link', 'static_courses.id', 'static_courses_tags_link.staticCourseId')
    .leftJoin('static_course_tags', 'static_course_tags.id', 'static_courses_tags_link.staticCourseTagId')
    .groupBy('static_courses.id')
    .orderBy('createdAt', 'desc');

  if (!_.isNil(filter.isActive)) {
    query.andWhere('isActive', filter.isActive);
  }
  if (filter.name) {
    query.andWhereILike('name', `%${escapeLikeWildcards(filter.name)}%`);
  }
  if (filter.tagIds?.length) {
    query.whereIn(
      'static_courses.id',
      knexConn.select('staticCourseId').from('static_courses_tags_link').whereIn('staticCourseTagId', filter.tagIds),
    );
  }

  const { results: staticCourses, pagination } = await fetchPage(query, page);

  const staticCoursesSummaries = staticCourses.map((staticCourse) => {
    const tags = staticCourse.tags
      .map(({ id, label }) => new StaticCourseTag_Read({ id, label }))
      .filter(({ id }) => id !== null);
    return new StaticCourseSummary_Read({
      id: staticCourse.id,
      name: staticCourse.name,
      createdAt: staticCourse.createdAt,
      challengeCount: staticCourse.challengeIds.split(',').length,
      isActive: staticCourse.isActive,
      tags,
    });
  });

  return { results: staticCoursesSummaries, meta: pagination };
}

export async function getRead(id, { baseUrl }) {
  const knexConn = DomainTransaction.getConnection();
  const staticCourse = await knexConn('static_courses')
    .select({
      id: 'static_courses.id',
      name: 'static_courses.name',
      updatedAt: 'static_courses.updatedAt',
      createdAt: 'static_courses.createdAt',
      description: 'static_courses.description',
      deactivationReason: 'static_courses.deactivationReason',
      challengeIds: 'static_courses.challengeIds',
      isActive: 'static_courses.isActive',
      tags: knexConn.raw(`
        json_agg(
          json_build_object('id', "static_course_tags"."id", 'label', "static_course_tags"."label")
          ORDER BY "static_course_tags"."label" ASC
        )`),
    })
    .where('static_courses.id', id)
    .leftJoin('static_courses_tags_link', 'static_courses.id', 'static_courses_tags_link.staticCourseId')
    .leftJoin('static_course_tags', 'static_course_tags.id', 'static_courses_tags_link.staticCourseTagId')
    .groupBy('static_courses.id')
    .first();

  if (!staticCourse) return null;

  const tags = staticCourse.tags
    .map(({ id, label }) => new StaticCourseTag_Read({ id, label }))
    .filter(({ id }) => id !== null);
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
    tags,
  });
}

export async function get(id) {
  const knexConn = DomainTransaction.getConnection();
  const staticCourse = await knexConn('static_courses')
    .select({
      id: 'static_courses.id',
      name: 'static_courses.name',
      updatedAt: 'static_courses.updatedAt',
      createdAt: 'static_courses.createdAt',
      description: 'static_courses.description',
      deactivationReason: 'static_courses.deactivationReason',
      challengeIds: 'static_courses.challengeIds',
      isActive: 'static_courses.isActive',
      tags: knexConn.raw(`
        json_agg(
          json_build_object('id', "static_course_tags"."id")
          ORDER BY "static_course_tags"."label" ASC
        )`),
    })
    .where('static_courses.id', id)
    .leftJoin('static_courses_tags_link', 'static_courses.id', 'static_courses_tags_link.staticCourseId')
    .leftJoin('static_course_tags', 'static_course_tags.id', 'static_courses_tags_link.staticCourseTagId')
    .groupBy('static_courses.id')
    .first();
  if (staticCourse) {
    const tagIds = staticCourse.tags.map(({ id }) => id).filter((id) => id !== null);
    return new StaticCourse({
      id: staticCourse.id,
      name: staticCourse.name,
      description: staticCourse.description,
      challengeIds: staticCourse.challengeIds.split(','),
      tagIds,
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
  await DomainTransaction.execute(async () => {
    const knexConn = DomainTransaction.getConnection();
    await knexConn('static_courses').insert(serializedStaticCourseForDB).onConflict('id').merge();
    await knexConn('static_courses_tags_link').del().where('staticCourseId', serializedStaticCourseForDB.id);
    if (staticCourseDTO.tagIds.length > 0) {
      await knexConn('static_courses_tags_link').insert(
        staticCourseDTO.tagIds.map((staticCourseDtoTagId) => ({
          staticCourseTagId: staticCourseDtoTagId,
          staticCourseId: serializedStaticCourseForDB.id,
        })),
      );
    }
  });

  return serializedStaticCourseForDB.id;
}

async function findChallengeSummaries(localizedChallengeIds, { baseUrl }) {
  const localizedChallenges = await localizedChallengeRepository.getMany({ ids: localizedChallengeIds });
  const challengeIds = localizedChallenges.map(({ challengeId }) => challengeId);
  const challenges = await challengeRepository.getMany(challengeIds);

  const skillIds = challenges.map(({ skillId }) => skillId);
  const skillsFromAirtable = await skillRepository.getMany(skillIds);

  return localizedChallengeIds.map((localizedChallengeId, index) => {
    const localizedChallenge = localizedChallenges.find(({ id }) => id === localizedChallengeId);
    const challenge = challenges.find((challenge) => localizedChallenge.challengeId === challenge.id);
    const translatedChallenge = challenge.translate(localizedChallenge.locale);
    const skill = skillsFromAirtable.find((skill) => skill.id === challenge.skillId);

    return new ChallengeSummary_Read({
      id: localizedChallengeId,
      instruction: translatedChallenge.instruction,
      skillName: skill?.name ?? '',
      status: translatedChallenge.status,
      index,
      previewUrl: getPreviewUrl(localizedChallenge, baseUrl),
    });
  });
}

export async function listForReplication() {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn.select('id', 'name').from('static_courses').orderBy('id');
  return dtos.map((dto) => new CourseForReplication(dto));
}

function getPreviewUrl(localizedChallenge, baseUrl) {
  return localizedChallenge.isPrimary
    ? `${baseUrl}/api/challenges/${localizedChallenge.challengeId}/preview`
    : `${baseUrl}/api/challenges/${localizedChallenge.challengeId}/preview?locale=${localizedChallenge.locale}`;
}
