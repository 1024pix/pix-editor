import { describe, expect, it } from 'vitest';
import { InvalidMissionContentError } from '../../../../lib/domain/errors.js';
import { updateMission } from '../../../../lib/domain/usecases/index.js';
import { airtableBuilder, databaseBuilder } from '../../../test-helper.js';
import { Mission, Skill } from '../../../../lib/domain/models/index.js';
import * as missionRepository from '../../../../lib/infrastructure/repositories/mission-repository.js';

describe('Integration | Usecases | Update mission', function() {
  it('when mission is totally valid, should update mission without warnings', async () => {
    // given
    const mission = databaseBuilder.factory.buildMission();
    await databaseBuilder.commit();

    const updatedMission = await missionRepository.getById(mission.id);
    updatedMission.status = Mission.status.EXPERIMENTAL;

    // when
    const result = await updateMission(updatedMission);

    // then
    expect(result).to.deep.equal({ mission: updatedMission, warnings: [] });
  });

  it('when mission is partially valid, should update mission with warnings', async () => {
    const mockedLearningContent = {
      skills: [
        airtableBuilder.factory.buildSkill({
          id: 'skillTuto2',
          level: 2,
          tubeId: 'tubeTuto',
          status: Skill.STATUSES.EN_CONSTRUCTION
        })],
      tubes: [
        airtableBuilder.factory.buildTube({ id: 'tubeTuto', name: '@Pix1D-recherche_di' }),
      ],
      thematics: [
        airtableBuilder.factory.buildThematic({
          id: 'Thematic',
          tubeIds: ['tubeTuto']
        }),
      ],
    };

    airtableBuilder.mockLists(mockedLearningContent);

    // given
    const mission = databaseBuilder.factory.buildMission({ thematicIds: 'Thematic' });
    await databaseBuilder.commit();

    const updatedMission = await missionRepository.getById(mission.id);
    updatedMission.status = Mission.status.VALIDATED;

    // when
    const result = await updateMission(updatedMission);

    // then
    expect(result).to.deep.equal({ mission: updatedMission, warnings: ['L\'activité \'@Pix1D-recherche_di\' n\'a pas d\'acquis actif pour le niveau 2.'] });
  });

  it('when mission is not valid, should throw an error', async () => {
    const mockedLearningContent = {
      skills: [
        airtableBuilder.factory.buildSkill({
          id: 'skillTuto2',
          level: 2,
          tubeId: 'tubeTuto',
          status: Skill.STATUSES.EN_CONSTRUCTION
        })],
      tubes: [
        airtableBuilder.factory.buildTube({ id: 'tubeTuto', name: '@Pix1D-recherche_di' }),
      ],
      thematics: [
        airtableBuilder.factory.buildThematic({
          id: 'Thematic',
          tubeIds: ['tubeTuto']
        }),
      ],
    };

    airtableBuilder.mockLists(mockedLearningContent);

    // given
    const mission = databaseBuilder.factory.buildMission();
    await databaseBuilder.commit();

    const updatedMission = await missionRepository.getById(mission.id);
    updatedMission.status = Mission.status.VALIDATED;

    // when
    const promise = updateMission(updatedMission);

    // then
    await expect(promise).rejects.to.deep.equal(new InvalidMissionContentError('La mission ne peut pas être mise à jour car elle n\'a pas de sujet'));
  });
});
