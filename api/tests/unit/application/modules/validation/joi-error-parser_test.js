import { describe, expect, it } from 'vitest';
import { joiErrorParser } from '../../../../../lib/application/modules/joi-error-parser.js';

describe('Unit | Infrastructure | Datasources | Learning Content | Module Datasource | joi error parser', function() {
  describe('#toStructuredErrors', function() {
    it('tags schema-shape errors as isSchemaError, since they are already detected by Monaco Editor', function() {
      const error = {
        details: [
          {
            message: '"id" must be a valid GUID',
            path: ['id'],
            type: 'string.guid',
            context: { label: 'id', value: 'f7b3a2-1a3d8f7e9f5d', key: 'id' },
          },
          {
            message: '"grains[0].components[0].element" does not match any of the allowed types',
            path: ['grains', 0, 'components', 0, 'element'],
            type: 'alternatives.any',
            context: { label: 'grains[0].components[0].element', value: {}, key: 0 },
          },
        ],
      };

      expect(joiErrorParser.toStructuredErrors(error)).to.deep.equal([
        { message: '"id" must be a valid GUID', isSchemaError: true },
        {
          message: '"grains[0].components[0].element" does not match any of the allowed types',
          isSchemaError: true,
        },
      ]);
    });

    it('tags cross-fields business rule errors as not isSchemaError', function() {
      // Joi's `.messages()` lookup by custom code isn't honored for `.external()` validators, so the
      // real error shape carries the message directly, with a generic 'external' type.
      const error = {
        details: [
          {
            message: "Il ne peut y avoir qu'un stepper par grain",
            path: ['grains', 0, 'components'],
            type: 'external',
            context: { label: 'grains[0].components', value: [], key: 'components' },
          },
        ],
      };

      expect(joiErrorParser.toStructuredErrors(error)).to.deep.equal([
        { message: "Il ne peut y avoir qu'un stepper par grain", isSchemaError: false },
      ]);
    });

    it('keeps html validation errors as not isSchemaError, with a readable message', function() {
      const error = {
        details: [
          {
            message: 'htmlvalidationerror',
            path: ['grains', 2, 'components', 0, 'element', 'feedbacks', 'invalid'],
            type: 'external',
            context: {
              value: {
                valid: false,
                results: [
                  {
                    filePath: 'inline',
                    messages: [
                      {
                        ruleId: 'attr-quotes',
                        severity: 2,
                        message: 'Attribute "aria-hidden" used \' instead of expected "',
                        ruleUrl: 'https://html-validate.org/rules/attr-quotes.html',
                      },
                    ],
                    errorCount: 1,
                    warningCount: 0,
                    source: "<p>Incorrect.</p>",
                  },
                ],
                errorCount: 1,
                warningCount: 0,
              },
              label: 'grains[2].components[0].element.feedbacks.invalid',
              key: 'invalid',
            },
          },
        ],
      };

      const result = joiErrorParser.toStructuredErrors(error);

      expect(result).to.have.lengthOf(1);
      expect(result[0].isSchemaError).to.equal(false);
      expect(result[0].message).to.contain('Attribute "aria-hidden" used \' instead of expected "');
    });
  });
});
