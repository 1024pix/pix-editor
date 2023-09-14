import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  databaseBuilder,
  generateAuthorizationHeader,
  airtableBuilder,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { challengeRepository } from '../../../../lib/infrastructure/repositories/index.js';

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
    await databaseBuilder.commit();
    const airtableChallenge1 = airtableBuilder.factory.buildChallenge({
      id: 'challengeid1',
      instruction: 'instruction for challengeid1',
      skillId: 'skillid1',
      status: 'status for challengeid1',
      preview: 'site/challenges/challengeid1',
    });
    const airtableSkill1 = airtableBuilder.factory.buildSkill({
      id: 'skillid1',
      name: '@skillid1',
      hint_i18n: {},
    });
    const airtableChallenge2 = airtableBuilder.factory.buildChallenge({
      id: 'challengeid2',
      instruction: 'instruction for challengeid2',
      skillId: 'skillid2',
      status: 'status for challengeid2',
      preview: 'site/challenges/challengeid2',
    });
    const airtableSkill2 = airtableBuilder.factory.buildSkill({
      id: 'skillid2',
      name: '@skillid2',
      hint_i18n: {},
    });
    const airtableChallenge3 = airtableBuilder.factory.buildChallenge({
      id: 'challengeid3',
      instruction: 'instruction for challengeid3',
      skillId: 'skillid3',
      status: 'status for challengeid3',
      preview: 'site/challenges/challengeid3',
    });
    const airtableSkill3 = airtableBuilder.factory.buildSkill({
      id: 'skillid3',
      name: '@skillid3',
      hint_i18n: {},
    });
    const airtableChallenge4 = airtableBuilder.factory.buildChallenge({
      id: 'challengeid4',
      instruction: 'instruction for challengeid4',
      skillId: 'skillid4',
      status: 'status for challengeid4',
      preview: 'site/challenges/challengeid4',
    });
    const airtableSkill4 = airtableBuilder.factory.buildSkill({
      id: 'skillid4',
      name: '@skillid4',
      hint_i18n: {},
    });
    airtableBuilder.mockLists({
      challenges: [airtableChallenge1, airtableChallenge2, airtableChallenge3, airtableChallenge4],
      skills: [airtableSkill1, airtableSkill2, airtableSkill3, airtableSkill4],
    });
    vi.spyOn(challengeRepository, 'getAllIdsIn')
      .mockResolvedValue(['challengeid1', 'challengeid2', 'challengeid3', 'challengeid4']);
  });

  afterEach(function() {
    vi.useRealTimers();
    return knex('static_courses').delete();
  });

  it('updates and returns the static course', async function() {
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
      url: `/api/static-courses/${activeCourseId}`,
      headers: generateAuthorizationHeader(user),
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
            'preview-url': 'site/challenges/challengeid3',
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
            'preview-url': 'site/challenges/challengeid1',
          },
        }
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
