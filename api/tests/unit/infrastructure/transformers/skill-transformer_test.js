import { describe, describe as context, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { forRelease, forReplication } from '../../../../lib/infrastructure/transformers/skill-transformer.js';
import { Skill } from '../../../../lib/domain/models/index.js';
import { SkillForRelease } from '../../../../lib/domain/models/release/index.js';
import { SkillForReplication } from '../../../../lib/domain/models/replication/index.js';

describe('Unit | Infrastructure | skill-transformer', function() {
  describe('#forRelease', function() {
    context('when providing a single Skill', function() {
      it('should transform it into a single SkillForRelease', function() {
        // given
        const skill = domainBuilder.buildSkill({
          id: 'skillId',
          airtableId: 'recSkillId',
          name: '@fruits2',
          description: 'la super description',
          descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
          hint_i18n: { fr: 'hint fr skillId', en: 'hint en skillId' },
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          tutorialIds: ['tutorialId1', 'tutorialId2'],
          tutorialAirtableIds: ['recTutorialId1', 'recTutorialId2'],
          learningMoreTutorialIds: ['tutorialId3'],
          learningMoreTutorialAirtableIds: ['recTutorialId3'],
          competenceId: 'competenceId',
          pixValue: 0,
          status: Skill.STATUSES.ARCHIVE,
          tubeId: 'tubeId',
          tubeAirtableId: 'recTubeId',
          level: 2,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          version: 1,
          challengeIds: ['challengeId1'],
          createdAt: new Date('2020-01-01'),
        });

        // when
        const actualSkillForRelease = forRelease(skill, ['competenceId']);

        // then
        expect(actualSkillForRelease).toStrictEqual(
          new SkillForRelease({
            id: 'skillId',
            name: '@fruits2',
            hint_i18n: { fr: 'hint fr skillId', en: 'hint en skillId' },
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            tutorialIds: ['tutorialId1', 'tutorialId2'],
            learningMoreTutorialIds: ['tutorialId3'],
            pixValue: 0,
            competenceId: 'competenceId',
            status: Skill.STATUSES.ARCHIVE,
            tubeId: 'tubeId',
            version: 1,
            level: 2,
          }),
        );
      });
    });

    context('when providing several Skills', function() {
      it('should transform them into several SkillsForRelease', function() {
        // given
        const skills = [
          domainBuilder.buildSkill({
            id: 'skillIdA',
            airtableId: 'recSkillIdA',
            name: '@fruits2',
            description: 'la super description A',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
            hint_i18n: { fr: 'hint fr skillIdA', en: 'hint en skillIdA' },
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            tutorialIds: ['tutorialId1', 'tutorialId2'],
            tutorialAirtableIds: ['recTutorialId1', 'recTutorialId2'],
            learningMoreTutorialIds: ['tutorialId3'],
            learningMoreTutorialAirtableIds: ['recTutorialId3'],
            competenceId: 'competenceId',
            pixValue: 0,
            status: Skill.STATUSES.ARCHIVE,
            tubeId: 'tubeId',
            tubeAirtableId: 'recTubeId',
            level: 2,
            internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
            version: 1,
            challengeIds: ['challengeId1'],
            createdAt: new Date('2020-01-01'),
          }),
          domainBuilder.buildSkill({
            id: 'skillIdB',
            airtableId: 'recSkillIdB',
            name: '@legumes3',
            description: 'la super description B',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.ARCHIVE,
            hint_i18n: { fr: 'hint fr skillIdB', en: 'hint en skillIdB' },
            hintStatus: Skill.HINT_STATUSES.PRE_VALIDE,
            tutorialIds: ['tutorialId4', 'tutorialId5'],
            tutorialAirtableIds: ['recTutorialId4', 'recTutorialId5'],
            learningMoreTutorialIds: ['tutorialId6'],
            learningMoreTutorialAirtableIds: ['recTutorialId6'],
            competenceId: 'competenceId',
            pixValue: 0,
            status: Skill.STATUSES.EN_CONSTRUCTION,
            tubeId: 'tubeId',
            tubeAirtableId: 'recTubeId',
            level: 3,
            internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
            version: 2,
            challengeIds: ['challengeId2'],
            createdAt: new Date('2020-01-02'),
          }),
        ];

        // when
        const actualSkillsForRelease = forRelease(skills, ['competenceId']);

        // then
        expect(actualSkillsForRelease).toStrictEqual([
          new SkillForRelease({
            id: 'skillIdA',
            name: '@fruits2',
            hint_i18n: { fr: 'hint fr skillIdA', en: 'hint en skillIdA' },
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            tutorialIds: ['tutorialId1', 'tutorialId2'],
            learningMoreTutorialIds: ['tutorialId3'],
            pixValue: 0,
            competenceId: 'competenceId',
            status: Skill.STATUSES.ARCHIVE,
            tubeId: 'tubeId',
            version: 1,
            level: 2,
          }),
          new SkillForRelease({
            id: 'skillIdB',
            name: '@legumes3',
            hint_i18n: { fr: 'hint fr skillIdB', en: 'hint en skillIdB' },
            hintStatus: Skill.HINT_STATUSES.PRE_VALIDE,
            tutorialIds: ['tutorialId4', 'tutorialId5'],
            learningMoreTutorialIds: ['tutorialId6'],
            pixValue: 0,
            competenceId: 'competenceId',
            status: Skill.STATUSES.EN_CONSTRUCTION,
            tubeId: 'tubeId',
            version: 2,
            level: 3,
          }),
        ]);
      });
    });
  });

  describe('#forReplication', function() {
    context('when providing a single Skill', function() {
      it('should transform it into a single SkillForReplication', function() {
        // given
        const skill = domainBuilder.buildSkill({
          id: 'skillId',
          airtableId: 'recSkillId',
          name: '@fruits2',
          description: 'la super description',
          descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
          hint_i18n: { fr: 'hint fr skillId', en: 'hint en skillId' },
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          tutorialIds: ['tutorialId1', 'tutorialId2'],
          tutorialAirtableIds: ['recTutorialId1', 'recTutorialId2'],
          learningMoreTutorialIds: ['tutorialId3'],
          learningMoreTutorialAirtableIds: ['recTutorialId3'],
          competenceId: 'competenceId',
          pixValue: 0,
          status: Skill.STATUSES.ARCHIVE,
          tubeId: 'tubeId',
          tubeAirtableId: 'recTubeId',
          level: 2,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          version: 1,
          challengeIds: ['challengeId1'],
          createdAt: new Date('2020-01-01T18:08:00Z'),
          activatedAt: new Date('2023-11-06T18:08:00Z'),
          archivedAt: new Date('2023-12-07T18:08:00Z'),
          obsoletedAt: new Date('2024-01-08T18:08:00Z'),
        });

        // when
        const actualSkillForReplication = forReplication(skill, ['competenceId']);

        // then
        expect(actualSkillForReplication).toStrictEqual(
          new SkillForReplication({
            id: 'skillId',
            name: '@fruits2',
            description: 'la super description',
            hint_i18n: { fr: 'hint fr skillId', en: 'hint en skillId' },
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            tutorialIds: ['tutorialId1', 'tutorialId2'],
            learningMoreTutorialIds: ['tutorialId3'],
            pixValue: 0,
            competenceId: 'competenceId',
            status: Skill.STATUSES.ARCHIVE,
            tubeId: 'tubeId',
            version: 1,
            internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
            level: 2,
            createdAt: new Date('2020-01-01T18:08:00Z'),
            activatedAt: new Date('2023-11-06T18:08:00Z'),
            archivedAt: new Date('2023-12-07T18:08:00Z'),
            obsoletedAt: new Date('2024-01-08T18:08:00Z'),
          }),
        );
      });
    });

    context('when providing several Skills', function() {
      it('should transform them into several SkillsForReplication', function() {
        // given
        const skills = [
          domainBuilder.buildSkill({
            id: 'skillIdA',
            airtableId: 'recSkillIdA',
            name: '@fruits2',
            description: 'la super description A',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
            hint_i18n: { fr: 'hint fr skillIdA', en: 'hint en skillIdA' },
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            tutorialIds: ['tutorialId1', 'tutorialId2'],
            tutorialAirtableIds: ['recTutorialId1', 'recTutorialId2'],
            learningMoreTutorialIds: ['tutorialId3'],
            learningMoreTutorialAirtableIds: ['recTutorialId3'],
            competenceId: 'competenceId',
            pixValue: 0,
            status: Skill.STATUSES.ARCHIVE,
            tubeId: 'tubeId',
            tubeAirtableId: 'recTubeId',
            level: 2,
            internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
            version: 1,
            challengeIds: ['challengeId1'],
            createdAt: new Date('2020-01-01T18:08:00Z'),
            activatedAt: new Date('2023-11-06T18:08:00Z'),
            archivedAt: new Date('2023-12-07T18:08:00Z'),
            obsoletedAt: new Date('2024-01-08T18:08:00Z'),
          }),
          domainBuilder.buildSkill({
            id: 'skillIdB',
            airtableId: 'recSkillIdB',
            name: '@legumes3',
            description: 'la super description B',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.ARCHIVE,
            hint_i18n: { fr: 'hint fr skillIdB', en: 'hint en skillIdB' },
            hintStatus: Skill.HINT_STATUSES.PRE_VALIDE,
            tutorialIds: ['tutorialId4', 'tutorialId5'],
            tutorialAirtableIds: ['recTutorialId4', 'recTutorialId5'],
            learningMoreTutorialIds: ['tutorialId6'],
            learningMoreTutorialAirtableIds: ['recTutorialId6'],
            competenceId: 'competenceId',
            pixValue: 0,
            status: Skill.STATUSES.EN_CONSTRUCTION,
            tubeId: 'tubeId',
            tubeAirtableId: 'recTubeId',
            level: 3,
            internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
            version: 2,
            challengeIds: ['challengeId2'],
            createdAt: new Date('2010-01-01T18:08:00Z'),
            activatedAt: new Date('2013-11-06T18:08:00Z'),
            archivedAt: new Date('2013-12-07T18:08:00Z'),
            obsoletedAt: new Date('2014-01-08T18:08:00Z'),
          }),
        ];

        // when
        const actualSkillsForReplication = forReplication(skills, ['competenceId']);

        // then
        expect(actualSkillsForReplication).toStrictEqual([
          new SkillForReplication({
            id: 'skillIdA',
            name: '@fruits2',
            description: 'la super description A',
            hint_i18n: { fr: 'hint fr skillIdA', en: 'hint en skillIdA' },
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            tutorialIds: ['tutorialId1', 'tutorialId2'],
            learningMoreTutorialIds: ['tutorialId3'],
            pixValue: 0,
            competenceId: 'competenceId',
            status: Skill.STATUSES.ARCHIVE,
            tubeId: 'tubeId',
            version: 1,
            level: 2,
            internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
            createdAt: new Date('2020-01-01T18:08:00Z'),
            activatedAt: new Date('2023-11-06T18:08:00Z'),
            archivedAt: new Date('2023-12-07T18:08:00Z'),
            obsoletedAt: new Date('2024-01-08T18:08:00Z'),
          }),
          new SkillForReplication({
            id: 'skillIdB',
            name: '@legumes3',
            description: 'la super description B',
            hint_i18n: { fr: 'hint fr skillIdB', en: 'hint en skillIdB' },
            hintStatus: Skill.HINT_STATUSES.PRE_VALIDE,
            tutorialIds: ['tutorialId4', 'tutorialId5'],
            learningMoreTutorialIds: ['tutorialId6'],
            pixValue: 0,
            competenceId: 'competenceId',
            status: Skill.STATUSES.EN_CONSTRUCTION,
            tubeId: 'tubeId',
            version: 2,
            level: 3,
            internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
            createdAt: new Date('2010-01-01T18:08:00Z'),
            activatedAt: new Date('2013-11-06T18:08:00Z'),
            archivedAt: new Date('2013-12-07T18:08:00Z'),
            obsoletedAt: new Date('2014-01-08T18:08:00Z'),
          }),
        ]);
      });
    });
  });
});
