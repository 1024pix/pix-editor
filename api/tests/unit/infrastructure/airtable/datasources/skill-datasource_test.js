const { expect } = require('../../../../test-helper');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const skillAirtableDataObjectFixture = require('../../../../tooling/fixtures/infrastructure/skillAirtableDataObjectFixture');
const { skillRawAirTableFixture } = require('../../../../tooling/fixtures/infrastructure/skillRawAirTableFixture');

describe('Unit | Infrastructure | Datasource | Airtable | SkillDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Skill from the AirtableRecord', () => {
      // given
      const expectedSkill = skillAirtableDataObjectFixture();

      // when
      const skill = skillDatasource.fromAirTableObject(skillRawAirTableFixture());

      // then
      expect(skill).to.deep.equal(expectedSkill);
    });
  });

});
