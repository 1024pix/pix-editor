import { beforeEach, describe, expect, it } from 'vitest';
import { AreaForRelease } from '../../../../lib/domain/models/release/index.js';
import { Area } from '../../../../lib/domain/models/index.js';
import * as areaTransformer from '../../../../lib/infrastructure/transformers/area-transformer.js';

describe('Unit | Infrastructure | area-transformer', function() {
  let area;
  beforeEach(function() {
    area = new Area({
      id: 'areaId',
      airtableId: 'areaAirtableId',
      code: '1',
      title_i18n: { fr: 'areaTitle fr', en: 'areaTitle en' },
      competenceIds: ['competenceId1', 'competenceId2'],
      competenceAirtableIds: ['competenceAirtableId1', 'competenceAirtableId2'],
      color: Area.COLORS.CERULEAN,
      frameworkId: 'frameworkId',
    });
  });

  describe('transformForRelease', function() {
    it('should transform a Area model into a AreaForRelease model', function() {
      // when
      const areaForRelease = areaTransformer.transformForRelease(area);

      // then
      expect(areaForRelease).to.be.instanceOf(AreaForRelease);
      expect(areaForRelease).toStrictEqual(new AreaForRelease({
        id: 'areaId',
        code: '1',
        title_i18n: { fr: 'areaTitle fr', en: 'areaTitle en' },
        competenceIds: ['competenceId1', 'competenceId2'],
        color: Area.COLORS.CERULEAN,
        name: '1. areaTitle fr',
        frameworkId: 'frameworkId',
      }));
    });
  });

  describe('transformForReplication', function() {
    it('should transform a Area model into a DTO for replication', function() {
      // when
      const areaForReplicationDTO = areaTransformer.transformForReplication(area);

      // then
      expect(areaForReplicationDTO).toStrictEqual({
        id: 'areaId',
        code: '1',
        title_i18n: { fr: 'areaTitle fr', en: 'areaTitle en' },
        competenceIds: ['competenceId1', 'competenceId2'],
        color: Area.COLORS.CERULEAN,
        name: '1. areaTitle fr',
        frameworkId: 'frameworkId',
      });
    });
  });
});
