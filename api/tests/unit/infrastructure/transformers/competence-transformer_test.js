import { describe, describe as context, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import {
  filterCompetencesFields,
  forRelease,
  forReplication
} from '../../../../lib/infrastructure/transformers/competence-transformer.js';
import { CompetenceForReplication } from '../../../../lib/domain/models/replication/index.js';
import { Competence } from '../../../../lib/domain/models/index.js';
import { CompetenceForRelease } from '../../../../lib/domain/models/release/index.js';

describe('Unit | Infrastructure | competence-transformer', function() {
  describe('#forRelease', function() {
    context('when providing a single Competence', function() {
      it('should transform it into a single CompetenceForRelease', function() {
      // given
        const competence = new Competence({
          id: 'competenceId',
          airtableId: 'recCompetenceId',
          index: 1,
          origin: 'Pix+Fruits',
          areaId: 'areaId',
          areaAirtableId: 'recAreaId',
          thematicIds: ['thematicId1', 'thematicId2'],
          thematicAirtableIds: ['recThematicId1', 'recThematicId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
          skillIds: ['skillId1', 'skillId2'],
          name_i18n: { fr: 'name fr competenceId', en: 'name en competenceId' },
          description_i18n: { fr: 'description fr competenceId', en: 'description en competenceId' },
        });

        // when
        const actualCompetenceForRelease = forRelease(competence);

        // then
        expect(actualCompetenceForRelease).toStrictEqual(new CompetenceForRelease({
          id: 'competenceId',
          index: 1,
          origin: 'Pix+Fruits',
          areaId: 'areaId',
          thematicIds: ['thematicId1', 'thematicId2'],
          skillIds: ['skillId1', 'skillId2'],
          name_i18n: { fr: 'name fr competenceId', en: 'name en competenceId' },
          description_i18n: { fr: 'description fr competenceId', en: 'description en competenceId' },
        }));
      });
    });

    context('when providing several Competences', function() {
      it('should transform them into a several CompetencesForRelease', function() {
      // given
        const competenceA = new Competence({
          id: 'competenceIdA',
          airtableId: 'recCompetenceIdA',
          index: 1,
          origin: 'Pix+Fruits',
          areaId: 'areaId',
          areaAirtableId: 'recAreaId',
          thematicIds: ['thematicId1', 'thematicId2'],
          thematicAirtableIds: ['recThematicId1', 'recThematicId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
          skillIds: ['skillId1', 'skillId2'],
          name_i18n: { fr: 'name fr competenceIdA', en: 'name en competenceIdA' },
          description_i18n: { fr: 'description fr competenceIdA', en: 'description en competenceIdA' },
        });
        const competenceB = new Competence({
          id: 'competenceIdB',
          airtableId: 'recCompetenceIdB',
          index: 2,
          origin: 'Pix+Légumes',
          areaId: 'areaId',
          areaAirtableId: 'recAreaId',
          thematicIds: ['thematicId3', 'thematicId4'],
          thematicAirtableIds: ['recThematicId3', 'recThematicId4'],
          tubeAirtableIds: ['recTubeId3', 'recTubeId4'],
          skillIds: ['skillId3', 'skillId4'],
          name_i18n: { fr: 'name fr competenceIdB', en: 'name en competenceIdB' },
          description_i18n: { fr: 'description fr competenceIdB', en: 'description en competenceIdB' },
        });

        // when
        const actualCompetencesForRelease = forRelease([competenceA, competenceB]);

        // then
        expect(actualCompetencesForRelease).toStrictEqual([
          new CompetenceForRelease({
            id: 'competenceIdA',
            index: 1,
            origin: 'Pix+Fruits',
            areaId: 'areaId',
            thematicIds: ['thematicId1', 'thematicId2'],
            skillIds: ['skillId1', 'skillId2'],
            name_i18n: { fr: 'name fr competenceIdA', en: 'name en competenceIdA' },
            description_i18n: { fr: 'description fr competenceIdA', en: 'description en competenceIdA' },
          }),
          new CompetenceForRelease({
            id: 'competenceIdB',
            index: 2,
            origin: 'Pix+Légumes',
            areaId: 'areaId',
            thematicIds: ['thematicId3', 'thematicId4'],
            skillIds: ['skillId3', 'skillId4'],
            name_i18n: { fr: 'name fr competenceIdB', en: 'name en competenceIdB' },
            description_i18n: { fr: 'description fr competenceIdB', en: 'description en competenceIdB' },
          }),
        ]);
      });
    });
  });

  describe('#forReplication', function() {
    context('when providing a single Competence', function() {
      it('should transform it into a single CompetenceForReplication', function() {
      // given
        const competence = new Competence({
          id: 'competenceId',
          airtableId: 'recCompetenceId',
          index: 1,
          origin: 'Pix+Fruits',
          areaId: 'areaId',
          areaAirtableId: 'recAreaId',
          thematicIds: ['thematicId1', 'thematicId2'],
          thematicAirtableIds: ['recThematicId1', 'recThematicId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
          skillIds: ['skillId1', 'skillId2'],
          name_i18n: { fr: 'name fr competenceId', en: 'name en competenceId' },
          description_i18n: { fr: 'description fr competenceId', en: 'description en competenceId' },
        });

        // when
        const actualCompetenceForReplication = forReplication(competence);

        // then
        expect(actualCompetenceForReplication).toStrictEqual(new CompetenceForReplication({
          id: 'competenceId',
          index: 1,
          origin: 'Pix+Fruits',
          areaId: 'areaId',
          thematicIds: ['thematicId1', 'thematicId2'],
          skillIds: ['skillId1', 'skillId2'],
          name_i18n: { fr: 'name fr competenceId', en: 'name en competenceId' },
          description_i18n: { fr: 'description fr competenceId', en: 'description en competenceId' },
        }));
      });
    });

    context('when providing several Competences', function() {
      it('should transform them into a several CompetencesForReplication', function() {
      // given
        const competenceA = new Competence({
          id: 'competenceIdA',
          airtableId: 'recCompetenceIdA',
          index: 1,
          origin: 'Pix+Fruits',
          areaId: 'areaId',
          areaAirtableId: 'recAreaId',
          thematicIds: ['thematicId1', 'thematicId2'],
          thematicAirtableIds: ['recThematicId1', 'recThematicId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
          skillIds: ['skillId1', 'skillId2'],
          name_i18n: { fr: 'name fr competenceIdA', en: 'name en competenceIdA' },
          description_i18n: { fr: 'description fr competenceIdA', en: 'description en competenceIdA' },
        });
        const competenceB = new Competence({
          id: 'competenceIdB',
          airtableId: 'recCompetenceIdB',
          index: 2,
          origin: 'Pix+Légumes',
          areaId: 'areaId',
          areaAirtableId: 'recAreaId',
          thematicIds: ['thematicId3', 'thematicId4'],
          thematicAirtableIds: ['recThematicId3', 'recThematicId4'],
          tubeAirtableIds: ['recTubeId3', 'recTubeId4'],
          skillIds: ['skillId3', 'skillId4'],
          name_i18n: { fr: 'name fr competenceIdB', en: 'name en competenceIdB' },
          description_i18n: { fr: 'description fr competenceIdB', en: 'description en competenceIdB' },
        });

        // when
        const actualCompetencesForReplication = forReplication([competenceA, competenceB]);

        // then
        expect(actualCompetencesForReplication).toStrictEqual([
          new CompetenceForReplication({
            id: 'competenceIdA',
            index: 1,
            origin: 'Pix+Fruits',
            areaId: 'areaId',
            thematicIds: ['thematicId1', 'thematicId2'],
            skillIds: ['skillId1', 'skillId2'],
            name_i18n: { fr: 'name fr competenceIdA', en: 'name en competenceIdA' },
            description_i18n: { fr: 'description fr competenceIdA', en: 'description en competenceIdA' },
          }),
          new CompetenceForReplication({
            id: 'competenceIdB',
            index: 2,
            origin: 'Pix+Légumes',
            areaId: 'areaId',
            thematicIds: ['thematicId3', 'thematicId4'],
            skillIds: ['skillId3', 'skillId4'],
            name_i18n: { fr: 'name fr competenceIdB', en: 'name en competenceIdB' },
            description_i18n: { fr: 'description fr competenceIdB', en: 'description en competenceIdB' },
          }),
        ]);
      });
    });
  });

  it('should only keep useful fields', function() {
    const airtableCompetences = [domainBuilder.buildCompetenceDatasourceObject()];

    const competences = filterCompetencesFields(airtableCompetences);

    expect(competences.length).to.equal(1);
  });
});
