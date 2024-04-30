import { omit } from 'lodash';
import { describe, describe as context, beforeEach, expect, expectTypeOf, it } from 'vitest';
import { airtableBuilder, databaseBuilder, knex } from '../../../test-helper.js';
import {
  findAllMissions,
  save,
  list,
  getById,
} from '../../../../lib/infrastructure/repositories/mission-repository.js';
import { Mission } from '../../../../lib/domain/models/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | Repository | mission-repository', function() {

  beforeEach(async function() {
    await knex('translations').delete();
    await knex('missions').delete();
  });

  describe('#get', function() {
    context('When mission does not exists', function() {
      it('should throw a NotFoundError', async function() {
        const promise = getById(1);
        await expect(promise).rejects.to.deep.equal(new NotFoundError('Mission introuvable'));
      });
    });
    context('When mission exists', function() {
      it('should return the mission', async function() {
        databaseBuilder.factory.buildMission({ id: 1, status: Mission.status.ACTIVE });
        await databaseBuilder.commit();

        const result = await getById(1);

        expect(result).to.deep.equal(new Mission({
          id: 1,
          name_i18n: { fr: 'Ma première mission' },
          competenceId: 'competenceId',
          thematicIds: 'thematicIds',
          learningObjectives_i18n: { fr: 'Que tu sois le meilleur' },
          validatedObjectives_i18n: { fr: 'Rien' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
        }));
      });
    });
  });
  describe('#findAllMissions', function() {
    context('When there are missions', function() {
      it('should return all missions', async function() {
        databaseBuilder.factory.buildMission({ id: 1, status: Mission.status.ACTIVE });
        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.INACTIVE,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives'
        });
        await databaseBuilder.commit();

        const results = await findAllMissions({ filter: { isActive: false }, page: { number: 1, size: 20 } });

        expect(results.missions).to.deep.equal([new Mission({
          id: 1,
          name_i18n: { fr: 'Ma première mission' },
          competenceId: 'competenceId',
          thematicIds: 'thematicIds',
          learningObjectives_i18n: { fr: 'Que tu sois le meilleur' },
          validatedObjectives_i18n: { fr: 'Rien' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
        }), new Mission({
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicIds',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.INACTIVE,
          createdAt: new Date('2010-01-04'),
        })]);
        expect(results.meta).to.deep.equal({
          page: 1,
          pageSize: 20,
          rowCount: 2,
          pageCount: 1,
        });
      });
    });
    context('When there are no missions', function() {
      it('should return an empty list', async function() {

        const results = await findAllMissions({ filter: { isActive: false }, page: { number: 1, size: 20 } });

        expect(results.missions.length).to.equal(0);
        expect(results.meta).to.deep.equal({
          page: 1,
          pageSize: 20,
          rowCount: 0,
          pageCount: 0,
        });
      });
    });
    context('With isActive filter', function() {
      context('with results', function() {
        it('should return all active missions', async function() {
          const activeMission = databaseBuilder.factory.buildMission({ id: 1, status: Mission.status.ACTIVE });
          databaseBuilder.factory.buildMission({ id: 2, status: Mission.status.INACTIVE });
          await databaseBuilder.commit();

          const results = await findAllMissions({ filter: { isActive: true }, page: { number: 1, size: 20 } });

          expect(results.missions.length).to.equal(1);
          expect(results.missions[0].id).to.equal(activeMission.id);
          expect(results.meta).to.deep.equal({
            page: 1,
            pageSize: 20,
            rowCount: 1,
            pageCount: 1,
          });
        });
      });
      context('with no results', function() {
        it('should return an empty list of missions', async function() {
          databaseBuilder.factory.buildMission({ id: 1, status: Mission.status.INACTIVE });
          databaseBuilder.factory.buildMission({ id: 2, status: Mission.status.INACTIVE });
          await databaseBuilder.commit();

          const results = await findAllMissions({ filter: { isActive: true }, page: { number: 1, size: 20 } });

          expect(results.missions.length).to.equal(0);
          expect(results.meta).to.deep.equal({
            page: 1,
            pageSize: 20,
            rowCount: 0,
            pageCount: 0,
          });
        });
      });
    });
  });

  describe('#list', function()  {
    let mockedLearningContent;

    beforeEach(async function() {
      mockedLearningContent = {
        challenges: [
          airtableBuilder.factory.buildChallenge({ id: 'challengeTuto1', status: 'validé', skillId: 'skillTuto1' }),
          airtableBuilder.factory.buildChallenge({ id: 'challengeTraining1', status: 'validé', skillId: 'skillTraining1' }),
          airtableBuilder.factory.buildChallenge({ id: 'challengeValidation1', status: 'validé', skillId: 'skillValidation1' }),
          airtableBuilder.factory.buildChallenge({ id: 'challengeTuto2', status: 'validé', skillId: 'skillTuto2' }),
          airtableBuilder.factory.buildChallenge({ id: 'challengeTraining2', status: 'validé', skillId: 'skillTraining2' }),
          airtableBuilder.factory.buildChallenge({ id: 'challengeValidation2', status: 'validé', skillId: 'skillValidation2' }),
          airtableBuilder.factory.buildChallenge({ id: 'challengeDare', status: 'validé', skillId: 'skillDare' }),
        ],
        skills: [
          airtableBuilder.factory.buildSkill({ id: 'skillTuto1', level: 1, tubeId: 'tubeTuto1' }),
          airtableBuilder.factory.buildSkill({ id: 'skillTraining1', level: 1, tubeId: 'tubeTraining1' }),
          airtableBuilder.factory.buildSkill({ id: 'skillValidation1', level: 1, tubeId: 'tubeValidation1' }),
          airtableBuilder.factory.buildSkill({ id: 'skillTuto2', level: 1, tubeId: 'tubeTuto2' }),
          airtableBuilder.factory.buildSkill({ id: 'skillTraining2', level: 1, tubeId: 'tubeTraining2' }),
          airtableBuilder.factory.buildSkill({ id: 'skillValidation2', level: 1, tubeId: 'tubeValidation2' }),
          airtableBuilder.factory.buildSkill({ id: 'skillDare', level: 1, tubeId: 'tubeDare' }),
        ],
        tubes: [
          airtableBuilder.factory.buildTube({ id: 'tubeTuto1', name: '@Pix1D-recherche_di' }),
          airtableBuilder.factory.buildTube({ id: 'tubeTraining1', name: '@Pix1D-recherche_en' }),
          airtableBuilder.factory.buildTube({ id: 'tubeValidation1', name: '@Pix1D-recherche_va' }),
          airtableBuilder.factory.buildTube({ id: 'tubeTuto2', name: '@Pix1D-recherche-2_di' }),
          airtableBuilder.factory.buildTube({ id: 'tubeTraining2', name: '@Pix1D-recherche-2_en' }),
          airtableBuilder.factory.buildTube({ id: 'tubeValidation2', name: '@Pix1D-recherche-2_va' }),
          airtableBuilder.factory.buildTube({ id: 'tubeDare', name: '@Pix1D-recherche_de' }),
        ],
        thematics: [
          airtableBuilder.factory.buildThematic({
            id: 'thematicStep1',
            tubeIds: ['tubeTuto1', 'tubeTraining1', 'tubeValidation1']
          }),
          airtableBuilder.factory.buildThematic({
            id: 'thematicStep2',
            tubeIds: ['tubeTuto2', 'tubeTraining2', 'tubeValidation2']
          }),
          airtableBuilder.factory.buildThematic({
            id: 'thematicDefi',
            tubeIds: ['tubeDare']
          }),
          airtableBuilder.factory.buildThematic({
            id: 'thematicDefiVide',
            tubeIds: [],
          })
        ],
      };

    });

    it('should return all missions', async function() {
      airtableBuilder.mockLists(mockedLearningContent);

      buildLocalizedChallenges(mockedLearningContent);

      databaseBuilder.factory.buildMission({
        id: 2,
        name: 'Alt name',
        status: Mission.status.ACTIVE,
        learningObjectives: 'Alt objectives',
        validatedObjectives: 'Alt validated objectives',
        thematicIds: 'thematicStep1,thematicStep2,thematicDefi',
      });

      await databaseBuilder.commit();

      const result = await list();

      expect(result).to.deep.equal([new Mission({
        id: 2,
        name_i18n: { fr: 'Alt name' },
        competenceId: 'competenceId',
        thematicIds: 'thematicStep1,thematicStep2,thematicDefi',
        learningObjectives_i18n: { fr: 'Alt objectives' },
        validatedObjectives_i18n: { fr: 'Alt validated objectives' },
        status: Mission.status.ACTIVE,
        createdAt: new Date('2010-01-04'),
        content: {
          steps: [{
            tutorialChallenges: [
              ['challengeTuto1'],
            ],
            trainingChallenges: [
              ['challengeTraining1'],
            ],
            validationChallenges: [
              ['challengeValidation1'],
            ],
          },{
            tutorialChallenges: [
              ['challengeTuto2'],
            ],
            trainingChallenges: [
              ['challengeTraining2'],
            ],
            validationChallenges: [
              ['challengeValidation2'],
            ],
          }],
          dareChallenges: [
            ['challengeDare'],
          ],
        },
      })]);

    });

    context('with inactive, proposal, and active challenges', async function() {
      it('should return proposal and active challenges only', async function() {
        mockedLearningContent.challenges = [
          airtableBuilder.factory.buildChallenge({ id: 'challengeValidationValidé', status: 'validé', skillId: 'skillValidation1' }),
          airtableBuilder.factory.buildChallenge({ id: 'challengeValidationProposé', status: 'proposé', skillId: 'skillValidation1' }),
          airtableBuilder.factory.buildChallenge({ id: 'challengeValidationPérimé', status: 'périmé', skillId: 'skillValidation1' }),
          airtableBuilder.factory.buildChallenge({ id: 'challengeValidationArchivé', status: 'archivé', skillId: 'skillValidation1' }),
        ];
        airtableBuilder.mockLists(mockedLearningContent);

        buildLocalizedChallenges(mockedLearningContent);

        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.ACTIVE,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
        });

        await databaseBuilder.commit();

        const result = await list();

        expect(result).to.deep.equal([new Mission({
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [{
              tutorialChallenges: [],
              trainingChallenges: [],
              validationChallenges: [
                ['challengeValidationValidé', 'challengeValidationProposé'],
              ],
            }],
            dareChallenges: [],
          },
        })]);
      });
    });

    context('with multiple challenges in activities', async function() {
      it('should return ordered challenges', async function() {
        mockedLearningContent.challenges = [
          airtableBuilder.factory.buildChallenge({ id: 'secondChallengeValidation', status: 'validé', skillId: 'skillValidation2' }),
          airtableBuilder.factory.buildChallenge({ id: 'firstChallengeValidation', status: 'validé', skillId: 'skillValidation1' }),
          airtableBuilder.factory.buildChallenge({ id: 'fourthChallengeValidation', status: 'validé', skillId: 'skillValidation4' }),
          airtableBuilder.factory.buildChallenge({ id: 'thirdChallengeValidation', status: 'validé', skillId: 'skillValidation3' }),
        ];
        mockedLearningContent.skills = [
          airtableBuilder.factory.buildSkill({ id: 'skillValidation2', level: 2, tubeId: 'tubeValidation1' }),
          airtableBuilder.factory.buildSkill({ id: 'skillValidation1', level: 1, tubeId: 'tubeValidation1' }),
          airtableBuilder.factory.buildSkill({ id: 'skillValidation4', level: 4, tubeId: 'tubeValidation1' }),
          airtableBuilder.factory.buildSkill({ id: 'skillValidation3', level: 3, tubeId: 'tubeValidation1' }),
        ];
        airtableBuilder.mockLists(mockedLearningContent);

        buildLocalizedChallenges(mockedLearningContent);

        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.ACTIVE,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
        });

        await databaseBuilder.commit();

        const result = await list();

        expect(result).to.deep.equal([new Mission({
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [{
              tutorialChallenges: [],
              trainingChallenges: [],
              validationChallenges: [
                ['firstChallengeValidation'],
                ['secondChallengeValidation'],
                ['thirdChallengeValidation'],
                ['fourthChallengeValidation'],
              ],
            }],
            dareChallenges: [],
          },
        })]);
      });
    });

    context('Without challenges for skills', async function() {
      it('Should return missions', async function() {
        mockedLearningContent.challenges = [];
        airtableBuilder.mockLists(mockedLearningContent);

        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.ACTIVE,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
        });

        await databaseBuilder.commit();

        const result = await list();

        expect(result).to.deep.equal([new Mission({
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [{
              trainingChallenges: [],
              validationChallenges: [],
              tutorialChallenges: [],
            }]
          }
        })]);

      });
    });
    context('Without skills in tubes', async function() {
      it('Should return missions', async function() {
        mockedLearningContent.skills = [];
        airtableBuilder.mockLists(mockedLearningContent);

        buildLocalizedChallenges(mockedLearningContent);

        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.ACTIVE,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
        });

        await databaseBuilder.commit();

        const result = await list();

        expect(result).to.deep.equal([new Mission({
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [{
              trainingChallenges: [],
              validationChallenges: [],
              tutorialChallenges: [],
            }]
          }
        })]);
      });
    });
    context('Without tubes', async function() {
      it('Should return missions', async function() {
        mockedLearningContent.tubes = [];
        airtableBuilder.mockLists(mockedLearningContent);

        buildLocalizedChallenges(mockedLearningContent);

        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.ACTIVE,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
        });

        await databaseBuilder.commit();

        const result = await list();

        expect(result).to.deep.equal([new Mission({
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
        })]);

      });
    });
    context('Without tubes in thematic', async function() {
      it('Should return missions', async function() {
        mockedLearningContent.thematics = [ airtableBuilder.factory.buildThematic({ id: 'thematicStep1', tubeIds: undefined }, { id: 'thematicDefiVide', tubeIds: undefined }) ];
        airtableBuilder.mockLists(mockedLearningContent);

        buildLocalizedChallenges(mockedLearningContent);

        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.ACTIVE,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
        });

        await databaseBuilder.commit();

        const result = await list();

        expect(result).to.deep.equal([new Mission({
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
        })]);

      });
    });
    context('Without thematic', async function() {
      it('Should return missions', async function() {
        mockedLearningContent.thematics = [];
        airtableBuilder.mockLists(mockedLearningContent);

        buildLocalizedChallenges(mockedLearningContent);

        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.ACTIVE,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
        });

        await databaseBuilder.commit();

        const result = await list();

        expect(result).to.deep.equal([new Mission({
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
        })]);

      });
    });
    context('Without thematicID in mission', async function() {
      it('Should return missions', async function() {
        airtableBuilder.mockLists(mockedLearningContent);

        buildLocalizedChallenges(mockedLearningContent);

        databaseBuilder.factory.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.ACTIVE,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: null,
        });

        await databaseBuilder.commit();

        const result = await list();

        expect(result).to.deep.equal([new Mission({
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: null,
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.ACTIVE,
          createdAt: new Date('2010-01-04'),
        })]);
      });
    });
  });

  describe('#save', function() {
    context('Mission creation', function() {
      it('should store mission', async function() {
        const mission = new Mission({
          name_i18n: { fr: 'Mission impossible'  },
          competenceId: 'AZERTY',
          thematicIds: 'QWERTY',
          learningObjectives_i18n:  { fr: null },
          validatedObjectives_i18n: { fr: 'Très bien' },
          status: Mission.status.INACTIVE,
        });

        const savedMission = await save(mission);
        expectTypeOf(savedMission).toEqualTypeOf('Mission');
        expect(omit(savedMission, ['createdAt'])).to.deep.equal(omit(new Mission({ ...mission, id: savedMission.id }), ['createdAt']));

        const expectedMission = {
          id: savedMission.id,
          competenceId: 'AZERTY',
          thematicIds: 'QWERTY',
          status: Mission.status.INACTIVE,
        };

        const missionFromDb = await knex('missions').where({ id: savedMission.id }).first().select('competenceId', 'thematicIds', 'status', 'id');
        expect(missionFromDb).to.deep.equal(expectedMission);
      });

      it('should store I18n for mission', async function() {

        const mission = new Mission({
          name_i18n: { fr: 'Mission impossible'  },
          competenceId: 'AZERTY',
          thematicIds: 'QWERTY',
          learningObjectives_i18n:  { fr: 'au boulot' },
          validatedObjectives_i18n: { fr: 'Très bien' },
          status: Mission.status.INACTIVE,
        });

        const savedMission = await save(mission);

        const translations = [
          {
            key: `mission.${savedMission.id}.name`,
            locale: 'fr',
            value: 'Mission impossible'
          },
          {
            key: `mission.${savedMission.id}.learningObjectives`,
            locale: 'fr',
            value: 'au boulot',
          },
          {
            key: `mission.${savedMission.id}.validatedObjectives`,
            locale: 'fr',
            value: 'Très bien'
          }
        ];

        expect(await knex('translations').select('*')).to.deep.equal(translations);
      });
    });

    context('Update mission', function() {
      it('should update the mission', async function() {
        const savedMission = databaseBuilder.factory.buildMission({ name: 'saved mission', competenceId: 'AZERTY', status: Mission.status.ACTIVE });
        await databaseBuilder.commit();

        const missionToUpdate = new Mission({
          id: savedMission.id,
          name_i18n: { fr: 'Updated mission'  },
          competenceId: 'QWERTY',
          thematicIds: 'Thematic',
          learningObjectives_i18n:  { fr: null },
          validatedObjectives_i18n: { fr: 'Très bien' },
          status: Mission.status.INACTIVE,
        });

        const updatedMission = await save(missionToUpdate);

        expectTypeOf(updatedMission).toEqualTypeOf('Mission');
        expect(omit(updatedMission, ['createdAt'])).to.deep.equal(omit(new Mission({ ...missionToUpdate, id: updatedMission.id }), ['createdAt']));

        const expectedMission = {
          id: updatedMission.id,
          competenceId: 'QWERTY',
          thematicIds: 'Thematic',
          status: Mission.status.INACTIVE,
        };

        const missionFromDb = await knex('missions').where({ id: updatedMission.id }).first().select('competenceId', 'thematicIds', 'status', 'id');
        expect(missionFromDb).to.deep.equal(expectedMission);
      });

      it('should store I18n for mission', async function() {
        const savedMission = databaseBuilder.factory.buildMission({ name: 'saved mission', competenceId: 'AZERTY', status: Mission.status.ACTIVE });
        await databaseBuilder.commit();

        const missionToUpdate = new Mission({
          id: savedMission.id,
          name_i18n: { fr: 'Updated mission'  },
          competenceId: 'QWERTY',
          thematicIds: 'Thematic',
          learningObjectives_i18n:  { fr: 'Etre la boss' },
          validatedObjectives_i18n: { fr: 'intermédiaire' },
          status: Mission.status.INACTIVE,
        });

        const updatedMission = await save(missionToUpdate);

        const translations = [
          {
            key: `mission.${updatedMission.id}.name`,
            locale: 'fr',
            value: 'Updated mission'
          },
          {
            key: `mission.${updatedMission.id}.learningObjectives`,
            locale: 'fr',
            value: 'Etre la boss',
          },
          {
            key: `mission.${updatedMission.id}.validatedObjectives`,
            locale: 'fr',
            value: 'intermédiaire'
          }
        ];

        expect(await knex('translations').select('*')).to.deep.equal(translations);
      });
    });
  });
});

function buildLocalizedChallenges(mockedLearningContent) {
  mockedLearningContent.challenges.forEach((airtableChallenge) => {
    databaseBuilder.factory.buildLocalizedChallenge({
      id: airtableChallenge.fields['id persistant'],
      challengeId: airtableChallenge.fields['id persistant']
    });
  });
}

