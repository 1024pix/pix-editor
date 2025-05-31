import { beforeEach, describe, expect, it } from 'vitest';
import { Competence } from '../../../../lib/domain/models/index.js';
import * as competenceTransformer from '../../../../lib/infrastructure/transformers/competence-transformer.js';
import { CompetenceForRelease } from '../../../../lib/domain/models/release/index.js';

describe('Unit | Infrastructure | competence-transformer', function() {
  let competence;
  beforeEach(function() {
    competence = new Competence({
      id: 'competenceId',
      airtableId: 'competenceAirtableId',
      index: 2,
      origin: 'Pix',
      areaId: 'areaId',
      areaAirtableId: 'areaAirtableId',
      thematicIds: ['thematicId1', 'thematicId2'],
      thematicAirtableIds: ['thematicAirtableId1', 'thematicAirtableId2'],
      tubeAirtableIds: ['tubeAirtableId1', 'tubeAirtableId2'],
      skillIds: ['skillId1', 'skillId2'],
      name_i18n: { fr: 'competenceName fr', en: 'competenceName en' },
      description_i18n: { fr: 'competenceDescription fr', en: 'competenceDescription en' },
    });
  });

  describe('transformForRelease', function() {
    it('should transform a Competence model into a CompetenceForRelease model', function() {
      // when
      const competenceForRelease = competenceTransformer.transformForRelease(competence);

      // then
      expect(competenceForRelease).to.be.instanceOf(CompetenceForRelease);
      expect(competenceForRelease).toStrictEqual(new CompetenceForRelease({
        id: 'competenceId',
        index: 2,
        origin: 'Pix',
        areaId: 'areaId',
        thematicIds: ['thematicId1', 'thematicId2'],
        skillIds: ['skillId1', 'skillId2'],
        name_i18n: { fr: 'competenceName fr', en: 'competenceName en' },
        description_i18n: { fr: 'competenceDescription fr', en: 'competenceDescription en' },
      }));
    });
  });

  describe('transformForReplication', function() {
    it('should transform a Competence model into a DTO for replication', function() {
      // when
      const competenceForReplicationDTO = competenceTransformer.transformForReplication(competence);

      // then
      expect(competenceForReplicationDTO).toStrictEqual({
        id: 'competenceId',
        index: 2,
        origin: 'Pix',
        areaId: 'areaId',
        thematicIds: ['thematicId1', 'thematicId2'],
        skillIds: ['skillId1', 'skillId2'],
        name_i18n: { fr: 'competenceName fr', en: 'competenceName en' },
        description_i18n: { fr: 'competenceDescription fr', en: 'competenceDescription en' },
      });
    });
  });
});
