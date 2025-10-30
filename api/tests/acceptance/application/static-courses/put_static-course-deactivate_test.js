import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  airtableBuilder,
  databaseBuilder,
  domainBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | static courses | PUT /api/static-courses/{id}/deactivate', function () {
  let user;
  const staticCourseId = 'myAwesomeCourse66';

  beforeEach(async function () {
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
    databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
    databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
    databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
    databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
    databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
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
    const challenge2 = domainBuilder.buildChallengeDatasourceObject({
      id: 'challengeid2',
      skillId: 'skillid2',
      status: 'status for challengeid2',
      locales: ['fr'],
    });
    const challenge3 = domainBuilder.buildChallengeDatasourceObject({
      id: 'challengeid3',
      skillId: 'skillid3',
      status: 'status for challengeid3',
      locales: ['fr'],
    });
    const challenge4 = domainBuilder.buildChallengeDatasourceObject({
      id: 'challengeid4',
      skillId: 'skillid4',
      status: 'status for challengeid4',
      locales: ['fr'],
    });
    databaseBuilder.factory.buildSkill(skill2);
    databaseBuilder.factory.buildSkill(skill3);
    databaseBuilder.factory.buildSkill(skill4);
    databaseBuilder.factory.buildChallenge(challenge2);
    databaseBuilder.factory.buildChallenge(challenge3);
    databaseBuilder.factory.buildChallenge(challenge4);

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

    const airtableSkill2 = airtableBuilder.factory.buildSkill(skill2);
    const airtableSkill3 = airtableBuilder.factory.buildSkill(skill3);
    const airtableSkill4 = airtableBuilder.factory.buildSkill(skill4);
    const airtableChallenge2 = airtableBuilder.factory.buildChallenge(challenge2);
    const airtableChallenge3 = airtableBuilder.factory.buildChallenge(challenge3);
    const airtableChallenge4 = airtableBuilder.factory.buildChallenge(challenge4);
    airtableBuilder.mockLists({
      challenges: [airtableChallenge2, airtableChallenge3, airtableChallenge4],
      skills: [airtableSkill2, airtableSkill3, airtableSkill4],
    });
  });

  afterEach(function () {
    vi.useRealTimers();
    return knex('static_courses').delete();
  });

  it('deactivates and returns the static course', async function () {
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
      headers: {
        ...generateAuthorizationHeader(user),
        host: 'test.site',
      },
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
            'skill-name': '@tube2',
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
            'skill-name': '@tube3',
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
            'skill-name': '@tube4',
            status: 'status for challengeid4',
            'preview-url': 'http://test.site/api/challenges/challengeid4/preview',
          },
        },
      ],
    });
  });
});
