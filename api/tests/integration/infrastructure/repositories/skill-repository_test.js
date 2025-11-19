import { describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as skillRepository from '../../../../lib/infrastructure/repositories/skill-repository.js';
import { skillDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import { Skill } from '../../../../lib/domain/models/index.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { stringValue } from '../../../../lib/infrastructure/airtable.js';

describe('Integration | Repository | skill-repository', () => {
  describe('#list', () => {
    it('should return the list of all skills', async () => {
      // given
      const skills = [
        {
          id: 'skill1',
          airtableId: 'recId1',
          name: '@foo4',
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
          version: 1,
          challengeIds: ['challenge123184r9124'],
          createdAt: '2025-01-01T09:58:57.465Z',
          activatedAt: '2023-11-06T18:08:00Z',
          archivedAt: '2023-12-07T18:08:00Z',
          obsoletedAt: '2024-01-08T18:08:00Z',
        },
        {
          id: 'skill2',
          airtableId: 'recId2',
          name: '@bar6',
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
          version: 2,
          challengeIds: ['challengesdgff230fj38cs'],
          createdAt: '2025-01-02T07:58:57.465Z',
        },
      ];

      const airtableScope = airtableBuilder
        .mockList({ tableName: 'Acquis' })
        .returns(skills.map(airtableBuilder.factory.buildSkill))
        .activate().nockScope;

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });

      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', thematicId: 'thematic1' });

      databaseBuilder.factory.buildCompetence({ id: 'competence2', index: '1.2', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic2', competenceId: 'competence2' });
      databaseBuilder.factory.buildTube({ id: 'tube2', name: '@bar', thematicId: 'thematic2' });

      databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto1', tagIds: [] }));
      databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto2', tagIds: [] }));
      databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto3', tagIds: [] }));
      databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto4', tagIds: [] }));
      databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto5', tagIds: [] }));
      databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto6', tagIds: [] }));

      skills.forEach((skill) => {
        databaseBuilder.factory.buildSkill(skill);
        skill.challengeIds.forEach((id) =>
          databaseBuilder.factory.buildChallenge(
            domainBuilder.buildChallengeDatasourceObject({ id, skillId: skill.id }),
          ),
        );
      });

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
      const results = await skillRepository.list();

      // then
      expect(results).toEqual([
        domainBuilder.buildSkill({
          id: 'skill1',
          airtableId: 'recId1',
          name: '@foo4',
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
          version: 1,
          challengeIds: ['challenge123184r9124'],
          createdAt: '2025-01-01T09:58:57.465Z',
          activatedAt: new Date('2023-11-06T18:08:00Z'),
          archivedAt: new Date('2023-12-07T18:08:00Z'),
          obsoletedAt: new Date('2024-01-08T18:08:00Z'),
        }),
        domainBuilder.buildSkill({
          id: 'skill2',
          airtableId: 'recId2',
          name: '@bar6',
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
          version: 2,
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
        name: '@foo4',
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
        version: 1,
        challengeIds: ['challenge12kwuefn2s', 'challengeJqdqwjcd1'],
        createdAt: '2025-01-06T08:58:57.465Z',
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', thematicId: 'thematic1' });

      [...skill1.tutorialIds, ...skill1.learningMoreTutorialIds].forEach((id) =>
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id, tagIds: [] })),
      );

      databaseBuilder.factory.buildSkill(skill1);
      skill1.challengeIds.forEach((id) =>
        databaseBuilder.factory.buildChallenge(
          domainBuilder.buildChallengeDatasourceObject({ id, skillId: skill1.id }),
        ),
      );

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
        if (
          options?.filterByFormula
          !== `AND({Compétence (via Tube) (id persistant)} = ${stringValue(skill1.competenceId)}, {Status} = "${Skill.STATUSES.ACTIF}")`
        )
          expect.unreachable('Wrong filterByFormula');
        return [
          {
            id: skill1.airtableId,
            fields: {
              'id persistant': skill1.id,
              'Record Id': skill1.airtableId,
              Nom: skill1.name,
              "Statut de l'indice": skill1.hintStatus,
              'Comprendre (id persistant)': skill1.tutorialIds,
              Comprendre: skill1.tutorialAirtableIds,
              'En savoir plus (id persistant)': skill1.learningMoreTutorialIds,
              'En savoir plus': skill1.learningMoreTutorialAirtableIds,
              PixValue: skill1.pixValue,
              'Compétence (via Tube) (id persistant)': [skill1.competenceId],
              Status: skill1.status,
              'Tube (id persistant)': [skill1.tubeId],
              Tube: [skill1.tubeAirtableId],
              Description: skill1.description,
              'Statut de la description': skill1.descriptionStatus,
              Level: skill1.level,
              Internationalisation: skill1.internationalisation,
              Version: skill1.version,
              'Epreuves (id persistant)': skill1.challengeIds,
              Date: skill1.createdAt,
            },
            get: function(field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const skills = await skillRepository.listActiveByCompetenceId('competence1');

      // then

      expect(skills).toEqual([
        domainBuilder.buildSkill({
          id: 'skill1',
          airtableId: 'recId1',
          name: '@foo4',
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
          version: 1,
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
        name: '@foo4',
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
        version: 1,
        challengeIds: ['challenge12kwuefn2s', 'challengeJqdqwjcd1'],
        createdAt: '2025-01-06T08:58:57.465Z',
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', thematicId: 'thematic1' });

      [...skill1.tutorialIds, ...skill1.learningMoreTutorialIds].forEach((id) =>
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id, tagIds: [] })),
      );

      databaseBuilder.factory.buildSkill(skill1);
      skill1.challengeIds.forEach((id) =>
        databaseBuilder.factory.buildChallenge(
          domainBuilder.buildChallengeDatasourceObject({ id, skillId: skill1.id }),
        ),
      );

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
        if (
          options?.filterByFormula !== `{Compétence (via Tube) (id persistant)} = ${stringValue(skill1.competenceId)}`
        )
          expect.unreachable('Wrong filterByFormula');
        return [
          {
            id: skill1.airtableId,
            fields: {
              'id persistant': skill1.id,
              'Record Id': skill1.airtableId,
              Nom: skill1.name,
              "Statut de l'indice": skill1.hintStatus,
              'Comprendre (id persistant)': skill1.tutorialIds,
              Comprendre: skill1.tutorialAirtableIds,
              'En savoir plus (id persistant)': skill1.learningMoreTutorialIds,
              'En savoir plus': skill1.learningMoreTutorialAirtableIds,
              PixValue: skill1.pixValue,
              'Compétence (via Tube) (id persistant)': [skill1.competenceId],
              Status: skill1.status,
              'Tube (id persistant)': [skill1.tubeId],
              Tube: [skill1.tubeAirtableId],
              Description: skill1.description,
              'Statut de la description': skill1.descriptionStatus,
              Level: skill1.level,
              Internationalisation: skill1.internationalisation,
              Version: skill1.version,
              'Epreuves (id persistant)': skill1.challengeIds,
              Date: skill1.createdAt,
            },
            get: function(field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const skills = await skillRepository.listByCompetenceId('competence1');

      // then
      expect(skills).toEqual([
        domainBuilder.buildSkill({
          id: 'skill1',
          airtableId: 'recId1',
          name: '@foo4',
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
          version: 1,
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
            competenceId: 'competence1',
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
            challengeIds: [
              'challenge3',
              'challenge4',
              'challenge5',
            ],
            competenceId: 'competence1',
          },
        ];
        const airtableSkills = skills.map((skill) =>
          airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject(skill)),
        );
        const findRecordsSpy = vi
          .spyOn(airtable, 'findRecords')
          .mockResolvedValueOnce(
            airtableSkills.map((airtableSkill) => new Airtable.Record('Acquis', airtableSkill.id, airtableSkill)),
          );
        skills.forEach((skill) => {
          databaseBuilder.factory.buildTranslation({
            key: `skill.${skill.id}.hint`,
            locale: 'fr',
            value: skill.hint_i18n.fr,
          });
          databaseBuilder.factory.buildTranslation({
            key: `skill.${skill.id}.hint`,
            locale: 'en',
            value: skill.hint_i18n.en,
          });
        });

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@skill', thematicId: 'thematic1' });
        databaseBuilder.factory.buildTube({ id: 'tube2', name: '@skill', thematicId: 'thematic1' });
        [
          'tuto1',
          'tuto2',
          'tuto3',
          'tuto4',
        ].forEach((tutorialId) => {
          databaseBuilder.factory.buildTutorial(
            domainBuilder.buildTutorialDatasourceObject({
              id: tutorialId,
              tagIds: [],
            }),
          );
        });
        skills.forEach(databaseBuilder.factory.buildSkill);
        skills.forEach((skill) =>
          skill.challengeIds.forEach((challengeId) => {
            databaseBuilder.factory.buildChallenge(
              domainBuilder.buildChallengeDatasourceObject({
                id: challengeId,
                skillId: skill.id,
              }),
            );
          }),
        );

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
          sort: [['name', 'asc'], ['version', 'desc']],
          page: { limit: 10 },
        };
        const findRecordsSpy = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([]);

        // when
        const results = await skillRepository.search(params);

        // then
        expect(results).toEqual([]);
        expect(findRecordsSpy).toHaveBeenCalledWith(skillDatasource.tableName, {
          filterByFormula: 'AND(FIND("@notfound", LOWER(Nom)), Nom != "@workbench")',
          fields: skillDatasource.usedFields,
          sort: [{ field: 'Nom', direction: 'asc' }, { field: 'Version', direction: 'desc' }],
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
            competenceId: 'competence1',
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
            tubeId: 'tube1',
            tubeAirtableId: 'recTube1',
            tutorialIds: ['tuto2'],
            tutorialAirtableIds: ['recTuto2'],
            learningMoreTutorialIds: ['tuto3', 'tuto4'],
            learningMoreTutorialAirtableIds: ['recTuto3', 'recTuto4'],
            challengeIds: [
              'challenge3',
              'challenge4',
              'challenge5',
            ],
            competenceId: 'competence1',
          },
        ];

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@skill', thematicId: 'thematic1' });

        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto1', tagIds: [] }));
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto2', tagIds: [] }));
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto3', tagIds: [] }));
        databaseBuilder.factory.buildTutorial(domainBuilder.buildTutorialDatasourceObject({ id: 'tuto4', tagIds: [] }));

        skills.forEach((skill) => {
          databaseBuilder.factory.buildSkill(skill);

          skill.challengeIds.forEach((id) =>
            databaseBuilder.factory.buildChallenge(domainBuilder.buildChallenge({ id, skillId: skill.id })),
          );

          databaseBuilder.factory.buildTranslation({
            key: `skill.${skill.id}.hint`,
            locale: 'fr',
            value: skill.hint_i18n.fr,
          });
          databaseBuilder.factory.buildTranslation({
            key: `skill.${skill.id}.hint`,
            locale: 'en',
            value: skill.hint_i18n.en,
          });
        });

        const airtableSkills = skills.map((skill) =>
          airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject(skill)),
        );
        const findRecordsSpy = vi
          .spyOn(airtable, 'findRecords')
          .mockResolvedValueOnce(
            airtableSkills.map((airtableSkill) => new Airtable.Record('Acquis', airtableSkill.id, airtableSkill)),
          );

        await databaseBuilder.commit();

        const params = { filter: { name: '@skill' } };

        // when
        const results = await skillRepository.search(params);

        // then
        expect(results).toStrictEqual(skills.map(domainBuilder.buildSkill));
        expect(findRecordsSpy).toHaveBeenCalledWith(skillDatasource.tableName, {
          filterByFormula: 'AND(FIND("@skill", LOWER(Nom)), Nom != "@workbench")',
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
          competenceId: 'competence1',
        };
        const airtableSkill = airtableBuilder.factory.buildSkill(domainBuilder.buildSkillDatasourceObject(skill));
        const findRecordSpy = vi
          .spyOn(airtable, 'findRecord')
          .mockResolvedValueOnce(new Airtable.Record('Acquis', airtableSkill.id, airtableSkill));
        databaseBuilder.factory.buildTranslation({
          key: `skill.${skill.id}.hint`,
          locale: 'fr',
          value: skill.hint_i18n.fr,
        });
        databaseBuilder.factory.buildTranslation({
          key: `skill.${skill.id}.hint`,
          locale: 'en',
          value: skill.hint_i18n.en,
        });

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@skill', thematicId: 'thematic1' });
        [...skill.tutorialIds, ...skill.learningMoreTutorialIds].forEach((tutorialId) => {
          databaseBuilder.factory.buildTutorial(
            domainBuilder.buildTutorialDatasourceObject({
              id: tutorialId,
              tagIds: [],
            }),
          );
        });
        databaseBuilder.factory.buildSkill(skill);
        skill.challengeIds.forEach((challengeId) => {
          databaseBuilder.factory.buildChallenge(
            domainBuilder.buildChallengeDatasourceObject({
              id: challengeId,
              skillId: skill.id,
            }),
          );
        });

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
    it('should save skill and translations', async () => {
      // given
      const skill = domainBuilder.buildSkill({
        tutorialIds: ['tuto1', 'tuto2'],
        tutorialAirtableIds: ['recTuto1', 'recTuto2'],
        learningMoreTutorialIds: ['tuto3'],
        learningMoreTutorialAirtableIds: ['recTuto3'],
      });

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: skill.tubeId, name: '@foo', thematicId: 'thematic1' });
      databaseBuilder.factory.buildTutorial({
        id: 'tuto1',
        title: 'title tuto1',
        duration: 'duration tuto1',
        source: 'source tuto1',
        format: 'format tuto1',
        link: 'link tuto1',
        locale: 'fr',
      });
      databaseBuilder.factory.buildTutorial({
        id: 'tuto2',
        title: 'title tuto2',
        duration: 'duration tuto2',
        source: 'source tuto2',
        format: 'format tuto2',
        link: 'link tuto2',
        locale: 'fr',
      });
      databaseBuilder.factory.buildTutorial({
        id: 'tuto3',
        title: 'title tuto3',
        duration: 'duration tuto3',
        source: 'source tuto3',
        format: 'format tuto3',
        link: 'link tuto3',
        locale: 'fr',
      });
      databaseBuilder.factory.buildTutorial({
        id: 'tuto4',
        title: 'title tuto4',
        duration: 'duration tuto4',
        source: 'source tuto4',
        format: 'format tuto4',
        link: 'link tuto4',
        locale: 'fr',
      });
      databaseBuilder.factory.buildSkill(skill);
      const otherSkill = databaseBuilder.factory.buildSkill({
        id: 'z_otherSkill',
        skillId: skill.tubeId,
        tutorialIds: ['tuto1', 'tuto4'],
        learningMoreTutorialIds: ['tuto3'],
      });
      databaseBuilder.factory.buildTranslation({
        key: `skill.${skill.id}.hint`,
        locale: 'fr',
        value: skill.hint_i18n.fr,
      });
      databaseBuilder.factory.buildTranslation({
        key: `skill.${skill.id}.hint`,
        locale: 'en',
        value: skill.hint_i18n.en,
      });
      await databaseBuilder.commit();

      const expectedSkill = domainBuilder.buildSkill({
        description: 'skill description new',
        descriptionStatus: Skill.DESCRIPTION_STATUSES.A_RETRAVAILLER,
        hintStatus: Skill.HINT_STATUSES.A_RETRAVAILLER,
        hint_i18n: { fr: 'nouvel indice', en: 'new hint' },
        internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
        status: Skill.STATUSES.EN_CONSTRUCTION,
        archivedAt: new Date('2025-10-10T15:20:23Z'),
        activatedAt: new Date('2025-10-11T15:20:23Z'),
        obsoletedAt: new Date('2025-10-12T15:20:23Z'),
        tutorialIds: ['tuto2', 'tuto4'],
        tutorialAirtableIds: ['recTuto2', 'recTuto4'],
        learningMoreTutorialIds: ['tuto1', 'tuto2'],
        learningMoreTutorialAirtableIds: ['recTuto1', 'recTuto2'],
      });

      const airtableSkill = airtableBuilder.factory.buildSkill(expectedSkill);
      const updateRecordSpy = vi
        .spyOn(airtable, 'updateRecord')
        .mockResolvedValueOnce(new Airtable.Record('Acquis', airtableSkill.id, airtableSkill));

      // when
      const updatedSkill = await skillRepository.update(expectedSkill);

      // then
      expect(updatedSkill).toStrictEqual(expectedSkill);
      expect(updateRecordSpy).toHaveBeenCalledWith('Acquis', {
        id: skill.airtableId,
        fields: {
          'id persistant': skill.id,
          "Statut de l'indice": expectedSkill.hintStatus,
          Status: expectedSkill.status,
          Description: expectedSkill.description,
          'Statut de la description': expectedSkill.descriptionStatus,
          Level: expectedSkill.level,
          Internationalisation: expectedSkill.internationalisation,
          Version: expectedSkill.version,
          Tube: [skill.tubeAirtableId],
          Comprendre: expectedSkill.tutorialAirtableIds,
          'En savoir plus': expectedSkill.learningMoreTutorialAirtableIds,
        },
      });

      await expect(knex.select('*').from('skills').where('id', skill.id).first()).resolves.toStrictEqual({
        id: skill.id,
        description: expectedSkill.description,
        descriptionStatus: expectedSkill.descriptionStatus,
        hintStatus: expectedSkill.hintStatus,
        internationalisation: expectedSkill.internationalisation,
        level: expectedSkill.level,
        status: expectedSkill.status,
        version: expectedSkill.version,
        tubeId: skill.tubeId,
        activatedAt: expectedSkill.activatedAt,
        archivedAt: expectedSkill.archivedAt,
        obsoletedAt: expectedSkill.obsoletedAt,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      await expect(
        knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
      ).resolves.toStrictEqual([{ key: `skill.${skill.id}.hint`, locale: 'en', value: expectedSkill.hint_i18n.en }, { key: `skill.${skill.id}.hint`, locale: 'fr', value: expectedSkill.hint_i18n.fr }]);

      await expect(
        knex.select('*').from('skills-tutorials').orderBy([
          'skillId',
          'type',
          'tutorialId',
        ]),
      ).resolves.toStrictEqual([
        ...expectedSkill.learningMoreTutorialIds.toSorted().map((tutorialId) => ({
          type: 'learningMore',
          skillId: skill.id,
          tutorialId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })),
        ...expectedSkill.tutorialIds.toSorted().map((tutorialId) => ({
          type: 'understanding',
          skillId: skill.id,
          tutorialId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })),
        ...otherSkill.learningMoreTutorialIds.toSorted().map((tutorialId) => ({
          type: 'learningMore',
          skillId: otherSkill.id,
          tutorialId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })),
        ...otherSkill.tutorialIds.toSorted().map((tutorialId) => ({
          type: 'understanding',
          skillId: otherSkill.id,
          tutorialId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })),
      ]);
    });
  });

  describe('#create', () => {
    it('should save new skill and translations', async () => {
      // given
      const skill = domainBuilder.buildSkill({
        airtableId: null,
        tubeId: null,
      });

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', thematicId: 'thematic1' });
      [...skill.tutorialIds, ...skill.learningMoreTutorialIds].forEach((id) =>
        databaseBuilder.factory.buildTutorial({
          id,
          title: `title ${id}`,
          duration: `duration ${id}`,
          source: `source ${id}`,
          format: `format ${id}`,
          link: `link ${id}`,
          locale: 'fr',
        }),
      );
      await databaseBuilder.commit();

      const airtableSkill = airtableBuilder.factory.buildSkill({
        ...skill,
        airtableId: 'recSkillPouet',
        tubeId: 'tube1',
      });
      const createRecordSpy = vi
        .spyOn(airtable, 'createRecord')
        .mockResolvedValueOnce(new Airtable.Record('Acquis', airtableSkill.id, airtableSkill));

      // when
      const createdSkill = await skillRepository.create(skill);

      // then
      expect(createdSkill).toStrictEqual(
        domainBuilder.buildSkill({
          ...skill,
          airtableId: 'recSkillPouet',
          tubeId: 'tube1',
        }),
      );
      expect(createRecordSpy).toHaveBeenCalledWith('Acquis', {
        fields: {
          'id persistant': skill.id,
          "Statut de l'indice": skill.hintStatus,
          Comprendre: skill.tutorialAirtableIds,
          'En savoir plus': skill.learningMoreTutorialAirtableIds,
          Status: skill.status,
          Tube: [skill.tubeAirtableId],
          Description: skill.description,
          'Statut de la description': skill.descriptionStatus,
          Level: skill.level,
          Internationalisation: skill.internationalisation,
          Version: skill.version,
        },
      });

      await expect(knex.select('*').from('skills')).resolves.toStrictEqual([
        {
          id: skill.id,
          description: skill.description,
          descriptionStatus: skill.descriptionStatus,
          hintStatus: skill.hintStatus,
          internationalisation: skill.internationalisation,
          level: skill.level,
          status: skill.status,
          version: skill.version,
          tubeId: 'tube1',
          activatedAt: null,
          archivedAt: null,
          obsoletedAt: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(
        knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
      ).resolves.toStrictEqual([{ key: `skill.${skill.id}.hint`, locale: 'en', value: skill.hint_i18n.en }, { key: `skill.${skill.id}.hint`, locale: 'fr', value: skill.hint_i18n.fr }]);

      await expect(knex.select('*').from('skills-tutorials').orderBy(['type', 'tutorialId'])).resolves.toStrictEqual([
        ...skill.learningMoreTutorialIds.toSorted().map((tutorialId) => ({
          type: 'learningMore',
          skillId: skill.id,
          tutorialId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })),
        ...skill.tutorialIds.map((tutorialId) => ({
          type: 'understanding',
          skillId: skill.id,
          tutorialId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })),
      ]);
    });
  });
});
