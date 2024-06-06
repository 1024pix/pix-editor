import { describe, expect, it, vi } from 'vitest';
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

  describe('#get isPropose', () => {
    it('should return true when challenge is propose', () => {
      // given
      const challenge  = domainBuilder.buildChallenge({
        status: Challenge.STATUSES.PROPOSE,
      });

      // when
      const isPropose = challenge.isPropose;

      // then
      expect(isPropose).to.be.true;
    });

    it.each(Object.keys(Challenge.STATUSES).filter((statusKey) => Challenge.STATUSES[statusKey] !== Challenge.STATUSES.PROPOSE)
    )('should return false when status key is %s', (statusKey) => {
      // given
      const challenge  = domainBuilder.buildChallenge({
        status: Challenge.STATUSES[statusKey],
      });

      // when
      const isPropose = challenge.isPropose;

      // then
      expect(isPropose).to.be.false;
    });
  });

  describe('#get isValide', () => {
    it('should return true when challenge is valide', () => {
      // given
      const challenge  = domainBuilder.buildChallenge({
        status: Challenge.STATUSES.VALIDE,
      });

      // when
      const isValide = challenge.isValide;

      // then
      expect(isValide).to.be.true;
    });

    it.each(Object.keys(Challenge.STATUSES).filter((statusKey) => Challenge.STATUSES[statusKey] !== Challenge.STATUSES.VALIDE)
    )('should return false when status key is %s', (statusKey) => {
      // given
      const challenge  = domainBuilder.buildChallenge({
        status: Challenge.STATUSES[statusKey],
      });

      // when
      const isValide = challenge.isValide;

      // then
      expect(isValide).to.be.false;
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
        geography: 'FR',
      });
      const dutchLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: dutchChallengeId,
        challengeId,
        locale: 'nl',
        embedUrl: 'https://example.nl/index.html?mode=example',
        status: 'proposé',
        geography: 'NL',
      });
      const englishLocalizedChallenge = domainBuilder.buildLocalizedChallenge({
        id: englishChallengeId,
        challengeId,
        locale: 'en',
        embedUrl: null,
        status: 'validé',
        geography: null,
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
        geography: 'France',
      });

      const expectedDutchChallenge = {
        ...challenge,
        id: dutchChallengeId,
        locales: ['nl'],
        status: 'proposé',
        ...translations.nl,
        embedUrl: dutchLocalizedChallenge.embedUrl,
        files: dutchFiles.map(({ fileId }) => fileId),
        geography: 'Pays-Bas',
      };

      const expectedEnglishChallenge = {
        ...challenge,
        id: englishChallengeId,
        locales: ['en'],
        status: 'validé',
        ...translations.en,
        embedUrl: 'https://example.com/index.html?lang=en&mode=example',
        files: englishFiles.map(({ fileId }) => fileId),
        geography: 'Neutre',
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
          geography: 'NZ',
        })],
        translations: { fr: {} },
        geography: 'DeprecatedLand',
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
          geography: null,
        })],
        translations: { fr: {} },
        geography: 'DeprecatedLand',
      });

      // when
      const codes = geographies.map((geography) => {
        challenge.geography = geography;
        return challenge.geographyCode;
      });

      // then
      expect(codes).toEqual([null, null, null]);
    });
  });

  describe('#cloneChallengeAndAttachments', ()=> {
    it('should clone challenge (no translations yet)', () => {
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
            status: null,
            fileIds: [],
            embedUrl: 'pix-mailccoule.fr',
            geography: 'France',
            urlsToConsult: ['https://monurl.fr'],
          }),
        ],
        files: [{
          fileId: 'attID',
          localizedChallengeId: 'challengeId'
        }],
        accessibility1: 'someValue',
        accessibility2: 'someOtherValue',
        alternativeVersion: 5,
        alpha: 'olé',
        archivedAt: new Date('2020-01-01'),
        author: 'CHU',
        autoReply: 'oui c auto reply',
        competenceId: 'someCompetenceId',
        contextualizedFields : ['mes super contextualizedFields'],
        createdAt: new Date('2019-01-01'),
        declinable: 'NON',
        delta: 'super delta',
        embedHeight: 800,
        focusable: 'oui avec plaisir',
        format: 'a4',
        genealogy: 'Décliné 1',
        geography: 'Monde',
        madeObsoleteAt: new Date('2021-01-01'),
        pedagogy: 'très fort',
        responsive: 'non pas pour mobile',
        shuffled: true,
        skillId: 'oldSkillId',
        skills: ['videz moi'],
        spoil: 'poil de nez',
        status: Challenge.STATUSES.VALIDE,
        t1Status: 'super t1',
        t2Status: 'super t2',
        t3Status: 'super t3',
        timer: '01:30',
        type: 'QROCM',
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
        attachments: []
      });

      // then
      expect(clonedAttachments).toStrictEqual([]);

      expect(clonedChallenge.id).toEqual(clonedChallengeId);
      expect(clonedChallenge.accessibility1).toEqual(challenge.accessibility1);
      expect(clonedChallenge.accessibility2).toEqual(challenge.accessibility2);
      expect(clonedChallenge.alternativeVersion).toEqual(alternativeVersion);
      expect(clonedChallenge.alpha).toBeNull;
      expect(clonedChallenge.archivedAt).toBeNull;
      expect(clonedChallenge.author).toEqual(challenge.author);
      expect(clonedChallenge.autoReply).toEqual(challenge.autoReply);
      expect(clonedChallenge.competenceId).toEqual(competenceId);
      expect(clonedChallenge.contextualizedFields).toEqual(challenge.contextualizedFields);
      expect(clonedChallenge.createdAt).toBeNull;
      expect(clonedChallenge.declinable).toEqual(challenge.declinable);
      expect(clonedChallenge.delta).toBeNull;
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
      expect(clonedChallenge.t1Status).toEqual(challenge.t1Status);
      expect(clonedChallenge.t2Status).toEqual(challenge.t2Status);
      expect(clonedChallenge.t3Status).toEqual(challenge.t3Status);
      expect(clonedChallenge.timer).toEqual(challenge.timer);
      expect(clonedChallenge.type).toEqual(challenge.type);
      expect(clonedChallenge.updatedAt).toBeNull;
      expect(clonedChallenge.validatedAt).toBeNull;
      expect(clonedChallenge.version).toEqual(prototypeVersion);
      expect(clonedChallenge.locales).toEqual(challenge.locales);
      expect(clonedChallenge.localizedChallenges[0]).toStrictEqual(domainBuilder.buildLocalizedChallenge({
        id: clonedChallengeId,
        challengeId: clonedChallengeId,
        status: null,
        embedUrl: challenge.localizedChallenges[0].embedUrl,
        geography: challenge.localizedChallenges[0].geography,
        urlsToConsult: challenge.localizedChallenges[0].urlsToConsult,
        fileIds: [],
        locale: challenge.localizedChallenges[0].locale,
      }));
    });

    it('should clone challenge translations and attachments', () => {
      // given
      const clonedChallengeId = 'clonedChallengeId';
      const competenceId = 'competenceId';
      const skillId = 'skillId';
      const alternativeVersion = 3;
      const prototypeVersion = 1;
      const generateNewIdFnc = vi.fn().mockImplementation(() => clonedChallengeId);
      const locales = ['fr', 'nl'];

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
            status: null,
            fileIds: ['attachmentIdA'],
            embedUrl: 'pix-mailccoule.fr',
            geography: 'France',
            urlsToConsult: ['https://monurl.fr'],
          }),
          new LocalizedChallenge({
            id: 'locNLChallengeId',
            challengeId: 'challengeId',
            locale: 'nl',
            status: Challenge.STATUSES.VALIDE,
            fileIds: ['attachmentIdB'],
            embedUrl: 'pix-mailccoule.nl',
            geography: 'Netherlands',
            urlsToConsult: ['https://monurl.nl'],
          }),
        ],
        files: [{
          fileId: 'attachmentIdA',
          localizedChallengeId: 'challengeId'
        },{
          fileId: 'attachmentIdB',
          localizedChallengeId: 'locNLChallengeId'
        }],
      });

      const attachmentIdA = domainBuilder.buildAttachment({
        id: 'attachmentIdA',
        url: 'cc',
        type: 'illustration',
        alt: 'mdr',
        challengeId: 'challengeId',
        localizedChallengeId: 'challengeId'
      });
      const attachmentIdB = domainBuilder.buildAttachment({
        id: 'attachmentIdB',
        url: 'cc',
        type: 'illustration',
        alt: 'mdr',
        challengeId: 'challengeId',
        localizedChallengeId: 'locNLChallengeId'
      });

      // when
      const { clonedChallenge, clonedAttachments } = challenge.cloneChallengeAndAttachments({
        skillId,
        competenceId,
        generateNewIdFnc,
        prototypeVersion,
        alternativeVersion,
        attachments: [attachmentIdA, attachmentIdB]
      });

      // then
      // airtable ids are unknown yet
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

      expect(clonedChallenge.localizedChallenges).toStrictEqual([domainBuilder.buildLocalizedChallenge({
        id: clonedChallengeId,
        challengeId: clonedChallengeId,
        status: null,
        embedUrl: challenge.localizedChallenges[0].embedUrl,
        geography: challenge.localizedChallenges[0].geography,
        urlsToConsult: challenge.localizedChallenges[0].urlsToConsult,
        fileIds: [],
        locale: challenge.localizedChallenges[0].locale,
      })]);

      expect(clonedAttachments).toStrictEqual([domainBuilder.buildAttachment({
        id: null,
        type: attachmentIdA.type,
        alt: attachmentIdA.alt,
        url: attachmentIdA.url,
        localizedChallengeId: clonedChallengeId,
        challengeId: clonedChallengeId
      })]);
    });
  });
});
