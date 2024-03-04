import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { airtableBuilder, databaseBuilder, generateAuthorizationHeader, knex, } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | static courses | PUT /api/static-courses/{id}', function() {
  let user;
  const activeCourseId = 'myAwesomeCourse66';
  const inactiveCourseId = 'myLameCourse66';

  beforeEach(async function() {
    vi.useFakeTimers({
      now: new Date('2021-10-29T03:04:00Z'),
      toFake: ['Date'],
    });
    user = databaseBuilder.factory.buildAdminUser();
    databaseBuilder.factory.buildStaticCourse({
      id: activeCourseId,
      name: 'some old name',
      description: 'some old description',
      challengeIds: 'challengeid2,challengeid3,challengeid4',
      isActive: true,
      createdAt: new Date('2020-01-01T00:00:10Z'),
      updatedAt: new Date('2020-01-01T00:00:10Z'),
    });
    databaseBuilder.factory.buildStaticCourse({
      id: inactiveCourseId,
      name: 'some inactive name',
      description: 'some inactive description',
      challengeIds: 'challengeid2,challengeid3,challengeid4',
      isActive: false,
      deactivationReason: 'because i wanted to',
      createdAt: new Date('2020-01-01T00:00:10Z'),
      updatedAt: new Date('2020-01-01T00:00:10Z'),
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid2',
      challengeId: 'challengeid2',
      locale: 'fr',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid3',
      challengeId: 'challengeid3',
      locale: 'fr',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid1',
      challengeId: 'challengeid1',
      locale: 'fr',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeidnl1',
      challengeId: 'challengeid1',
      locale: 'nl',
      status: 'validé',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid4',
      challengeId: 'challengeid4',
      locale: 'fr',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeid1.instruction',
      locale: 'nl',
      value: 'instruction for challengeidnl1',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeid1.instruction',
      locale: 'fr',
      value: 'instruction for challengeid1',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeid2.instruction',
      locale: 'fr',
      value: 'instruction for challengeid2',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeid3.instruction',
      locale: 'fr',
      value: 'instruction for challengeid3',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeid4.instruction',
      locale: 'fr',
      value: 'instruction for challengeid4',
    });
    databaseBuilder.factory.buildStaticCourseTag({
      id: 123,
      label: 'tagA'
    });
    databaseBuilder.factory.buildStaticCourseTag({
      id: 456,
      label: 'tagB'
    });
    databaseBuilder.factory.buildStaticCourseTag({
      id: 789,
      label: 'tagC'
    });
    databaseBuilder.factory.buildStaticCourseTag({
      id: 159,
      label: 'tagD'
    });
    databaseBuilder.factory.linkTagsTo({
      staticCourseTagIds: [123, 456, 159],
      staticCourseId: activeCourseId,
    });
    await databaseBuilder.commit();
    const airtableChallenge1 = airtableBuilder.factory.buildChallenge({
      id: 'challengeid1',
      skillId: 'skillid1',
      status: 'status for challengeid1',
      locales: ['fr'],
    });
    const airtableSkill1 = airtableBuilder.factory.buildSkill({
      id: 'skillid1',
      name: '@skillid1',
      hint_i18n: {},
    });
    const airtableChallenge2 = airtableBuilder.factory.buildChallenge({
      id: 'challengeid2',
      skillId: 'skillid2',
      status: 'status for challengeid2',
      locales: ['fr'],
    });
    const airtableSkill2 = airtableBuilder.factory.buildSkill({
      id: 'skillid2',
      name: '@skillid2',
      hint_i18n: {},
    });
    const airtableChallenge3 = airtableBuilder.factory.buildChallenge({
      id: 'challengeid3',
      skillId: 'skillid3',
      status: 'status for challengeid3',
      locales: ['fr'],
    });
    const airtableSkill3 = airtableBuilder.factory.buildSkill({
      id: 'skillid3',
      name: '@skillid3',
      hint_i18n: {},
    });
    const airtableChallenge4 = airtableBuilder.factory.buildChallenge({
      id: 'challengeid4',
      skillId: 'skillid4',
      status: 'status for challengeid4',
      locales: ['fr'],
    });
    const airtableSkill4 = airtableBuilder.factory.buildSkill({
      id: 'skillid4',
      name: '@skillid4',
      hint_i18n: {},
    });
    // TODO replace by nock to assert airtable query parameters
    airtableBuilder.mockLists({
      challenges: [airtableChallenge1, airtableChallenge2, airtableChallenge3, airtableChallenge4],
      skills: [airtableSkill1, airtableSkill2, airtableSkill3, airtableSkill4],
    });
  });

  afterEach(async function() {
    vi.useRealTimers();
    await knex('static_courses_tags_link').delete();
    return knex('static_courses').delete();
  });

  it('updates and returns the static course', async function() {
    // given
    const payload = {
      data: {
        attributes: {
          name: 'static course 1',
          description: 'static course description',
          'challenge-ids': ['challengeid3', 'challengeid1', 'challengeidnl1'],
          'tag-ids': ['456', '789'],
        },
      },
    };

    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'PUT',
      url: `/api/static-courses/${activeCourseId}`,
      headers: {
        ...generateAuthorizationHeader(user),
        host: 'host.site',
      },
      payload,
    });

    // then
    expect(response.statusCode).to.equal(200);
    expect(response.result).to.deep.equal({
      data: {
        type: 'static-courses',
        id: activeCourseId,
        attributes: {
          name: 'static course 1',
          description: 'static course description',
          'created-at': new Date('2020-01-01T00:00:10Z'),
          'updated-at': new Date('2021-10-29T03:04:00Z'),
          'is-active': true,
          'deactivation-reason': '',
        },
        relationships: {
          tags: {
            data: [
              {
                type: 'static-course-tags',
                id: '456',
              },
              {
                type: 'static-course-tags',
                id: '789',
              }
            ],
          },
          'challenge-summaries': {
            data: [
              {
                type: 'challenge-summaries',
                id: 'challengeid3',
              },
              {
                type: 'challenge-summaries',
                id: 'challengeid1',
              },
              {
                type: 'challenge-summaries',
                id: 'challengeidnl1',
              },
            ],
          },
        },
      },
      included: [
        {
          type: 'challenge-summaries',
          id: 'challengeid3',
          attributes: {
            index: 0,
            instruction: 'instruction for challengeid3',
            'skill-name': '@skillid3',
            status: 'status for challengeid3',
            'preview-url': 'http://host.site/api/challenges/challengeid3/preview',
          },
        },
        {
          type: 'challenge-summaries',
          id: 'challengeid1',
          attributes: {
            index: 1,
            instruction: 'instruction for challengeid1',
            'skill-name': '@skillid1',
            status: 'status for challengeid1',
            'preview-url': 'http://host.site/api/challenges/challengeid1/preview',
          },
        },
        {
          type: 'challenge-summaries',
          id: 'challengeidnl1',
          attributes: {
            index: 2,
            instruction: 'instruction for challengeidnl1',
            'skill-name': '@skillid1',
            status: 'status for challengeid1',
            'preview-url': 'http://host.site/api/challenges/challengeid1/preview?locale=nl',
          },
        },
        {
          type: 'static-course-tags',
          id: '456',
          attributes: {
            label: 'tagB'
          },
        },
        {
          type: 'static-course-tags',
          id: '789',
          attributes: {
            label: 'tagC'
          },
        },
      ],
    });
  });

  it('return a 409 HTTP status code when static course is inactive', async function() {
    // given
    const payload = {
      data: {
        attributes: {
          name: 'static course 1',
          description: 'static course description',
          'challenge-ids': ['challengeid3', 'challengeid1'],
        },
      },
    };

    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'PUT',
      url: `/api/static-courses/${inactiveCourseId}`,
      headers: generateAuthorizationHeader(user),
      payload,
    });

    // then
    expect(response.statusCode).to.equal(409);
  });
});
