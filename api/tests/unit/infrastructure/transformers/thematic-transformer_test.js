import { beforeEach, describe, expect, it } from 'vitest';
import * as thematicTransformer from '../../../../lib/infrastructure/transformers/thematic-transformer.js';
import { Thematic } from '../../../../lib/domain/models/index.js';
import { ThematicForRelease } from '../../../../lib/domain/models/release/index.js';

describe('Unit | Infrastructure | thematic-transformer', function() {
  let thematic;
  beforeEach(function() {
    thematic = new Thematic({
      id: 'thematicId',
      name_i18n: { fr: 'thematicName fr', en: 'thematicName en' },
      index: 1,
      airtableId: 'thematicAirtableId',
      competenceId: 'competenceId',
      competenceAirtableId: 'competenceAirtableId',
      tubeIds: ['tubeId1', 'tubeId2'],
    });
  });

  describe('transformForRelease', function() {
    it('should transform a Thematic model into a ThematicForRelease model', function() {
      // when
      const thematicForRelease = thematicTransformer.transformForRelease(thematic);

      // then
      expect(thematicForRelease).to.be.instanceOf(ThematicForRelease);
      expect(thematicForRelease).toStrictEqual(new ThematicForRelease({
        id: 'thematicId',
        name_i18n: { fr: 'thematicName fr', en: 'thematicName en' },
        index: 1,
        competenceId: 'competenceId',
        tubeIds: ['tubeId1', 'tubeId2'],
      }));
    });
  });

  describe('transformForReplication', function() {
    it('should transform a Thematic model into a DTO for replication', function() {
      // when
      const thematicForReplicationDTO = thematicTransformer.transformForReplication(thematic);

      // then
      expect(thematicForReplicationDTO).toStrictEqual({
        id: 'thematicId',
        name_i18n: { fr: 'thematicName fr', en: 'thematicName en' },
        index: 1,
        competenceId: 'competenceId',
        tubeIds: ['tubeId1', 'tubeId2'],
      });
    });
  });
});
