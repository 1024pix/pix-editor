import { afterEach, describe, expect, it } from 'vitest';
import {
  databaseBuilder,
  generateAuthorizationHeader,
  knex,
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { Mission } from '../../../../lib/domain/models/index.js';

describe('Acceptance | API | mission | GET /api/missions', function() {

  afterEach(async function() {
    await knex('missions').delete();
    await knex('translations').delete();
  });

  it('Should return an object of serialized missions', async function() {

    //given
    const user = databaseBuilder.factory.buildAdminUser();
    const mission = databaseBuilder.factory.buildMission({ name: 'Condor', status: Mission.status.ACTIVE, competenceId: 'recCompetence0', thematicId: null, validatedObjectives: 'Être forte', learningObjectives: 'Être imbattable', createdAt: new Date('2024-01-01') });
    await databaseBuilder.commit();

    //when
    const server = await createServer();
    const response = await server.inject({
      method: 'GET',
      url: `/api/missions/${mission.id}`,
      headers: generateAuthorizationHeader(user),
    });

    //then
    expect(response.result).to.deep.equal({
      data: {
        type: 'missions',
        id: mission.id.toString(),
        attributes: {
          name: 'Condor',
          status: Mission.status.ACTIVE,
          'competence-id': 'recCompetence0',
          'thematic-id': null,
          'validated-objectives': 'Être forte',
          'learning-objectives': 'Être imbattable',
          'created-at': new Date('2024-01-01')
        },
      },
    });
  });

});
