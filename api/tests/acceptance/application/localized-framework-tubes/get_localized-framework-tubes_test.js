import { describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | localized_framework_tubes | GET /api/localized-framework-tubes', function() {
  it('Should return serialized localizedFrameworkTubes', async function() {
    // given
    const user = databaseBuilder.factory.buildAdminUser();
    const { id: frameworkId } = databaseBuilder.factory.buildFramework({
      id: 'frameworkId',
      name: 'framework',
    });
    const { id: areaId } = databaseBuilder.factory.buildArea({
      id: 'areaId',
      code: '1.1',
      color: 'blue',
      frameworkId,
    });
    const { id: competenceId } = databaseBuilder.factory.buildCompetence({
      id: 'competenceId',
      index: 1,
      areaId,
    });
    const { id: thematicId } = databaseBuilder.factory.buildThematic({
      id: 'thematicId',
      index: 1,
      competenceId,
    });
    const { id: tubeId } = databaseBuilder.factory.buildTube({
      id: 'tubeId',
      name: 'tubeName',
      index: 1,
      thematicId,
    });

    const localizedFrameworkTubes = databaseBuilder.factory.buildLocalizedFrameworkTubes({
      tubeId,
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
            'tube-id': 'tubeId',
            'max-level': 5,
            locale: 'bz',
          },
        },
      ],
    });
  });
});
