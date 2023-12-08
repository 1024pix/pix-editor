import { describe, it, expect } from 'vitest';
import { parseQROCProposal } from './parse-qroc-proposal';

describe('parseQROCProposal', () => {
  describe('text input', () => {
    describe('should parse qroc input and return as an object', () => {
      it('should set the input name, type and add empty modifiers if not given', () => {
        expect(parseQROCProposal('${symbole}')).toStrictEqual({
          input: 'symbole',
          type: 'input',
          placeholder: '',
          ariaLabel: '',
          defaultValue: null,
        });
      });

      describe('single modifier', () => {
        it('should set given placeholder', () => {
          expect(parseQROCProposal('${symbole#Placeholder du champ}')).toStrictEqual({
            input: 'symbole',
            type: 'input',
            placeholder: 'Placeholder du champ',
            ariaLabel: '',
            defaultValue: null,
          });
        });

        it('should set given aria-label', () => {
          expect(parseQROCProposal('${symbole§aria-label du champ}')).toStrictEqual({
            input: 'symbole',
            type: 'input',
            placeholder: '',
            ariaLabel: 'aria-label du champ',
            defaultValue: null,
          });
        });

        it('should set given default value', () => {
          expect(parseQROCProposal('${truc-bidule value="valeur par défaut"}')).toStrictEqual({
            input: 'truc-bidule',
            type: 'input',
            placeholder: '',
            ariaLabel: '',
            defaultValue: 'valeur par défaut',
          });
        });

        it('should set the last given modifier if duplicated', () => {
          expect(parseQROCProposal('${symbole#1#2}').placeholder).toBe('2');
          expect(parseQROCProposal('${symbole§1§2}').ariaLabel).toBe('2');
          expect(parseQROCProposal('${symbole value="1" value="2"}').defaultValue).toBe('2');
        });
      });

      describe('multiple modifiers', () => {
        it('should combine all modifiers in the documented order', () => {
          expect(
            parseQROCProposal('${variableFoo#Placeholder du champ§aria-label du champ value="valeur par défaut"}'),
          ).toStrictEqual({
            input: 'variableFoo',
            type: 'input',
            placeholder: 'Placeholder du champ',
            ariaLabel: 'aria-label du champ',
            defaultValue: 'valeur par défaut',
          });
        });

        it('should throw if documented order is not respected', () => {
          expect(() =>
            parseQROCProposal('${variableFoo value="valeur par défaut"§aria-label du champ#Placeholder du champ}'),
          ).toThrow(new TypeError('proposal modifiers should be unique and in the documented order'));
        });

        it('should throw if multiples modifiers are set', () => {
          expect(() => parseQROCProposal('${variableFoo value="valeur par défaut"#1§aria-label du champ#2}')).toThrow(
            new TypeError('proposal modifiers should be unique and in the documented order'),
          );
          expect(() => parseQROCProposal('${variableFoo value="valeur par défaut"§1#Placeholder du champ§2}')).toThrow(
            new TypeError('proposal modifiers should be unique and in the documented order'),
          );
          expect(() =>
            parseQROCProposal(
              '${variableFoo value="1"§aria-label du champ value="2"#Placeholder du champ§autre aria-label du champ}',
            ),
          ).toThrow(new TypeError('proposal modifiers should be unique and in the documented order'));
        });
      });
    });
  });
});
