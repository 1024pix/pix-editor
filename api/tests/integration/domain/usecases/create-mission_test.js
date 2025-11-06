import { describe, expect, it } from 'vitest';
import { InvalidMissionContentError } from '../../../../lib/domain/errors.js';
import { createMission } from '../../../../lib/domain/usecases/index.js';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import { Mission, Skill } from '../../../../lib/domain/models/index.js';
import _ from 'lodash';

describe('Integration | Usecases | create mission', function() {
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
    // given
    const thematic = {
      id: 'Thematic',
      competenceId: 'competence1',
      tubeIds: ['tubeTuto'],
    };
    const tube = {
      id: 'tubeTuto',
      name: '@Pix1D-recherche_di',
      thematicId: 'Thematic',
      competenceId: 'competence1',
      skillIds: ['skillTuto2'],
    };

    databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
    databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
    databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
    databaseBuilder.factory.buildThematic(thematic);
    databaseBuilder.factory.buildTube(tube);
    const skill = domainBuilder.buildSkillDatasourceObject({
      id: 'skillTuto2',
      level: 2,
      tubeId: 'tubeTuto',
      status: Skill.STATUSES.EN_CONSTRUCTION,
      competenceId: 'competence1',
      tutorialIds: [],
      learningMoreTutorialIds: [],
      name: '@Pix1D-recherche_di2',
      challengeIds: [],
    });
    databaseBuilder.factory.buildSkill(skill);
    await databaseBuilder.commit();

    airtableBuilder.mockLists({
      skills: [airtableBuilder.factory.buildSkill(skill)],
      tubes: [airtableBuilder.factory.buildTube(tube)],
      thematics: [airtableBuilder.factory.buildThematic(thematic)],
    });

    const createdMission = domainBuilder.buildMission({ status: Mission.status.VALIDATED, thematicIds: 'Thematic' });

    // when
    const result = await createMission(createdMission);

    // then
    expect(result.warnings).to.deep.equal(["L'activité '@Pix1D-recherche_di' n'a pas d'acquis actif pour le niveau 2."]);
  });

  it('when mission is not valid, should throw an error', async () => {
    // given
    const createdMission = domainBuilder.buildMission({
      status: Mission.status.VALIDATED,
      thematicIds: '',
    });

    // when
    const promise = createMission(createdMission);

    // then
    await expect(promise).rejects.to.deep.equal(
      new InvalidMissionContentError("La mission ne peut pas être mise à jour car elle n'a pas de thématique"),
    );
  });
});
