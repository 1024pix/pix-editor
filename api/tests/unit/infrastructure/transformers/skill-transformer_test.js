const { expect, domainBuilder } = require('../../../test-helper');
const { filterSkillsFields } = require('../../../../lib/infrastructure/transformers/skill-transformer');

describe('Unit | Infrastructure | skill-transformer', function() {

  it('should only keep useful fields', function() {
    const airtableSkills = [domainBuilder.buildSkill()];

    const skills = filterSkillsFields(airtableSkills);

    expect(skills.length).to.equal(1);
    expect(skills[0].name).to.exist;
    expect(skills[0].description).to.not.exist;
    expect(skills[0].level).to.not.exist;
    expect(skills[0].internationalisation).to.not.exist;
  });
});
