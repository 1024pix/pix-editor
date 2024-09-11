import { beforeEach, describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { LocalizedChallenge, Challenge, Skill, Thematic } from '../../../../lib/domain/models/index.js';
import {
  AtelierSkillVersionView,
  AtelierSkillView,
  CompetenceOverview,
  EnConstructionSkillView,
  EnProductionSkillView,
  ThematicOverview,
  TubeOverview,
} from '../../../../lib/domain/readmodels/index.js';

describe('Unit | Domain | CompetenceOverview', () => {
  describe('#static build', () => {
    const locale = 'fr';
    const altLocale = 'fr-fr';
    const wrongLocale = 'nl';
    let competence, thematicsForCompetence, thematicWorkbench, thematic1, thematic2, tubeWorkbench, tubesForCompetence;

    beforeEach(() => {
      competence = domainBuilder.buildCompetence({
        id: 'competenceId',
        name: 'Ma super competence',
      });
      tubeWorkbench = domainBuilder.buildTube({
        id: 'tubeWorkbenchId',
        name: '@workbench',
      });
      thematic1 = domainBuilder.buildThematic({
        id: 'thematic1Id',
        name_i18n: { 'fr' : 'thematic1Name' },
        competenceId: competence.id,
        tubeIds: undefined,
      });
      thematic2 = domainBuilder.buildThematic({
        id: 'thematic2Id',
        name_i18n: { 'fr' : 'thematic2Name' },
        competenceId: competence.id,
        tubeIds: undefined,
      });
      thematicWorkbench = domainBuilder.buildThematic({
        id: 'thematicWorkbenchId',
        name_i18n: { 'fr' : `${Thematic.WORKBENCH}_desfruits` },
        competenceId: competence.id,
        tubeIds: [tubeWorkbench.id],
      });
      thematicsForCompetence = [thematicWorkbench, thematic1, thematic2];
    });

    it('should not crash when there are no tubes in thematic', () => {
      // when
      const competenceOverview = CompetenceOverview.build({
        locale,
        competence,
        thematicsForCompetence,
        tubesForCompetence: [domainBuilder.buildTube({
          id: 'tubeABCId',
          name: '@tubeABC',
          competenceId: competence.id,
        })],
        skillsForCompetence: [],
        challengesForCompetence: [],
        tutorialsForCompetence: [],
      });

      // then
      const expectedCompetenceOverview = new CompetenceOverview({
        id: competence.id,
        name: competence.name_i18n['fr'],
        locale,
        thematicOverviews: [
          new ThematicOverview({
            id: thematic1.id,
            name: thematic1.name_i18n['fr'],
            tubeOverviews: [],
          }),
          new ThematicOverview({
            id: thematic2.id,
            name: thematic2.name_i18n['fr'],
            tubeOverviews: [],
          }),
        ],
      });

      expect(competenceOverview).toStrictEqual(expectedCompetenceOverview);
    });

    it('should not crash when there are no skills in tube', () => {
      // given
      const tubeABC = domainBuilder.buildTube({
        id: 'tubeABCId',
        name: '@tubeABC',
        competenceId: competence.id,
      });
      thematic1.tubeIds = ['tubeABCId'];

      // when
      const competenceOverview = CompetenceOverview.build({
        locale,
        competence,
        thematicsForCompetence: [thematic1],
        tubesForCompetence: [tubeABC],
        skillsForCompetence: [],
        challengesForCompetence: [],
        tutorialsForCompetence: [],
      });

      // then
      const expectedCompetenceOverview = new CompetenceOverview({
        id: competence.id,
        name: competence.name_i18n['fr'],
        locale,
        thematicOverviews: [
          new ThematicOverview({
            id: thematic1.id,
            name: thematic1.name_i18n['fr'],
            tubeOverviews: [
              new TubeOverview({
                id: 'tubeABCId',
                name: '@tubeABC',
                competenceId: competence.id,
                enProductionSkillViews: [],
                enConstructionSkillViews: [],
                atelierSkillViews: []
              })
            ],
          }),
        ],
      });

      expect(competenceOverview).toStrictEqual(expectedCompetenceOverview);
    });

    it('should not crash when there are no challenges in skill', () => {
      // given
      const tubeABC = domainBuilder.buildTube({
        id: 'tubeABCId',
        name: '@tubeABC',
        competenceId: competence.id,
      });
      thematic1.tubeIds = ['tubeABCId'];

      const skill = domainBuilder.buildSkill({
        id: 'archivedSkillId',
        name: `${tubeABC.name}1`,
        status: Skill.STATUSES.ARCHIVE,
        level: 1,
        hintStatus: Skill.HINT_STATUSES.NONE,
        tubeId: tubeABC.id,
      });

      // when
      const competenceOverview = CompetenceOverview.build({
        locale,
        competence,
        thematicsForCompetence: [thematic1],
        tubesForCompetence: [tubeABC],
        skillsForCompetence: [skill],
        challengesForCompetence: [],
        tutorialsForCompetence: [],
      });

      // then
      const expectedCompetenceOverview = new CompetenceOverview({
        id: competence.id,
        name: competence.name_i18n['fr'],
        locale,
        thematicOverviews: [
          new ThematicOverview({
            id: thematic1.id,
            name: thematic1.name_i18n['fr'],
            tubeOverviews: [
              new TubeOverview({
                id: 'tubeABCId',
                name: '@tubeABC',
                competenceId: competence.id,
                enProductionSkillViews: expect.any(Array),
                enConstructionSkillViews: expect.any(Array),
                atelierSkillViews: [
                  new AtelierSkillView({
                    name: skill.name,
                    level: skill.level,
                    validatedPrototypesCount: 0,
                    proposedPrototypesCount: 0,
                    archivedPrototypesCount: 0,
                    obsoletePrototypesCount: 0,
                    atelierSkillVersionViews: [
                      new AtelierSkillVersionView({
                        id: skill.id,
                        status: skill.status,
                      }),
                    ]
                  })
                ]
              })
            ],
          }),
        ],
      });

      expect(competenceOverview).toStrictEqual(expectedCompetenceOverview);
    });

    describe('EnConstruction view', () => {
      let tubeABC, tubeDEF, tubeGHI, tubeJKL;
      it('should build a CompetenceOverview readmodel and respect all the business rules to build the enconstruction view objects', () => {
        // given
        tubeABC = domainBuilder.buildTube({
          id: 'tubeABCId',
          name: '@tubeABC',
          competenceId: competence.id,
        });
        tubeDEF = domainBuilder.buildTube({
          id: 'tubeDEFId',
          name: '@tubeDEF',
          competenceId: competence.id,
        });
        thematic1.tubeIds = [tubeABC.id, tubeDEF.id];
        tubeGHI = domainBuilder.buildTube({
          id: 'tubeGHIId',
          name: '@tubeGHI',
          competenceId: competence.id,
        });
        tubeJKL = domainBuilder.buildTube({
          id: 'tubeJKLId',
          name: '@tubeJKL',
          competenceId: competence.id,
        });
        thematic2.tubeIds = [tubeGHI.id, tubeJKL.id];
        tubesForCompetence = [tubeWorkbench, tubeABC, tubeDEF, tubeGHI, tubeJKL];
        const tutorialABC_frfr = domainBuilder.buildTutorial({
          id: 'tutorialABC_frfr_id',
          locale: altLocale,
        });
        const tutorialDEF_fr = domainBuilder.buildTutorial({
          id: 'tutorialDEF_fr_id',
          locale: locale,
        });
        const tutorialGHI_nl = domainBuilder.buildTutorial({
          id: 'tutorialGHI_nl_id',
          locale: wrongLocale,
        });
        const tutorialJKL_fr = domainBuilder.buildTutorial({
          id: 'tutorialJKL_fr_id',
          locale: locale,
        });
        const skillWorkbench = domainBuilder.buildSkill({
          id: 'skillWorkbench',
          name: '@workbench',
          status: Skill.STATUSES.EN_CONSTRUCTION,
          version: 1,
          level: 1,
          hintStatus: Skill.HINT_STATUSES.NONE,
          tubeId: tubeWorkbench.id,
        });
        const skillTubeABC5_enconstruction_noversion = domainBuilder.buildSkill({
          id: 'skillTubeABC5_enconstruction_noversion_id',
          name: '@tubeABC5',
          status: Skill.STATUSES.EN_CONSTRUCTION,
          version: null,
          level: 5,
          hint_i18n: {
            [locale]: 'coucou'
          },
          hintStatus: Skill.HINT_STATUSES.A_RETRAVAILLER,
          tutorialIds: [tutorialABC_frfr.id, tutorialGHI_nl.id, tutorialJKL_fr.id],
          learningMoreTutorialIds: [],
          tubeId: tubeABC.id,
        });
        const skillTubeDEF2_enconstruction_noversion = domainBuilder.buildSkill({
          id: 'skillTubeDEF2_enconstruction_noversion_id',
          name: '@tubeDEF2',
          status: Skill.STATUSES.EN_CONSTRUCTION,
          version: null,
          level: 2,
          hint_i18n: {
            [locale]: 'coucou'
          },
          hintStatus: Skill.HINT_STATUSES.A_SOUMETTRE,
          tutorialIds: [tutorialGHI_nl.id],
          learningMoreTutorialIds: [],
          tubeId: tubeDEF.id,
        });
        const skillTubeDEF2_enconstruction_version1 = domainBuilder.buildSkill({
          id: 'skillTubeDEF2_enconstruction_version1_id',
          name: '@tubeDEF2',
          status: Skill.STATUSES.EN_CONSTRUCTION,
          version: 1,
          level: 2,
          hint_i18n: {
            [locale]: 'coucou'
          },
          hintStatus: Skill.HINT_STATUSES.PROPOSE,
          tutorialIds: [tutorialJKL_fr.id],
          learningMoreTutorialIds: [tutorialDEF_fr.id],
          tubeId: tubeDEF.id,
        });
        const skillTubeGHI4_enconstruction_version1 = domainBuilder.buildSkill({
          id: 'skillTubeGHI4_enconstruction_version1_id',
          name: '@tubeGHI4',
          status: Skill.STATUSES.EN_CONSTRUCTION,
          version: 1,
          level: 4,
          hint_i18n: {
            wrongLocal: 'coucou'
          },
          hintStatus: Skill.HINT_STATUSES.A_SOUMETTRE,
          tutorialIds: [],
          learningMoreTutorialIds: [],
          tubeId: tubeGHI.id,
        });
        const skillTubeGHI4_actif_version2 = domainBuilder.buildSkill({
          id: 'skillTubeGHI4_actif_version2_id',
          name: '@tubeGHI4',
          status: Skill.STATUSES.ACTIF,
          version: 2,
          level: 4,
          hint_i18n: {
            [locale]: 'coucou'
          },
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          tubeId: tubeGHI.id,
        });
        const challengeTubeGHI4 = domainBuilder.buildChallenge({
          skillId: skillTubeGHI4_actif_version2.id,
        });
        const skillTubeJKL3_actif_version1 = domainBuilder.buildSkill({
          id: 'skillTubeJKL3_actif_version1_id',
          name: '@tubeJKL',
          status: Skill.STATUSES.PERIME,
          version: 1,
          level: 3,
          hint_i18n: {
            [locale]: 'coucou'
          },
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          tubeId: tubeJKL.id,
        });
        const challengeTubeJKL3 = domainBuilder.buildChallenge({
          skillId: skillTubeJKL3_actif_version1.id,
        });
        const skillTubeJKL3_archive_version2 = domainBuilder.buildSkill({
          id: 'skillTubeJKL3_archive_version2_id',
          name: '@tubeJKL',
          status: Skill.STATUSES.ARCHIVE,
          version: 2,
          level: 3,
          hint_i18n: {
            [locale]: 'coucou'
          },
          hintStatus: Skill.HINT_STATUSES.A_SOUMETTRE,
          tubeId: tubeJKL.id,
        });
        const skillsForCompetence = [
          skillWorkbench,
          skillTubeABC5_enconstruction_noversion,
          skillTubeDEF2_enconstruction_noversion,
          skillTubeDEF2_enconstruction_version1,
          skillTubeGHI4_enconstruction_version1,
          skillTubeGHI4_actif_version2,
          skillTubeJKL3_actif_version1,
          skillTubeJKL3_archive_version2,
        ];
        const challengesForCompetence = [
          challengeTubeGHI4,
          challengeTubeJKL3,
        ];
        const tutorialsForCompetence = [
          tutorialABC_frfr,
          tutorialDEF_fr,
          tutorialGHI_nl,
          tutorialJKL_fr,
        ];

        // when
        const competenceOverview = CompetenceOverview.build({
          locale,
          competence,
          thematicsForCompetence,
          tubesForCompetence,
          skillsForCompetence,
          challengesForCompetence,
          tutorialsForCompetence,
        });
        const expectedCompetenceOverview = new CompetenceOverview({
          id: competence.id,
          name: competence.name_i18n['fr'],
          locale,
          thematicOverviews: [
            new ThematicOverview({
              id: thematic1.id,
              name: thematic1.name_i18n['fr'],
              tubeOverviews: [
                new TubeOverview({
                  id: tubeABC.id,
                  name: tubeABC.name,
                  enConstructionSkillViews: [
                    new EnConstructionSkillView({
                      id: skillTubeABC5_enconstruction_noversion.id,
                      name: skillTubeABC5_enconstruction_noversion.name,
                      level: skillTubeABC5_enconstruction_noversion.level,
                      hint: skillTubeABC5_enconstruction_noversion.hint_i18n[locale],
                      hintStatus: skillTubeABC5_enconstruction_noversion.hintStatus,
                      tutorialsCount: 2,
                      learningMoreTutorialsCount: 0,
                    }),
                  ],
                  atelierSkillViews: expect.any(Array),
                  enProductionSkillViews: expect.any(Array),
                }),
                new TubeOverview({
                  id: tubeDEF.id,
                  name: tubeDEF.name,
                  enConstructionSkillViews: [
                    new EnConstructionSkillView({
                      id: skillTubeDEF2_enconstruction_version1.id,
                      name: skillTubeDEF2_enconstruction_version1.name,
                      level: skillTubeDEF2_enconstruction_version1.level,
                      hint: skillTubeDEF2_enconstruction_version1.hint_i18n[locale],
                      hintStatus: skillTubeDEF2_enconstruction_version1.hintStatus,
                      tutorialsCount: 1,
                      learningMoreTutorialsCount: 1,
                    }),
                  ],
                  atelierSkillViews: expect.any(Array),
                  enProductionSkillViews: expect.any(Array),
                }),
              ],
            }),
            new ThematicOverview({
              id: thematic2.id,
              name: thematic2.name_i18n['fr'],
              tubeOverviews: [
                new TubeOverview({
                  id: tubeGHI.id,
                  name: tubeGHI.name,
                  enConstructionSkillViews: [
                    new EnConstructionSkillView({
                      id: skillTubeGHI4_enconstruction_version1.id,
                      name: skillTubeGHI4_enconstruction_version1.name,
                      level: skillTubeGHI4_enconstruction_version1.level,
                      hint: undefined,
                      hintStatus: skillTubeGHI4_enconstruction_version1.hintStatus,
                      tutorialsCount: 0,
                      learningMoreTutorialsCount: 0,
                    }),
                  ],
                  atelierSkillViews: expect.any(Array),
                  enProductionSkillViews: expect.any(Array),
                }),
                new TubeOverview({
                  id: tubeJKL.id,
                  name: tubeJKL.name,
                  enConstructionSkillViews: [],
                  atelierSkillViews: expect.any(Array),
                  enProductionSkillViews: expect.any(Array),
                }),
              ],
            }),
          ],
        });

        // then
        expect(competenceOverview).toStrictEqual(expectedCompetenceOverview);
      });
    });
    describe('EnProduction view', () => {
      it('should build a CompetenceOverview readmodel when there is only one tube with no active skills in it', () => {
        // given

        const tubeWithNoActiveSkill = domainBuilder.buildTube({
          id: 'tubeWithNoActiveSkillId',
          name: 'tubeWithNoActiveSkillName',
          competenceId: competence.id,
        });
        thematic1.tubeIds = [tubeWithNoActiveSkill.id];
        tubesForCompetence = [tubeWorkbench, tubeWithNoActiveSkill];
        const archivedSkill = domainBuilder.buildSkill({
          id: 'archivedSkillId',
          name: `${tubeWithNoActiveSkill.name}1`,
          status: Skill.STATUSES.ARCHIVE,
          level: 1,
          hintStatus: Skill.HINT_STATUSES.NONE,
          tubeId: tubeWithNoActiveSkill.id,
        });
        const enConstructionSkill = domainBuilder.buildSkill({
          id: 'enConstructionSkillId',
          name: `${tubeWithNoActiveSkill.name}1`,
          status: Skill.STATUSES.EN_CONSTRUCTION,
          level: 1,
          hintStatus: Skill.HINT_STATUSES.PRE_VALIDE,
          tubeId: tubeWithNoActiveSkill.id,
        });
        const perimeSkill = domainBuilder.buildSkill({
          id: 'perimeSkillId',
          name: `${tubeWithNoActiveSkill.name}1`,
          status: Skill.STATUSES.PERIME,
          level: 1,
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          tubeId: tubeWithNoActiveSkill.id,
        });

        const challengesForCompetence = [];
        const skillsForCompetence = [
          archivedSkill,
          enConstructionSkill,
          perimeSkill,
        ];
        const tutorialsForCompetence = [];

        // when
        const competenceOverview = CompetenceOverview.build({
          locale,
          competence,
          thematicsForCompetence,
          tubesForCompetence,
          skillsForCompetence,
          challengesForCompetence,
          tutorialsForCompetence,
        });
        const expectedCompetenceOverview = new CompetenceOverview({
          id: competence.id,
          name: competence.name_i18n['fr'],
          locale,
          thematicOverviews: [
            new ThematicOverview({
              id: thematic1.id,
              name: thematic1.name_i18n['fr'],
              tubeOverviews: [
                new TubeOverview({
                  id: tubeWithNoActiveSkill.id,
                  name: tubeWithNoActiveSkill.name,
                  enConstructionSkillViews: expect.any(Array),
                  atelierSkillViews: expect.any(Array),
                  enProductionSkillViews: [],
                }),
              ],
            }),
            new ThematicOverview({
              id: thematic2.id,
              name: thematic2.name_i18n['fr'],
              tubeOverviews: [],
            }),
          ],
        });
        expect(competenceOverview).toStrictEqual(expectedCompetenceOverview);
      });
      it('should build a CompetenceOverview readmodel when tube has an active skill with prototypes but the active one is not in the good language', () => {
        // given
        const tutorial_frfr = domainBuilder.buildTutorial({
          id: 'tutorial_frfr_id',
          locale: altLocale,
        });
        const tutorial_fr = domainBuilder.buildTutorial({
          id: 'tutorial_fr_id',
          locale: locale,
        });
        const tutorial_nl = domainBuilder.buildTutorial({
          id: 'tutorial_nl_id',
          locale: wrongLocale,
        });
        const tube = domainBuilder.buildTube({
          id: 'tubeId',
          name: 'tubeName',
          competenceId: competence.id,
        });
        thematic1.tubeIds = [tube.id];
        tubesForCompetence = [tubeWorkbench, tube];
        const actifSkill = domainBuilder.buildSkill({
          id: 'actifSkillId',
          name: `${tube.name}1`,
          status: Skill.STATUSES.ACTIF,
          level: 1,
          hint_i18n: {
            [locale]: 'coucou'
          },
          hintStatus: Skill.HINT_STATUSES.PRE_VALIDE,
          tubeId: tube.id,
          tutorialIds: [tutorial_frfr.id, tutorial_nl.id],
          learningMoreTutorialIds: [tutorial_fr.id],
        });
        const archivedPrototype = domainBuilder.buildChallenge({
          id: 'archivedPrototypeId',
          declinable: Challenge.DECLINABLES.FACILEMENT,
          status: Challenge.STATUSES.ARCHIVE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          skillId: actifSkill.id,
          locales: [locale],
          version: 1,
          localizedChallenges: [domainBuilder.buildLocalizedChallenge({ id: 'archivedPrototypeId', challengeId: 'archivedPrototypeId', locale: locale, status: LocalizedChallenge.STATUSES.PRIMARY })],
        });
        const proposePrototype = domainBuilder.buildChallenge({
          id: 'proposePrototypeId',
          declinable: Challenge.DECLINABLES.DIFFICILEMENT,
          status: Challenge.STATUSES.PROPOSE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          skillId: actifSkill.id,
          locales: [altLocale],
          version: 3,
          localizedChallenges: [domainBuilder.buildLocalizedChallenge({ id: 'proposePrototypeId', challengeId: 'proposePrototypeId', locale: altLocale, status: LocalizedChallenge.STATUSES.PRIMARY })],
        });
        const validePrototype = domainBuilder.buildChallenge({
          id: 'validePrototypeId',
          declinable: Challenge.DECLINABLES.NON,
          status: Challenge.STATUSES.VALIDE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          skillId: actifSkill.id,
          locales: [wrongLocale],
          version: 2,
          localizedChallenges: [domainBuilder.buildLocalizedChallenge({ id: 'validePrototypeId', challengeId: 'validePrototypeId', locale: wrongLocale, status: LocalizedChallenge.STATUSES.PRIMARY })],
        });

        const challengesForCompetence = [archivedPrototype, proposePrototype, validePrototype];
        const skillsForCompetence = [ actifSkill ];
        const tutorialsForCompetence = [tutorial_frfr, tutorial_fr, tutorial_nl];

        // when
        const competenceOverview = CompetenceOverview.build({
          locale,
          competence,
          thematicsForCompetence,
          tubesForCompetence,
          skillsForCompetence,
          challengesForCompetence,
          tutorialsForCompetence,
        });
        const expectedCompetenceOverview = new CompetenceOverview({
          id: competence.id,
          name: competence.name_i18n['fr'],
          locale,
          thematicOverviews: [
            new ThematicOverview({
              id: thematic1.id,
              name: thematic1.name_i18n['fr'],
              tubeOverviews: [
                new TubeOverview({
                  id: tube.id,
                  name: tube.name,
                  enConstructionSkillViews: expect.any(Array),
                  atelierSkillViews: expect.any(Array),
                  enProductionSkillViews: [
                    new EnProductionSkillView({
                      id: actifSkill.id,
                      name: actifSkill.name,
                      level: actifSkill.level,
                      status: actifSkill.status,
                      hint: actifSkill.hint_i18n[locale],
                      hintStatus: actifSkill.hintStatus,
                      prototypeId: validePrototype.id,
                      isProtoDeclinable: false,
                      validatedChallengesCount: 0,
                      proposedChallengesCount: 0,
                      tutorialsCount: 1,
                      learningMoreTutorialsCount: 1,
                    }),
                  ],
                }),
              ],
            }),
            new ThematicOverview({
              id: thematic2.id,
              name: thematic2.name_i18n['fr'],
              tubeOverviews: [],
            }),
          ],
        });
        expect(competenceOverview).toStrictEqual(expectedCompetenceOverview);
      });
      it('should build a CompetenceOverview readmodel when tube has an active skill with prototypes and declinaisons', () => {
        // given
        const tube = domainBuilder.buildTube({
          id: 'tubeId',
          name: 'tubeName',
          competenceId: competence.id,
        });
        thematic1.tubeIds = [tube.id];
        tubesForCompetence = [tubeWorkbench, tube];
        const actifSkill = domainBuilder.buildSkill({
          id: 'actifSkillId',
          name: `${tube.name}1`,
          status: Skill.STATUSES.ACTIF,
          level: 1,
          hint_i18n: {
            [locale]: 'coucou'
          },
          hintStatus: Skill.HINT_STATUSES.PRE_VALIDE,
          tubeId: tube.id,
        });
        const validePrototype = domainBuilder.buildChallenge({
          id: 'validePrototypeId',
          declinable: Challenge.DECLINABLES.NON,
          status: Challenge.STATUSES.VALIDE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          skillId: actifSkill.id,
          locales: [wrongLocale],
          version: 2,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({ id: 'validePrototypeId', challengeId: 'validePrototypeId', locale: wrongLocale, status: LocalizedChallenge.STATUSES.PRIMARY }),
            domainBuilder.buildLocalizedChallenge({ id: 'validePrototypeId_goodLocale', challengeId: 'validePrototypeId', locale: locale, status: LocalizedChallenge.STATUSES.PLAY }),
          ],
        });
        const valideDeclinaisonNotForPrototype = domainBuilder.buildChallenge({
          id: 'valideDeclinaisonNotForPrototypeId',
          status: Challenge.STATUSES.VALIDE,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          skillId: actifSkill.id,
          locales: [wrongLocale],
          version: validePrototype.version + 1,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({ id: 'valideDeclinaisonNotForPrototypeId', challengeId: 'valideDeclinaisonNotForPrototypeId', locale: wrongLocale, status: LocalizedChallenge.STATUSES.PRIMARY }),
            domainBuilder.buildLocalizedChallenge({ id: 'valideDeclinaisonNotForPrototypeId_goodLocale', challengeId: 'valideDeclinaisonNotForPrototypeId', locale: altLocale, status: LocalizedChallenge.STATUSES.PAUSE }),
          ],
        });
        const valideDeclinaisonWithProposedTranslationForPrototype = domainBuilder.buildChallenge({
          id: 'valideDeclinaisonWithProposedTranslationForPrototypeId',
          status: Challenge.STATUSES.VALIDE,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          skillId: actifSkill.id,
          locales: [wrongLocale],
          version: validePrototype.version,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({ id: 'valideDeclinaisonWithProposedTranslationForPrototypeId', challengeId: 'valideDeclinaisonWithProposedTranslationForPrototypeId', locale: wrongLocale, status: LocalizedChallenge.STATUSES.PRIMARY }),
            domainBuilder.buildLocalizedChallenge({ id: 'valideDeclinaisonWithProposedTranslationForPrototype_goodLocale', challengeId: 'valideDeclinaisonWithProposedTranslationForPrototypeId', locale: altLocale, status: LocalizedChallenge.STATUSES.PAUSE }),
          ],
        });
        const proposeDeclinaisonWithProposeTranslationForPrototype = domainBuilder.buildChallenge({
          id: 'proposeDeclinaisonWithProposeTranslationForPrototypeId',
          status: Challenge.STATUSES.PROPOSE,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          skillId: actifSkill.id,
          locales: [wrongLocale],
          version: validePrototype.version,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({ id: 'proposeDeclinaisonWithProposeTranslationForPrototypeId', challengeId: 'proposeDeclinaisonWithProposeTranslationForPrototypeId', locale: wrongLocale, status: LocalizedChallenge.STATUSES.PRIMARY }),
            domainBuilder.buildLocalizedChallenge({ id: 'proposeDeclinaisonWithProposeTranslationForPrototype_goodLocale', challengeId: 'proposeDeclinaisonWithProposeTranslationForPrototypeId', locale: altLocale, status: LocalizedChallenge.STATUSES.PAUSE }),
          ],
        });
        const valideDeclinaisonWithGoodLocaleForPrototype = domainBuilder.buildChallenge({
          id: 'valideDeclinaisonWithGoodLocaleForPrototypeId',
          status: Challenge.STATUSES.VALIDE,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          skillId: actifSkill.id,
          locales: [locale],
          version: validePrototype.version,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({ id: 'valideDeclinaisonWithGoodLocaleForPrototypeId', challengeId: 'valideDeclinaisonWithGoodLocaleForPrototypeId', locale: locale, status: LocalizedChallenge.STATUSES.PRIMARY }),
          ],
        });
        const proposeDeclinaisonWithGoodLocaleForPrototype = domainBuilder.buildChallenge({
          id: 'proposeDeclinaisonWithGoodLocaleForPrototypeId',
          status: Challenge.STATUSES.PROPOSE,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          skillId: actifSkill.id,
          locales: [altLocale],
          version: validePrototype.version,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({ id: 'proposeDeclinaisonWithGoodLocaleForPrototypeId', challengeId: 'proposeDeclinaisonWithGoodLocaleForPrototypeId', locale: altLocale, status: LocalizedChallenge.STATUSES.PRIMARY }),
          ],
        });

        const archiveDeclinaisonWithValidTranslationForPrototype = domainBuilder.buildChallenge({
          id: 'archiveDeclinaisonWithValidTranslationForPrototypeId',
          status: Challenge.STATUSES.ARCHIVE,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          skillId: actifSkill.id,
          locales: [wrongLocale],
          version: validePrototype.version,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({ id: 'archiveDeclinaisonWithValidTranslationForPrototypeId', challengeId: 'archiveDeclinaisonWithValidTranslationForPrototypeId', locale: wrongLocale, status: LocalizedChallenge.STATUSES.PRIMARY }),
            domainBuilder.buildLocalizedChallenge({ id: 'archiveDeclinaisonWithValidTranslationForPrototype_goodLocale', challengeId: 'archiveDeclinaisonWithValidTranslationForPrototypeId', locale: locale, status: LocalizedChallenge.STATUSES.PLAY }),
          ],
        });
        const perimeDeclinaisonWithValidTranslationForPrototype = domainBuilder.buildChallenge({
          id: 'perimeDeclinaisonWithProposedTranslationForPrototypeId',
          status: Challenge.STATUSES.PERIME,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          skillId: actifSkill.id,
          locales: [wrongLocale],
          version: validePrototype.version,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({ id: 'perimeDeclinaisonWithProposedTranslationForPrototypeId', challengeId: 'perimeDeclinaisonWithProposedTranslationForPrototypeId', locale: wrongLocale, status: LocalizedChallenge.STATUSES.PRIMARY }),
            domainBuilder.buildLocalizedChallenge({ id: 'perimeDeclinaisonWithProposedTranslationForPrototype_goodLocale', challengeId: 'perimeDeclinaisonWithProposedTranslationForPrototypeId', locale: locale, status: LocalizedChallenge.STATUSES.PLAY }),
          ],
        });

        const challengesForCompetence = [
          validePrototype,
          valideDeclinaisonWithProposedTranslationForPrototype,
          valideDeclinaisonNotForPrototype,
          proposeDeclinaisonWithProposeTranslationForPrototype,
          valideDeclinaisonWithGoodLocaleForPrototype,
          proposeDeclinaisonWithGoodLocaleForPrototype,
          archiveDeclinaisonWithValidTranslationForPrototype,
          perimeDeclinaisonWithValidTranslationForPrototype,
        ];
        const skillsForCompetence = [ actifSkill ];
        const tutorialsForCompetence = [];

        // when
        const competenceOverview = CompetenceOverview.build({
          locale,
          competence,
          thematicsForCompetence,
          tubesForCompetence,
          skillsForCompetence,
          challengesForCompetence,
          tutorialsForCompetence,
        });
        const expectedCompetenceOverview = new CompetenceOverview({
          id: competence.id,
          name: competence.name_i18n['fr'],
          locale,
          thematicOverviews: [
            new ThematicOverview({
              id: thematic1.id,
              name: thematic1.name_i18n['fr'],
              tubeOverviews: [
                new TubeOverview({
                  id: tube.id,
                  name: tube.name,
                  enConstructionSkillViews: expect.any(Array),
                  atelierSkillViews: expect.any(Array),
                  enProductionSkillViews: [
                    new EnProductionSkillView({
                      id: actifSkill.id,
                      name: actifSkill.name,
                      level: actifSkill.level,
                      status: actifSkill.status,
                      hint: actifSkill.hint_i18n[locale],
                      hintStatus: actifSkill.hintStatus,
                      prototypeId: validePrototype.id,
                      isProtoDeclinable: false,
                      validatedChallengesCount: 2,
                      proposedChallengesCount: 2,
                      tutorialsCount: 0,
                      learningMoreTutorialsCount: 0,
                    }),
                  ],
                }),
              ],
            }),
            new ThematicOverview({
              id: thematic2.id,
              name: thematic2.name_i18n['fr'],
              tubeOverviews: [],
            }),
          ],
        });
        expect(competenceOverview).toStrictEqual(expectedCompetenceOverview);
      });
    });
    describe('Atelier view', () => {
      let tubeABC, tubeDEF, tubeGHI;
      it('should build a CompetenceOverview readmodel and respect all the business rules to build the atelier view objects', () => {
        // given
        tubeABC = domainBuilder.buildTube({
          id: 'tubeABCId',
          name: '@tubeABC',
          competenceId: competence.id,
        });
        tubeDEF = domainBuilder.buildTube({
          id: 'tubeDEFId',
          name: '@tubeDEF',
          competenceId: competence.id,
        });
        thematic1.tubeIds = [tubeABC.id, tubeDEF.id];
        tubeGHI = domainBuilder.buildTube({
          id: 'tubeGHIId',
          name: '@tubeGHI',
          competenceId: competence.id,
        });
        thematic2.tubeIds = [tubeGHI.id];
        tubesForCompetence = [tubeWorkbench, tubeABC, tubeDEF, tubeGHI];
        const skillWorkbench = domainBuilder.buildSkill({
          id: 'skillWorkbench',
          name: '@workbench',
          status: Skill.STATUSES.EN_CONSTRUCTION,
          version: 1,
          level: 1,
          tubeId: tubeWorkbench.id,
        });
        const skillTubeABC5_enconstruction_noversion = domainBuilder.buildSkill({
          id: 'skillTubeABC5_enconstruction_noversion_id',
          name: '@tubeABC5',
          status: Skill.STATUSES.EN_CONSTRUCTION,
          version: null,
          level: 5,
          tubeId: tubeABC.id,
        });
        const skillTubeDEF2_archive_noversion = domainBuilder.buildSkill({
          id: 'skillTubeDEF2_archive_noversion_id',
          name: '@tubeDEF2',
          status: Skill.STATUSES.ARCHIVE,
          version: null,
          level: 2,
          tubeId: tubeDEF.id,
        });
        const challengeTubeDEF2_archive_prototype_perime =  domainBuilder.buildChallenge({
          id: `${skillTubeDEF2_archive_noversion.id}_prototype_perimeId`,
          skillId: skillTubeDEF2_archive_noversion.id,
          version: 1,
          status: Challenge.STATUSES.PERIME,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        });
        const challengeTubeDEF2_archive_prototype_archive =  domainBuilder.buildChallenge({
          id: `${skillTubeDEF2_archive_noversion.id}_prototype_archiveId`,
          skillId: skillTubeDEF2_archive_noversion.id,
          version: 2,
          status: Challenge.STATUSES.ARCHIVE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        });
        const challengeTubeDEF2_archive_declinaison_archive =  domainBuilder.buildChallenge({
          id: `${skillTubeDEF2_archive_noversion.id}_declinaison_archiveId`,
          skillId: skillTubeDEF2_archive_noversion.id,
          version: 2,
          status: Challenge.STATUSES.ARCHIVE,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
        });
        const skillTubeDEF2_perime_version1 = domainBuilder.buildSkill({
          id: 'skillTubeDEF2_perime_version1_id',
          name: '@tubeDEF2',
          status: Skill.STATUSES.PERIME,
          version: 1,
          level: 2,
          tubeId: tubeDEF.id,
        });
        const challengeTubeDEF2_perime_prototype_perime =  domainBuilder.buildChallenge({
          id: `${skillTubeDEF2_perime_version1.id}_prototype_perimeId`,
          skillId: skillTubeDEF2_perime_version1.id,
          version: 2,
          status: Challenge.STATUSES.PERIME,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        });
        const challengeTubeDEF2_perime_prototype_propose =  domainBuilder.buildChallenge({
          id: `${skillTubeDEF2_perime_version1.id}_prototype_proposeId`,
          skillId: skillTubeDEF2_perime_version1.id,
          version: 1,
          status: Challenge.STATUSES.PROPOSE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        });
        const skillTubeGHI4_archive_version1 = domainBuilder.buildSkill({
          id: 'skillTubeGHI4_archive_version1_id',
          name: '@tubeGHI4',
          status: Skill.STATUSES.ARCHIVE,
          version: 1,
          level: 4,
          tubeId: tubeGHI.id,
        });
        const challengeTubeGHI4_archive_prototype_archive =  domainBuilder.buildChallenge({
          id: `${skillTubeGHI4_archive_version1.id}_prototype_archiveId`,
          skillId: skillTubeGHI4_archive_version1.id,
          version: 1,
          status: Challenge.STATUSES.ARCHIVE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        });
        const skillTubeGHI4_actif_version2 = domainBuilder.buildSkill({
          id: 'skillTubeGHI4_actif_version2_id',
          name: '@tubeGHI4',
          status: Skill.STATUSES.ACTIF,
          version: 2,
          level: 4,
          tubeId: tubeGHI.id,
        });
        const challengeTubeGHI4_actif_prototype_archive1 =  domainBuilder.buildChallenge({
          id: `${skillTubeGHI4_actif_version2.id}_prototype_archiveId`,
          skillId: skillTubeGHI4_actif_version2.id,
          version: 1,
          status: Challenge.STATUSES.ARCHIVE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        });
        const challengeTubeGHI4_actif_prototype_archive2 =  domainBuilder.buildChallenge({
          id: `${skillTubeGHI4_actif_version2.id}_prototype_archiveId`,
          skillId: skillTubeGHI4_actif_version2.id,
          version: 2,
          status: Challenge.STATUSES.ARCHIVE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        });
        const challengeTubeGHI4_actif_prototype_valide =  domainBuilder.buildChallenge({
          id: `${skillTubeGHI4_actif_version2.id}_prototype_valideId`,
          skillId: skillTubeGHI4_actif_version2.id,
          version: 3,
          status: Challenge.STATUSES.VALIDE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        });
        const challengeTubeGHI4_actif_prototype_propose =  domainBuilder.buildChallenge({
          id: `${skillTubeGHI4_actif_version2.id}_prototype_proposeId`,
          skillId: skillTubeGHI4_actif_version2.id,
          version: 4,
          status: Challenge.STATUSES.PROPOSE,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        });
        const skillsForCompetence = [
          skillWorkbench,
          skillTubeABC5_enconstruction_noversion,
          skillTubeDEF2_archive_noversion,
          skillTubeDEF2_perime_version1,
          skillTubeGHI4_archive_version1,
          skillTubeGHI4_actif_version2,
        ];
        const challengesForCompetence = [
          challengeTubeDEF2_archive_prototype_perime,
          challengeTubeDEF2_archive_prototype_archive,
          challengeTubeDEF2_archive_declinaison_archive,
          challengeTubeDEF2_perime_prototype_perime,
          challengeTubeDEF2_perime_prototype_propose,
          challengeTubeGHI4_archive_prototype_archive,
          challengeTubeGHI4_actif_prototype_archive1,
          challengeTubeGHI4_actif_prototype_archive2,
          challengeTubeGHI4_actif_prototype_valide,
          challengeTubeGHI4_actif_prototype_propose,
        ];

        // when
        const competenceOverview = CompetenceOverview.build({
          locale,
          competence,
          thematicsForCompetence,
          tubesForCompetence,
          skillsForCompetence,
          challengesForCompetence,
          tutorialsForCompetence: [],
        });
        const expectedCompetenceOverview = new CompetenceOverview({
          id: competence.id,
          name: competence.name_i18n['fr'],
          locale,
          thematicOverviews: [
            new ThematicOverview({
              id: thematic1.id,
              name: thematic1.name_i18n['fr'],
              tubeOverviews: [
                new TubeOverview({
                  id: tubeABC.id,
                  name: tubeABC.name,
                  enProductionSkillViews: expect.any(Array),
                  enConstructionSkillViews: expect.any(Array),
                  atelierSkillViews: [
                    new AtelierSkillView({
                      name: skillTubeABC5_enconstruction_noversion.name,
                      level: skillTubeABC5_enconstruction_noversion.level,
                      validatedPrototypesCount: 0,
                      proposedPrototypesCount: 0,
                      archivedPrototypesCount: 0,
                      obsoletePrototypesCount: 0,
                      atelierSkillVersionViews: [
                        new AtelierSkillVersionView({
                          id: skillTubeABC5_enconstruction_noversion.id,
                          status: skillTubeABC5_enconstruction_noversion.status,
                        }),
                      ],
                    }),
                  ],
                }),
                new TubeOverview({
                  id: tubeDEF.id,
                  name: tubeDEF.name,
                  enProductionSkillViews: expect.any(Array),
                  enConstructionSkillViews: expect.any(Array),
                  atelierSkillViews: [
                    new AtelierSkillView({
                      name: skillTubeDEF2_archive_noversion.name,
                      level: skillTubeDEF2_archive_noversion.level,
                      validatedPrototypesCount: 0,
                      proposedPrototypesCount: 1,
                      archivedPrototypesCount: 1,
                      obsoletePrototypesCount: 2,
                      atelierSkillVersionViews: [
                        new AtelierSkillVersionView({
                          id: skillTubeDEF2_archive_noversion.id,
                          status: skillTubeDEF2_archive_noversion.status,
                        }),
                        new AtelierSkillVersionView({
                          id: skillTubeDEF2_perime_version1.id,
                          status: skillTubeDEF2_perime_version1.status,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new ThematicOverview({
              id: thematic2.id,
              name: thematic2.name_i18n['fr'],
              tubeOverviews: [
                new TubeOverview({
                  id: tubeGHI.id,
                  name: tubeGHI.name,
                  enProductionSkillViews: expect.any(Array),
                  enConstructionSkillViews: expect.any(Array),
                  atelierSkillViews: [
                    new AtelierSkillView({
                      name: skillTubeGHI4_archive_version1.name,
                      level: skillTubeGHI4_archive_version1.level,
                      validatedPrototypesCount: 1,
                      proposedPrototypesCount: 1,
                      archivedPrototypesCount: 3,
                      obsoletePrototypesCount: 0,
                      atelierSkillVersionViews: [
                        new AtelierSkillVersionView({
                          id: skillTubeGHI4_archive_version1.id,
                          status: skillTubeGHI4_archive_version1.status,

                        }),
                        new AtelierSkillVersionView({
                          id: skillTubeGHI4_actif_version2.id,
                          status: skillTubeGHI4_actif_version2.status,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
        expect(competenceOverview).toStrictEqual(expectedCompetenceOverview);
      });
    });
  });
});
