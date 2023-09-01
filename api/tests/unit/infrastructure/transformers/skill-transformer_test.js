import { expect, domainBuilder } from '../../../test-helper.js';
import { filterSkillsFields } from '../../../../lib/infrastructure/transformers/skill-transformer.js';

describe('Unit | Infrastructure | skill-transformer', function() {

  it('should only keep useful fields', function() {
    const airtableSkills = [domainBuilder.buildSkillDatasourceObject()];

    const skills = filterSkillsFields(airtableSkills);

    expect(skills.length).to.equal(1);
    expect(skills[0].name).to.exist;
    expect(skills[0].description).to.not.exist;
    expect(skills[0].level).to.equal(5);
    expect(skills[0].internationalisation).to.not.exist;
  });
});
