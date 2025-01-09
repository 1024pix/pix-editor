import { afterEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as skillRepository from '../../../../lib/infrastructure/repositories/skill-repository.js';
import {
  skillDatasource,
  tubeDatasource,
  tutorialDatasource,
} from '../../../../lib/infrastructure/datasources/airtable/index.js';
import { Skill } from '../../../../lib/domain/models/index.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
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
          descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          tutorialIds: ['tuto1', 'tuto2'],
          tutorialAirtableIds: ['recTuto1', 'recTuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
          pixValue: 2.5,
          competenceId: 'competence1',
          status: Skill.STATUSES.PERIME,
          tubeId: 'tube1',
          tubeAirtableId: 'recTube1',
          level: 4,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          version: '1',
          challengeIds: ['challenge123184r9124'],
          createdAt: '2025-01-01T09:58:57.465Z',
        }),
        airtableBuilder.factory.buildSkill({
          id: 'skill2',
          airtableId: 'recId2',
          name: 'Acquis 2',
          description: 'Description Acquis 2',
          descriptionStatus: Skill.DESCRIPTION_STATUSES.PROPOSE,
          hintStatus: Skill.HINT_STATUSES.PROPOSE,
          tutorialIds: ['tuto5'],
          tutorialAirtableIds: ['recTuto5'],
          learningMoreTutorialIds: ['tuto6'],
          learningMoreTutorialAirtableIds: ['recTuto6'],
          pixValue: 1.6,
          competenceId: 'competence2',
          status: 'actif',
          tubeId: 'tube2',
          tubeAirtableId: 'recTube2',
          level: 6,
          internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
          version: '2',
          challengeIds: ['challengesdgff230fj38cs'],
          createdAt: '2025-01-02T07:58:57.465Z',
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
          descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
          hint_i18n: {
            fr: 'Indice acquis 1',
            en: 'Skill 1 hint',
          },
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          tutorialIds: ['tuto1', 'tuto2'],
          tutorialAirtableIds: ['recTuto1', 'recTuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
          pixValue: 2.5,
          competenceId: 'competence1',
          status: Skill.STATUSES.PERIME,
          tubeId: 'tube1',
          tubeAirtableId: 'recTube1',
          level: 4,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          version: '1',
          challengeIds: ['challenge123184r9124'],
          createdAt: '2025-01-01T09:58:57.465Z',
        }),
        domainBuilder.buildSkill({
          id: 'skill2',
          airtableId: 'recId2',
          name: 'Acquis 2',
          description: 'Description Acquis 2',
          descriptionStatus: Skill.DESCRIPTION_STATUSES.PROPOSE,
          hint_i18n: {
            fr: 'Indice acquis 2',
            en: 'Skill 2 hint',
          },
          hintStatus: Skill.HINT_STATUSES.PROPOSE,
          tutorialIds: ['tuto5'],
          tutorialAirtableIds: ['recTuto5'],
          learningMoreTutorialIds: ['tuto6'],
          learningMoreTutorialAirtableIds: ['recTuto6'],
          pixValue: 1.6,
          competenceId: 'competence2',
          status: 'actif',
          tubeId: 'tube2',
          tubeAirtableId: 'recTube2',
          level: 6,
          internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
          version: '2',
          challengeIds: ['challengesdgff230fj38cs'],
          createdAt: '2025-01-02T07:58:57.465Z',
        }),
      ]);

      airtableScope.done();
    });
  });

  describe('#listActiveByCompetenceId', () => {
    it('should retrieve all skills by competence Id', async () => {
      // given
      const skill1 = {
        id: 'skill1',
        airtableId: 'recId1',
        name: 'Acquis 1',
        description: 'Description Acquis 1',
        descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
        hintStatus: Skill.HINT_STATUSES.VALIDE,
        tutorialIds: ['tuto1', 'tuto2'],
        tutorialAirtableIds: ['recTuto1', 'recTuto2'],
        learningMoreTutorialIds: ['tuto3', 'tuto4'],
        learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
        pixValue: 2.5,
        competenceId: 'competence1',
        status: Skill.STATUSES.ACTIF,
        tubeId: 'tube1',
        tubeAirtableId: 'recTube1',
        level: 4,
        internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
        version: '1',
        challengeIds: ['challenge12kwuefn2s', 'challengeJqdqwjcd1'],
        createdAt: '2025-01-06T08:58:57.465Z',
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
      vi.spyOn(airtable, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Acquis') expect.unreachable('Airtable tableName should be Acquis');
        if (options?.filterByFormula !== `AND({Compétence (via Tube) (id persistant)} = ${stringValue(skill1.competenceId)}, {Status} = "${Skill.STATUSES.ACTIF}")`) expect.unreachable('Wrong filterByFormula');
        return [{
          id: skill1.airtableId,
          fields: {
            'id persistant': skill1.id,
            'Record Id': skill1.airtableId,
            'Nom': skill1.name,
            'Statut de l\'indice': skill1.hintStatus,
            'Comprendre (id persistant)': skill1.tutorialIds,
            'Comprendre': skill1.tutorialAirtableIds,
            'En savoir plus (id persistant)': skill1.learningMoreTutorialIds,
            'En savoir plus': skill1.learningMoreTutorialAirtableIds,
            'PixValue': skill1.pixValue,
            'Compétence (via Tube) (id persistant)': [skill1.competenceId],
            'Status': skill1.status,
            'Tube (id persistant)': [skill1.tubeId],
            'Tube': [skill1.tubeAirtableId],
            'Description': skill1.description,
            'Statut de la description': skill1.descriptionStatus,
            'Level': skill1.level,
            'Internationalisation': skill1.internationalisation,
            'Version': skill1.version,
            'Epreuves (id persistant)': skill1.challengeIds,
            'Date': skill1.createdAt,
          },
          get: function(field) { return this.fields[field]; },
        }];
      });

      // when
      const skills = await skillRepository.listActiveByCompetenceId('competence1');

      // then

      expect(skills).toEqual([
        domainBuilder.buildSkill({
          id: 'skill1',
          airtableId: 'recId1',
          name: 'Acquis 1',
          description: 'Description Acquis 1',
          descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
          hint_i18n: {
            fr: 'Indice acquis 1',
            en: 'Skill 1 hint',
          },
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          tutorialIds: ['tuto1', 'tuto2'],
          tutorialAirtableIds: ['recTuto1', 'recTuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
          pixValue: 2.5,
          competenceId: 'competence1',
          status: Skill.STATUSES.ACTIF,
          tubeId: 'tube1',
          tubeAirtableId: 'recTube1',
          level: 4,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          version: '1',
          challengeIds: ['challenge12kwuefn2s', 'challengeJqdqwjcd1'],
          createdAt: '2025-01-06T08:58:57.465Z',
        }),
      ]);
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
        descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
        hintStatus: Skill.HINT_STATUSES.VALIDE,
        tutorialIds: ['tuto1', 'tuto2'],
        tutorialAirtableIds: ['recTuto1', 'recTuto2'],
        learningMoreTutorialIds: ['tuto3', 'tuto4'],
        learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
        pixValue: 2.5,
        competenceId: 'competence1',
        status: Skill.STATUSES.ACTIF,
        tubeId: 'tube1',
        tubeAirtableId: 'recTube1',
        level: 4,
        internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
        version: '1',
        challengeIds: ['challenge12kwuefn2s', 'challengeJqdqwjcd1'],
        createdAt: '2025-01-06T08:58:57.465Z',
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
      vi.spyOn(airtable, 'findRecords').mockImplementation((tableName, options) => {
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
            'Comprendre': skill1.tutorialAirtableIds,
            'En savoir plus (id persistant)': skill1.learningMoreTutorialIds,
            'En savoir plus': skill1.learningMoreTutorialAirtableIds,
            'PixValue': skill1.pixValue,
            'Compétence (via Tube) (id persistant)': [skill1.competenceId],
            'Status': skill1.status,
            'Tube (id persistant)': [skill1.tubeId],
            'Tube': [skill1.tubeAirtableId],
            'Description': skill1.description,
            'Statut de la description': skill1.descriptionStatus,
            'Level': skill1.level,
            'Internationalisation': skill1.internationalisation,
            'Version': skill1.version,
            'Epreuves (id persistant)': skill1.challengeIds,
            'Date': skill1.createdAt,
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
          descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          tutorialIds: ['tuto1', 'tuto2'],
          tutorialAirtableIds: ['recTuto1', 'recTuto2'],
          learningMoreTutorialIds: ['tuto3', 'tuto4'],
          learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
          pixValue: 2.5,
          competenceId: 'competence1',
          status: Skill.STATUSES.ACTIF,
          tubeId: 'tube1',
          tubeAirtableId: 'recTube1',
          level: 4,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          version: '1',
          challengeIds: ['challenge12kwuefn2s', 'challengeJqdqwjcd1'],
          createdAt: '2025-01-06T08:58:57.465Z',
        }),
      ]);
    });
  });

  describe('#getManyByAirtableIds', () => {
    describe('when no ids', () => {
      it('should return an empty array', async () => {
        // given
        const ids = [];

        // when
        const results = await skillRepository.getManyByAirtableIds(ids);

        // then
        expect(results).toEqual([]);
      });
    });

    describe('when none found', () => {
      it('should return an empty array', async () => {
        // given
        const ids = ['notfound1', 'notfound2'];
        const findRecordsSpy = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([]);

        // when
        const results = await skillRepository.getManyByAirtableIds(ids);

        // then
        expect(results).toEqual([]);
        expect(findRecordsSpy).toHaveBeenCalledWith(skillDatasource.tableName, {
          filterByFormula: 'OR(RECORD_ID() = "notfound1", RECORD_ID() = "notfound2")',
          fields: skillDatasource.usedFields,
          sort: [{ field: skillDatasource.sortField, direction: 'asc' }],
        });
      });
    });

    describe('when some found', () => {
      it('should return domain skills', async () => {
        // given
        const skills = [
          {
            id: 'skill1',
            airtableId: 'recSkill1',
            createdAt: '2025-01-06T13:50:47.437Z',
            description: 'premier acquis',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
            hint_i18n: {
              fr: 'premier indice',
              en: 'first clue',
            },
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
            level: 4,
            name: '@skill4',
            pixValue: 1.5,
            status: Skill.STATUSES.ACTIF,
            version: 1,
            tubeId: 'tube1',
            tubeAirtableId: 'recTube1',
            tutorialIds: ['tuto1'],
            tutorialAirtableIds: ['recTuto1'],
            learningMoreTutorialIds: ['tuto2', 'tuto3'],
            learningMoreTutorialAirtableIds: ['recTuto2', 'recTuto3'],
            challengeIds: ['challenge1', 'challenge2'],
          },
          {
            id: 'skill2',
            airtableId: 'recSkill2',
            createdAt: '2025-01-06T13:51:04.381Z',
            description: 'deuxième acquis',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.PROPOSE,
            hint_i18n: {
              fr: 'premier indice',
              en: 'first clue',
            },
            hintStatus: Skill.HINT_STATUSES.PROPOSE,
            internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
            level: 3,
            name: '@skill3',
            pixValue: 1.8,
            status: Skill.STATUSES.EN_CONSTRUCTION,
            version: 2,
            tubeId: 'tube2',
            tubeAirtableId: 'recTube2',
            tutorialIds: ['tuto2'],
            tutorialAirtableIds: ['recTuto2'],
            learningMoreTutorialIds: ['tuto3', 'tuto4'],
            learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
            challengeIds: ['challenge3', 'challenge4', 'challenge5'],
          },
        ];
        const airtableSkills = skills.map((skill) => airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject(skill)));
        const findRecordsSpy = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce(
          airtableSkills.map((airtableSkill) => new Airtable.Record('Acquis', airtableSkill.id, airtableSkill)),
        );
        skills.forEach((skill) => {
          databaseBuilder.factory.buildTranslation({ key: `skill.${skill.id}.hint`, locale: 'fr', value: skill.hint_i18n.fr });
          databaseBuilder.factory.buildTranslation({ key: `skill.${skill.id}.hint`, locale: 'en', value: skill.hint_i18n.en });
        });
        await databaseBuilder.commit();
        const ids = skills.map((skill) => skill.id);

        // when
        const results = await skillRepository.getManyByAirtableIds(ids);

        // then
        expect(results).toStrictEqual(skills.map(domainBuilder.buildSkill));
        expect(findRecordsSpy).toHaveBeenCalledWith(skillDatasource.tableName, {
          filterByFormula: 'OR(RECORD_ID() = "skill1", RECORD_ID() = "skill2")',
          fields: skillDatasource.usedFields,
          sort: [{ field: skillDatasource.sortField, direction: 'asc' }],
        });
      });
    });
  });

  describe('#search', () => {
    describe('when none found', () => {
      it('should return corresponding skills', async () => {
        const params = {
          filter: { name: '@NotFound' },
          sort: [['name', 'asc']],
          page: { limit: 10 },
        };
        const findRecordsSpy = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([]);

        // when
        const results = await skillRepository.search(params);

        // then
        expect(results).toEqual([]);
        expect(findRecordsSpy).toHaveBeenCalledWith(skillDatasource.tableName, {
          filterByFormula: 'FIND("@notfound", LOWER(Nom))',
          fields: skillDatasource.usedFields,
          sort: [{ field: 'Nom', direction: 'asc' }],
          maxRecords: 10,
        });
      });
    });

    describe('when some found', () => {
      it('should return domain skills', async () => {
        // given
        const skills = [
          {
            id: 'skill1',
            airtableId: 'recSkill1',
            createdAt: '2025-01-06T13:50:47.437Z',
            description: 'premier acquis',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
            hint_i18n: {
              fr: 'premier indice',
              en: 'first clue',
            },
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
            level: 3,
            name: '@skill3',
            pixValue: 1.5,
            status: Skill.STATUSES.ACTIF,
            version: 1,
            tubeId: 'tube1',
            tubeAirtableId: 'recTube1',
            tutorialIds: ['tuto1'],
            tutorialAirtableIds: ['recTuto1'],
            learningMoreTutorialIds: ['tuto2', 'tuto3'],
            learningMoreTutorialAirtableIds: ['recTuto2', 'recTuto3'],
            challengeIds: ['challenge1', 'challenge2'],
          },
          {
            id: 'skill2',
            airtableId: 'recSkill2',
            createdAt: '2025-01-06T13:51:04.381Z',
            description: 'deuxième acquis',
            descriptionStatus: Skill.DESCRIPTION_STATUSES.PROPOSE,
            hint_i18n: {
              fr: 'premier indice',
              en: 'first clue',
            },
            hintStatus: Skill.HINT_STATUSES.PROPOSE,
            internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
            level: 4,
            name: '@skill4',
            pixValue: 1.8,
            status: Skill.STATUSES.EN_CONSTRUCTION,
            version: 2,
            tubeId: 'tube2',
            tubeAirtableId: 'recTube2',
            tutorialIds: ['tuto2'],
            tutorialAirtableIds: ['recTuto2'],
            learningMoreTutorialIds: ['tuto3', 'tuto4'],
            learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
            challengeIds: ['challenge3', 'challenge4', 'challenge5'],
          },
        ];
        const airtableSkills = skills.map((skill) => airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject(skill)));
        const findRecordsSpy = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce(
          airtableSkills.map((airtableSkill) => new Airtable.Record('Acquis', airtableSkill.id, airtableSkill)),
        );
        skills.forEach((skill) => {
          databaseBuilder.factory.buildTranslation({ key: `skill.${skill.id}.hint`, locale: 'fr', value: skill.hint_i18n.fr });
          databaseBuilder.factory.buildTranslation({ key: `skill.${skill.id}.hint`, locale: 'en', value: skill.hint_i18n.en });
        });
        await databaseBuilder.commit();

        const params = {
          filter: { name: '@skill' },
        };

        // when
        const results = await skillRepository.search(params);

        // then
        expect(results).toStrictEqual(skills.map(domainBuilder.buildSkill));
        expect(findRecordsSpy).toHaveBeenCalledWith(skillDatasource.tableName, {
          filterByFormula: 'FIND("@skill", LOWER(Nom))',
          fields: skillDatasource.usedFields,
          sort: [{ field: skillDatasource.sortField, direction: 'asc' }],
        });
      });
    });
  });

  describe('#getByAirtableId', () => {
    describe('when not found', () => {
      it('should return null', async () => {
        // given
        const id = 'notfound';
        const findRecordSpy = vi.spyOn(airtable, 'findRecord').mockRejectedValueOnce(new Airtable.Error('', '', 404));

        // when
        const result = await skillRepository.getByAirtableId(id);

        // then
        expect(result).toBe(null);
        expect(findRecordSpy).toHaveBeenCalledWith(skillDatasource.tableName, id);
      });
    });

    describe('when found', () => {
      it('should return domain skill', async () => {
        // given
        const skill = {
          id: 'skill1',
          airtableId: 'recSkill1',
          createdAt: '2025-01-06T13:50:47.437Z',
          description: 'premier acquis',
          descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
          hint_i18n: {
            fr: 'premier indice',
            en: 'first clue',
          },
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          level: 4,
          name: '@skill4',
          pixValue: 1.5,
          status: Skill.STATUSES.ACTIF,
          version: 1,
          tubeId: 'tube1',
          tubeAirtableId: 'recTube1',
          tutorialIds: ['tuto1'],
          tutorialAirtableIds: ['recTuto1'],
          learningMoreTutorialIds: ['tuto2', 'tuto3'],
          learningMoreTutorialAirtableIds: ['recTuto2', 'recTuto3'],
          challengeIds: ['challenge1', 'challenge2'],
        };
        const airtableSkill = airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject(skill));
        const findRecordSpy = vi.spyOn(airtable, 'findRecord').mockResolvedValueOnce(
          new Airtable.Record('Acquis', airtableSkill.id, airtableSkill),
        );
        databaseBuilder.factory.buildTranslation({ key: `skill.${skill.id}.hint`, locale: 'fr', value: skill.hint_i18n.fr });
        databaseBuilder.factory.buildTranslation({ key: `skill.${skill.id}.hint`, locale: 'en', value: skill.hint_i18n.en });
        await databaseBuilder.commit();
        const id = skill.id;

        // when
        const result = await skillRepository.getByAirtableId(id);

        // then
        expect(result).toStrictEqual(domainBuilder.buildSkill(skill));
        expect(findRecordSpy).toHaveBeenCalledWith(skillDatasource.tableName, id);
      });
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
        hintStatus: Skill.HINT_STATUSES.PROPOSE,
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
        hintStatus: Skill.HINT_STATUSES.PROPOSE,
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
        hintStatus: Skill.HINT_STATUSES.PROPOSE,
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
        hintStatus: Skill.HINT_STATUSES.PROPOSE,
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

  describe('#create', () => {
    afterEach(() => {
      return knex('translations').truncate();
    });

    it('should save new skill to Airtable and translations to DB', async () => {
      // given
      const skill = domainBuilder.buildSkill({
        airtableId: null,
      });
      const airtableSkill = airtableBuilder.factory.buildSkill({ ...skill, airtableId: 'recSkillPouet' });
      const createRecordSpy = vi.spyOn(airtable, 'createRecord').mockResolvedValueOnce(
        new Airtable.Record('Acquis', airtableSkill.id, airtableSkill),
      );

      // when
      const createdSkill = await skillRepository.create(skill);

      // then
      expect(createdSkill).toStrictEqual(domainBuilder.buildSkill({
        ...skill,
        airtableId: 'recSkillPouet',
      }));
      expect(createRecordSpy).toHaveBeenCalledWith(
        'Acquis',
        {
          fields: {
            'id persistant': skill.id,
            'Statut de l\'indice': skill.hintStatus,
            'Comprendre': skill.tutorialAirtableIds,
            'En savoir plus': skill.learningMoreTutorialAirtableIds,
            'Status': skill.status,
            'Tube': [skill.tubeAirtableId],
            'Description': skill.description,
            'Statut de la description': skill.descriptionStatus,
            'Level': skill.level,
            'Internationalisation': skill.internationalisation,
            'Version': skill.version,
          },
        });
    });
  });
});
