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
    const mission = databaseBuilder.factory.buildMission({ name: 'Condor', cardImageUrl: 'https://example.com/image.png', status: Mission.status.VALIDATED, competenceId: 'recCompetence0', thematicIds: null, validatedObjectives: 'Être forte', learningObjectives: 'Être imbattable', createdAt: new Date('2024-01-01') });
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
          'card-image-url': 'https://example.com/image.png',
          status: Mission.status.VALIDATED,
          'competence-id': 'recCompetence0',
          'thematic-ids': null,
          'validated-objectives': 'Être forte',
          'learning-objectives': 'Être imbattable',
          'introduction-media-url': null,
          'introduction-media-type': null,
          'introduction-media-alt': 'Message alternatif',
          'documentation-url': null,
          'created-at': new Date('2024-01-01'),
          'warnings': undefined,
        },
      },
    });
  });

});
