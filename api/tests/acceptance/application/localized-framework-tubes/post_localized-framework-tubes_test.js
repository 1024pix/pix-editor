import { beforeEach, describe, expect, it } from 'vitest';
import { databaseBuilder, generateAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

describe('Acceptance | API | localized_framework_tubes | POST /api/localized-framework-tubes', function() {
  let user, tubeId;

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
    await databaseBuilder.commit();
  });

  it('should create a localizedFrameworkTube', async function() {
    // given
    const payload = {
      data: {
        attributes: {
          'tube-id': tubeId,
          'max-level': 2,
          locale: 'nl',
        },
      },
    };

    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'POST',
      url: '/api/localized-framework-tubes',
      headers: generateAuthorizationHeader(user),
      payload,
    });

    // then
    const { id: localizedFrameworkTubesId } = await knex('localized_framework_tubes').select('id').first();

    expect(response.statusCode).to.equal(201);
    expect(response.result).to.deep.equal({
      data: {
        type: 'localized-framework-tubes',
        id: localizedFrameworkTubesId.toString(),
        attributes: {
          'tube-id': 'tubeId',
          'max-level': 2,
          locale: 'nl',
        },
      },
    });
  });

  it('Should return bad request if invalid payload', async function() {
    // given
    const payload = {
      data: {
        attributes: {
          'tube-id': tubeId,
          'max-level': 10,
          locale: 'nl',
        },
      },
    };

    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'POST',
      url: '/api/localized-framework-tubes',
      headers: generateAuthorizationHeader(user),
      payload,
    });

    // then
    const localizedFrameworkTube = await knex('localized_framework_tubes').select('id').first();

    expect(localizedFrameworkTube).to.be.undefined;
    expect(response.statusCode).to.equal(400);
    expect(response.payload).to.equal('{"errors":[{"status":"400","title":"Bad Request","detail":"MaxLevel out of range"}]}');
  });

  it('Should return 403 if user doesn\'t have access', async function() {
    // given
    user = databaseBuilder.factory.buildReadonlyUser();
    const payload = {
      data: {
        attributes: {
          'tube-id': tubeId,
          'max-level': 10,
          locale: 'nl',
        },
      },
    };

    await databaseBuilder.commit();

    // when
    const server = await createServer();
    const response = await server.inject({
      method: 'POST',
      url: '/api/localized-framework-tubes',
      headers: generateAuthorizationHeader(user),
      payload,
    });

    // then
    const localizedFrameworkTube = await knex('localized_framework_tubes').select('id').first();

    expect(localizedFrameworkTube).to.be.undefined;
    expect(response.statusCode).to.equal(403);
    expect(response.payload).to.equal('{"errors":[{"code":403,"title":"Forbidden access","detail":"Missing or insufficient permissions."}]}');
  });
});
