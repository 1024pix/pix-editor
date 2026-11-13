import Joi from 'joi';
import { describe, expect, it } from 'vitest';

import { withAssetsHostname } from '../../../../../lib/application/modules/validation/utils.js';

describe('Unit | Application | Modules | Validation | utils', function() {
  describe('#withAssetsHostname', function() {
    it('accepts a URL hosted on assets.pix.org', async function() {
      // given
      const schema = withAssetsHostname(Joi.string().uri());

      // when
      const value = await schema.validateAsync('https://assets.pix.org/modulix/placeholder-image.svg');

      // then
      expect(value).to.equal('https://assets.pix.org/modulix/placeholder-image.svg');
    });

    it('rejects a URL hosted on another domain', async function() {
      // given
      const schema = withAssetsHostname(Joi.string().uri());

      // when
      try {
        await schema.validateAsync('https://example.com/modulix/placeholder-image.svg');
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        // then
        expect(joiError.message).to.equal('"value" doit être hébergé sur "assets.pix.org"');
      }
    });

    it('does not validate hostname when the value is empty', async function() {
      // given
      const schema = withAssetsHostname(Joi.string().uri().allow(''));

      // when
      const value = await schema.validateAsync('');

      // then
      expect(value).to.equal('');
    });
  });
});
