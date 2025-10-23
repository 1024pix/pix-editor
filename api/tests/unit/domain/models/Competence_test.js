import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Competence', () => {
  describe('#update', () => {
    it('should change only updatable fields', () => {
      // given
      const competence = domainBuilder.buildCompetence();
      const originalCompetence = domainBuilder.buildCompetence();

      // when
      competence.update({
        name_i18n: 'name_i18n new value',
        description_i18n: 'description_i18n new value',

        id: 'should not change',
        airtableId: 'should not change',
        index: 'should not change',
        areaId: 'should not change',
        areaAirtableId: 'should not change',
        skillIds: 'should not change',
        thematicIds: 'should not change',
        thematicAirtableIds: 'should not change',
        tubeAirtableIds: 'should not change',
        origin: 'should not change',
      });

      // then
      expect(competence).toHaveProperty('name_i18n', 'name_i18n new value');
      expect(competence).toHaveProperty('description_i18n', 'description_i18n new value');

      expect(competence).toHaveProperty('id', originalCompetence.id);
      expect(competence).toHaveProperty('airtableId', originalCompetence.airtableId);
      expect(competence).toHaveProperty('index', originalCompetence.index);
      expect(competence).toHaveProperty('areaId', originalCompetence.areaId);
      expect(competence).toHaveProperty('areaAirtableId', originalCompetence.areaAirtableId);
      expect(competence).toHaveProperty('skillIds', originalCompetence.skillIds);
      expect(competence).toHaveProperty('thematicIds', originalCompetence.thematicIds);
      expect(competence).toHaveProperty('thematicAirtableIds', originalCompetence.thematicAirtableIds);
      expect(competence).toHaveProperty('tubeAirtableIds', originalCompetence.tubeAirtableIds);
      expect(competence).toHaveProperty('origin', originalCompetence.origin);
    });
  });
});
