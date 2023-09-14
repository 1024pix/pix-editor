import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  databaseBuilder,
  generateAuthorizationHeader,
  airtableBuilder,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | static courses | PUT /api/static-courses/{id}/deactivate', function() {
  let user;
  const staticCourseId = 'myAwesomeCourse66';

  beforeEach(async function() {
    vi.useFakeTimers({
      now: new Date('2021-10-29T03:04:00Z'),
      toFake: ['Date'],
    });
    user = databaseBuilder.factory.buildAdminUser();
    databaseBuilder.factory.buildStaticCourse({
      id: staticCourseId,
      name: 'some name',
      description: 'some description',
      challengeIds: 'challengeid2,challengeid3,challengeid4',
      isActive: true,
      createdAt: new Date('2020-01-01T00:00:10Z'),
      updatedAt: new Date('2020-01-01T00:00:10Z'),
    });
    await databaseBuilder.commit();
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
      challenges: [airtableChallenge2, airtableChallenge3, airtableChallenge4],
      skills: [airtableSkill2, airtableSkill3, airtableSkill4],
    });
  });

  afterEach(function() {
    vi.useRealTimers();
    return knex('static_courses').delete();
  });

  it('deactivates and returns the static course', async function() {
    // given
    const payload = {
      data: {
        attributes: {
          reason: 'je le veux',
        },
      },
    };

    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'PUT',
      url: `/api/static-courses/${staticCourseId}/deactivate`,
      headers: generateAuthorizationHeader(user),
      payload,
    });

    // then
    expect(response.statusCode).to.equal(200);
    expect(response.result).to.deep.equal({
      data: {
        type: 'static-courses',
        id: staticCourseId,
        attributes: {
          name: 'some name',
          description: 'some description',
          'created-at': new Date('2020-01-01T00:00:10Z'),
          'updated-at': new Date('2021-10-29T03:04:00Z'),
          'is-active': false,
          'deactivation-reason': 'je le veux',
        },
        relationships: {
          'challenge-summaries': {
            data: [
              {
                type: 'challenge-summaries',
                id: 'challengeid2',
              },
              {
                type: 'challenge-summaries',
                id: 'challengeid3',
              },
              {
                type: 'challenge-summaries',
                id: 'challengeid4',
              },
            ],
          },
        },
      },
      included: [
        {
          type: 'challenge-summaries',
          id: 'challengeid2',
          attributes: {
            index: 0,
            instruction: 'instruction for challengeid2',
            'skill-name': '@skillid2',
            status: 'status for challengeid2',
            'preview-url': 'site/challenges/challengeid2',
          },
        },
        {
          type: 'challenge-summaries',
          id: 'challengeid3',
          attributes: {
            index: 1,
            instruction: 'instruction for challengeid3',
            'skill-name': '@skillid3',
            status: 'status for challengeid3',
            'preview-url': 'site/challenges/challengeid3',
          },
        },
        {
          type: 'challenge-summaries',
          id: 'challengeid4',
          attributes: {
            index: 2,
            instruction: 'instruction for challengeid4',
            'skill-name': '@skillid4',
            status: 'status for challengeid4',
            'preview-url': 'site/challenges/challengeid4',
          },
        }
      ],
    });
  });
});
