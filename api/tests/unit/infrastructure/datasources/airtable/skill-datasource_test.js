import { describe, expect, it } from 'vitest';
import { domainBuilder, airtableBuilder } from '../../../../test-helper.js';
import { skillDatasource } from '../../../../../lib/infrastructure/datasources/airtable/skill-datasource.js';
import airtable from 'airtable';

const { Record: AirtableRecord } = airtable;

describe('Unit | Infrastructure | Datasource | Airtable | SkillDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Skill from the AirtableRecord', () => {
      // given
      const expectedSkill = domainBuilder.buildSkillDatasourceObject();
      const airtableSkill = airtableBuilder.factory.buildSkill(expectedSkill);
      const skillRecord = new AirtableRecord('Acquis', airtableSkill.id, airtableSkill);

      // when
      const skill = skillDatasource.fromAirTableObject(skillRecord);

      // then
      expect(skill).to.deep.equal(expectedSkill);
    });
  });

});
