import { describe, expect, it } from 'vitest';
import {  serialize } from '../../../../../lib/infrastructure/serializers/jsonapi/competence-overview-serializer.js';
import { AtelierSkillVersionView, AtelierSkillView, CompetenceOverview, EnConstructionSkillView, EnProductionSkillView, ThematicOverview, TubeOverview } from '../../../../../lib/domain/readmodels/CompetenceOverview.js';

describe('Unit | Serializer | JSONAPI | challenge-serializer', () => {
  describe('#serialize', () => {
    it('should serialize a Challenge', () => {
      // given
      const competenceOverview = new CompetenceOverview({
        id: 'competenceOverviewId',
        locale: 'ao',
        name: 'competenceOverviewName',
        thematicOverviews: [
          new ThematicOverview({
            id: 'thematicOverviewId1',
            name: 'thematicOverviewName1',
            tubeOverviews: [
              new TubeOverview({
                id: 'tubeOverviewId1',
                name: 'tubeOverviewName1',
                atelierSkillViews: [
                  new AtelierSkillView({
                    name: 'atelierSkillViewName',
                    level: 666,
                    archivedPrototypesCount: 3469237895,
                    obsoletePrototypesCount: 1294672387,
                    proposedPrototypesCount: 9823789237,
                    validatedPrototypesCount: 1239719831,
                    atelierSkillVersionViews: [
                      new AtelierSkillVersionView({
                        id: 'atelierSkillVersionViewId1',
                        status: 'atelierSkillVersionViewStatus',
                      }),
                    ],
                  }),
                ],
                enConstructionSkillViews: [
                  new EnConstructionSkillView({
                    id: 'enConstructionSkillViewId1',
                    hintStatus: 'enConstructionSkillViewHintStatus',
                    learningMoreTutorialsCount: 49257492353,
                    level: 777,
                    name: 'enConstructionSkillViewName',
                    tutorialsCount: 6278345927,
                  }),
                ],
                enProductionSkillViews: [
                  new EnProductionSkillView({
                    id: 'enProductionSkillViewId1',
                    hintStatus: 'enProductionSkillViewHintStatus',
                    isProtoDeclinable: true,
                    learningMoreTutorialsCount: 23789468237,
                    level: 888,
                    name: 'enProductionSkillViewName',
                    proposedChallengesCount: 983756893,
                    prototypeId: 'enProductionSkillViewPrototypeId',
                    status: 'enProductionSkillViewStatus',
                    tutorialsCount: 213847923,
                    validatedChallengesCount: 9823742234,
                  }),
                ],
              }),
            ],
          }),
        ],
      });

      // when
      const payload = serialize(competenceOverview);

      // then
      expect(payload).toStrictEqual({
        data: {
          type: 'competence-overviews',
          id: 'competenceOverviewId',
          attributes: {
            locale: 'ao',
            name: 'competenceOverviewName',
          },
          relationships: {
            'thematic-overviews': {
              data: [
                {
                  type: 'thematic-overviews',
                  id: 'thematicOverviewId1',
                }
              ],
            },
          },
        },
        included: [
          {
            type: 'en-construction-skill-views',
            id: 'enConstructionSkillViewId1',
            attributes: {
              'hint-status': 'enConstructionSkillViewHintStatus',
              'learning-more-tutorials-count': 49257492353,
              level: 777,
              name: 'enConstructionSkillViewName',
              'tutorials-count': 6278345927,
            },
          },
          {
            type: 'en-production-skill-views',
            id: 'enProductionSkillViewId1',
            attributes: {
              'hint-status': 'enProductionSkillViewHintStatus',
              'is-proto-declinable': true,
              'learning-more-tutorials-count': 23789468237,
              level: 888,
              name: 'enProductionSkillViewName',
              'proposed-challenges-count': 983756893,
              'prototype-id': 'enProductionSkillViewPrototypeId',
              status: 'enProductionSkillViewStatus',
              'tutorials-count': 213847923,
              'validated-challenges-count': 9823742234,
            },
          },
          {
            type: 'atelier-skill-version-views',
            id: 'atelierSkillVersionViewId1',
            attributes: {
              status: 'atelierSkillVersionViewStatus',
            },
          },
          {
            type: 'atelier-skill-views',
            id: 'atelierSkillViewName',
            attributes: {
              name: 'atelierSkillViewName',
              level: 666,
              'archived-prototypes-count': 3469237895,
              'obsolete-prototypes-count': 1294672387,
              'proposed-prototypes-count': 9823789237,
              'validated-prototypes-count': 1239719831,
            },
            relationships: {
              'atelier-skill-version-views': {
                data: [
                  {
                    type: 'atelier-skill-version-views',
                    id: 'atelierSkillVersionViewId1',
                  },
                ],
              },
            },
          },
          {
            type: 'tube-overviews',
            id: 'tubeOverviewId1',
            attributes: {
              name: 'tubeOverviewName1',
            },
            relationships: {
              'atelier-skill-views': {
                data: [
                  {
                    type: 'atelier-skill-views',
                    id: 'atelierSkillViewName',
                  },
                ],
              },
              'en-construction-skill-views': {
                data: [
                  {
                    type: 'en-construction-skill-views',
                    id: 'enConstructionSkillViewId1',
                  },
                ],
              },
              'en-production-skill-views': {
                data: [
                  {
                    type: 'en-production-skill-views',
                    id: 'enProductionSkillViewId1',
                  },
                ],
              },
            },
          },
          {
            type: 'thematic-overviews',
            id: 'thematicOverviewId1',
            attributes: {
              name: 'thematicOverviewName1',
            },
            relationships: {
              'tube-overviews': {
                data: [
                  {
                    type: 'tube-overviews',
                    id: 'tubeOverviewId1',
                  },
                ],
              },
            },
          },
        ],
      });
    });
  });
});
