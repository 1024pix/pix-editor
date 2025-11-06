import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { transformTube, transformTubes } from '../../../../lib/infrastructure/transformers/tube-transformer.js';
import { Challenge } from '../../../../lib/domain/models/Challenge.js';

describe('Unit | Infrastructure | tube-transformer', function() {
  describe('#transformTube', () => {
    it('transforms tube for release', function() {
      // given
      const tube = domainBuilder.buildTube({
        id: 'tube1',
        thematicId: 'thematic1',
        competenceId: 'competence1',
        name: '@test',
        practicalTitle_i18n: {
          fr: 'Titre',
          en: 'Title',
        },
        practicalDescription_i18n: {
          fr: 'La description',
          en: 'The description',
        },
        skillIds: ['skill1', 'skill2'],
      });
      const challenges = [
        domainBuilder.buildChallenge({
          skillId: 'skill1',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.VALIDE,
          responsive: Challenge.RESPONSIVES.SMARTPHONE,
        }),
        domainBuilder.buildChallenge({
          skillId: 'skill2',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.VALIDE,
          responsive: Challenge.RESPONSIVES.TABLETTE_ET_SMARTPHONE,
        }),
        domainBuilder.buildChallenge({
          skillId: 'skill3',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.VALIDE,
          responsive: Challenge.RESPONSIVES.NONE,
        }),
        domainBuilder.buildChallenge({
          skillId: 'skill1',
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          responsive: Challenge.RESPONSIVES.NONE,
        }),
        domainBuilder.buildChallenge({
          skillId: 'skill1',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.PROPOSE,
          responsive: Challenge.RESPONSIVES.NONE,
        }),
      ];

      // when
      const transformedTube = transformTube(tube, challenges);

      // then
      expect(transformedTube).toStrictEqual({
        id: 'tube1',
        competenceId: 'competence1',
        thematicId: 'thematic1',
        name: '@test',
        practicalTitle_i18n: {
          fr: 'Titre',
          en: 'Title',
        },
        practicalDescription_i18n: {
          fr: 'La description',
          en: 'The description',
        },
        skillIds: ['skill1', 'skill2'],
        isMobileCompliant: true,
        isTabletCompliant: false,
      });
    });
  });

  describe('#transformTubes', () => {
    it('transforms tubes for release', () => {
      // given
      const tubes = [
        domainBuilder.buildTube({
          id: 'tube1',
          thematicId: 'thematic1',
          competenceId: 'competence1',
          name: '@test',
          practicalTitle_i18n: {
            fr: 'Titre 1',
            en: 'Title 1',
          },
          practicalDescription_i18n: {
            fr: 'La description 1',
            en: 'The description 1',
          },
          skillIds: ['skill1'],
        }),
        domainBuilder.buildTube({
          id: 'tube2',
          thematicId: 'thematic2',
          competenceId: 'competence2',
          name: '@pouet',
          practicalTitle_i18n: {
            fr: 'Titre 2',
            en: 'Title 2',
          },
          practicalDescription_i18n: {
            fr: 'La description 2',
            en: 'The description 2',
          },
          skillIds: ['skill2'],
        }),
      ];
      const challenges = [
        domainBuilder.buildChallenge({
          skillId: 'skill1',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.VALIDE,
          responsive: Challenge.RESPONSIVES.SMARTPHONE,
        }),
        domainBuilder.buildChallenge({
          skillId: 'skill2',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.VALIDE,
          responsive: Challenge.RESPONSIVES.TABLETTE_ET_SMARTPHONE,
        }),
        domainBuilder.buildChallenge({
          skillId: 'skill3',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.VALIDE,
          responsive: Challenge.RESPONSIVES.NONE,
        }),
        domainBuilder.buildChallenge({
          skillId: 'skill1',
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          status: Challenge.STATUSES.VALIDE,
          responsive: Challenge.RESPONSIVES.NONE,
        }),
        domainBuilder.buildChallenge({
          skillId: 'skill1',
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          status: Challenge.STATUSES.PROPOSE,
          responsive: Challenge.RESPONSIVES.NONE,
        }),
      ];

      // when
      const transformedTubes = transformTubes(tubes, challenges);

      // then
      expect(transformedTubes).toStrictEqual([
        {
          id: 'tube1',
          competenceId: 'competence1',
          thematicId: 'thematic1',
          name: '@test',
          practicalTitle_i18n: {
            fr: 'Titre 1',
            en: 'Title 1',
          },
          practicalDescription_i18n: {
            fr: 'La description 1',
            en: 'The description 1',
          },
          skillIds: ['skill1'],
          isMobileCompliant: true,
          isTabletCompliant: false,
        },
        {
          id: 'tube2',
          competenceId: 'competence2',
          thematicId: 'thematic2',
          name: '@pouet',
          practicalTitle_i18n: {
            fr: 'Titre 2',
            en: 'Title 2',
          },
          practicalDescription_i18n: {
            fr: 'La description 2',
            en: 'The description 2',
          },
          skillIds: ['skill2'],
          isMobileCompliant: true,
          isTabletCompliant: true,
        },
      ]);
    });
  });
});
