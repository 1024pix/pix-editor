import { beforeEach, describe as context, describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { transform as missionTransformer } from '../../../../lib/infrastructure/transformers/mission-transformer.js';
import { Challenge, Mission } from '../../../../lib/domain/models/index.js';
import { SkillForRelease } from '../../../../lib/domain/models/release/index.js';

describe('Unit | Transformer | mission-transformer', function() {
  describe('#listActive', function() {
    let challenges, skills, tubes, thematics;
    beforeEach(async function() {
      challenges = [
        domainBuilder.buildChallenge({
          id: 'challengeTuto1',
          status: Challenge.STATUSES.VALIDE,
          skillId: 'skillTuto1'
        }),
        domainBuilder.buildChallenge({
          id: 'challengeTraining1',
          status: Challenge.STATUSES.VALIDE,
          skillId: 'skillTraining1'
        }),
        domainBuilder.buildChallenge({
          id: 'challengeValidation1',
          status: Challenge.STATUSES.VALIDE,
          skillId: 'skillValidation1'
        }),
        domainBuilder.buildChallenge({
          id: 'challengeTuto2',
          status: Challenge.STATUSES.VALIDE,
          skillId: 'skillTuto2'
        }),
        domainBuilder.buildChallenge({
          id: 'challengeTraining2',
          status: Challenge.STATUSES.VALIDE,
          skillId: 'skillTraining2'
        }),
        domainBuilder.buildChallenge({
          id: 'challengeValidation2',
          status: Challenge.STATUSES.VALIDE,
          skillId: 'skillValidation2'
        }),
        domainBuilder.buildChallenge({
          id: 'challengeDare',
          status: Challenge.STATUSES.VALIDE,
          skillId: 'skillDare'
        }),
      ];
      skills = [
        domainBuilder.buildSkill({ id: 'skillTuto1', level: 1, tubeId: 'tubeTuto1' }),
        domainBuilder.buildSkill({ id: 'skillTraining1', level: 1, tubeId: 'tubeTraining1' }),
        domainBuilder.buildSkill({ id: 'skillValidation1', level: 1, tubeId: 'tubeValidation1' }),
        domainBuilder.buildSkill({ id: 'skillTuto2', level: 1, tubeId: 'tubeTuto2' }),
        domainBuilder.buildSkill({ id: 'skillTraining2', level: 1, tubeId: 'tubeTraining2' }),
        domainBuilder.buildSkill({ id: 'skillValidation2', level: 1, tubeId: 'tubeValidation2' }),
        domainBuilder.buildSkill({ id: 'skillDare', level: 1, tubeId: 'tubeDare' }),
      ];
      tubes = [
        domainBuilder.buildTube({ id: 'tubeTuto1', name: '@Pix1D-recherche_di' }),
        domainBuilder.buildTube({ id: 'tubeTraining1', name: '@Pix1D-recherche_en' }),
        domainBuilder.buildTube({ id: 'tubeValidation1', name: '@Pix1D-recherche_va' }),
        domainBuilder.buildTube({ id: 'tubeTuto2', name: '@Pix1D-recherche-2_di' }),
        domainBuilder.buildTube({ id: 'tubeTraining2', name: '@Pix1D-recherche-2_en' }),
        domainBuilder.buildTube({ id: 'tubeValidation2', name: '@Pix1D-recherche-2_va' }),
        domainBuilder.buildTube({ id: 'tubeDare', name: '@Pix1D-recherche_de' }),
      ];
      thematics = [
        domainBuilder.buildThematic({
          id: 'thematicStep1',
          tubeIds: ['tubeTuto1', 'tubeTraining1', 'tubeValidation1']
        }),
        domainBuilder.buildThematic({
          id: 'thematicStep2',
          tubeIds: ['tubeTuto2', 'tubeTraining2', 'tubeValidation2']
        }),
        domainBuilder.buildThematic({
          id: 'thematicDefi',
          tubeIds: ['tubeDare']
        }),
        domainBuilder.buildThematic({
          id: 'thematicDefiVide',
          tubeIds: [],
        })
      ];

    });

    context('with inactive, proposal, and active challenges', function() {
      context('when mission is EXPERIMENTAL', function() {
        it('should return proposal and active challenges only', function() {
          challenges = [
            domainBuilder.buildChallenge({
              id: 'challengeValidationValidé',
              status: Challenge.STATUSES.VALIDE,
              skillId: 'skillValidation1'
            }),
            domainBuilder.buildChallenge({
              id: 'challengeValidationProposé',
              status: Challenge.STATUSES.PROPOSE,
              skillId: 'skillValidation1'
            }),
            domainBuilder.buildChallenge({
              id: 'challengeValidationPérimé',
              status: Challenge.STATUSES.PERIME,
              skillId: 'skillValidation1'
            }),
            domainBuilder.buildChallenge({
              id: 'challengeValidationArchivé',
              status: Challenge.STATUSES.ARCHIVE,
              skillId: 'skillValidation1'
            }),
          ];

          const missions = [domainBuilder.buildMission({
            id: 2,
            name: 'Alt name',
            status: Mission.status.EXPERIMENTAL,
            learningObjectives: 'Alt objectives',
            validatedObjectives: 'Alt validated objectives',
            thematicIds: 'thematicStep1,thematicDefiVide',
            competenceId: 'competenceId',
            createdAt: new Date('2010-01-04'),
          })];

          const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

          expect(result).to.deep.equal([{
            id: 2,
            name_i18n: { fr: 'Alt name' },
            competenceId: 'competenceId',
            thematicIds: 'thematicStep1,thematicDefiVide',
            learningObjectives_i18n: { fr: 'Alt objectives' },
            validatedObjectives_i18n: { fr: 'Alt validated objectives' },
            introductionMediaUrl: null,
            introductionMediaAlt: null,
            introductionMediaType: null,
            documentationUrl: null,
            status: Mission.status.EXPERIMENTAL,
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
          }]);
        });
      });

      context('when mission is validated', function() {
        it('should return active challenges only', async function() {
          challenges = [
            domainBuilder.buildChallenge({
              id: 'challengeValidationValidé',
              status: Challenge.STATUSES.VALIDE,
              skillId: 'skillValidation1'
            }),
            domainBuilder.buildChallenge({
              id: 'challengeValidationProposé',
              status: Challenge.STATUSES.PROPOSE,
              skillId: 'skillValidation1'
            }),
            domainBuilder.buildChallenge({
              id: 'challengeValidationPérimé',
              status: Challenge.STATUSES.PERIME,
              skillId: 'skillValidation1'
            }),
            domainBuilder.buildChallenge({
              id: 'challengeValidationArchivé',
              status: Challenge.STATUSES.ARCHIVE,
              skillId: 'skillValidation1'
            }),
          ];

          const missions = [domainBuilder.buildMission({
            id: 2,
            competenceId: 'competenceId',
            name: 'Alt name',
            status: Mission.status.VALIDATED,
            learningObjectives: 'Alt objectives',
            validatedObjectives: 'Alt validated objectives',
            thematicIds: 'thematicStep1,thematicDefiVide',
            createdAt: new Date('2010-01-04'),
          })];

          const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

          expect(result).to.deep.equal([{
            id: 2,
            name_i18n: { fr: 'Alt name' },
            competenceId: 'competenceId',
            thematicIds: 'thematicStep1,thematicDefiVide',
            learningObjectives_i18n: { fr: 'Alt objectives' },
            validatedObjectives_i18n: { fr: 'Alt validated objectives' },
            introductionMediaUrl: null,
            introductionMediaAlt: null,
            introductionMediaType: null,
            documentationUrl: null,
            status: Mission.status.VALIDATED,
            createdAt: new Date('2010-01-04'),
            content: {
              steps: [{
                tutorialChallenges: [],
                trainingChallenges: [],
                validationChallenges: [
                  ['challengeValidationValidé'],
                ],
              }],
              dareChallenges: [],
            },
          }]);
        });

      });
    });

    context('with inactive, proposal, and active skills', async function() {
      it('should return in progress and active skill challenges only', async function() {
        challenges = [
          domainBuilder.buildChallenge({
            id: 'challengeSkillActif',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation1Active'
          }),
          domainBuilder.buildChallenge({
            id: 'challengeSkillEnConstruction',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation2InProgress'
          }),
          domainBuilder.buildChallenge({
            id: 'challengeSkillPérimé',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation3Deprecated'
          }),
          domainBuilder.buildChallenge({
            id: 'challengeSkillArchivé',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation3Archived'
          }),
        ];
        skills = [
          domainBuilder.buildSkill({ id: 'skillTuto1', level: 1, tubeId: 'tubeTuto1' }),
          domainBuilder.buildSkill({ id: 'skillTraining1', level: 1, tubeId: 'tubeTraining1' }),
          domainBuilder.buildSkill({
            id: 'skillValidation1Active',
            status: SkillForRelease.STATUSES.ACTIF,
            level: 1,
            tubeId: 'tubeValidation1'
          }),
          domainBuilder.buildSkill({
            id: 'skillValidation2InProgress',
            status: SkillForRelease.STATUSES.EN_CONSTRUCTION,
            level: 2,
            tubeId: 'tubeValidation1'
          }),
          domainBuilder.buildSkill({
            id: 'skillValidation3Deprecated',
            status: SkillForRelease.STATUSES.PERIME,
            level: 3,
            tubeId: 'tubeValidation1'
          }),
          domainBuilder.buildSkill({
            id: 'skillValidation3Archived',
            status: SkillForRelease.STATUSES.ARCHIVE,
            level: 4,
            tubeId: 'tubeValidation1'
          }),
          domainBuilder.buildSkill({ id: 'skillTuto2', level: 1, tubeId: 'tubeTuto2' }),
          domainBuilder.buildSkill({ id: 'skillTraining2', level: 1, tubeId: 'tubeTraining2' }),
          domainBuilder.buildSkill({ id: 'skillValidation2', level: 1, tubeId: 'tubeValidation2' }),
          domainBuilder.buildSkill({ id: 'skillDare', level: 1, tubeId: 'tubeDare' }),
        ];

        const missions = [domainBuilder.buildMission({
          id: 2,
          competenceId: 'competenceId',
          name: 'Alt name',
          status: Mission.status.VALIDATED,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
          createdAt: new Date('2010-01-04'),
        })];

        const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

        expect(result).to.deep.equal([{
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          introductionMediaUrl: null,
          introductionMediaAlt: null,
          introductionMediaType: null,
          documentationUrl: null,
          status: Mission.status.VALIDATED,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [{
              tutorialChallenges: [],
              trainingChallenges: [],
              validationChallenges: [
                ['challengeSkillActif'],
                ['challengeSkillEnConstruction'],
              ],
            }],
            dareChallenges: [],
          },
        }]);
      });
    });

    context('with multiple challenges in activities', async function() {
      it('should return ordered challenges', async function() {
        challenges = [
          domainBuilder.buildChallenge({
            id: 'secondChallengeValidation',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation2'
          }),
          domainBuilder.buildChallenge({
            id: 'firstChallengeValidation',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation1'
          }),
          domainBuilder.buildChallenge({
            id: 'fourthChallengeValidation',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation4'
          }),
          domainBuilder.buildChallenge({
            id: 'thirdChallengeValidation',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation3'
          }),
        ];
        skills = [
          domainBuilder.buildSkill({ id: 'skillValidation2', level: 2, tubeId: 'tubeValidation1' }),
          domainBuilder.buildSkill({ id: 'skillValidation1', level: 1, tubeId: 'tubeValidation1' }),
          domainBuilder.buildSkill({ id: 'skillValidation4', level: 4, tubeId: 'tubeValidation1' }),
          domainBuilder.buildSkill({ id: 'skillValidation3', level: 3, tubeId: 'tubeValidation1' }),
        ];

        const missions = [domainBuilder.buildMission({
          id: 2,
          competenceId: 'competenceId',
          name: 'Alt name',
          status: Mission.status.VALIDATED,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
          createdAt: new Date('2010-01-04'),
        })];

        const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

        expect(result).to.deep.equal([{
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          introductionMediaUrl: null,
          introductionMediaAlt: null,
          introductionMediaType: null,
          documentationUrl: null,
          status: Mission.status.VALIDATED,
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
        }]);
      });
    });

    context('with alternative challenges in activities', async function() {
      it('should return ordered alternative challenges', async function() {
        challenges = [
          domainBuilder.buildChallenge({
            id: 'secondAltChallengeValidation',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation1',
            alternativeVersion: 1
          }),
          {
            ...domainBuilder.buildChallenge({
              id: 'firstAltChallengeValidation',
              status: Challenge.STATUSES.VALIDE,
              skillId: 'skillValidation1',
            }),
            alternativeVersion: undefined,
          },
          domainBuilder.buildChallenge({
            id: 'fourthAltChallengeValidation',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation1',
            alternativeVersion: 3
          }),
          domainBuilder.buildChallenge({
            id: 'thirdAltChallengeValidation',
            status: Challenge.STATUSES.VALIDE,
            skillId: 'skillValidation1',
            alternativeVersion: 2
          }),
        ];
        skills = [
          domainBuilder.buildSkill({ id: 'skillValidation1', level: 1, tubeId: 'tubeValidation1' }),
        ];

        const missions = [domainBuilder.buildMission({
          id: 2,
          competenceId: 'competenceId',
          name: 'Alt name',
          status: Mission.status.VALIDATED,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
          createdAt: new Date('2010-01-04'),
        })];

        const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

        expect(result).to.deep.equal([{
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          status: Mission.status.VALIDATED,
          introductionMediaUrl: null,
          introductionMediaType: null,
          introductionMediaAlt: null,
          documentationUrl: null,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [{
              tutorialChallenges: [],
              trainingChallenges: [],
              validationChallenges: [
                ['firstAltChallengeValidation', 'secondAltChallengeValidation', 'thirdAltChallengeValidation', 'fourthAltChallengeValidation'],
              ],
            }],
            dareChallenges: [],
          },
        }]);
      });
    });

    context('Without challenges for skills', async function() {
      it('Should return missions', async function() {
        challenges = [];

        const missions = [domainBuilder.buildMission({
          id: 2,
          competenceId: 'competenceId',
          name: 'Alt name',
          status: Mission.status.VALIDATED,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
          createdAt: new Date('2010-01-04'),
        })];

        const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

        expect(result).to.deep.equal([{
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          introductionMediaUrl: null,
          introductionMediaType: null,
          introductionMediaAlt: null,
          documentationUrl: null,
          status: Mission.status.VALIDATED,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [{
              trainingChallenges: [],
              validationChallenges: [],
              tutorialChallenges: [],
            }],
            dareChallenges: [],
          }
        }]);

      });
    });
    context('Without skills in tubes', async function() {
      it('Should return missions', async function() {
        skills = [];

        const missions = [domainBuilder.buildMission({
          id: 2,
          competenceId: 'competenceId',
          name: 'Alt name',
          status: Mission.status.VALIDATED,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
          createdAt: new Date('2010-01-04'),

        })];

        const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

        expect(result).to.deep.equal([{
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          introductionMediaUrl: null,
          introductionMediaAlt: null,
          introductionMediaType: null,
          documentationUrl: null,
          status: Mission.status.VALIDATED,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [{
              trainingChallenges: [],
              validationChallenges: [],
              tutorialChallenges: [],
            }],
            dareChallenges: [],
          }
        }]);
      });
    });
    context('Without tubes', async function() {
      it('Should return missions', async function() {
        tubes = [];

        const missions = [domainBuilder.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.VALIDATED,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
          competenceId: 'competenceId',
          createdAt: new Date('2010-01-04'),
        })];

        const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

        expect(result).to.deep.equal([{
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          introductionMediaUrl: null,
          introductionMediaType: null,
          introductionMediaAlt: null,
          documentationUrl: null,
          status: Mission.status.VALIDATED,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [],
            dareChallenges: [],
          }
        }]);

      });
    });
    context('Without tubes in thematic', async function() {
      it('Should return missions', async function() {
        thematics = [domainBuilder.buildThematic({
          id: 'thematicStep1',
          tubeIds: undefined
        }, { id: 'thematicDefiVide', tubeIds: undefined })];

        const missions = [domainBuilder.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.VALIDATED,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
          competenceId: 'competenceId',
          createdAt: new Date('2010-01-04'),
        })];

        const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

        expect(result).to.deep.equal([{
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          introductionMediaUrl: null,
          introductionMediaType: null,
          introductionMediaAlt: null,
          documentationUrl: null,
          status: Mission.status.VALIDATED,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [],
            dareChallenges: [],
          }
        }]);

      });
    });
    context('Without thematic', async function() {
      it('Should return missions', async function() {
        thematics = [];

        const missions = [domainBuilder.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.VALIDATED,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: 'thematicStep1,thematicDefiVide',
          competenceId: 'competenceId',
          createdAt: new Date('2010-01-04'),
        })];

        const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

        expect(result).to.deep.equal([{
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: 'thematicStep1,thematicDefiVide',
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          introductionMediaUrl: null,
          introductionMediaAlt: null,
          introductionMediaType: null,
          documentationUrl: null,
          status: Mission.status.VALIDATED,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [],
            dareChallenges: [],
          }
        }]);

      });
    });
    context('Without thematicID in mission', async function() {
      it('Should return missions', async function() {

        const missions = [domainBuilder.buildMission({
          id: 2,
          name: 'Alt name',
          status: Mission.status.VALIDATED,
          learningObjectives: 'Alt objectives',
          validatedObjectives: 'Alt validated objectives',
          thematicIds: null,
          competenceId: 'competenceId',
          createdAt: new Date('2010-01-04'),
        })];

        const result = missionTransformer({ missions, challenges, tubes, thematics, skills });

        expect(result).to.deep.equal([{
          id: 2,
          name_i18n: { fr: 'Alt name' },
          competenceId: 'competenceId',
          thematicIds: null,
          learningObjectives_i18n: { fr: 'Alt objectives' },
          validatedObjectives_i18n: { fr: 'Alt validated objectives' },
          introductionMediaUrl: null,
          introductionMediaType: null,
          introductionMediaAlt: null,
          documentationUrl: null,
          status: Mission.status.VALIDATED,
          createdAt: new Date('2010-01-04'),
          content: {
            steps: [],
            dareChallenges: [],
          }
        }]);
      });
    });
  });

});
