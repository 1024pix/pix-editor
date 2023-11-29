import { describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as skillRepository from '../../../../lib/infrastructure/repositories/skill-repository.js';

describe('Integration | Repository | competence-repository', () => {

  describe('#list', () => {
    it('should return the list of all skills', async () => {
      // given
      const airtableScope = airtableBuilder.mockList({ tableName: 'Acquis' }).returns([
        airtableBuilder.factory.buildSkill({
          id: 'skill1',
          name: 'Acquis 1',
          description: 'Description Acquis 1',
          hintStatus: 'validé',
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          pixValue: 2.5,
          competenceId: 'competence1',
          status: 'périmé',
          tubeId: 'tube1',
          level: 4,
          internationalisation: 'i18n skill1',
          version: '1',
        }),
        airtableBuilder.factory.buildSkill({
          id: 'skill2',
          name: 'Acquis 2',
          description: 'Description Acquis 2',
          hintStatus: 'proposé',
          tutorialIds: ['tuto5'],
          learningMoreTutorialIds: ['tuto6'],
          pixValue: 1.6,
          competenceId: 'competence2',
          status: 'actif',
          tubeId: 'tube2',
          level: 6,
          internationalisation: 'i18n skill2',
          version: '2',
        }),
      ]).activate().nockScope;

      databaseBuilder.factory.buildTranslation({
        key: 'skill.skill1.hint',
        locale: 'fr',
        value: 'Indice acquis 1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'skill.skill1.hint',
        locale: 'en',
        value: 'Skill 1 hint',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'skill.skill2.hint',
        locale: 'fr',
        value: 'Indice acquis 2',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'skill.skill2.hint',
        locale: 'en',
        value: 'Skill 2 hint',
      });

      await databaseBuilder.commit();

      // when
      const skills = await skillRepository.list();

      // then
      expect(skills).toEqual([
        domainBuilder.buildSkill({
          id: 'skill1',
          name: 'Acquis 1',
          description: 'Description Acquis 1',
          hint_i18n: {
            fr: 'Indice acquis 1',
            en: 'Skill 1 hint',
          },
          hintStatus: 'validé',
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          pixValue: 2.5,
          competenceId: 'competence1',
          status: 'périmé',
          tubeId: 'tube1',
          level: 4,
          internationalisation: 'i18n skill1',
          version: '1',
        }),
        domainBuilder.buildSkill({
          id: 'skill2',
          name: 'Acquis 2',
          description: 'Description Acquis 2',
          hint_i18n: {
            fr: 'Indice acquis 2',
            en: 'Skill 2 hint',
          },
          hintStatus: 'proposé',
          tutorialIds: ['tuto5'],
          learningMoreTutorialIds: ['tuto6'],
          pixValue: 1.6,
          competenceId: 'competence2',
          status: 'actif',
          tubeId: 'tube2',
          level: 6,
          internationalisation: 'i18n skill2',
          version: '2',
        }),
      ]);

      airtableScope.done();
    });
  });
});
