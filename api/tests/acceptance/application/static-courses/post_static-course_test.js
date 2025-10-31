import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';

describe('Acceptance | API | static courses | POST /api/static-courses', function () {
  let user;

  beforeEach(async function () {
    vi.useFakeTimers({
      now: new Date('2021-10-29T03:04:00Z'),
      toFake: ['Date'],
    });
    user = databaseBuilder.factory.buildAdminUser();
    databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
    databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
    databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
    databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
    databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });

    const skill1 = domainBuilder.buildSkillDatasourceObject({
      id: 'skillid1',
      name: '@tube1',
      level: 1,
      hint_i18n: {},
      tubeId: 'tube1',
      competenceId: 'competence1',
      tutorialIds: [],
      learningMoreTutorialIds: [],
      challengeIds: ['challengeid1'],
    });
    const skill2 = domainBuilder.buildSkillDatasourceObject({
      id: 'skillid2',
      name: '@tube2',
      level: 2,
      hint_i18n: {},
      tubeId: 'tube1',
      competenceId: 'competence1',
      tutorialIds: [],
      learningMoreTutorialIds: [],
      challengeIds: ['challengeid2'],
    });
    const skill3 = domainBuilder.buildSkillDatasourceObject({
      id: 'skillid3',
      name: '@tube3',
      level: 3,
      hint_i18n: {},
      tubeId: 'tube1',
      competenceId: 'competence1',
      tutorialIds: [],
      learningMoreTutorialIds: [],
      challengeIds: ['challengeid3'],
    });
    const skill4 = domainBuilder.buildSkillDatasourceObject({
      id: 'skillid4',
      name: '@tube4',
      level: 4,
      hint_i18n: {},
      tubeId: 'tube1',
      competenceId: 'competence1',
      tutorialIds: [],
      learningMoreTutorialIds: [],
      challengeIds: ['challengeid4'],
    });
    const challenge1 = domainBuilder.buildChallengeDatasourceObject({
      id: 'challengeid1',
      skillId: 'skillid1',
      locales: ['fr'],
      status: Challenge.STATUSES.VALIDE,
    });
    const challenge2 = domainBuilder.buildChallengeDatasourceObject({
      id: 'challengeid2',
      skillId: 'skillid2',
      locales: ['fr'],
      status: Challenge.STATUSES.PROPOSE,
    });
    const challenge3 = domainBuilder.buildChallengeDatasourceObject({
      id: 'challengeid3',
      skillId: 'skillid3',
      locales: ['fr'],
      status: Challenge.STATUSES.PROPOSE,
    });
    const challenge4 = domainBuilder.buildChallengeDatasourceObject({
      id: 'challengeid4',
      skillId: 'skillid4',
      locales: ['fr'],
      status: Challenge.STATUSES.PROPOSE,
    });
    databaseBuilder.factory.buildSkill(skill1);
    databaseBuilder.factory.buildSkill(skill2);
    databaseBuilder.factory.buildSkill(skill3);
    databaseBuilder.factory.buildSkill(skill4);
    databaseBuilder.factory.buildChallenge(challenge1);
    databaseBuilder.factory.buildChallenge(challenge2);
    databaseBuilder.factory.buildChallenge(challenge3);
    databaseBuilder.factory.buildChallenge(challenge4);

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
      status: LocalizedChallenge.STATUSES.PAUSE,
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
    databaseBuilder.factory.buildStaticCourseTag({
      id: 123,
      label: 'tagA',
    });
    databaseBuilder.factory.buildStaticCourseTag({
      id: 456,
      label: 'tagB',
    });
    databaseBuilder.factory.buildStaticCourseTag({
      id: 789,
      label: 'tagC',
    });
    databaseBuilder.factory.buildStaticCourseTag({
      id: 159,
      label: 'tagD',
    });

    await databaseBuilder.commit();
    const airtableChallenge1 = airtableBuilder.factory.buildChallenge(challenge1);
    const airtableSkill1 = airtableBuilder.factory.buildSkill(skill1);
    const airtableChallenge3 = airtableBuilder.factory.buildChallenge(challenge3);
    const airtableSkill3 = airtableBuilder.factory.buildSkill(skill3);
    airtableBuilder.mockLists({
      challenges: [airtableChallenge1, airtableChallenge3],
      skills: [airtableSkill1, airtableSkill3],
    });
  });

  afterEach(async function () {
    vi.useRealTimers();
    await knex('static_courses_tags_link').delete();
    return knex('static_courses').delete();
  });

  it('creates and returns the static course', async function () {
    // given
    const payload = {
      data: {
        attributes: {
          name: 'static course 1',
          description: 'static course description',
          'challenge-ids': ['challengeid3', 'challengeid1', 'challengeid1nl'],
          'tag-ids': ['123', '456'],
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
            data: [
              {
                type: 'static-course-tags',
                id: '123',
              },
              {
                type: 'static-course-tags',
                id: '456',
              },
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
            'skill-name': '@tube3',
            status: Challenge.STATUSES.PROPOSE,
            'preview-url': 'http://test.site/api/challenges/challengeid3/preview',
          },
        },
        {
          type: 'challenge-summaries',
          id: 'challengeid1',
          attributes: {
            index: 1,
            instruction: 'instruction for challengeid1',
            'skill-name': '@tube1',
            status: Challenge.STATUSES.VALIDE,
            'preview-url': 'http://test.site/api/challenges/challengeid1/preview',
          },
        },
        {
          type: 'challenge-summaries',
          id: 'challengeid1nl',
          attributes: {
            index: 2,
            instruction: 'instruction for challengeid1 in nl',
            'skill-name': '@tube1',
            status: Challenge.STATUSES.PROPOSE,
            'preview-url': 'http://test.site/api/challenges/challengeid1/preview?locale=nl',
          },
        },
        {
          type: 'static-course-tags',
          id: '123',
          attributes: {
            label: 'tagA',
          },
        },
        {
          type: 'static-course-tags',
          id: '456',
          attributes: {
            label: 'tagB',
          },
        },
      ],
    });
  });
});
