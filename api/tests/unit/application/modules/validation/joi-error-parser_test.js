import { describe, expect, it } from 'vitest';
import { joiErrorParser } from '../../../../../lib/application/modules/joi-error-parser.js';

describe('Unit | Infrastructure | Datasources | Learning Content | Module Datasource | joi error parser', function() {
  describe('#toStructuredErrors', function() {
    it('tags schema-shape errors as isSchemaError', function() {
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
            path: [
              'grains',
              0,
              'components',
              0,
              'element',
            ],
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
      const error = {
        details: [
          {
            message: "Il ne peut y avoir qu'un stepper par grain",
            path: [
              'grains',
              0,
              'components',
            ],
            type: 'external',
            context: { label: 'grains[0].components', value: [], key: 'components' },
          },
        ],
      };

      expect(joiErrorParser.toStructuredErrors(error)).to.deep.equal([{ message: "Il ne peut y avoir qu'un stepper par grain", isSchemaError: false }]);
    });
  });
});
