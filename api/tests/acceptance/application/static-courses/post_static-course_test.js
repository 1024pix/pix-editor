import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { airtableBuilder, databaseBuilder, generateAuthorizationHeader, knex, } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | static courses | POST /api/static-courses', function() {
  let user;

  beforeEach(async function() {
    vi.useFakeTimers({
      now: new Date('2021-10-29T03:04:00Z'),
      toFake: ['Date'],
    });
    user = databaseBuilder.factory.buildAdminUser();
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid1',
      challengeId: 'challengeid1',
      locale: 'fr',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeid1.instruction',
      locale: 'fr',
      value: 'instruction for challengeid1',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid1nl',
      challengeId: 'challengeid1',
      locale: 'nl',
      status: 'proposé',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeid1.instruction',
      locale: 'nl',
      value: 'instruction for challengeid1 in nl',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid2',
      challengeId: 'challengeid2',
      locale: 'fr',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeid2.instruction',
      locale: 'fr',
      value: 'instruction for challengeid2',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid3',
      challengeId: 'challengeid3',
      locale: 'fr',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeid3.instruction',
      locale: 'fr',
      value: 'instruction for challengeid3',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeid4',
      challengeId: 'challengeid4',
      locale: 'fr',
    });
    databaseBuilder.factory.buildTranslation({
      key: 'challenge.challengeid4.instruction',
      locale: 'fr',
      value: 'instruction for challengeid4',
    });

    await databaseBuilder.commit();
    const airtableChallenge1 = airtableBuilder.factory.buildChallenge({
      id: 'challengeid1',
      skillId: 'skillid1',
      status: 'validé',
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
      status: 'proposé',
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
      status: 'proposé',
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
      status: 'proposé',
      locales: ['fr'],
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
  });

  afterEach(function() {
    vi.useRealTimers();
    return knex('static_courses').delete();
  });

  it('creates and returns the static course', async function() {
    // given
    const payload = {
      data: {
        attributes: {
          name: 'static course 1',
          description: 'static course description',
          'challenge-ids': ['challengeid3', 'challengeid1', 'challengeid1nl'],
        },
      },
    };

    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'POST',
      url: '/api/static-courses',
      headers: { ...generateAuthorizationHeader(user), host: 'test.site' },
      payload,
    });

    // then
    const [staticCourseId] = await knex('static_courses').pluck('id');
    expect(response.statusCode).to.equal(201);
    expect(response.result).to.deep.equal({
      data: {
        type: 'static-courses',
        id: staticCourseId,
        attributes: {
          name: 'static course 1',
          description: 'static course description',
          'created-at': new Date('2021-10-29T03:04:00Z'),
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
                id: 'challengeid3',
              },
              {
                type: 'challenge-summaries',
                id: 'challengeid1',
              },
              {
                type: 'challenge-summaries',
                id: 'challengeid1nl',
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
            status: 'proposé',
            'preview-url': 'http://test.site/api/challenges/challengeid3/preview',
          },
        },
        {
          type: 'challenge-summaries',
          id: 'challengeid1',
          attributes: {
            index: 1,
            instruction: 'instruction for challengeid1',
            'skill-name': '@skillid1',
            status: 'validé',
            'preview-url': 'http://test.site/api/challenges/challengeid1/preview',
          },
        },
        {
          type: 'challenge-summaries',
          id: 'challengeid1nl',
          attributes: {
            index: 2,
            instruction: 'instruction for challengeid1 in nl',
            'skill-name': '@skillid1',
            status: 'proposé',
            'preview-url': 'http://test.site/api/challenges/challengeid1/preview?locale=nl',
          },
        },
      ],
    });
  });
});
