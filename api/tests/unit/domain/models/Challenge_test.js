import { describe, expect, it } from 'vitest';
import { Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Challenge', () => {

  const fields = ['instruction', 'alternativeInstruction', 'proposals', 'solution', 'solutionToDisplay'];

  for (const field of fields) {
    describe(`#get ${field}`, () => {
      it(`should return ${field} from translations`, () => {
        // given
        const challengeId = 'challengeId';
        const tests = [
          {
            challenge: new Challenge({
              id: challengeId,
              translations: {
                fr: { [field]: `${field} fr` },
                en: { [field]: `${field} en` },
              },
              locales: ['en'],
              localizedChallenges: [
                new LocalizedChallenge({ id: `${challengeId}Fr`, challengeId, locale: 'fr' }),
                new LocalizedChallenge({ id: challengeId, challengeId, locale: 'en' }),
              ],
            }),
            expected: `${field} en`,
          },
          {
            challenge: new Challenge({
              id: challengeId,
              translations: {
                fr: { [field]: `${field} fr` },
                en: { [field]: `${field} en` },
              },
              locales: ['fr'],
              localizedChallenges: [
                new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }),
                new LocalizedChallenge({ id: `${challengeId}En`, challengeId, locale: 'en' }),
              ],
            }),
            expected: `${field} fr`,
          },
          {
            challenge: new Challenge({
              id: challengeId,
              translations: {
                fr: { [field]: `${field} fr` },
                'fr-fr': { [field]: `${field} fr-fr` },
              },
              localizedChallenges: [
                new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }),
                new LocalizedChallenge({ id: `${challengeId}FrFr`, challengeId, locale: 'fr-fr' }),
              ],
            }),
            expected: `${field} fr`,
          },
          {
            challenge: new Challenge({
              id: challengeId,
              translations: {
                fr: { [field]: `${field} fr` },
              },
              locales: ['fr-fr', 'fr'],
              localizedChallenges: [
                new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }),
              ],
            }),
            expected: `${field} fr`,
          },
          {
            challenge: new Challenge({
              id: challengeId,
              translations: {
                fr: {},
              },
              locales: ['fr'],
              localizedChallenges: [
                new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }),
              ],
            }),
            expected: '',
          },
        ];

        for (const { challenge, expected } of tests) {
          // when
          const actual = challenge[field];

          // then
          expect.soft(actual).toBe(expected);
        }
      });
    });
  }

  describe('#get instruction', () => {
    it('should return instruction from translations', () => {
      // given
      const challengeId = 'challengeId';
      const tests = [
        {
          challenge: new Challenge({
            id: challengeId,
            translations: {
              fr: { instruction: 'instruction fr' },
              en: { instruction: 'instruction en' },
            },
            locales: ['en'],
            localizedChallenges: [
              new LocalizedChallenge({ id: `${challengeId}Fr`, challengeId, locale: 'fr' }),
              new LocalizedChallenge({ id: challengeId, challengeId, locale: 'en' }),
            ],
          }),
          expected: 'instruction en',
        },
        {
          challenge: new Challenge({
            id: challengeId,
            translations: {
              fr: { instruction: 'instruction fr' },
              en: { instruction: 'instruction en' },
            },
            locales: ['fr'],
            localizedChallenges: [
              new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }),
              new LocalizedChallenge({ id: `${challengeId}En`, challengeId, locale: 'en' }),
            ],
          }),
          expected: 'instruction fr',
        },
        {
          challenge: new Challenge({
            id: challengeId,
            translations: {
              fr: { instruction: 'instruction fr' },
              'fr-fr': { instruction: 'instruction fr-fr' },
            },
            localizedChallenges: [
              new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }),
              new LocalizedChallenge({ id: `${challengeId}FrFr`, challengeId, locale: 'fr-fr' }),
            ],
          }),
          expected: 'instruction fr',
        },
      ];

      for (const { challenge, expected } of tests) {
        // when
        const actual = challenge.instruction;

        // then
        expect.soft(actual).toBe(expected);
      }
    });
  });

  describe('#embedUrl', () => {
    it('should return embedUrl from localized challenge', () => {
      // given
      const localizedChallenges = [{
        id: '1',
        challengeId: '1',
        locale: 'fr',
        embedUrl: 'mon.site.fr'
      }, {
        id: '2',
        challengeId: '1',
        locale: 'nl',
        embedUrl: 'mon.site.nl'
      }];

      const challenge = new Challenge({
        locales: ['fr'],
        translations: {
          fr: {},
        },
        localizedChallenges,
      });

      // when
      const embedUrl = challenge.embedUrl;

      // then
      expect(embedUrl).toBe('mon.site.fr');
    });
  });

  describe('#translate', () => {
    it('should return a translated challenge', () => {
      // given
      const challengeId = 'challengeId';
      const dutchChallengeId = 'challengeIdNl';
      const englishChallengeId = 'challengeIdEn';

      const frenchLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr',
        embedUrl: 'https://example.com/index.html?lang=fr&mode=example',
      });
      const dutchLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: dutchChallengeId,
        challengeId,
        locale: 'nl',
        embedUrl: 'https://example.nl/index.html?mode=example',
        status: 'proposé',
      });
      const englishLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: englishChallengeId,
        challengeId,
        locale: 'en',
        embedUrl: null,
        status: 'validé',
      });
      const localizedChallenges = [
        frenchLocalizedChallenge,
        dutchLocalizedChallenge,
        englishLocalizedChallenge,
      ];

      const frenchFiles = [
        { fileId: 'fileId1', localizedChallengeId: challengeId },
        { fileId: 'fileId2', localizedChallengeId: challengeId },
      ];
      const dutchFiles = [
        { fileId: 'fileId1Nl', localizedChallengeId: dutchChallengeId },
        { fileId: 'fileId2Nl', localizedChallengeId: dutchChallengeId },
      ];
      const englishFiles = [
        { fileId: 'fileId1En', localizedChallengeId: englishChallengeId },
        { fileId: 'fileId2En', localizedChallengeId: englishChallengeId },
      ];

      const translations = Object.fromEntries(localizedChallenges.map(({ locale }) => [
        locale,
        {
          alternativeInstruction: `alternativeInstruction ${locale}`,
          embedTitle: `embedTitle ${locale}`,
          instruction: `instruction ${locale}`,
          proposals: `proposals ${locale}`,
          solution: `solution ${locale}`,
          solutionToDisplay: `solutionToDisplay ${locale}`,
        },
      ]));

      const challenge = domainBuilder.buildChallenge({
        id: challengeId,
        locales: ['fr-fr', 'fr'],
        status: 'validé',
        localizedChallenges,
        translations,
        files: [
          ...frenchFiles,
          ...dutchFiles,
          ...englishFiles,
        ],
      });

      const expectedDutchChallenge = {
        ...challenge,
        id: dutchChallengeId,
        locales: ['nl'],
        status: 'proposé',
        ...translations.nl,
        embedUrl: dutchLocalizedChallenge.embedUrl,
        files: dutchFiles.map(({ fileId }) => fileId),
      };

      const expectedEnglishChallenge = {
        ...challenge,
        id: englishChallengeId,
        locales: ['en'],
        status: 'validé',
        ...translations.en,
        embedUrl: 'https://example.com/index.html?lang=en&mode=example',
        files: englishFiles.map(({ fileId }) => fileId),
      };

      // when
      const dutchChallenge = challenge.translate('nl');
      const refrenchChallenge = dutchChallenge.translate('fr');
      const englishChallenge = challenge.translate('en');

      // then
      expect(dutchChallenge).toEqual(expectedDutchChallenge);
      expect(dutchChallenge).toHaveProperty('primaryLocale', 'fr');
      expect(dutchChallenge).toHaveProperty('alternativeLocales', ['nl', 'en']);
      expect(dutchChallenge).toHaveProperty('locale', 'nl');
      expect(dutchChallenge).toHaveProperty('isPrimary', false);

      expect(refrenchChallenge).toEqual(challenge);
      expect(refrenchChallenge).toHaveProperty('primaryLocale', 'fr');
      expect(refrenchChallenge).toHaveProperty('alternativeLocales', ['nl', 'en']);
      expect(refrenchChallenge).toHaveProperty('locale', 'fr');
      expect(refrenchChallenge).toHaveProperty('isPrimary', true);

      expect(englishChallenge).toEqual(expectedEnglishChallenge);
      expect(englishChallenge).toHaveProperty('primaryLocale', 'fr');
      expect(englishChallenge).toHaveProperty('alternativeLocales', ['nl', 'en']);
      expect(englishChallenge).toHaveProperty('locale', 'en');
      expect(englishChallenge).toHaveProperty('isPrimary', false);
    });

    [
      { challengeStatus: 'proposé', localizedChallengeStatus: 'proposé', expectedTranslatedStatus: 'proposé' },
      { challengeStatus: 'proposé', localizedChallengeStatus: 'validé', expectedTranslatedStatus: 'proposé' },
      { challengeStatus: 'validé', localizedChallengeStatus: 'proposé', expectedTranslatedStatus: 'proposé' },
      { challengeStatus: 'validé', localizedChallengeStatus: 'validé', expectedTranslatedStatus: 'validé' },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'proposé', expectedTranslatedStatus: 'proposé' },
      { challengeStatus: 'archivé', localizedChallengeStatus: 'validé', expectedTranslatedStatus: 'archivé' },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'proposé', expectedTranslatedStatus: 'périmé' },
      { challengeStatus: 'périmé', localizedChallengeStatus: 'validé', expectedTranslatedStatus: 'périmé' },
    ].forEach(({ challengeStatus, localizedChallengeStatus, expectedTranslatedStatus }) => {
      it(`should translate status ${challengeStatus} and localized status ${localizedChallengeStatus} to ${expectedTranslatedStatus}`, () => {
        // given
        const challengeId = 'challengeId';

        const primaryLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          locale: 'fr',
        });
        const secondaryLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'secondaryChallengeId',
          challengeId,
          locale: 'nl',
          status: localizedChallengeStatus,
        });
        const localizedChallenges = [
          primaryLocalizedChallenge,
          secondaryLocalizedChallenge,
        ];

        const challenge = domainBuilder.buildChallenge({
          id: challengeId,
          locales: ['fr'],
          status: challengeStatus,
          localizedChallenges,
          translations: Object.fromEntries(localizedChallenges.map(({ locale }) => [locale, {}])),
          files: [],
        });

        // when
        const translatedChallenge = challenge.translate('nl');

        // then
        expect(translatedChallenge.status).toBe(expectedTranslatedStatus);
      });
    });
  });

  describe('#geographyCode', () => {
    it('should return a country code', () => {
      // given
      const challengeId = 'challengeId';
      const challenge = domainBuilder.buildChallenge({
        id: challengeId,
        locales: ['fr'],
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          locale: 'fr',
        })],
        translations: { fr: {} },
        geography: 'Nouvelle-Zélande',
      });

      // then
      expect(challenge).toHaveProperty('geographyCode', 'NZ');
    });

    it('should undefined when geography is not a country', () => {
      // given
      const geographies = ['Neutre', undefined, null];
      const challengeId = 'challengeId';
      const challenge = domainBuilder.buildChallenge({
        id: challengeId,
        locales: ['fr'],
        localizedChallenges: [domainBuilder.buildLocalizedChallenge({
          id: challengeId,
          challengeId,
          locale: 'fr',
        })],
        translations: { fr: {} },
      });

      // when
      const codes = geographies.map((geography) => {
        challenge.geography = geography;
        return challenge.geographyCode;
      });

      // then
      expect(codes).toEqual([undefined, undefined, undefined]);
    });
  });
});
