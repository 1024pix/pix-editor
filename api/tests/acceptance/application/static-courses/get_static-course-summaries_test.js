import { describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | static courses | GET /api/static-course-summaries', function() {
  it('Return the list of static course summaries', async function() {
    // Given
    const server = await createServer();
    const user = databaseBuilder.factory.buildReadonlyUser();
    databaseBuilder.factory.buildStaticCourse({
      id: 'courseid1',
      name: 'static course 01',
      challengeIds: 'challengeid1,challengeid2',
      createdAt: new Date('2021-01-01'),
      isActive: true,
    });
    databaseBuilder.factory.buildStaticCourse({
      id: 'courseid2',
      name: 'static course 20',
      challengeIds: 'challengeid3,challengeid4,challengeid5',
      createdAt: new Date('2021-01-03'),
      isActive: false,
    });
    databaseBuilder.factory.buildStaticCourse({
      id: 'courseid3',
      name: 'static course 03',
      challengeIds: 'challengeid2,challengeid3,challengeid5',
      createdAt: new Date('2021-01-05'),
      isActive: true,
    });
    await databaseBuilder.commit();

    // When
    const response = await server.inject({
      method: 'GET',
      url: '/api/static-course-summaries?filter[isActive]=true&filter[name]=Rse+0',
      headers: generateAuthorizationHeader(user),
    });

    // Then
    expect(response.statusCode).to.equal(200);
    expect(response.result.meta).to.deep.equal({ page: 1, pageSize: 10, rowCount: 2, pageCount: 1 });
    expect(response.result.data).to.deep.equal([
      {
        type: 'static-course-summaries',
        id: 'courseid3',
        attributes: {
          name: 'static course 03',
          'created-at': new Date('2021-01-05'),
          'challenge-count': 3,
          'is-active': true,
        },
      },
      {
        type: 'static-course-summaries',
        id: 'courseid1',
        attributes: {
          name: 'static course 01',
          'created-at': new Date('2021-01-01'),
          'challenge-count': 2,
          'is-active': true,
        },
      }
    ]);
  });
});
