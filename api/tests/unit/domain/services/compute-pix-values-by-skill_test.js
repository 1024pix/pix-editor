import { describe, expect, it } from 'vitest';
import { computePixValuesBySkill } from '../../../../lib/domain/services/compute-pix-values-by-skill';
import { Skill } from '../../../../lib/domain/models/Skill';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Services | compute-pix-values-by-skill', function () {
  describe('when skills are empty', function () {
    it('should return an empty object', function () {
      // given
      const skills = [];

      // when
      const pixValuesBySkill = computePixValuesBySkill(skills);

      // then
      expect(pixValuesBySkill).toStrictEqual({});
    });
  });

  describe('when there are some inactive skills', function () {
    it('should return 4 for the only one active skill', function () {
      // given
      const skills = [
        { id: 'skill1', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
        { id: 'skill2', competenceId: 'competence1', status: Skill.STATUSES.EN_CONSTRUCTION, level: 1 },
        { id: 'skill3', competenceId: 'competence1', status: Skill.STATUSES.PERIME, level: 1 },
      ].map(domainBuilder.buildSkill);

      // when
      const pixValuesBySkill = computePixValuesBySkill(skills);

      // then
      expect(pixValuesBySkill).toStrictEqual({
        skill1: 4,
      });
    });
  });

  describe('when there is only 1 competence', function () {
    describe('when all skills are on same level', function () {
      it('should return 4 when there is 1 validated skill', function () {
        // given
        const skills = [
          domainBuilder.buildSkill({
            id: 'skill1',
            competenceId: 'competence1',
            level: 1,
            status: Skill.STATUSES.ACTIF,
          }),
        ];

        // when
        const pixValuesBySkill = computePixValuesBySkill(skills);

        // then
        expect(pixValuesBySkill).toStrictEqual({
          skill1: 4,
        });
      });

      it('should return 4 for each 2 validated skill', function () {
        // given
        const skills = [
          { id: 'skill1', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
          { id: 'skill2', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
        ].map(domainBuilder.buildSkill);

        // when
        const pixValuesBySkill = computePixValuesBySkill(skills);

        // then
        expect(pixValuesBySkill).toStrictEqual({
          skill1: 4,
          skill2: 4,
        });
      });

      it('should return 2.667 for each 3 validated skill', function () {
        // given
        const skills = [
          { id: 'skill1', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
          { id: 'skill2', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
          { id: 'skill3', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
        ].map(domainBuilder.buildSkill);

        // when
        const pixValuesBySkill = computePixValuesBySkill(skills);

        // then
        expect(pixValuesBySkill).toStrictEqual({
          skill1: 2.667,
          skill2: 2.667,
          skill3: 2.667,
        });
      });
    });
    describe('when all skills are on different levels', function () {
      it('should return 4 for 2 validated skill on level 1 and 1 validated skill on level 2', function () {
        // given
        const skills = [
          { id: 'skill1', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
          { id: 'skill2', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
          { id: 'skill3', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 2 },
        ].map(domainBuilder.buildSkill);

        // when
        const pixValuesBySkill = computePixValuesBySkill(skills);

        // then
        expect(pixValuesBySkill).toStrictEqual({
          skill1: 4,
          skill2: 4,
          skill3: 4,
        });
      });
    });
  });

  describe('when there are 2 competences with skills on different level', function () {
    it('should return 2,667 for validated skills on competence 1 and 4 for validated skills on competence2 for each level', function () {
      // given
      const skills = [
        { id: 'skill1', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
        { id: 'skill2', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
        { id: 'skill3', competenceId: 'competence1', status: Skill.STATUSES.ACTIF, level: 1 },
        { id: 'skill4', competenceId: 'competence2', status: Skill.STATUSES.ACTIF, level: 1 },
        { id: 'skill5', competenceId: 'competence2', status: Skill.STATUSES.ACTIF, level: 1 },
        { id: 'skill6', competenceId: 'competence2', status: Skill.STATUSES.ACTIF, level: 2 },
      ].map(domainBuilder.buildSkill);

      // when
      const pixValuesBySkill = computePixValuesBySkill(skills);

      // then
      expect(pixValuesBySkill).toStrictEqual({
        skill1: 2.667,
        skill2: 2.667,
        skill3: 2.667,
        skill4: 4,
        skill5: 4,
        skill6: 4,
      });
    });
  });
});
