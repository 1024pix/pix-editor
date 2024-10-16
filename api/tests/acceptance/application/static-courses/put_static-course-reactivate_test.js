import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { airtableBuilder, databaseBuilder, generateAuthorizationHeader, knex, } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | static courses | PUT /api/static-courses/{id}/deactivate', function() {
  let user;
  const staticCourseId = 'myAwesomeCourse66';

  beforeEach(async function() {
    vi.useFakeTimers({
      now: new Date('2021-10-29T03:04:00Z'),
      toFake: ['Date'],
    });

    const airtableSkills = [
      airtableBuilder.factory.buildSkill({
        id: 'skillid2',
        airtableId: 'airtableskillid2',
        name: '@skillid2',
        hint_i18n: {},
      }),
      airtableBuilder.factory.buildSkill({
        id: 'skillid3',
        airtableId: 'airtableskillid3',
        name: '@skillid3',
        hint_i18n: {},
      }),
      airtableBuilder.factory.buildSkill({
        id: 'skillid4',
        airtableId: 'airtableskillid4',
        name: '@skillid4',
        hint_i18n: {},
      }),
    ];

    const airtableChallenges = [
      airtableBuilder.factory.buildChallenge({
        id: 'challengeid2',
        skillId: airtableSkills[0].fields['id persistant'],
        status: 'status for challengeid2',
        locales: ['fr'],
      }),
      airtableBuilder.factory.buildChallenge({
        id: 'challengeid3',
        skillId: airtableSkills[1].fields['id persistant'],
        status: 'status for challengeid3',
        locales: ['fr'],
      }),
      airtableBuilder.factory.buildChallenge({
        id: 'challengeid4',
        skillId: airtableSkills[2].fields['id persistant'],
        status: 'status for challengeid4',
        locales: ['fr'],
      }),
    ];

    airtableBuilder.mockLists({
      skills: airtableSkills,
      challenges: airtableChallenges,
    });

    user = databaseBuilder.factory.buildAdminUser();
    databaseBuilder.factory.buildStaticCourse({
      id: staticCourseId,
      name: 'some name',
      description: 'some description',
      challengeIds: airtableChallenges.map((challenge) => challenge.fields['id persistant']).join(','),
      isActive: false,
      deactivationReason: 'because',
      createdAt: new Date('2020-01-01T00:00:10Z'),
      updatedAt: new Date('2020-01-02T00:00:10Z'),
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
      id: 'challengeid4',
      challengeId: 'challengeid4',
      locale: 'fr',
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
    await databaseBuilder.commit();
  });

  afterEach(function() {
    vi.useRealTimers();
    return knex('static_courses').delete();
  });

  it('deactivates and returns the static course', async function() {
    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'PUT',
      url: `/api/static-courses/${staticCourseId}/reactivate`,
      headers: {
        ...generateAuthorizationHeader(user),
        host: 'test.site',
      },
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
          'is-active': true,
          'deactivation-reason': '',
        },
        relationships: {
          tags: {
            data: [],
          },
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
            'preview-url': 'http://test.site/api/challenges/challengeid2/preview',
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
            'preview-url': 'http://test.site/api/challenges/challengeid3/preview',
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
            'preview-url': 'http://test.site/api/challenges/challengeid4/preview',
          },
        }
      ],
    });
  });
});
