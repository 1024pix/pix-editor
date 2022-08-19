const { expect, domainBuilder, airtableBuilder } = require('../../../../test-helper');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const AirtableRecord = require('airtable').Record;

describe('Unit | Infrastructure | Datasource | Airtable | SkillDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Skill from the AirtableRecord', () => {
      // given
      const expectedSkill = domainBuilder.buildSkillAirtableDataObject();
      const airtableSkill = airtableBuilder.factory.buildSkill(expectedSkill);
      const skillRecord = new AirtableRecord('Acquis', airtableSkill.id, airtableSkill);

      // when
      const skill = skillDatasource.fromAirTableObject(skillRecord);

      // then
      expect(skill).to.deep.equal(expectedSkill);
    });
  });

});
