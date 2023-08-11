const {
  expect,
  databaseBuilder,
  generateAuthorizationHeader,
  airtableBuilder,
} = require('../../../test-helper');
const createServer = require('../../../../server');

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
      isActive: true,
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
          'is-active': true,
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
