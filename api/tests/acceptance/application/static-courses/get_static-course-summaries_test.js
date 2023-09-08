import { describe, expect, it } from 'vitest';
import {
  databaseBuilder,
  generateAuthorizationHeader,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | static courses | GET /api/static-course-summaries', function() {
  it('Return the list of static course summaries', async function() {
    // Given
    const server = await createServer();
    const user = databaseBuilder.factory.buildReadonlyUser();
    databaseBuilder.factory.buildStaticCourse({
      id: 'courseid1',
      name: 'static course 1',
      challengeIds: 'challengeid1,challengeid2',
      createdAt: new Date('2021-01-01'),
      isActive: true,
    });
    databaseBuilder.factory.buildStaticCourse({
      id: 'courseid2',
      name: 'static course 2',
      challengeIds: 'challengeid3,challengeid4,challengeid5',
      createdAt: new Date('2021-01-03'),
      isActive: false,
    });
    await databaseBuilder.commit();

    // When
    const response = await server.inject({
      method: 'GET',
      url: '/api/static-course-summaries',
      headers: generateAuthorizationHeader(user),
    });

    // Then
    expect(response.statusCode).to.equal(200);
    expect(response.result.meta).to.deep.equal({ page: 1, pageSize: 10, rowCount: 2, pageCount: 1 });
    expect(response.result.data).to.deep.equal([
      {
        type: 'static-course-summaries',
        id: 'courseid2',
        attributes: {
          name: 'static course 2',
          'created-at': new Date('2021-01-03'),
          'challenge-count': 3,
          'is-active': false,
        },
      },
      {
        type: 'static-course-summaries',
        id: 'courseid1',
        attributes: {
          name: 'static course 1',
          'created-at': new Date('2021-01-01'),
          'challenge-count': 2,
          'is-active': true,
        },
      }
    ]);
  });
});
