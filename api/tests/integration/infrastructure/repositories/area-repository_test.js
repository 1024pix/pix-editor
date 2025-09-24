import { afterEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { create, list } from '../../../../lib/infrastructure/repositories/area-repository.js';
import { Area } from '../../../../lib/domain/models/index.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';

const TABLE_NAME = 'areas';
const AIRTABLE_NAME = 'Domaines';

describe('Integration | Infrastructure | Repository | area-repository', () => {
  describe('#create', () => {
    afterEach(async () => {
      await knex.delete().from(TABLE_NAME);
    });

    it('inserts area in airtable and postgres w/ its translations', async () => {
      // given
      const airtableId = 'rec123Abc';
      const id = 'area123Abc';
      const code = '6';
      const titleFr = 'Nouveau domaine';
      const titleEn = 'New domain';
      const frameworkId = 'recFmk123';

      const generateNewId = vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce(id);

      const createRecord = vi.spyOn(airtable, 'createRecord').mockResolvedValueOnce(
        new Airtable.Record(AIRTABLE_NAME, airtableId, {
          fields: {
            'id persistant': id,
            Code: code,
            Referentiel: [frameworkId],
          },
        }),
      );

      databaseBuilder.factory.buildFramework({
        id: frameworkId,
        name: 'Un référentiel',
      });
      await databaseBuilder.commit();

      const area = new Area({
        code,
        title_i18n: {
          fr: titleFr,
          en: titleEn,
        },
        frameworkId,
      });

      // when
      const createdArea = await create(area);

      // then
      expect(createdArea).toStrictEqual(new Area({
        airtableId,
        id,
        code,
        title_i18n: {
          fr: titleFr,
          en: titleEn,
        },
        frameworkId,
        competenceAirtableIds: [],
        competenceIds: [],
      }));

      expect(generateNewId).toHaveBeenCalledExactlyOnceWith('area');
      expect(createRecord).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
        fields: {
          'id persistant': id,
          Code: code,
          Referentiel: [frameworkId],
        },
      });

      await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
        {
          id,
          code,
          color: null,
          frameworkId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });

  describe('#list', () => {
    it('should return the list of all areas', async () => {
      // given
      const airtableScope = airtableBuilder.mockList({ tableName: AIRTABLE_NAME }).returns([
        airtableBuilder.factory.buildArea({
          id: 'areaId1',
          airtableId: 'recAreaId1',
          code: '1',
          color: Area.COLORS.BUTTERFLY_BUSH,
          competenceAirtableIds: ['competenceAirtableId11', 'competenceAirtableId12'],
          competenceIds: ['competenceId11', 'competenceId12'],
          frameworkId: 'frameworkId1',
        }),
        airtableBuilder.factory.buildArea({
          id: 'areaId2',
          airtableId: 'recAreaId2',
          code: '2',
          color: Area.COLORS.WILD_STRAWBERRY,
          competenceAirtableIds: ['competenceAirtableId21', 'competenceAirtableId22'],
          competenceIds: ['competenceId21', 'competenceId22'],
          frameworkId: 'frameworkId1',
        }),
      ]).activate().nockScope;

      databaseBuilder.factory.buildFramework({ id: 'frameworkId1', name: 'Fmk' });
      databaseBuilder.factory.buildArea({ id: 'areaId1', code: '1', color: Area.COLORS.BUTTERFLY_BUSH, frameworkId: 'frameworkId1' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId11', index: '1.1', areaId: 'areaId1' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId12', index: '1.2', areaId: 'areaId1' });
      databaseBuilder.factory.buildArea({ id: 'areaId2', code: '2', color: Area.COLORS.WILD_STRAWBERRY, frameworkId: 'frameworkId1' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId21', index: '2.1', areaId: 'areaId2' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId22', index: '2.2', areaId: 'areaId2' });

      databaseBuilder.factory.buildTranslation({
        key: 'area.areaId1.title',
        locale: 'fr',
        value: 'Premier domaine',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'area.areaId1.title',
        locale: 'en',
        value: 'First area',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'area.areaId2.title',
        locale: 'fr',
        value: 'Second domaine',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'area.areaId2.title',
        locale: 'en',
        value: 'Second area',
      });

      await databaseBuilder.commit();

      // when
      const areas = await list();

      // then
      expect(areas).toEqual([
        domainBuilder.buildArea({
          id: 'areaId1',
          airtableId: 'recAreaId1',
          code: '1',
          color: Area.COLORS.BUTTERFLY_BUSH,
          competenceAirtableIds: ['competenceAirtableId11', 'competenceAirtableId12'],
          competenceIds: ['competenceId11', 'competenceId12'],
          frameworkId: 'frameworkId1',
          title_i18n: {
            fr: 'Premier domaine',
            en: 'First area',
          },
        }),
        domainBuilder.buildArea({
          id: 'areaId2',
          airtableId: 'recAreaId2',
          code: '2',
          color: Area.COLORS.WILD_STRAWBERRY,
          competenceAirtableIds: ['competenceAirtableId21', 'competenceAirtableId22'],
          competenceIds: ['competenceId21', 'competenceId22'],
          frameworkId: 'frameworkId1',
          title_i18n: {
            fr: 'Second domaine',
            en: 'Second area',
          },
        }),
      ]);

      airtableScope.done();
    });
  });
});
