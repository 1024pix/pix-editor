import { describe, expect, it } from 'vitest';

import { Mission, Skill } from '../../../../lib/domain/models/index.js';
import * as missionValidator from '../../../../lib/domain/services/mission-validator.js';
import { InvalidMissionContentError, MissionIntroductionMediaError } from '../../../../lib/domain/errors.js';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../test-helper.js';

describe('Integration | Validator | Mission', function () {
  describe('status validation', function () {
    describe('when requested mission status is not VALIDATED', function () {
      it('should not reject mission with not validated challenges', async () => {
        // given
        const mission = new Mission({
          name_i18n: { fr: 'Updated mission' },
          competenceId: 'QWERTY',
          thematicIds: 'Thematic',
          learningObjectives_i18n: { fr: null },
          validatedObjectives_i18n: { fr: 'Très bien' },
          introductionMediaUrl: null,
          introductionMediaType: null,
          introductionMediaAlt_i18n: { fr: null },
          documentationUrl: null,
          status: Mission.status.INACTIVE,
          createdAt: new Date('2023-12-25'),
        });

        const warnings = await missionValidator.validate(mission);

        // then
        expect(warnings).toStrictEqual([]);
      });
    });

    describe('when requested mission status is VALIDATED', function () {
      describe('when there is no thematic', function () {
        it('throws InvalidMissionContentError', async () => {
          // given
          const mission = new Mission({
            name_i18n: { fr: 'Updated mission' },
            competenceId: 'QWERTY',
            thematicIds: '',
            learningObjectives_i18n: { fr: null },
            validatedObjectives_i18n: { fr: 'Très bien' },
            status: Mission.status.VALIDATED,
            createdAt: new Date('2023-12-25'),
          });

          // when
          const promise = missionValidator.validate(mission);

          // then
          await expect(promise).rejects.toStrictEqual(
            new InvalidMissionContentError("La mission ne peut pas être mise à jour car elle n'a pas de thématique"),
          );
        });
      });

      describe('When there is no tubes', function () {
        it('throws InvalidMissionContentError', async () => {
          // given
          const thematic = {
            id: 'Thematic',
            competenceId: 'competence1',
          };

          databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
          databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
          databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
          databaseBuilder.factory.buildThematic(thematic);
          await databaseBuilder.commit();

          airtableBuilder.mockLists({
            tubes: [],
            thematics: [airtableBuilder.factory.buildThematic(thematic)],
          });

          const mission = new Mission({
            name_i18n: { fr: 'Updated mission' },
            competenceId: 'QWERTY',
            thematicIds: 'Thematic',
            learningObjectives_i18n: { fr: null },
            validatedObjectives_i18n: { fr: 'Très bien' },
            status: Mission.status.VALIDATED,
            createdAt: new Date('2023-12-25'),
          });

          // when
          const promise = missionValidator.validate(mission);

          // then
          await expect(promise).rejects.toStrictEqual(
            new InvalidMissionContentError("La mission ne peut pas être mise à jour car elle n'a pas de sujet"),
          );
        });
      });

      describe('Skill cases', () => {
        describe('when a skill has 2 versions including one with "ACTIF" status', function () {
          it('should not return a warning', async () => {
            // given
            const thematic = {
              id: 'Thematic1',
              competenceId: 'competence1',
              tubeIds: ['tubeTuto'],
            };
            const tube = {
              id: 'tubeTuto',
              name: '@Pix1D-recherche_di',
              thematicId: 'Thematic1',
            };

            databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
            databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
            databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
            databaseBuilder.factory.buildThematic(thematic);
            databaseBuilder.factory.buildTube(tube);
            const skill1 = domainBuilder.buildSkillDatasourceObject({
              id: 'skillTuto1',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.ACTIF,
              name: '@Pix1D-recherche_di1',
              tutorialIds: [],
              learningMoreTutorialIds: [],
              competenceId: 'competence1',
              challengeIds: [],
            });
            const skill2 = domainBuilder.buildSkillDatasourceObject({
              id: 'skillTuto1Bis',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.EN_CONSTRUCTION,
              name: '@Pix1D-recherche_di1',
              tutorialIds: [],
              learningMoreTutorialIds: [],
              competenceId: 'competence1',
              challengeIds: [],
            });
            databaseBuilder.factory.buildSkill(skill1);
            databaseBuilder.factory.buildSkill(skill2);
            await databaseBuilder.commit();

            airtableBuilder.mockLists({
              skills: [airtableBuilder.factory.buildSkill(skill1), airtableBuilder.factory.buildSkill(skill2)],
              tubes: [airtableBuilder.factory.buildTube(tube)],
              thematics: [airtableBuilder.factory.buildThematic(thematic)],
            });

            const mission = new Mission({
              name_i18n: { fr: 'Updated mission' },
              competenceId: 'QWERTY',
              thematicIds: 'Thematic1',
              learningObjectives_i18n: { fr: null },
              validatedObjectives_i18n: { fr: 'Très bien' },
              introductionMediaUrl: null,
              introductionMediaType: null,
              introductionMediaAlt_i18n: { fr: null },
              documentationUrl: null,
              status: Mission.status.VALIDATED,
              createdAt: new Date('2023-12-25'),
            });

            // when
            const warnings = await missionValidator.validate(mission);

            // then
            expect(warnings).toStrictEqual([]);
          });
        });

        describe('when a skill has versions with only "ARCHIVE" or "PERIME" statuses', function () {
          it('should not return a warning', async () => {
            // given
            const thematic = {
              id: 'Thematic1',
              competenceId: 'competence1',
              tubeIds: ['tubeTuto'],
            };
            const tube = {
              id: 'tubeTuto',
              name: '@Pix1D-recherche_di',
              thematicId: 'Thematic1',
              competenceId: 'competence1',
              skillIds: ['skillTuto1', 'skillTuto1Bis'],
            };

            databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
            databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
            databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
            databaseBuilder.factory.buildThematic(thematic);
            databaseBuilder.factory.buildTube(tube);
            const skill1 = domainBuilder.buildSkill({
              id: 'skillTuto1',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.ARCHIVE,
              competenceId: 'competence1',
              tutorialIds: [],
              learningMoreTutorialIds: [],
              challengeIds: [],
              name: '@Pix1D-recherche_di1',
            });
            const skill2 = domainBuilder.buildSkill({
              id: 'skillTuto1Bis',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.PERIME,
              competenceId: 'competence1',
              tutorialIds: [],
              learningMoreTutorialIds: [],
              challengeIds: [],
              name: '@Pix1D-recherche_di1',
            });
            databaseBuilder.factory.buildSkill(skill1);
            databaseBuilder.factory.buildSkill(skill2);
            await databaseBuilder.commit();

            airtableBuilder.mockLists({
              skills: [airtableBuilder.factory.buildSkill(skill1), airtableBuilder.factory.buildSkill(skill2)],
              tubes: [airtableBuilder.factory.buildTube(tube)],
              thematics: [airtableBuilder.factory.buildThematic(thematic)],
            });

            const mission = new Mission({
              name_i18n: { fr: 'Updated mission' },
              competenceId: 'QWERTY',
              thematicIds: 'Thematic1',
              learningObjectives_i18n: { fr: null },
              validatedObjectives_i18n: { fr: 'Très bien' },
              introductionMediaUrl: null,
              introductionMediaType: null,
              introductionMediaAlt_i18n: { fr: null },
              documentationUrl: null,
              status: Mission.status.VALIDATED,
              createdAt: new Date('2023-12-25'),
            });

            // when
            const warnings = await missionValidator.validate(mission);

            // then
            expect(warnings).toStrictEqual([]);
          });
        });

        describe('when a skill has a "en construction" status version but no "actif" status version', function () {
          it('should return a warning', async () => {
            // given
            const thematic = {
              id: 'Thematic1',
              competenceId: 'competence1',
              tubeIds: ['tubeTuto'],
            };
            const tube = {
              id: 'tubeTuto',
              name: '@Pix1D-recherche_di',
              thematicId: 'Thematic1',
              competenceId: 'competence1',
              skillIds: ['skillTuto1', 'skillTuto1Bis', 'skillTuto2'],
            };

            databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
            databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
            databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
            databaseBuilder.factory.buildThematic(thematic);
            databaseBuilder.factory.buildTube(tube);
            const skill1 = domainBuilder.buildSkillDatasourceObject({
              id: 'skillTuto1',
              name: '@Pix1D-recherche_di1',
              tubeId: 'tubeTuto',
              level: 1,
              status: Skill.STATUSES.ACTIF,
              tutorialIds: [],
              learningMoreTutorialIds: [],
              competenceId: 'competence1',
              challengeIds: [],
            });
            const skill2 = domainBuilder.buildSkillDatasourceObject({
              id: 'skillTuto1Bis',
              name: '@Pix1D-recherche_di1',
              tubeId: 'tubeTuto',
              level: 1,
              status: Skill.STATUSES.EN_CONSTRUCTION,
              tutorialIds: [],
              learningMoreTutorialIds: [],
              competenceId: 'competence1',
              challengeIds: [],
            });
            const skill3 = domainBuilder.buildSkillDatasourceObject({
              id: 'skillTuto2',
              name: '@Pix1D-recherche_di2',
              tubeId: 'tubeTuto',
              level: 2,
              status: Skill.STATUSES.EN_CONSTRUCTION,
              tutorialIds: [],
              learningMoreTutorialIds: [],
              competenceId: 'competence1',
              challengeIds: [],
            });
            [skill1, skill2, skill3].forEach(databaseBuilder.factory.buildSkill);

            await databaseBuilder.commit();

            airtableBuilder.mockLists({
              skills: [
                airtableBuilder.factory.buildSkill(skill1),
                airtableBuilder.factory.buildSkill(skill2),
                airtableBuilder.factory.buildSkill(skill3),
              ],
              tubes: [airtableBuilder.factory.buildTube(tube)],
              thematics: [airtableBuilder.factory.buildThematic(thematic)],
            });

            const mission = new Mission({
              name_i18n: { fr: 'Updated mission' },
              competenceId: 'QWERTY',
              thematicIds: 'Thematic1',
              learningObjectives_i18n: { fr: null },
              validatedObjectives_i18n: { fr: 'Très bien' },
              introductionMediaUrl: null,
              introductionMediaType: null,
              introductionMediaAlt_i18n: { fr: null },
              documentationUrl: null,
              status: Mission.status.VALIDATED,
              createdAt: new Date('2023-12-25'),
            });

            // when
            const warnings = await missionValidator.validate(mission);

            // then
            expect(warnings).toStrictEqual([
              "L'activité '@Pix1D-recherche_di' n'a pas d'acquis actif pour le niveau 2.",
            ]);
          });
        });

        describe('when there are several skills with "en construction"', function () {
          it('should return multiple warnings', async () => {
            // given
            const thematic = {
              id: 'Thematic1',
              competenceId: 'competence1',
              tubeIds: ['tubeTuto'],
            };
            const tube = {
              id: 'tubeTuto',
              name: '@Pix1D-recherche_di',
              thematicId: 'Thematic1',
              competenceId: 'competence1',
              skillIds: ['skillTuto1', 'skillTuto2'],
            };

            databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
            databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
            databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
            databaseBuilder.factory.buildThematic(thematic);
            databaseBuilder.factory.buildTube(tube);
            const skill1 = domainBuilder.buildSkillDatasourceObject({
              id: 'skillTuto1',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.EN_CONSTRUCTION,
              tutorialIds: [],
              learningMoreTutorialIds: [],
              competenceId: 'competence1',
              challengeIds: [],
              name: '@Pix1D-recherche_di1',
            });
            const skill2 = domainBuilder.buildSkillDatasourceObject({
              id: 'skillTuto2',
              level: 2,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.EN_CONSTRUCTION,
              tutorialIds: [],
              learningMoreTutorialIds: [],
              competenceId: 'competence1',
              challengeIds: [],
              name: '@Pix1D-recherche_di2',
            });
            databaseBuilder.factory.buildSkill(skill1);
            databaseBuilder.factory.buildSkill(skill2);
            await databaseBuilder.commit();

            airtableBuilder.mockLists({
              skills: [airtableBuilder.factory.buildSkill(skill1), airtableBuilder.factory.buildSkill(skill2)],
              tubes: [airtableBuilder.factory.buildTube(tube)],
              thematics: [airtableBuilder.factory.buildThematic(thematic)],
            });

            const mission = new Mission({
              name_i18n: { fr: 'Updated mission' },
              competenceId: 'QWERTY',
              thematicIds: 'Thematic1',
              learningObjectives_i18n: { fr: null },
              validatedObjectives_i18n: { fr: 'Très bien' },
              introductionMediaUrl: null,
              introductionMediaType: null,
              introductionMediaAlt_i18n: { fr: null },
              documentationUrl: null,
              status: Mission.status.VALIDATED,
              createdAt: new Date('2023-12-25'),
            });

            // when
            const warnings = await missionValidator.validate(mission);

            // then
            expect(warnings).toStrictEqual([
              "L'activité '@Pix1D-recherche_di' n'a pas d'acquis actif pour le niveau 1.",
              "L'activité '@Pix1D-recherche_di' n'a pas d'acquis actif pour le niveau 2.",
            ]);
          });
        });
      });
    });
  });

  describe('introduction media validation', function () {
    describe('When the mission has a media url without a type', function () {
      it('should return an error MissionIntroductionMediaError', async () => {
        // given
        const missionToSave = new Mission({
          name_i18n: { fr: 'new mission' },
          competenceId: 'QWERTY',
          thematicIds: 'Thematic',
          learningObjectives_i18n: { fr: null },
          validatedObjectives_i18n: { fr: 'Très bien' },
          introductionMediaType: null,
          introductionMediaUrl: 'http://example.net',
          introductionMediaAlt_i18n: { fr: null },
          documentationUrl: null,
          status: Mission.status.INACTIVE,
          createdAt: new Date('2023-12-25'),
        });

        // when
        const promise = missionValidator.validate(missionToSave);

        // then
        await expect(promise).rejects.toStrictEqual(
          new MissionIntroductionMediaError(
            "Opération impossible car la mission n'a pas de type pour le media d'introduction.",
          ),
        );
      });
    });

    describe('When the mission has a media type without an url', function () {
      it('should return an error MissionIntroductionMediaError', async () => {
        // given
        const missionToSave = new Mission({
          name_i18n: { fr: 'new mission' },
          competenceId: 'QWERTY',
          thematicIds: 'Thematic',
          learningObjectives_i18n: { fr: null },
          validatedObjectives_i18n: { fr: 'Très bien' },
          introductionMediaType: 'image',
          introductionMediaUrl: null,
          introductionMediaAlt_i18n: { fr: null },
          documentationUrl: null,
          status: Mission.status.INACTIVE,
          createdAt: new Date('2023-12-25'),
        });

        // when
        const promise = missionValidator.validate(missionToSave);

        // then
        await expect(promise).rejects.toStrictEqual(
          new MissionIntroductionMediaError(
            'Opération impossible car la mission ne peut avoir de type de média sans URL pour ce dernier.',
          ),
        );
      });
    });
  });
});
