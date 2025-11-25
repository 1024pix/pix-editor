import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | localized_framework_tubes | DELETE /api/localized-framework-tubes', function() {
  let user, tubeId, localizedFrameworkTubeId;

  beforeEach(async function() {
    user = databaseBuilder.factory.buildAdminUser();
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
    const tube = databaseBuilder.factory.buildTube({
      id: 'tubeId',
      name: 'tubeName',
      index: 1,
      thematicId,
    });
    tubeId = tube.id;

    const localizedFrameworkTube = databaseBuilder.factory.buildLocalizedFrameworkTubes({
      tubeId,
      maxLevel: 8,
      locale: 'nl',
    });

    localizedFrameworkTubeId = localizedFrameworkTube.id;

    await databaseBuilder.commit();
  });

  it('should delete localizedFrameworkTube', async function() {
    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/localized-framework-tubes/${localizedFrameworkTubeId}`,
      headers: generateAuthorizationHeader(user),
    });

    // then
    const localizedFrameworkTube = await knex('localized_framework_tubes').select().first();

    expect(response.statusCode).to.equal(204);
    expect(localizedFrameworkTube).to.be.undefined;
  });
});
