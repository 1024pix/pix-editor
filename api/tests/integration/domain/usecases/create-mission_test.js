import { afterEach, describe, expect, it } from 'vitest';
import { InvalidMissionContentError } from '../../../../lib/domain/errors.js';
import { createMission } from '../../../../lib/domain/usecases/index.js';
import { airtableBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { Mission, Skill } from '../../../../lib/domain/models/index.js';
import _ from 'lodash';

describe('Integration | Usecases | create mission', function() {
  afterEach(async function() {
    await knex('missions').delete();
    await knex('translations').delete();
  });

  it('when mission is totally valid, should create mission without warnings', async () => {
    // given
    const mission = domainBuilder.buildMission({ status: Mission.status.EXPERIMENTAL });

    // when
    const result = await createMission(mission);

    // then
    expect(_.omit(result.mission, 'createdAt')).to.deep.equal(_.omit(mission, 'createdAt'));
    expect(result.warnings).to.be.empty;
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
    const createdMission = domainBuilder.buildMission({ status: Mission.status.VALIDATED, thematicIds: 'Thematic' });

    // when
    const result = await createMission(createdMission);

    // then
    expect(result.warnings).to.deep.equal(['L\'activité \'@Pix1D-recherche_di\' n\'a pas d\'acquis actif pour le niveau 2.']);
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
    const createdMission = domainBuilder.buildMission({
      status: Mission.status.VALIDATED,
      thematicIds: ''
    });

    // when
    const promise = createMission(createdMission);

    // then
    await expect(promise).rejects.to.deep.equal(new InvalidMissionContentError('La mission ne peut pas être mise à jour car elle n\'a pas de thématique'));
  });
});

