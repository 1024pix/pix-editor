import { describe, expect, it } from 'vitest';
import {
  databaseBuilder,
  generateAuthorizationHeader,
  airtableBuilder,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | static courses | GET /api/static-courses/{id}', function() {
  it('Return the static course', async function() {
    // Given
    const server = await createServer();
    const user = databaseBuilder.factory.buildReadonlyUser();
    databaseBuilder.factory.buildStaticCourse({
      id: 'courseid1',
      name: 'static course 1',
      description: 'static course description',
      challengeIds: 'challengeid1,challengeid2',
      createdAt: new Date('2021-01-01'),
      updatedAt: new Date('2021-02-02'),
      isActive: false,
      deactivationReason: 'Les fruits c genial',
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
    await databaseBuilder.commit();
    const airtableChallenge1 = airtableBuilder.factory.buildChallenge({
      id: 'challengeid1',
      skillId: 'skillid1',
      status: 'status for challengeid1',
      preview: 'site/challenges/challengeid1',
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
      preview: 'site/challenges/challengeid2',
      locales: ['fr'],
    });
    const airtableSkill2 = airtableBuilder.factory.buildSkill({
      id: 'skillid2',
      name: '@skillid2',
      hint_i18n: {},
    });
    airtableBuilder.mockLists({
      challenges: [airtableChallenge1, airtableChallenge2],
      skills: [airtableSkill1, airtableSkill2],
    });

    // When
    const response = await server.inject({
      method: 'GET',
      url: '/api/static-courses/courseid1',
      headers: generateAuthorizationHeader(user),
    });

    // Then
    expect(response.statusCode).to.equal(200);
    expect(response.result).to.deep.equal({
      data: {
        type: 'static-courses',
        id: 'courseid1',
        attributes: {
          name: 'static course 1',
          description: 'static course description',
          'created-at': new Date('2021-01-01'),
          'updated-at': new Date('2021-02-02'),
          'is-active': false,
          'deactivation-reason': 'Les fruits c genial',
        },
        relationships: {
          'challenge-summaries': {
            data: [
              {
                type: 'challenge-summaries',
                id: 'challengeid1',
              },
              {
                type: 'challenge-summaries',
                id: 'challengeid2',
              },
            ],
          },
        },
      },
      included: [
        {
          type: 'challenge-summaries',
          id: 'challengeid1',
          attributes: {
            index: 0,
            instruction: 'instruction for challengeid1',
            'skill-name': '@skillid1',
            status: 'status for challengeid1',
            'preview-url': 'site/challenges/challengeid1',
          },
        },
        {
          type: 'challenge-summaries',
          id: 'challengeid2',
          attributes: {
            index: 1,
            instruction: 'instruction for challengeid2',
            'skill-name': '@skillid2',
            status: 'status for challengeid2',
            'preview-url': 'site/challenges/challengeid2',
          },
        }
      ],
    });
  });
});
