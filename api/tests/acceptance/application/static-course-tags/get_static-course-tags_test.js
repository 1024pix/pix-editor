import { describe, expect, it } from 'vitest';
import {
  databaseBuilder,
  generateAuthorizationHeader,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | static course tags | GET /api/static-course-tags', function() {
  it('Return the list of all static course tags', async function() {
    // Given
    const server = await createServer();
    const user = databaseBuilder.factory.buildReadonlyUser();
    const tagA = databaseBuilder.factory.buildStaticCourseTag({ id: 456, label: 'TagA' });
    const tagB = databaseBuilder.factory.buildStaticCourseTag({ id: 123, label: 'TagB' });

    await databaseBuilder.commit();

    // When
    const response = await server.inject({
      method: 'GET',
      url: '/api/static-course-tags',
      headers: {
        ...generateAuthorizationHeader(user),
        host: 'host.site',
      },
    });

    // Then
    expect(response.statusCode).to.equal(200);
    expect(response.result).to.deep.equal({
      data: [
        {
          type: 'static-course-tags',
          id: tagB.id.toString(),
          attributes: {
            label: tagB.label,
          },
        },
        {
          type: 'static-course-tags',
          id: tagA.id.toString(),
          attributes: {
            label: tagA.label,
          },
        },
      ]
    });
  });
});
