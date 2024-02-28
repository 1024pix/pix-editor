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
    const tagAId = databaseBuilder.factory.buildStaticCourseTag({ label: 'TagA' }).id;
    const tagBId = databaseBuilder.factory.buildStaticCourseTag({ label: 'TagB' }).id;
    const tagCId = databaseBuilder.factory.buildStaticCourseTag({ label: 'TagC' }).id;
    databaseBuilder.factory.linkTagsTo({ staticCourseTagIds: [tagAId, tagBId], staticCourseId: 'courseid1' });
    databaseBuilder.factory.linkTagsTo({ staticCourseTagIds: [tagBId, tagCId], staticCourseId: 'courseid2' });
    databaseBuilder.factory.linkTagsTo({ staticCourseTagIds: [tagCId, tagAId], staticCourseId: 'courseid3' });
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
        relationships: {
          tags: {
            data: [
              {
                type: 'static-course-tags',
                id: `${tagAId}`,
              },
              {
                type: 'static-course-tags',
                id: `${tagCId}`,
              },
            ],
          },
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
        relationships: {
          tags: {
            data: [
              {
                type: 'static-course-tags',
                id: `${tagAId}`,
              },
              {
                type: 'static-course-tags',
                id: `${tagBId}`,
              },
            ],
          },
        },
      }
    ]);
    expect(response.result.included).to.deep.equal([
      {
        type: 'static-course-tags',
        id: `${tagAId}`,
        attributes: {
          label: 'TagA',
        },
        relationships: {},
      },
      {
        type: 'static-course-tags',
        id: `${tagCId}`,
        attributes: {
          label: 'TagC',
        },
      },
      {
        type: 'static-course-tags',
        id: `${tagBId}`,
        attributes: {
          label: 'TagB',
        },
      },
    ]);
  });
});
