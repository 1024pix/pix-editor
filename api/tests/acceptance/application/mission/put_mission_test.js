import _ from 'lodash';
import { afterEach, describe, describe as context, expect, it } from 'vitest';
import {
  databaseBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { Mission } from '../../../../lib/domain/models/index.js';

describe('Acceptance | API | mission | PATCH /api/missions/{id}', function() {

  afterEach(async function() {
    await knex('missions').delete();
    await knex('translations').delete();
  });

  context('when user has rights to update a mission', function() {
    it('updates the mission and returns its id', async function() {
      // given
      const user = databaseBuilder.factory.buildAdminUser();
      const missionToUpdateId = databaseBuilder.factory.buildMission().id;
      await databaseBuilder.commit();

      const payload = {
        data: {
          attributes: {
            name: 'Mission à mettre à jour',
            'competence-id': 'TYUI',
            'thematic-ids': '',
            status: Mission.status.EXPERIMENTAL,
            'learning-objectives': 'Une chose',
            'validated-objectives': null,
            'introductionMediaAlt': null
          },
        },
      };

      // when
      const server = await createServer();
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/missions/${missionToUpdateId}`,
        headers: generateAuthorizationHeader(user),
        payload,
      });

      // then
      const { id: missionId } = await knex('missions').select('id').first();

      expect(response.statusCode).to.equal(201);
      expect(_.omit(response.result, 'data.attributes.created-at')).to.deep.equal({
        data: {
          type: 'missions',
          id: missionId.toString(),
          'attributes': {
            'competence-id': 'TYUI',
            'documentation-url': null,
            'introduction-media-alt': null,
            'introduction-media-type': null,
            'introduction-media-url': null,
            'learning-objectives': 'Une chose',
            'name': 'Mission à mettre à jour',
            'status': 'EXPERIMENTAL',
            'thematic-ids': '',
            'validated-objectives': null,
            'warnings': [],
          },
        },
      });
    });
  });

  context('when user no has rights to update a mission', function() {
    it('does not allow the update', async function() {
      // given
      const user = databaseBuilder.factory.buildReadonlyUser();
      const missionId = databaseBuilder.factory.buildMission().id;
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
          },
          id: missionId.toString()
        },
      };

      // when
      const server = await createServer();
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/missions/${missionId}`,
        headers: generateAuthorizationHeader(user),
        payload,
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
