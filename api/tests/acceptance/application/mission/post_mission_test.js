import { afterEach, describe, describe as context, expect, it } from 'vitest';
import {
  databaseBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { Mission } from '../../../../lib/domain/models/index.js';

describe('Acceptance | API | mission | POST /api/missions', function() {

  afterEach(async function() {
    await knex('missions').delete();
    await knex('translations').delete();
  });

  context('when user has rights to create a mission', function() {
    it('creates the mission and returns its id', async function() {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      await databaseBuilder.commit();
  
      const payload = {
        data: {
          attributes: {
            name: 'Mission impossible',
            'competence-id': 'AZERTY',
            'thematic-id': null,
            status: Mission.status.INACTIVE,
            'learning-objectives': 'Autre chose',
            'validated-objectives': 'Très bien'
          }
        },
      };
  
      // when
      const server = await createServer();
      const response = await server.inject({
        method: 'POST',
        url: '/api/missions',
        headers: generateAuthorizationHeader(user),
        payload,
      });
  
      // then
      const { id: missionId } = await knex('missions').select('id').first();
  
      expect(response.statusCode).to.equal(201);
      expect(response.result).to.deep.equal({
        data: {
          type: 'missions',
          id: missionId.toString(),
        },
      });
    });
  });

  context('when user no has rights to create a mission', function() {
    it('does not allow the creation', async function() {
      // given
      const user = databaseBuilder.factory.buildReadonlyUser();
      await databaseBuilder.commit();
  
      const payload = {
        data: {
          attributes: {
            name: 'Mission impossible',
            'competence-id': 'AZERTY',
            'thematic-id': null,
            status: Mission.status.INACTIVE,
            'learning-objectives': 'Autre chose',
            'validated-objectives': 'Très bien'
          }
        },
      };
  
      // when
      const server = await createServer();
      const response = await server.inject({
        method: 'POST',
        url: '/api/missions',
        headers: generateAuthorizationHeader(user),
        payload,
      });
  
      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
