import { describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | localized_framework_tubes | GET /api/localized-framework-tubes', function() {
  it('Should return an object of serialized localizedFrameworkTubes', async function() {
    // given
    const user = databaseBuilder.factory.buildAdminUser();
    const localizedFrameworkTubes = databaseBuilder.factory.buildLocalizedFrameworkTubes({
      tubeId: 'tubeId1',
      maxLevel: 5,
      locale: 'bz',
    });
    await databaseBuilder.commit();

    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'GET',
      url: '/api/localized-framework-tubes',
      headers: generateAuthorizationHeader(user),
    });

    // then
    expect(response.result).to.deep.equal({
      data: [
        {
          type: 'localized-framework-tubes',
          id: localizedFrameworkTubes.id.toString(),
          attributes: {
            'tube-id': 'tubeId1',
            'max-level': 5,
            locale: 'bz',
          },
        },
      ],
    });
  });
});
