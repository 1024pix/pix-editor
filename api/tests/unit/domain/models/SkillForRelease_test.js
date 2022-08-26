const { expect } = require('../../../test-helper');
const SkillForRelease = require('../../../../lib/domain/models/SkillForRelease');

describe('Unit | Domain | SkillForRelease', function() {
  describe('constructor', function() {
    it('should return domain object Skill', function() {
      // when
      const skill = new SkillForRelease();

      // then
      expect(skill).to.be.instanceOf(SkillForRelease);
    });

    it('should return domain object Skill with common fields', function() {
      const skillData = {
        id: 'rec1',
        name: 'skill1',
        hintStatus: 'someHintStatus',
        tutorialIds: ['recTuto1', 'recTuto2'],
        learningMoreTutorialIds: ['recTutoMore1', 'recTutoMore2'],
        pixValue: 123,
        competenceId: 'recComp1',
        status: 'validé',
        tubeId: 'recTube1',
        version: 1,
        level: 1,
      };

      // when
      const skill = new SkillForRelease(skillData);

      // then
      expect(skill).to.deep.contains(skillData);
    });

    it('should return domain object Skill without locale', function() {
      // given
      const skillData = {
        hintFrFr: 'indice fr-fr 1',
        hintEnUs: 'indice en-us 1',
      };

      // when
      const skill = new SkillForRelease(skillData, null);

      // then
      expect(skill).to.deep.contains(skillData);
    });

    it('should return french fields when there is "fr-fr" locale', function() {
      // given
      const skillData = {
        hintFrFr: 'indice fr-fr 1',
        hintEnUs: 'indice en-us 1',
      };

      const expectedSkill = {
        hintFrFr: 'indice fr-fr 1',
        hint: 'indice fr-fr 1',
      };

      // when
      const skill = new SkillForRelease(skillData, 'fr-fr');

      // then
      expect(skill).to.deep.contains(expectedSkill);
    });

    it('should return french fields when there is "fr" locale', function() {
      // given
      const skillData = {
        hintFrFr: 'indice fr-fr 1',
        hintEnUs: 'indice en-us 1',
      };

      const expectedSkill = {
        hintFrFr: 'indice fr-fr 1',
        hint: 'indice fr-fr 1',
      };

      // when
      const skill = new SkillForRelease(skillData, 'fr');

      // then
      expect(skill).to.deep.contains(expectedSkill);
    });

    it('should return english fields when there is "en" locale', function() {
      // given
      const skillData = {
        hintFrFr: 'indice fr-fr 1',
        hintEnUs: 'indice en-us 1',
      };

      const expectedSkill = {
        hintEnUs: 'indice en-us 1',
        hint: 'indice en-us 1',
      };

      // when
      const skill = new SkillForRelease(skillData, 'en');

      // then
      expect(skill).to.deep.contains(expectedSkill);
    });
  });
});
