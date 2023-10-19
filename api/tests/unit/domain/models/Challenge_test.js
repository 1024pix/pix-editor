import { describe, expect, it } from 'vitest';
import { Challenge } from '../../../../lib/domain/models/Challenge';

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
});
