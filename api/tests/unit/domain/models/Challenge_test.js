import { beforeEach, describe as context, describe, expect, it, vi } from 'vitest';
import { Attachment, Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';
import { catchErr, domainBuilder } from '../../../test-helper.js';
import { ChallengeForRelease } from '../../../../lib/domain/models/release/index.js';
import { ForbiddenError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Challenge', () => {
  const fields = [
    'instruction',
    'alternativeInstruction',
    'proposals',
    'solution',
    'solutionToDisplay',
  ];

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
              localizedChallenges: [new LocalizedChallenge({ id: `${challengeId}Fr`, challengeId, locale: 'fr' }), new LocalizedChallenge({ id: challengeId, challengeId, locale: 'en' })],
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
              localizedChallenges: [new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }), new LocalizedChallenge({ id: `${challengeId}En`, challengeId, locale: 'en' })],
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
              localizedChallenges: [new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }), new LocalizedChallenge({ id: `${challengeId}FrFr`, challengeId, locale: 'fr-fr' })],
            }),
            expected: `${field} fr`,
          },
          {
            challenge: new Challenge({
              id: challengeId,
              translations: { fr: { [field]: `${field} fr` } },
              locales: ['fr-fr', 'fr'],
              localizedChallenges: [new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' })],
            }),
            expected: `${field} fr`,
          },
          {
            challenge: new Challenge({
              id: challengeId,
              translations: { fr: {} },
              locales: ['fr'],
              localizedChallenges: [new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' })],
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

  describe('#get isPropose', () => {
    it('should return true when challenge is propose', () => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES.PROPOSE });

      // when
      const isPropose = challenge.isPropose;

      // then
      expect(isPropose).to.be.true;
    });

    it.each(
      Object.keys(Challenge.STATUSES).filter(
        (statusKey) => Challenge.STATUSES[statusKey] !== Challenge.STATUSES.PROPOSE,
      ),
    )('should return false when status key is %s', (statusKey) => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES[statusKey] });

      // when
      const isPropose = challenge.isPropose;

      // then
      expect(isPropose).to.be.false;
    });
  });

  describe('#get isArchive', () => {
    it('should return true when challenge is archive', () => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES.ARCHIVE });

      // when
      const isArchive = challenge.isArchive;

      // then
      expect(isArchive).to.be.true;
    });

    it.each(
      Object.keys(Challenge.STATUSES).filter(
        (statusKey) => Challenge.STATUSES[statusKey] !== Challenge.STATUSES.ARCHIVE,
      ),
    )('should return false when status key is %s', (statusKey) => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES[statusKey] });

      // when
      const isArchive = challenge.isArchive;

      // then
      expect(isArchive).to.be.false;
    });
  });

  describe('#get isValide', () => {
    it('should return true when challenge is valide', () => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES.VALIDE });

      // when
      const isValide = challenge.isValide;

      // then
      expect(isValide).to.be.true;
    });

    it.each(
      Object.keys(Challenge.STATUSES).filter(
        (statusKey) => Challenge.STATUSES[statusKey] !== Challenge.STATUSES.VALIDE,
      ),
    )('should return false when status key is %s', (statusKey) => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES[statusKey] });

      // when
      const isValide = challenge.isValide;

      // then
      expect(isValide).to.be.false;
    });
  });

  describe('#get isPerime', () => {
    it('should return true when challenge is perime', () => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES.PERIME });

      // when
      const isPerime = challenge.isPerime;

      // then
      expect(isPerime).to.be.true;
    });

    it.each(
      Object.keys(Challenge.STATUSES).filter(
        (statusKey) => Challenge.STATUSES[statusKey] !== Challenge.STATUSES.PERIME,
      ),
    )('should return false when status key is %s', (statusKey) => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES[statusKey] });

      // when
      const isPerime = challenge.isPerime;

      // then
      expect(isPerime).to.be.false;
    });
  });

  describe('#get isPrototype', () => {
    it('should return true when challenge is isPrototype', () => {
      // given
      const challenge = domainBuilder.buildChallenge({ genealogy: Challenge.GENEALOGIES.PROTOTYPE });

      // when
      const isPrototype = challenge.isPrototype;

      // then
      expect(isPrototype).to.be.true;
    });

    it.each(
      Object.keys(Challenge.GENEALOGIES).filter(
        (statusKey) => Challenge.STATUSES[statusKey] !== Challenge.STATUSES.PROTOTYPE,
      ),
    )('should return false when status key is %s', (statusKey) => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES[statusKey] });

      // when
      const isPrototype = challenge.isPrototype;

      // then
      expect(isPrototype).to.be.false;
    });
  });

  describe('#get isAlternative', () => {
    it('should return true when challenge is isAlternative', () => {
      // given
      const challenge = domainBuilder.buildChallenge({ genealogy: Challenge.GENEALOGIES.DECLINAISON });

      // when
      const isAlternative = challenge.isAlternative;

      // then
      expect(isAlternative).to.be.true;
    });

    it.each(
      Object.keys(Challenge.GENEALOGIES).filter(
        (statusKey) => Challenge.STATUSES[statusKey] !== Challenge.STATUSES.DECLINAISON,
      ),
    )('should return false when status key is %s', (statusKey) => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES[statusKey] });

      // when
      const isAlternative = challenge.isAlternative;

      // then
      expect(isAlternative).to.be.false;
    });
  });

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
            localizedChallenges: [new LocalizedChallenge({ id: `${challengeId}Fr`, challengeId, locale: 'fr' }), new LocalizedChallenge({ id: challengeId, challengeId, locale: 'en' })],
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
            localizedChallenges: [new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }), new LocalizedChallenge({ id: `${challengeId}En`, challengeId, locale: 'en' })],
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
            localizedChallenges: [new LocalizedChallenge({ id: challengeId, challengeId, locale: 'fr' }), new LocalizedChallenge({ id: `${challengeId}FrFr`, challengeId, locale: 'fr-fr' })],
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
      const localizedChallenges = [
        {
          id: '1',
          challengeId: '1',
          locale: 'fr',
          embedUrl: 'mon.site.fr',
        },
        {
          id: '2',
          challengeId: '1',
          locale: 'nl',
          embedUrl: 'mon.site.nl',
        },
      ];

      const challenge = new Challenge({
        locales: ['fr'],
        translations: { fr: {} },
        localizedChallenges,
      });

      // when
      const embedUrl = challenge.embedUrl;

      // then
      expect(embedUrl).toBe('mon.site.fr');
    });
  });

  describe('#switchToPrototype', () => {
    it('should update genealogy and remove alternativeVersion', function() {
      // given
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        locale: 'fr',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      });
      const challenge = domainBuilder.buildChallenge({
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        version: 1,
        alternativeVersion: 15,
        author: ['TOTO'],
        accessibility1: Challenge.ACCESSIBILITY1.ACQUIS_NON_PERTINENT,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        locales: ['fr'],
        localizedChallenges: [localizedChallenge],
      });

      // when
      challenge.switchToPrototype({
        accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
        accessibility2: Challenge.ACCESSIBILITY2.NONE,
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.ACQUIS_NON_PERTINENT,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });

      // then
      expect({
        genealogy: challenge.genealogy,
        alternativeVersion: challenge.alternativeVersion,
        version: challenge.version,
        author: challenge.author,
        accessibility1: challenge.accessibility1,
        accessibility2: challenge.accessibility2,
        requireGafamWebsiteAccess: challenge.primaryLocalizedChallenge.requireGafamWebsiteAccess,
        isIncompatibleIpadCertif: challenge.primaryLocalizedChallenge.isIncompatibleIpadCertif,
        deafAndHardOfHearing: challenge.primaryLocalizedChallenge.deafAndHardOfHearing,
        isAwarenessChallenge: challenge.primaryLocalizedChallenge.isAwarenessChallenge,
        toRephrase: challenge.primaryLocalizedChallenge.toRephrase,
        hasEmbedInternalValidation: challenge.primaryLocalizedChallenge.hasEmbedInternalValidation,
        noValidationNeeded: challenge.primaryLocalizedChallenge.noValidationNeeded,
      }).toEqual({
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        alternativeVersion: null,
        version: 1,
        author: ['TOTO'],
        accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
        accessibility2: Challenge.ACCESSIBILITY2.NONE,
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.ACQUIS_NON_PERTINENT,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });
    });

    it('should throw a ForbiddenError when challenge is not an alternative', async function() {
      // given
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        locale: 'fr',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      });
      const challenge = domainBuilder.buildChallenge({
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        version: 1,
        alternativeVersion: 15,
        author: ['TOTO'],
        accessibility1: Challenge.ACCESSIBILITY1.ACQUIS_NON_PERTINENT,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        locales: ['fr'],
        localizedChallenges: [localizedChallenge],
      });

      // when
      const err = await catchErr(challenge.switchToPrototype, challenge)({
        accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
        accessibility2: Challenge.ACCESSIBILITY2.NONE,
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.ACQUIS_NON_PERTINENT,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });

      // then
      expect(err).toBeInstanceOf(ForbiddenError);
    });

    it('should throw a ForbiddenError when challenge is not validated', async function() {
      // given
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        locale: 'fr',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      });
      const challenge = domainBuilder.buildChallenge({
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        version: 1,
        alternativeVersion: 15,
        author: ['TOTO'],
        accessibility1: Challenge.ACCESSIBILITY1.ACQUIS_NON_PERTINENT,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        locales: ['fr'],
        localizedChallenges: [localizedChallenge],
        status: Challenge.STATUSES.ARCHIVE,
      });

      // when
      const err = await catchErr(challenge.switchToPrototype, challenge)({
        accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
        accessibility2: Challenge.ACCESSIBILITY2.NONE,
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.ACQUIS_NON_PERTINENT,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });

      // then
      expect(err).toBeInstanceOf(ForbiddenError);
    });
  });

  describe('#switchToAlternative', () => {
    it('should update genealogy and remove alternativeVersion', function() {
      // given
      const challenge = domainBuilder.buildChallenge({ genealogy: Challenge.GENEALOGIES.PROTOTYPE, version: 1, alternativeVersion: null, author: ['TOTO'] });

      // when
      challenge.switchToAlternative({ alternativeVersion: 5 });

      // then
      expect({
        genealogy: challenge.genealogy,
        alternativeVersion: challenge.alternativeVersion,
        version: challenge.version,
        author: challenge.author,
      }).toEqual({
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        alternativeVersion: 5,
        version: 1,
        author: ['TOTO'],
      });
    });
  });

  describe('#get dataOnSwitchGenealogy', () => {
    it('should return data to update for prototype', () => {
      // given
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        locale: 'fr',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      });
      const challenge = domainBuilder.buildChallenge({
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        version: 1,
        alternativeVersion: null,
        author: ['TOTO'],
        accessibility1: Challenge.ACCESSIBILITY1.ACQUIS_NON_PERTINENT,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        locales: ['fr'],
        localizedChallenges: [localizedChallenge],
      });

      // when
      const expectedPojo = challenge.dataOnSwitchGenealogy;

      // then
      expect({
        id: challenge.id,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        alternativeVersion: null,
        accessibility1: challenge.accessibility1,
        accessibility2: challenge.accessibility2,
        updatedAt: expect.any(Date),
      }).toEqual(expectedPojo);
    });

    it('should return data to update for declinaison', () => {
      // given
      const localizedChallenge = domainBuilder.buildLocalizedChallenge({
        locale: 'fr',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      });
      const challenge = domainBuilder.buildChallenge({
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        version: 1,
        alternativeVersion: 18,
        author: ['TOTO'],
        accessibility1: Challenge.ACCESSIBILITY1.ACQUIS_NON_PERTINENT,
        accessibility2: Challenge.ACCESSIBILITY2.KO,
        locales: ['fr'],
        localizedChallenges: [localizedChallenge],
      });

      // when
      const expectedPojo = challenge.dataOnSwitchGenealogy;

      // then
      expect({
        id: challenge.id,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        alternativeVersion: 18,
        updatedAt: expect.any(Date),
      }).toEqual(expectedPojo);
    });
  });

  describe('#translate', () => {
    it('should throw an Error when trying to translate from an already translated Challenge', () => {
      // given
      const challengeId = 'challengeId';
      const dutchChallengeId = 'challengeIdNl';

      const frenchLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr',
      });
      const dutchLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: dutchChallengeId,
        challengeId,
        locale: 'nl',
      });
      const localizedChallenges = [frenchLocalizedChallenge, dutchLocalizedChallenge];

      const translations = Object.fromEntries(localizedChallenges.map(({ locale }) => [locale, {}]));
      const challenge = domainBuilder.buildChallenge({
        id: challengeId,
        locales: ['fr-fr', 'fr'],
        status: Challenge.STATUSES.VALIDE,
        localizedChallenges,
        translations,
        files: [],
      });

      // when
      const dutchChallenge = challenge.translate('nl');

      // then
      expect(() => dutchChallenge.translate('fr')).toThrow(
        'Illegal operation : trying to translate an already translated challenge',
      );
    });

    it('should return a translated challenge', () => {
      // given
      const challengeId = 'challengeId';
      const dutchChallengeId = 'challengeIdNl';
      const englishChallengeId = 'challengeIdEn';
      const primaryEmbedUrl = 'https://example.com/index.html?lang=fr&mode=example';

      const frenchLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: challengeId,
        challengeId,
        locale: 'fr',
        embedUrl: primaryEmbedUrl,
        geography: 'FR',
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: false,
        noValidationNeeded: true,
      });
      const dutchLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: dutchChallengeId,
        challengeId,
        locale: 'nl',
        embedUrl: 'https://example.nl/index.html?mode=example',
        primaryEmbedUrl,
        status: Challenge.STATUSES.PROPOSE,
        geography: 'NL',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: true,
        noValidationNeeded: false,
      });
      const englishLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: englishChallengeId,
        challengeId,
        locale: 'en',
        embedUrl: null,
        primaryEmbedUrl,
        status: Challenge.STATUSES.VALIDE,
        geography: 'GB',
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: true,
        toRephrase: false,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });
      const localizedChallenges = [
        frenchLocalizedChallenge,
        dutchLocalizedChallenge,
        englishLocalizedChallenge,
      ];

      const frenchFiles = [{ fileId: 'fileId1', localizedChallengeId: challengeId }, { fileId: 'fileId2', localizedChallengeId: challengeId }];
      const dutchFiles = [{ fileId: 'fileId1Nl', localizedChallengeId: dutchChallengeId }, { fileId: 'fileId2Nl', localizedChallengeId: dutchChallengeId }];
      const englishFiles = [{ fileId: 'fileId1En', localizedChallengeId: englishChallengeId }, { fileId: 'fileId2En', localizedChallengeId: englishChallengeId }];

      const translations = Object.fromEntries(
        localizedChallenges.map(({ locale }) => [
          locale,
          {
            alternativeInstruction: `alternativeInstruction ${locale}`,
            embedTitle: `embedTitle ${locale}`,
            instruction: `instruction ${locale}`,
            proposals: `proposals ${locale}`,
            solution: `solution ${locale}`,
            solutionToDisplay: `solutionToDisplay ${locale}`,
          },
        ]),
      );

      const challenge = domainBuilder.buildChallenge({
        id: challengeId,
        locales: ['fr-fr', 'fr'],
        status: Challenge.STATUSES.VALIDE,
        localizedChallenges,
        translations,
        files: [
          ...frenchFiles,
          ...dutchFiles,
          ...englishFiles,
        ],
        geography: 'FR',
        validatedAt: null,
      });

      const expectedDutchChallenge = {
        ...challenge,
        id: dutchChallengeId,
        locales: ['nl'],
        status: Challenge.STATUSES.PROPOSE,
        ...translations.nl,
        embedUrl: dutchLocalizedChallenge.embedUrl,
        files: dutchFiles.map(({ fileId }) => fileId),
        geography: 'NL',
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: false,
        noValidationNeeded: true,
        validatedAt: null,
      };

      const expectedEnglishChallenge = {
        ...challenge,
        id: englishChallengeId,
        locales: ['en'],
        status: Challenge.STATUSES.VALIDE,
        ...translations.en,
        embedUrl: 'https://example.com/index.html?lang=en&mode=example',
        files: englishFiles.map(({ fileId }) => fileId),
        geography: 'GB',
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: false,
        noValidationNeeded: true,
        validatedAt: null,
      };

      // when
      const dutchChallenge = challenge.translate('nl');
      const englishChallenge = challenge.translate('en');

      // then
      expect(dutchChallenge).toEqual(expectedDutchChallenge);
      expect(dutchChallenge).toHaveProperty('primaryLocale', 'fr');
      expect(dutchChallenge).toHaveProperty('alternativeLocales', ['nl', 'en']);
      expect(dutchChallenge).toHaveProperty('locale', 'nl');
      expect(dutchChallenge).toHaveProperty('isPrimary', false);
      expect(dutchChallenge).toHaveProperty('requireGafamWebsiteAccess', true);
      expect(dutchChallenge).toHaveProperty('isIncompatibleIpadCertif', true);
      expect(dutchChallenge).toHaveProperty(
        'deafAndHardOfHearing',
        LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
      );
      expect(dutchChallenge).toHaveProperty('isAwarenessChallenge', true);
      expect(dutchChallenge).toHaveProperty('toRephrase', true);
      expect(dutchChallenge).toHaveProperty('hasEmbedInternalValidation', false);
      expect(dutchChallenge).toHaveProperty('noValidationNeeded', true);

      expect(challenge).toHaveProperty('primaryLocale', 'fr');
      expect(challenge).toHaveProperty('alternativeLocales', ['nl', 'en']);
      expect(challenge).toHaveProperty('locale', 'fr');
      expect(challenge).toHaveProperty('isPrimary', true);
      expect(challenge).toHaveProperty('requireGafamWebsiteAccess', true);
      expect(challenge).toHaveProperty('isIncompatibleIpadCertif', true);
      expect(challenge).toHaveProperty('deafAndHardOfHearing', LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK);
      expect(challenge).toHaveProperty('isAwarenessChallenge', true);
      expect(challenge).toHaveProperty('toRephrase', true);
      expect(challenge).toHaveProperty('hasEmbedInternalValidation', false);
      expect(challenge).toHaveProperty('noValidationNeeded', true);

      expect(englishChallenge).toEqual(expectedEnglishChallenge);
      expect(englishChallenge).toHaveProperty('primaryLocale', 'fr');
      expect(englishChallenge).toHaveProperty('alternativeLocales', ['nl', 'en']);
      expect(englishChallenge).toHaveProperty('locale', 'en');
      expect(englishChallenge).toHaveProperty('isPrimary', false);
      expect(englishChallenge).toHaveProperty('requireGafamWebsiteAccess', true);
      expect(englishChallenge).toHaveProperty('isIncompatibleIpadCertif', true);
      expect(englishChallenge).toHaveProperty(
        'deafAndHardOfHearing',
        LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
      );
      expect(englishChallenge).toHaveProperty('isAwarenessChallenge', true);
      expect(englishChallenge).toHaveProperty('toRephrase', true);
      expect(englishChallenge).toHaveProperty('hasEmbedInternalValidation', false);
      expect(englishChallenge).toHaveProperty('noValidationNeeded', true);
    });

    [
      {
        challengeStatus: Challenge.STATUSES.PROPOSE,
        localizedChallengeStatus: LocalizedChallenge.STATUSES.PAUSE,
        expectedTranslatedStatus: Challenge.STATUSES.PROPOSE,
      },
      {
        challengeStatus: Challenge.STATUSES.PROPOSE,
        localizedChallengeStatus: LocalizedChallenge.STATUSES.PLAY,
        expectedTranslatedStatus: Challenge.STATUSES.PROPOSE,
      },
      {
        challengeStatus: Challenge.STATUSES.VALIDE,
        localizedChallengeStatus: LocalizedChallenge.STATUSES.PAUSE,
        expectedTranslatedStatus: Challenge.STATUSES.PROPOSE,
      },
      {
        challengeStatus: Challenge.STATUSES.VALIDE,
        localizedChallengeStatus: LocalizedChallenge.STATUSES.PLAY,
        expectedTranslatedStatus: Challenge.STATUSES.VALIDE,
      },
      {
        challengeStatus: Challenge.STATUSES.ARCHIVE,
        localizedChallengeStatus: LocalizedChallenge.STATUSES.PAUSE,
        expectedTranslatedStatus: Challenge.STATUSES.PROPOSE,
      },
      {
        challengeStatus: Challenge.STATUSES.ARCHIVE,
        localizedChallengeStatus: LocalizedChallenge.STATUSES.PLAY,
        expectedTranslatedStatus: Challenge.STATUSES.ARCHIVE,
      },
      {
        challengeStatus: Challenge.STATUSES.PERIME,
        localizedChallengeStatus: LocalizedChallenge.STATUSES.PAUSE,
        expectedTranslatedStatus: Challenge.STATUSES.PERIME,
      },
      {
        challengeStatus: Challenge.STATUSES.PERIME,
        localizedChallengeStatus: LocalizedChallenge.STATUSES.PLAY,
        expectedTranslatedStatus: Challenge.STATUSES.PERIME,
      },
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
        const localizedChallenges = [primaryLocalizedChallenge, secondaryLocalizedChallenge];

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

    context('when translating validatedAt field', function() {
      let expectedFrValidatdAt, expectedNlValidatedAt, challenge;
      beforeEach(function() {
        expectedNlValidatedAt = new Date('2022-02-02T00:00:00Z');
        expectedFrValidatdAt = new Date('2023-03-03T00:00:00Z');
        const primaryLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'challengeId',
          challengeId: 'challengeId',
          locale: 'fr',
          validatedAt: new Date('2021-01-01T00:00:00Z'),
        });
        const secondaryLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'challengeId-NL',
          challengeId: 'challengeId',
          locale: 'nl',
          validatedAt: expectedNlValidatedAt,
        });
        challenge = domainBuilder.buildChallenge({
          id: 'challengeId',
          locales: ['fr', 'nl'],
          localizedChallenges: [primaryLocalizedChallenge, secondaryLocalizedChallenge],
          translations: Object.fromEntries(
            [primaryLocalizedChallenge, secondaryLocalizedChallenge].map(({ locale }) => [locale, {}]),
          ),
          files: [],
          validatedAt: expectedFrValidatdAt,
        });
      });
      context('when translating to primary locale', function() {
        it("should have the value of the Challenge's validatedAt, ignoring the one in primary Localized Challenge", function() {
          // when
          const translatedToPrimaryChallenge = challenge.translate('fr');

          // then
          expect(translatedToPrimaryChallenge.validatedAt).toStrictEqual(expectedFrValidatdAt);
        });
      });
      context('when translating to an other locale', function() {
        it("should have the value of the corresponding Localized Challenge's validatedAt", function() {
          // when
          const translatedToPrimaryChallenge = challenge.translate('nl');

          // then
          expect(translatedToPrimaryChallenge.validatedAt).toStrictEqual(expectedNlValidatedAt);
        });
      });
    });
  });

  describe('#cloneChallengeAndAttachments', () => {
    it('should clone challenge', () => {
      // given
      const clonedChallengeId = 'clonedChallengeId';
      const competenceId = 'competenceId';
      const skillId = 'skillId';
      const alternativeVersion = 3;
      const prototypeVersion = 1;
      const generateNewIdFnc = vi.fn().mockImplementation(() => clonedChallengeId);
      const challenge = new Challenge({
        id: 'challengeId',
        translations: {
          fr: {
            instruction: 'instruction',
            alternativeInstruction: 'alternativeInstruction',
            proposals: 'proposals',
            solution: 'solution',
            solutionToDisplay: 'solutionToDisplay',
          },
        },
        locales: ['fr'],
        localizedChallenges: [
          new LocalizedChallenge({
            id: 'challengeId',
            challengeId: 'challengeId',
            locale: 'fr',
            status: LocalizedChallenge.STATUSES.PRIMARY,
            fileIds: [],
            embedUrl: 'pix-mailccoule.fr',
            geography: 'FR',
            urlsToConsult: ['https://monurl.fr'],
            requireGafamWebsiteAccess: true,
            isIncompatibleIpadCertif: true,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            isAwarenessChallenge: true,
            toRephrase: true,
            hasEmbedInternalValidation: true,
            noValidationNeeded: true,
          }),
        ],
        files: [
          {
            fileId: 'attID',
            localizedChallengeId: 'challengeId',
          },
        ],
        accessibility1: Challenge.ACCESSIBILITY1.OK,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        alternativeVersion: 5,
        archivedAt: new Date('2020-01-01'),
        author: 'CHU',
        autoReply: 'oui c auto reply',
        competenceId: 'someCompetenceId',
        createdAt: new Date('2019-01-01'),
        declinable: Challenge.DECLINABLES.NON,
        embedHeight: 800,
        focusable: 'oui avec plaisir',
        format: Challenge.FORMATS.PETIT,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        geography: 'AA',
        madeObsoleteAt: new Date('2021-01-01'),
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        responsive: Challenge.RESPONSIVES.NON,
        shuffled: true,
        skillId: 'oldSkillId',
        skills: ['videz moi'],
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        status: Challenge.STATUSES.VALIDE,
        isQualityOk: true,
        t1Status: 'super t1',
        t2Status: 'super t2',
        t3Status: 'super t3',
        timer: '01:30',
        type: ChallengeForRelease.TYPES.QROCM,
        updatedAt: new Date('2020-01-01'),
        validatedAt: new Date('2022-01-01'),
        version: 8,
      });

      // when
      const { clonedChallenge, clonedAttachments } = challenge.cloneChallengeAndAttachments({
        skillId,
        competenceId,
        generateNewIdFnc,
        prototypeVersion,
        alternativeVersion,
        attachments: [],
      });

      // then
      expect(clonedAttachments).toStrictEqual([]);

      expect(clonedChallenge.id).toEqual(clonedChallengeId);
      expect(clonedChallenge.accessibility1).toEqual(challenge.accessibility1);
      expect(clonedChallenge.accessibility2).toEqual(challenge.accessibility2);
      expect(clonedChallenge.alternativeVersion).toEqual(alternativeVersion);
      expect(clonedChallenge.airtableId).toBeNull;
      expect(clonedChallenge.archivedAt).toBeNull;
      expect(clonedChallenge.author).toEqual(challenge.author);
      expect(clonedChallenge.autoReply).toEqual(challenge.autoReply);
      expect(clonedChallenge.competenceId).toEqual(competenceId);
      expect(clonedChallenge.createdAt).toBeNull;
      expect(clonedChallenge.declinable).toEqual(challenge.declinable);
      expect(clonedChallenge.embedHeight).toEqual(challenge.embedHeight);
      expect(clonedChallenge.focusable).toEqual(challenge.focusable);
      expect(clonedChallenge.format).toEqual(challenge.format);
      expect(clonedChallenge.genealogy).toEqual(challenge.genealogy);
      expect(clonedChallenge.geography).toEqual(challenge.geography);
      expect(clonedChallenge.madeObsoleteAt).toBeNull;
      expect(clonedChallenge.pedagogy).toEqual(challenge.pedagogy);
      expect(clonedChallenge.responsive).toEqual(challenge.responsive);
      expect(clonedChallenge.shuffled).toEqual(challenge.shuffled);
      expect(clonedChallenge.skillId).toEqual(skillId);
      expect(clonedChallenge.status).toEqual(Challenge.STATUSES.PROPOSE);
      expect(clonedChallenge.isQualityOk).toBeFalsy();
      expect(clonedChallenge.t1Status).toEqual(challenge.t1Status);
      expect(clonedChallenge.t2Status).toEqual(challenge.t2Status);
      expect(clonedChallenge.t3Status).toEqual(challenge.t3Status);
      expect(clonedChallenge.timer).toEqual(challenge.timer);
      expect(clonedChallenge.type).toEqual(challenge.type);
      expect(clonedChallenge.updatedAt).toBeNull;
      expect(clonedChallenge.validatedAt).toBeNull;
      expect(clonedChallenge.version).toEqual(prototypeVersion);
      expect(clonedChallenge.locales).toEqual(challenge.locales);
      expect(clonedChallenge.requireGafamWebsiteAccess).toEqual(challenge.requireGafamWebsiteAccess);
      expect(clonedChallenge.isIncompatibleIpadCertif).toEqual(challenge.isIncompatibleIpadCertif);
      expect(clonedChallenge.deafAndHardOfHearing).toEqual(challenge.deafAndHardOfHearing);
      expect(clonedChallenge.isAwarenessChallenge).toEqual(challenge.isAwarenessChallenge);
      expect(clonedChallenge.toRephrase).toEqual(challenge.toRephrase);
      expect(clonedChallenge.hasEmbedInternalValidation).toEqual(challenge.hasEmbedInternalValidation);
      expect(clonedChallenge.noValidationNeeded).toEqual(challenge.noValidationNeeded);
      expect(clonedChallenge.localizedChallenges[0]).toStrictEqual(
        domainBuilder.buildLocalizedChallenge({
          id: clonedChallengeId,
          challengeId: clonedChallengeId,
          status: LocalizedChallenge.STATUSES.PRIMARY,
          embedUrl: challenge.localizedChallenges[0].embedUrl,
          geography: challenge.localizedChallenges[0].geography,
          urlsToConsult: challenge.localizedChallenges[0].urlsToConsult,
          fileIds: [],
          locale: challenge.localizedChallenges[0].locale,
          requireGafamWebsiteAccess: challenge.localizedChallenges[0].requireGafamWebsiteAccess,
          isIncompatibleIpadCertif: challenge.localizedChallenges[0].isIncompatibleIpadCertif,
          deafAndHardOfHearing: challenge.localizedChallenges[0].deafAndHardOfHearing,
          isAwarenessChallenge: challenge.localizedChallenges[0].isAwarenessChallenge,
          toRephrase: challenge.localizedChallenges[0].toRephrase,
          hasEmbedInternalValidation: challenge.localizedChallenges[0].hasEmbedInternalValidation,
          noValidationNeeded: challenge.localizedChallenges[0].noValidationNeeded,
        }),
      );
    });

    it('should clone challenge without translations', () => {
      // given
      const clonedChallengeId = 'clonedChallengeId';
      const clonedNLLocalizedChallengeId = 'clonedNLLocalizedChallengeId';
      const competenceId = 'competenceId';
      const skillId = 'skillId';
      const alternativeVersion = 3;
      const prototypeVersion = 1;
      const generateNewIdFnc = vi
        .fn()
        .mockImplementationOnce(() => clonedChallengeId)
        .mockImplementation(() => clonedNLLocalizedChallengeId);
      const locales = ['fr', 'fr-FR'];

      const challenge = new Challenge({
        id: 'challengeId',
        translations: {
          fr: {
            instruction: 'instruction FR',
            alternativeInstruction: 'alternativeInstruction FR',
            proposals: 'proposals FR',
            solution: 'solution FR',
            solutionToDisplay: 'solutionToDisplay FR',
          },
          nl: {
            instruction: 'instruction NL',
            alternativeInstruction: 'alternativeInstruction NL',
            proposals: 'proposals NL',
            solution: 'solution NL',
            solutionToDisplay: 'solutionToDisplay NL',
          },
        },
        locales,
        localizedChallenges: [
          new LocalizedChallenge({
            id: 'challengeId',
            challengeId: 'challengeId',
            locale: 'fr',
            status: LocalizedChallenge.STATUSES.PRIMARY,
            fileIds: ['attachmentIdA'],
            embedUrl: 'pix-mailccoule.fr',
            geography: 'France',
            urlsToConsult: ['https://monurl.fr'],
            requireGafamWebsiteAccess: true,
            isIncompatibleIpadCertif: true,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
            isAwarenessChallenge: true,
            toRephrase: true,
            hasEmbedInternalValidation: true,
            noValidationNeeded: true,
          }),
          new LocalizedChallenge({
            id: 'locNLChallengeId',
            challengeId: 'challengeId',
            locale: 'nl',
            status: LocalizedChallenge.STATUSES.PLAY,
            fileIds: ['attachmentIdB'],
            embedUrl: 'pix-mailccoule.nl',
            geography: 'Netherlands',
            urlsToConsult: ['https://monurl.nl'],
            requireGafamWebsiteAccess: false,
            isIncompatibleIpadCertif: false,
            deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
            isAwarenessChallenge: false,
            toRephrase: false,
            hasEmbedInternalValidation: false,
            noValidationNeeded: false,
          }),
        ],
        files: [
          {
            fileId: 'attachmentIdA',
            localizedChallengeId: 'challengeId',
          },
          {
            fileId: 'attachmentIdB',
            localizedChallengeId: 'locNLChallengeId',
          },
        ],
      });

      const attachmentIdA = domainBuilder.buildAttachment({
        id: 'attachmentIdA',
        url: 'cc',
        type: Attachment.TYPES.ILLUSTRATION,
        alt: 'mdr',
        challengeId: 'challengeId',
        localizedChallengeId: 'challengeId',
      });
      const attachmentIdB = domainBuilder.buildAttachment({
        id: 'attachmentIdB',
        url: 'cc',
        type: Attachment.TYPES.ILLUSTRATION,
        alt: 'mdr',
        challengeId: 'challengeId',
        localizedChallengeId: 'locNLChallengeId',
      });

      // when
      const { clonedChallenge, clonedAttachments } = challenge.cloneChallengeAndAttachments({
        skillId,
        competenceId,
        generateNewIdFnc,
        prototypeVersion,
        alternativeVersion,
        attachments: [attachmentIdA, attachmentIdB],
      });

      // then
      // airtable ids are unknown yet
      expect(clonedChallenge.requireGafamWebsiteAccess).toEqual(challenge.requireGafamWebsiteAccess);
      expect(clonedChallenge.isIncompatibleIpadCertif).toEqual(challenge.isIncompatibleIpadCertif);
      expect(clonedChallenge.deafAndHardOfHearing).toEqual(challenge.deafAndHardOfHearing);
      expect(clonedChallenge.isAwarenessChallenge).toEqual(challenge.isAwarenessChallenge);
      expect(clonedChallenge.toRephrase).toEqual(challenge.toRephrase);
      expect(clonedChallenge.hasEmbedInternalValidation).toEqual(challenge.hasEmbedInternalValidation);
      expect(clonedChallenge.noValidationNeeded).toEqual(challenge.noValidationNeeded);

      expect(clonedChallenge.files).toStrictEqual([]);

      expect(clonedChallenge.translations).toStrictEqual({
        fr: {
          instruction: 'instruction FR',
          alternativeInstruction: 'alternativeInstruction FR',
          proposals: 'proposals FR',
          solution: 'solution FR',
          solutionToDisplay: 'solutionToDisplay FR',
        },
      });

      expect(clonedChallenge.localizedChallenges).toStrictEqual([
        domainBuilder.buildLocalizedChallenge({
          id: clonedChallengeId,
          challengeId: clonedChallengeId,
          status: LocalizedChallenge.STATUSES.PRIMARY,
          embedUrl: challenge.localizedChallenges[0].embedUrl,
          geography: challenge.localizedChallenges[0].geography,
          urlsToConsult: challenge.localizedChallenges[0].urlsToConsult,
          fileIds: [],
          locale: challenge.localizedChallenges[0].locale,
          requireGafamWebsiteAccess: challenge.localizedChallenges[0].requireGafamWebsiteAccess,
          isIncompatibleIpadCertif: challenge.localizedChallenges[0].isIncompatibleIpadCertif,
          deafAndHardOfHearing: challenge.localizedChallenges[0].deafAndHardOfHearing,
          isAwarenessChallenge: challenge.localizedChallenges[0].isAwarenessChallenge,
          toRephrase: challenge.localizedChallenges[0].toRephrase,
          hasEmbedInternalValidation: challenge.localizedChallenges[0].hasEmbedInternalValidation,
          noValidationNeeded: challenge.localizedChallenges[0].noValidationNeeded,
        }),
      ]);

      expect(clonedAttachments).toStrictEqual([
        domainBuilder.buildAttachment({
          id: null,
          type: attachmentIdA.type,
          alt: attachmentIdA.alt,
          url: attachmentIdA.url,
          localizedChallengeId: clonedChallengeId,
          challengeId: clonedChallengeId,
          airtableChallengeId: null,
        }),
      ]);
    });
  });

  describe('#isMobileCompliant', () => {
    it('returns true if challenge is compliant w/ mobile', () => {
      // given
      const challenges = [
        domainBuilder.buildChallenge({ responsive: Challenge.RESPONSIVES.NON }),
        domainBuilder.buildChallenge({ responsive: Challenge.RESPONSIVES.NONE }),
        domainBuilder.buildChallenge({ responsive: Challenge.RESPONSIVES.SMARTPHONE }),
        domainBuilder.buildChallenge({ responsive: Challenge.RESPONSIVES.TABLETTE }),
        domainBuilder.buildChallenge({ responsive: Challenge.RESPONSIVES.TABLETTE_ET_SMARTPHONE }),
      ];

      // when
      const compliants = challenges.map((challenge) => challenge.isMobileCompliant);

      // then
      expect(compliants).toStrictEqual([
        false,
        false,
        true,
        false,
        true,
      ]);
    });
  });

  describe('#isTabletCompliant', () => {
    it('returns true if challenge is compliant w/ mobile', () => {
      // given
      const challenges = [
        domainBuilder.buildChallenge({ responsive: Challenge.RESPONSIVES.NON }),
        domainBuilder.buildChallenge({ responsive: Challenge.RESPONSIVES.NONE }),
        domainBuilder.buildChallenge({ responsive: Challenge.RESPONSIVES.SMARTPHONE }),
        domainBuilder.buildChallenge({ responsive: Challenge.RESPONSIVES.TABLETTE }),
        domainBuilder.buildChallenge({ responsive: Challenge.RESPONSIVES.TABLETTE_ET_SMARTPHONE }),
      ];

      // when
      const compliants = challenges.map((challenge) => challenge.isTabletCompliant);

      // then
      expect(compliants).toStrictEqual([
        false,
        false,
        false,
        true,
        true,
      ]);
    });
  });

  describe('obsolete', () => {
    it('obsoletes a challenge', () => {
      // given
      const challenge = domainBuilder.buildChallenge({ status: Challenge.STATUSES.PROPOSE });

      // when
      challenge.obsolete();

      // then
      expect(challenge.status).toStrictEqual(Challenge.STATUSES.PERIME);
      expect(challenge.madeObsoleteAt).toBeInstanceOf(Date);
    });
  });
});
