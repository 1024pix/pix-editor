import { describe, expect, it } from 'vitest';
import { describe as context } from '@vitest/runner';
import {  Mission, Skill } from '../../../../lib/domain/models/index.js';
import * as missionValidator from '../../../../lib/domain/services/mission-validator.js';
import { InvalidMissionContentError, MissionIntroductionMediaError } from '../../../../lib/domain/errors.js';
import { airtableBuilder } from '../../../test-helper.js';

describe('Integration | Validator | Mission', function() {
  describe('status validation', function() {
    describe('when requested mission status is not VALIDATED', function() {
      it('should not reject mission with not validated challenges', async () => {
        const mockedLearningContent = {
          skills: [
            airtableBuilder.factory.buildSkill({ id: 'skillTuto1', level: 1, tubeId: 'tubeTuto1' }),
          ],
          tubes: [
            airtableBuilder.factory.buildTube({ id: 'tubeTuto1', name: '@Pix1D-recherche_di' }),
          ],
          thematics: [
            airtableBuilder.factory.buildThematic({
              id: 'Thematic',
              tubeIds: ['tubeTuto1']
            }),]
        };
        airtableBuilder.mockLists(mockedLearningContent);

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
          createdAt: new Date('2023-12-25')
        });

        const promise = missionValidator.validate(mission);

        // then
        await expect(promise).resolves.not.toThrow();
      });
    });

    describe('when requested mission status is VALIDATED', function() {
      context('When there is no thematic', function() {
        it('throws InvalidMissionContentError', async () => {
          const mockedLearningContent = {
            tubes: [
              airtableBuilder.factory.buildTube({ id: 'tubeFromOtherThematic' }),
            ],
            thematics: [
              airtableBuilder.factory.buildThematic({
                id: 'Thematic',
                tubeIds: []
              })]
          };

          airtableBuilder.mockLists(mockedLearningContent);

          // given
          const mission = new Mission({
            name_i18n: { fr: 'Updated mission' },
            competenceId: 'QWERTY',
            thematicIds: '',
            learningObjectives_i18n: { fr: null },
            validatedObjectives_i18n: { fr: 'Très bien' },
            status: Mission.status.VALIDATED,
            createdAt: new Date('2023-12-25')
          });

          // when
          const promise = missionValidator.validate(mission);

          // then
          await expect(promise).rejects.to.deep.equal(new InvalidMissionContentError('La mission ne peut pas être mise à jour car elle n\'a pas de thématique'));
        });
      });

      context('When there is no tubes', function() {
        it('throws InvalidMissionContentError', async () => {
          const mockedLearningContent = {
            tubes: [
              airtableBuilder.factory.buildTube({ id: 'tubeFromOtherThematic' }),
            ],
            thematics: [
              airtableBuilder.factory.buildThematic({
                id: 'Thematic',
                tubeIds: []
              })]
          };

          airtableBuilder.mockLists(mockedLearningContent);

          // given
          const mission = new Mission({
            name_i18n: { fr: 'Updated mission' },
            competenceId: 'QWERTY',
            thematicIds: 'Thematic',
            learningObjectives_i18n: { fr: null },
            validatedObjectives_i18n: { fr: 'Très bien' },
            status: Mission.status.VALIDATED,
            createdAt: new Date('2023-12-25')
          });

          // when
          const promise = missionValidator.validate(mission);

          // then
          await expect(promise).rejects.to.deep.equal(new InvalidMissionContentError('La mission ne peut pas être mise à jour car elle n\'a pas de sujet'));
        });
      });

      describe('Skill cases', () => {
        context('when a skill has 2 versions including one with "ACTIF" status', function() {
          it('should not return a warning', async () => {
            const skill1 = airtableBuilder.factory.buildSkill({
              id: 'skillTuto1',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.ACTIF
            });
            const skill1Bis = airtableBuilder.factory.buildSkill({
              id: 'skillTuto1Bis',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.EN_CONSTRUCTION
            });

            const mockedLearningContent = {
              skills: [skill1, skill1Bis],
              tubes: [
                airtableBuilder.factory.buildTube({ id: 'tubeTuto', name: '@Pix1D-recherche_di' }),
              ],
              thematics: [
                airtableBuilder.factory.buildThematic({
                  id: 'Thematic1',
                  tubeIds: ['tubeTuto']
                }),
              ],
            };

            airtableBuilder.mockLists(mockedLearningContent);

            // given
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
              createdAt: new Date('2023-12-25')
            });

            // when
            const warnings = await missionValidator.validate(mission);

            // then
            expect(warnings).to.deep.equal([]);
          });
        });
        context('when a skill has versions with only "ARCHIVE" or "PERIME" statuses', function() {
          it('should not return a warning', async () => {
            const skill1 = airtableBuilder.factory.buildSkill({
              id: 'skillTuto1',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.ARCHIVE
            });
            const skill1Bis = airtableBuilder.factory.buildSkill({
              id: 'skillTuto1Bis',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.PERIME
            });

            const mockedLearningContent = {
              skills: [skill1, skill1Bis],
              tubes: [
                airtableBuilder.factory.buildTube({ id: 'tubeTuto', name: '@Pix1D-recherche_di' }),
              ],
              thematics: [
                airtableBuilder.factory.buildThematic({
                  id: 'Thematic1',
                  tubeIds: ['tubeTuto']
                }),
              ],
            };

            airtableBuilder.mockLists(mockedLearningContent);

            // given
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
              createdAt: new Date('2023-12-25')
            });

            // when
            const warnings = await missionValidator.validate(mission);

            // then
            expect(warnings).to.deep.equal([]);
          });
        });
        context('when a skill has a "en construction" status version but no "actif" status version', function() {
          it('should return a warning', async () => {
            const skill1 = airtableBuilder.factory.buildSkill({
              id: 'skillTuto1',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.ACTIF
            });
            const skill1Bis = airtableBuilder.factory.buildSkill({
              id: 'skillTuto1Bis',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.EN_CONSTRUCTION
            });
            const skill2 = airtableBuilder.factory.buildSkill({
              id: 'skillTuto2',
              level: 2,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.EN_CONSTRUCTION
            });

            const mockedLearningContent = {
              skills: [skill1, skill1Bis, skill2],
              tubes: [
                airtableBuilder.factory.buildTube({ id: 'tubeTuto', name: '@Pix1D-recherche_di' }),
              ],
              thematics: [
                airtableBuilder.factory.buildThematic({
                  id: 'Thematic1',
                  tubeIds: ['tubeTuto']
                }),
              ],
            };

            airtableBuilder.mockLists(mockedLearningContent);

            // given
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
              createdAt: new Date('2023-12-25')
            });

            // when
            const warnings = await missionValidator.validate(mission);

            // then
            expect(warnings).to.deep.equal(['L\'activité \'@Pix1D-recherche_di\' n\'a pas d\'acquis actif pour le niveau 2.']);
          });
        });
        context('when there is several skills with "en construction"', function() {
          it('should return multiple warnings', async () => {
            const skill1 = airtableBuilder.factory.buildSkill({
              id: 'skillTuto1',
              level: 1,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.EN_CONSTRUCTION
            });
            const skill2 = airtableBuilder.factory.buildSkill({
              id: 'skillTuto2',
              level: 2,
              tubeId: 'tubeTuto',
              status: Skill.STATUSES.EN_CONSTRUCTION
            });

            const mockedLearningContent = {
              skills: [skill1, skill2],
              tubes: [
                airtableBuilder.factory.buildTube({ id: 'tubeTuto', name: '@Pix1D-recherche_di' }),
              ],
              thematics: [
                airtableBuilder.factory.buildThematic({
                  id: 'Thematic1',
                  tubeIds: ['tubeTuto']
                }),
              ],
            };

            airtableBuilder.mockLists(mockedLearningContent);

            // given
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
              createdAt: new Date('2023-12-25')
            });

            // when
            const warnings = await missionValidator.validate(mission);

            // then
            expect(warnings).to.deep.equal(
              [
                'L\'activité \'@Pix1D-recherche_di\' n\'a pas d\'acquis actif pour le niveau 1.',
                'L\'activité \'@Pix1D-recherche_di\' n\'a pas d\'acquis actif pour le niveau 2.'
              ]);
          });
        });
      });
    });
  });

  describe('introduction media validation', function() {
    context('When the mission has a media url without a type', function() {
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
          createdAt: new Date('2023-12-25')
        });

        // when
        const promise = missionValidator.validate(missionToSave);

        // then
        await expect(promise).rejects.to.deep.equal(new MissionIntroductionMediaError('Opération impossible car la mission n\'a pas de type pour le media d\'introduction.'));

      });
    });
    context('When the mission has a media type without an url', function() {
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
          createdAt: new Date('2023-12-25')
        });

        // when
        const promise = missionValidator.validate(missionToSave);

        // then
        await expect(promise).rejects.to.deep.equal(new MissionIntroductionMediaError('Opération impossible car la mission ne peut avoir de type de média sans URL pour ce dernier.'));

      });
    });
  });
});

