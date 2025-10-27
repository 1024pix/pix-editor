import { describe, describe as context, expect, it } from 'vitest';
import { forRelease, forReplication } from '../../../../lib/infrastructure/transformers/area-transformer.js';
import { Area } from '../../../../lib/domain/models/index.js';
import { AreaForRelease } from '../../../../lib/domain/models/release/index.js';
import { AreaForReplication } from '../../../../lib/domain/models/replication/index.js';

describe('Unit | Infrastructure | area-transformer', function () {
  describe('#forRelease', function () {
    context('when providing a single Area', function () {
      it('should transform it into a single AreaForRelease', function () {
        // given
        const area = new Area({
          id: 'areaId',
          airtableId: 'recAreaId',
          code: '1',
          title_i18n: { fr: 'title fr areaId', en: 'title en areaId' },
          competenceIds: ['competenceId1', 'competenceId2'],
          competenceAirtableIds: ['recCompetenceId1', 'recCompetenceId2'],
          color: Area.COLORS.CERULEAN,
          frameworkId: 'frameworkId',
        });

        // when
        const actualAreaForRelease = forRelease(area);

        // then
        expect(actualAreaForRelease).toStrictEqual(
          new AreaForRelease({
            id: 'areaId',
            code: '1',
            name: '1. title fr areaId',
            title_i18n: { fr: 'title fr areaId', en: 'title en areaId' },
            competenceIds: ['competenceId1', 'competenceId2'],
            color: Area.COLORS.CERULEAN,
            frameworkId: 'frameworkId',
          }),
        );
      });
    });

    context('when providing several Areas', function () {
      it('should transform them into a several AreasForRelease', function () {
        // given
        const areaA = new Area({
          id: 'areaIdA',
          airtableId: 'recAreaIdA',
          code: '1',
          title_i18n: { fr: 'title fr areaIdA', en: 'title en areaIdA' },
          competenceIds: ['competenceId1', 'competenceId2'],
          competenceAirtableIds: ['recCompetenceId1', 'recCompetenceId2'],
          color: Area.COLORS.CERULEAN,
          frameworkId: 'frameworkId',
        });
        const areaB = new Area({
          id: 'areaIdB',
          airtableId: 'recAreaIdB',
          code: '2',
          title_i18n: { fr: 'title fr areaIdB', en: 'title en areaIdB' },
          competenceIds: ['competenceId3', 'competenceId4'],
          competenceAirtableIds: ['recCompetenceId3', 'recCompetenceId4'],
          color: Area.COLORS.BUTTERFLY_BUSH,
          frameworkId: 'frameworkId',
        });

        // when
        const actualAreasForRelease = forRelease([areaA, areaB]);

        // then
        expect(actualAreasForRelease).toStrictEqual([
          new AreaForRelease({
            id: 'areaIdA',
            code: '1',
            name: '1. title fr areaIdA',
            title_i18n: { fr: 'title fr areaIdA', en: 'title en areaIdA' },
            competenceIds: ['competenceId1', 'competenceId2'],
            color: Area.COLORS.CERULEAN,
            frameworkId: 'frameworkId',
          }),
          new AreaForRelease({
            id: 'areaIdB',
            code: '2',
            name: '2. title fr areaIdB',
            title_i18n: { fr: 'title fr areaIdB', en: 'title en areaIdB' },
            competenceIds: ['competenceId3', 'competenceId4'],
            color: Area.COLORS.BUTTERFLY_BUSH,
            frameworkId: 'frameworkId',
          }),
        ]);
      });
    });
  });

  describe('#forReplication', function () {
    context('when providing a single Area', function () {
      it('should transform it into a single AreaForReplication', function () {
        // given
        const area = new Area({
          id: 'areaId',
          airtableId: 'recAreaId',
          code: '1',
          title_i18n: { fr: 'title fr areaId', en: 'title en areaId' },
          competenceIds: ['competenceId1', 'competenceId2'],
          competenceAirtableIds: ['recCompetenceId1', 'recCompetenceId2'],
          color: Area.COLORS.CERULEAN,
          frameworkId: 'frameworkId',
        });

        // when
        const actualAreaForReplication = forReplication(area);

        // then
        expect(actualAreaForReplication).toStrictEqual(
          new AreaForReplication({
            id: 'areaId',
            code: '1',
            name: '1. title fr areaId',
            title_i18n: { fr: 'title fr areaId', en: 'title en areaId' },
            competenceIds: ['competenceId1', 'competenceId2'],
            color: Area.COLORS.CERULEAN,
            frameworkId: 'frameworkId',
          }),
        );
      });
    });

    context('when providing several Areas', function () {
      it('should transform them into a several AreasForReplication', function () {
        // given
        const areaA = new Area({
          id: 'areaIdA',
          airtableId: 'recAreaIdA',
          code: '1',
          title_i18n: { fr: 'title fr areaIdA', en: 'title en areaIdA' },
          competenceIds: ['competenceId1', 'competenceId2'],
          competenceAirtableIds: ['recCompetenceId1', 'recCompetenceId2'],
          color: Area.COLORS.CERULEAN,
          frameworkId: 'frameworkId',
        });
        const areaB = new Area({
          id: 'areaIdB',
          airtableId: 'recAreaIdB',
          code: '2',
          title_i18n: { fr: 'title fr areaIdB', en: 'title en areaIdB' },
          competenceIds: ['competenceId3', 'competenceId4'],
          competenceAirtableIds: ['recCompetenceId3', 'recCompetenceId4'],
          color: Area.COLORS.BUTTERFLY_BUSH,
          frameworkId: 'frameworkId',
        });

        // when
        const actualAreasForReplication = forReplication([areaA, areaB]);

        // then
        expect(actualAreasForReplication).toStrictEqual([
          new AreaForReplication({
            id: 'areaIdA',
            code: '1',
            name: '1. title fr areaIdA',
            title_i18n: { fr: 'title fr areaIdA', en: 'title en areaIdA' },
            competenceIds: ['competenceId1', 'competenceId2'],
            color: Area.COLORS.CERULEAN,
            frameworkId: 'frameworkId',
          }),
          new AreaForReplication({
            id: 'areaIdB',
            code: '2',
            name: '2. title fr areaIdB',
            title_i18n: { fr: 'title fr areaIdB', en: 'title en areaIdB' },
            competenceIds: ['competenceId3', 'competenceId4'],
            color: Area.COLORS.BUTTERFLY_BUSH,
            frameworkId: 'frameworkId',
          }),
        ]);
      });
    });
  });
});
