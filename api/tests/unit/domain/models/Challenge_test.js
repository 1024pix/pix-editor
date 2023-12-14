import { describe, expect, it } from 'vitest';
import { Challenge } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Challenge', () => {

  const fields = ['instruction', 'alternativeInstruction', 'proposals', 'solution', 'solutionToDisplay'];

  for (const field of fields) {
    describe(`#get ${field}`, () => {
      it(`should return ${field} from translations`, () => {
        // given
        const tests = [
          {
            challenge: new Challenge({
              translations: {
                fr: { [field]: `${field} fr` },
                en: { [field]: `${field} en` },
              },
              locales: ['en'],
            }),
            expected: `${field} en`,
          },
          {
            challenge: new Challenge({
              translations: {
                fr: { [field]: `${field} fr` },
                en: { [field]: `${field} en` },
              },
              locales: ['fr'],
            }),
            expected: `${field} fr`,
          },
          {
            challenge: new Challenge({
              translations: {
                fr: { [field]: `${field} fr` },
                'fr-fr': { [field]: `${field} fr-fr` },
              },
            }),
            expected: `${field} fr`,
          },
          {
            challenge: new Challenge({
              translations: {
                fr: { [field]: `${field} fr` },
                'fr-fr': { [field]: `${field} fr-fr` },
              },
              locales: ['fr-fr', 'fr'],
            }),
            expected: `${field} fr`,
          },
          {
            challenge: new Challenge({
              translations: {
                fr: {},
              },
              locales: ['fr'],
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
      const tests = [
        {
          challenge: new Challenge({
            translations: {
              fr: { instruction: 'instruction fr' },
              en: { instruction: 'instruction en' },
            },
            locales: ['en'],
          }),
          expected: 'instruction en',
        },
        {
          challenge: new Challenge({
            translations: {
              fr: { instruction: 'instruction fr' },
              en: { instruction: 'instruction en' },
            },
            locales: ['fr'],
          }),
          expected: 'instruction fr',
        },
        {
          challenge: new Challenge({
            translations: {
              fr: { instruction: 'instruction fr' },
              'fr-fr': { instruction: 'instruction fr-fr' },
            },
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
        localizedChallenges
      });

      // when
      const embedUrl = challenge.embedUrl;

      // then
      expect(embedUrl).toBe('mon.site.fr');
    });
  });
});
