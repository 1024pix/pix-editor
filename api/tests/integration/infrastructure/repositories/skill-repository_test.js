import { afterEach, describe, expect, it, vi } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as skillRepository from '../../../../lib/infrastructure/repositories/skill-repository.js';
import {
  skillDatasource,
  tubeDatasource,
  tutorialDatasource
} from '../../../../lib/infrastructure/datasources/airtable/index.js';
import { Skill } from '../../../../lib/domain/models/index.js';
import { SkillForRelease } from '../../../../lib/domain/models/release/index.js';
import * as airtableClient from '../../../../lib/infrastructure/airtable.js';
import { stringValue } from '../../../../lib/infrastructure/airtable.js';

describe('Integration | Repository | skill-repository', () => {

  describe('#list', () => {
    it('should return the list of all skills', async () => {
      // given
      const airtableScope = airtableBuilder.mockList({ tableName: 'Acquis' }).returns([
        airtableBuilder.factory.buildSkill({
          id: 'skill1',
          airtableId: 'recId1',
          name: 'Acquis 1',
          description: 'Description Acquis 1',
          hintStatus: SkillForRelease.HINT_STATUSES.VALIDE,
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          pixValue: 2.5,
          competenceId: 'competence1',
          status: Skill.STATUSES.PERIME,
          tubeId: 'tube1',
          level: 4,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          version: '1',
        }),
        airtableBuilder.factory.buildSkill({
          id: 'skill2',
          airtableId: 'recId2',
          name: 'Acquis 2',
          description: 'Description Acquis 2',
          hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
          tutorialIds: ['tuto5'],
          learningMoreTutorialIds: ['tuto6'],
          pixValue: 1.6,
          competenceId: 'competence2',
          status: 'actif',
          tubeId: 'tube2',
          level: 6,
          internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
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
          airtableId: 'recId1',
          name: 'Acquis 1',
          description: 'Description Acquis 1',
          hint_i18n: {
            fr: 'Indice acquis 1',
            en: 'Skill 1 hint',
          },
          hintStatus: SkillForRelease.HINT_STATUSES.VALIDE,
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          pixValue: 2.5,
          competenceId: 'competence1',
          status: Skill.STATUSES.PERIME,
          tubeId: 'tube1',
          level: 4,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          version: '1',
        }),
        domainBuilder.buildSkill({
          id: 'skill2',
          airtableId: 'recId2',
          name: 'Acquis 2',
          description: 'Description Acquis 2',
          hint_i18n: {
            fr: 'Indice acquis 2',
            en: 'Skill 2 hint',
          },
          hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
          tutorialIds: ['tuto5'],
          learningMoreTutorialIds: ['tuto6'],
          pixValue: 1.6,
          competenceId: 'competence2',
          status: 'actif',
          tubeId: 'tube2',
          level: 6,
          internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
          version: '2',
        }),
      ]);

      airtableScope.done();
    });
  });

  describe('#listByCompetenceId', () => {
    it('should retrieve all skills by competence Id', async () => {
      // given
      const skill1 = {
        id: 'skill1',
        airtableId: 'recId1',
        name: 'Acquis 1',
        description: 'Description Acquis 1',
        hintStatus: SkillForRelease.HINT_STATUSES.VALIDE,
        tutorialIds: ['tuto1', 'tuto2'],
        learningMoreTutorialIds: ['tuto3', 'tuto4'],
        pixValue: 2.5,
        competenceId: 'competence1',
        status: Skill.STATUSES.PERIME,
        tubeId: 'tube1',
        level: 4,
        internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
        version: '1',
      };

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

      await databaseBuilder.commit();
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Acquis') expect.unreachable('Airtable tableName should be Acquis');
        if (options?.filterByFormula !== `{Compétence (via Tube) (id persistant)} = ${stringValue(skill1.competenceId)}`) expect.unreachable('Wrong filterByFormula');
        return [{
          id: skill1.airtableId,
          fields: {
            'id persistant': skill1.id,
            'Record Id': skill1.airtableId,
            'Nom': skill1.name,
            'Statut de l\'indice': skill1.hintStatus,
            'Comprendre (id persistant)': skill1.tutorialIds,
            'En savoir plus (id persistant)': skill1.learningMoreTutorialIds,
            'PixValue': skill1.pixValue,
            'Compétence (via Tube) (id persistant)': [skill1.competenceId],
            'Status': skill1.status,
            'Tube (id persistant)': [skill1.tubeId],
            'Description': skill1.description,
            'Level': skill1.level,
            'Internationalisation': skill1.internationalisation,
            'Version': skill1.version,
          },
          get: function(field) { return this.fields[field]; },
        }];
      });

      // when
      const skills = await skillRepository.listByCompetenceId('competence1');

      // then

      expect(skills).toEqual([
        domainBuilder.buildSkill({
          id: 'skill1',
          airtableId: 'recId1',
          name: 'Acquis 1',
          description: 'Description Acquis 1',
          hint_i18n: {
            fr: 'Indice acquis 1',
            en: 'Skill 1 hint',
          },
          hintStatus: SkillForRelease.HINT_STATUSES.VALIDE,
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          pixValue: 2.5,
          competenceId: 'competence1',
          status: Skill.STATUSES.PERIME,
          tubeId: 'tube1',
          level: 4,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          version: '1',
        }),
      ]);
    });
  });

  describe('#update', () => {

    afterEach(() => {
      return knex('translations').truncate();
    });

    it('should update skill', async () => {
      // given
      const airtableIdsByIds = {
        'tubeIdPersistant': 'airtableTubeId',
        'tutorialIdPersistant': 'airtableTutorialId',
        'skillIdPersistantA': 'airtableSkillIdA',
        'skillIdPersistantB': 'airtableSkillIdB',
        'skillIdPersistantC': 'airtableSkillIdC',
        'skillIdPersistantD': 'airtableSkillIdD',
      };
      vi.spyOn(tubeDatasource, 'getAirtableIdsByIds').mockImplementation(() => airtableIdsByIds);
      vi.spyOn(tutorialDatasource, 'getAirtableIdsByIds').mockImplementation(() => airtableIdsByIds);
      vi.spyOn(skillDatasource, 'getAirtableIdsByIds').mockImplementation(() => airtableIdsByIds);

      const skillNoHintBeforeHintAfter = domainBuilder.buildSkill({
        id: 'skillIdPersistantA',
        hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
        tutorialIds: ['tutorialIdPersistant'],
        learningMoreTutorialIds: [],
        status: Skill.STATUSES.ACTIF,
        tubeId: 'tubeIdPersistant',
        description: 'ma super description',
        level: 4,
        internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
        version: 2,
        hint_i18n: { fr: 'hint A fr', en: 'hint A en' },
      });

      const skillHintBeforeHintAfter = domainBuilder.buildSkill({
        id: 'skillIdPersistantB',
        hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
        tutorialIds: ['tutorialIdPersistant'],
        learningMoreTutorialIds: [],
        status: Skill.STATUSES.ACTIF,
        tubeId: 'tubeIdPersistant',
        description: 'ma super description',
        level: 4,
        internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
        version: 2,
        hint_i18n: { fr: 'hint B fr', en: 'hint B en' },
      });
      databaseBuilder.factory.buildTranslation({
        key: 'skill.skillIdPersistantB.hint',
        locale: 'fr',
        value: 'hint before B',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'skill.skillIdPersistantB.hint',
        locale: 'en',
        value: 'hint before B EN',
      });

      const skillHintBeforeNoHintAfter = domainBuilder.buildSkill({
        id: 'skillIdPersistantC',
        hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
        tutorialIds: ['tutorialIdPersistant'],
        learningMoreTutorialIds: [],
        status: Skill.STATUSES.ACTIF,
        tubeId: 'tubeIdPersistant',
        description: 'ma super description',
        level: 4,
        internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
        version: 2,
        hint_i18n: { fr: null, en: null },
      });
      databaseBuilder.factory.buildTranslation({
        key: 'skill.skillIdPersistantC.hint',
        locale: 'fr',
        value: 'hint before C FR',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'skill.skillIdPersistantC.hint',
        locale: 'en',
        value: 'hint before C EN',
      });

      const skillNoHintBeforeNoHintAfter = domainBuilder.buildSkill({
        id: 'skillIdPersistantD',
        hintStatus: SkillForRelease.HINT_STATUSES.PROPOSE,
        tutorialIds: ['tutorialIdPersistant'],
        learningMoreTutorialIds: [],
        status: Skill.STATUSES.ACTIF,
        tubeId: 'tubeIdPersistant',
        description: 'ma super description',
        level: 4,
        internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
        version: 2,
        hint_i18n: { fr: null, en: null },
      });

      await databaseBuilder.commit();

      vi.spyOn(skillDatasource, 'update')
        .mockImplementationOnce(() => ({
          id: skillNoHintBeforeHintAfter.id,
          name: 'nom computé',
          tutorialIds: skillNoHintBeforeHintAfter.tutorialIds,
          learningMoreTutorialIds: skillNoHintBeforeHintAfter.learningMoreTutorialIds,
          hintStatus: skillNoHintBeforeHintAfter.hintStatus,
          pixValue: 'pix value computé',
          competenceId: 'maSUperCOmpetenceId',
          status: skillNoHintBeforeHintAfter.status,
          tubeId: skillNoHintBeforeHintAfter.tubeId,
          description: skillNoHintBeforeHintAfter.description,
          level: skillNoHintBeforeHintAfter.level,
          internationalisation: skillNoHintBeforeHintAfter.internationalisation,
          version: skillNoHintBeforeHintAfter.version,
        }))
        .mockImplementationOnce(() => ({
          id: skillHintBeforeHintAfter.id,
          name: 'nom computé',
          tutorialIds: skillHintBeforeHintAfter.tutorialIds,
          learningMoreTutorialIds: skillHintBeforeHintAfter.learningMoreTutorialIds,
          hintStatus: skillHintBeforeHintAfter.hintStatus,
          pixValue: 'pix value computé',
          competenceId: 'maSUperCOmpetenceId',
          status: skillHintBeforeHintAfter.status,
          tubeId: skillHintBeforeHintAfter.tubeId,
          description: skillHintBeforeHintAfter.description,
          level: skillHintBeforeHintAfter.level,
          internationalisation: skillHintBeforeHintAfter.internationalisation,
          version: skillHintBeforeHintAfter.version,
        }))
        .mockImplementationOnce(() => ({
          id: skillHintBeforeNoHintAfter.id,
          name: 'nom computé',
          tutorialIds: skillHintBeforeNoHintAfter.tutorialIds,
          learningMoreTutorialIds: skillHintBeforeNoHintAfter.learningMoreTutorialIds,
          hintStatus: skillHintBeforeNoHintAfter.hintStatus,
          pixValue: 'pix value computé',
          competenceId: 'maSUperCOmpetenceId',
          status: skillHintBeforeNoHintAfter.status,
          tubeId: skillHintBeforeNoHintAfter.tubeId,
          description: skillHintBeforeNoHintAfter.description,
          level: skillHintBeforeNoHintAfter.level,
          internationalisation: skillHintBeforeNoHintAfter.internationalisation,
          version: skillHintBeforeNoHintAfter.version,
        }))
        .mockImplementationOnce(() => ({
          id: skillNoHintBeforeNoHintAfter.id,
          name: 'nom computé',
          tutorialIds: skillNoHintBeforeNoHintAfter.tutorialIds,
          learningMoreTutorialIds: skillNoHintBeforeNoHintAfter.learningMoreTutorialIds,
          hintStatus: skillNoHintBeforeNoHintAfter.hintStatus,
          pixValue: 'pix value computé',
          competenceId: 'maSUperCOmpetenceId',
          status: skillNoHintBeforeNoHintAfter.status,
          tubeId: skillNoHintBeforeNoHintAfter.tubeId,
          description: skillNoHintBeforeNoHintAfter.description,
          level: skillNoHintBeforeNoHintAfter.level,
          internationalisation: skillNoHintBeforeNoHintAfter.internationalisation,
          version: skillNoHintBeforeNoHintAfter.version,
        }));

      // when
      await skillRepository.update(skillNoHintBeforeHintAfter);
      await skillRepository.update(skillHintBeforeHintAfter);
      await skillRepository.update(skillHintBeforeNoHintAfter);
      await skillRepository.update(skillNoHintBeforeNoHintAfter);

      // when
      const allTranslations = await knex('translations').select('key', 'locale', 'value').orderBy('key', 'locale');
      expect(allTranslations).toEqual([{
        key: 'skill.skillIdPersistantA.hint',
        locale: 'fr',
        value: skillNoHintBeforeHintAfter.hint_i18n.fr
      },{
        key: 'skill.skillIdPersistantB.hint',
        locale: 'en',
        value: 'hint before B EN'
      },{
        key: 'skill.skillIdPersistantB.hint',
        locale: 'fr',
        value: skillHintBeforeHintAfter.hint_i18n.fr
      },{
        key: 'skill.skillIdPersistantC.hint',
        locale: 'en',
        value: 'hint before C EN'
      },{
        key: 'skill.skillIdPersistantC.hint',
        locale: 'fr',
        value: ''
      },]);
      expect(skillDatasource.update).toHaveBeenCalledTimes(4);
      expect(skillDatasource.update).toHaveBeenNthCalledWith(1, {
        id: skillNoHintBeforeHintAfter.id,
        airtableId: airtableIdsByIds[skillNoHintBeforeHintAfter.id],
        hintStatus: skillNoHintBeforeHintAfter.hintStatus,
        tutorialIds: ['airtableTutorialId'],
        learningMoreTutorialIds: [],
        status: skillNoHintBeforeHintAfter.status,
        tubeId: 'airtableTubeId',
        description: skillNoHintBeforeHintAfter.description,
        level: skillNoHintBeforeHintAfter.level,
        internationalisation: skillNoHintBeforeHintAfter.internationalisation,
        version: skillNoHintBeforeHintAfter.version,
      });
      expect(skillDatasource.update).toHaveBeenNthCalledWith(2, {
        id: skillHintBeforeHintAfter.id,
        airtableId: airtableIdsByIds[skillHintBeforeHintAfter.id],
        hintStatus: skillHintBeforeHintAfter.hintStatus,
        tutorialIds: ['airtableTutorialId'],
        learningMoreTutorialIds: [],
        status: skillHintBeforeHintAfter.status,
        tubeId: 'airtableTubeId',
        description: skillHintBeforeHintAfter.description,
        level: skillHintBeforeHintAfter.level,
        internationalisation: skillHintBeforeHintAfter.internationalisation,
        version: skillHintBeforeHintAfter.version,
      });
      expect(skillDatasource.update).toHaveBeenNthCalledWith(3, {
        id: skillHintBeforeNoHintAfter.id,
        airtableId: airtableIdsByIds[skillHintBeforeNoHintAfter.id],
        hintStatus: skillHintBeforeNoHintAfter.hintStatus,
        tutorialIds: ['airtableTutorialId'],
        learningMoreTutorialIds: [],
        status: skillHintBeforeNoHintAfter.status,
        tubeId: 'airtableTubeId',
        description: skillHintBeforeNoHintAfter.description,
        level: skillHintBeforeNoHintAfter.level,
        internationalisation: skillHintBeforeNoHintAfter.internationalisation,
        version: skillHintBeforeNoHintAfter.version,
      });
      expect(skillDatasource.update).toHaveBeenNthCalledWith(4, {
        id: skillNoHintBeforeNoHintAfter.id,
        airtableId: airtableIdsByIds[skillNoHintBeforeNoHintAfter.id],
        hintStatus: skillNoHintBeforeNoHintAfter.hintStatus,
        tutorialIds: ['airtableTutorialId'],
        learningMoreTutorialIds: [],
        status: skillNoHintBeforeNoHintAfter.status,
        tubeId: 'airtableTubeId',
        description: skillNoHintBeforeNoHintAfter.description,
        level: skillNoHintBeforeNoHintAfter.level,
        internationalisation: skillNoHintBeforeNoHintAfter.internationalisation,
        version: skillNoHintBeforeNoHintAfter.version,
      });
    });
  });
});
