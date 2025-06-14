import { describe, describe as context, expect, it } from 'vitest';
import { forRelease, forReplication } from '../../../../lib/infrastructure/transformers/thematic-transformer.js';
import { Thematic } from '../../../../lib/domain/models/index.js';
import { ThematicForRelease } from '../../../../lib/domain/models/release/index.js';
import { ThematicForReplication } from '../../../../lib/domain/models/replication/index.js';

describe('Unit | Infrastructure | thematic-transformer', function() {

  describe('#forRelease', function() {
    context('when providing a single Thematic', function() {
      it('should transform it into a single ThematicForRelease', function() {
        // given
        const thematic = new Thematic({
          id: 'thematicId',
          airtableId: 'recThematicId',
          name_i18n: { fr: 'name fr thematicId', en: 'name en thematicId' },
          index: 1,
          competenceId: 'competenceId',
          competenceAirtableId: 'recCompetenceId',
          tubeIds: ['tubeId1', 'tubeId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
        });

        // when
        const actualThematicForRelease = forRelease(thematic);

        // then
        expect(actualThematicForRelease).toStrictEqual(new ThematicForRelease({
          id: 'thematicId',
          name_i18n: { fr: 'name fr thematicId', en: 'name en thematicId' },
          index: 1,
          competenceId: 'competenceId',
          tubeIds: ['tubeId1', 'tubeId2'],
        }));
      });
    });

    context('when providing several Thematics', function() {
      it('should transform them into a several ThematicsForRelease', function() {
        // given
        const thematicA = new Thematic({
          id: 'thematicIdA',
          airtableId: 'recThematicIdA',
          name_i18n: { fr: 'name fr thematicIdA', en: 'name en thematicIdA' },
          index: 1,
          competenceId: 'competenceId',
          competenceAirtableId: 'recCompetenceId',
          tubeIds: ['tubeId1', 'tubeId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
        });
        const thematicB = new Thematic({
          id: 'thematicIdB',
          airtableId: 'recThematicIdB',
          name_i18n: { fr: 'name fr thematicIdB', en: 'name en thematicIdB' },
          index: 2,
          competenceId: 'competenceId',
          competenceAirtableId: 'recCompetenceId',
          tubeIds: ['tubeId3', 'tubeId4'],
          tubeAirtableIds: ['recTubeId3', 'recTubeId4'],
        });

        // when
        const actualThematicsForRelease = forRelease([thematicA, thematicB]);

        // then
        expect(actualThematicsForRelease).toStrictEqual([
          new ThematicForRelease({
            id: 'thematicIdA',
            name_i18n: { fr: 'name fr thematicIdA', en: 'name en thematicIdA' },
            index: 1,
            competenceId: 'competenceId',
            tubeIds: ['tubeId1', 'tubeId2'],
          }),
          new ThematicForRelease({
            id: 'thematicIdB',
            name_i18n: { fr: 'name fr thematicIdB', en: 'name en thematicIdB' },
            index: 2,
            competenceId: 'competenceId',
            tubeIds: ['tubeId3', 'tubeId4'],
          }),
        ]);
      });
    });
  });

  describe('#forReplication', function() {
    context('when providing a single Thematic', function() {
      it('should transform it into a single ThematicForReplication', function() {
        // given
        const thematic = new Thematic({
          id: 'thematicId',
          airtableId: 'recThematicId',
          name_i18n: { fr: 'name fr thematicId', en: 'name en thematicId' },
          index: 1,
          competenceId: 'competenceId',
          competenceAirtableId: 'recCompetenceId',
          tubeIds: ['tubeId1', 'tubeId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
        });

        // when
        const actualThematicForReplication = forReplication(thematic);

        // then
        expect(actualThematicForReplication).toStrictEqual(new ThematicForReplication({
          id: 'thematicId',
          name_i18n: { fr: 'name fr thematicId', en: 'name en thematicId' },
          index: 1,
          competenceId: 'competenceId',
          tubeIds: ['tubeId1', 'tubeId2'],
        }));
      });
    });

    context('when providing several Thematics', function() {
      it('should transform them into a several ThematicsForReplication', function() {
        // given
        const thematicA = new Thematic({
          id: 'thematicIdA',
          airtableId: 'recThematicIdA',
          name_i18n: { fr: 'name fr thematicIdA', en: 'name en thematicIdA' },
          index: 1,
          competenceId: 'competenceId',
          competenceAirtableId: 'recCompetenceId',
          tubeIds: ['tubeId1', 'tubeId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
        });
        const thematicB = new Thematic({
          id: 'thematicIdB',
          airtableId: 'recThematicIdB',
          name_i18n: { fr: 'name fr thematicIdB', en: 'name en thematicIdB' },
          index: 2,
          competenceId: 'competenceId',
          competenceAirtableId: 'recCompetenceId',
          tubeIds: ['tubeId3', 'tubeId4'],
          tubeAirtableIds: ['recTubeId3', 'recTubeId4'],
        });

        // when
        const actualThematicsForReplication = forReplication([thematicA, thematicB]);

        // then
        expect(actualThematicsForReplication).toStrictEqual([
          new ThematicForReplication({
            id: 'thematicIdA',
            name_i18n: { fr: 'name fr thematicIdA', en: 'name en thematicIdA' },
            index: 1,
            competenceId: 'competenceId',
            tubeIds: ['tubeId1', 'tubeId2'],
          }),
          new ThematicForReplication({
            id: 'thematicIdB',
            name_i18n: { fr: 'name fr thematicIdB', en: 'name en thematicIdB' },
            index: 2,
            competenceId: 'competenceId',
            tubeIds: ['tubeId3', 'tubeId4'],
          }),
        ]);
      });
    });
  });
});
