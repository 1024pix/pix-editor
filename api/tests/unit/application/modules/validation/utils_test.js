import Joi from 'joi';
import { describe, expect, it } from 'vitest';

import { withAssetsHostname, withCustomDraftUrlPrefix } from '../../../../../lib/application/modules/validation/utils.js';

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

  describe('#withCustomDraftUrlPrefix', function() {
    it('accepts a URL starting with an allowed prefix', async function() {
      // given
      const schema = withCustomDraftUrlPrefix(Joi.string().uri());

      // when
      const value = await schema.validateAsync('https://1024pix.github.io/atelier-contenus/placeholder.html');

      // then
      expect(value).to.equal('https://1024pix.github.io/atelier-contenus/placeholder.html');
    });

    it('rejects a URL that does not start with any allowed prefix', async function() {
      // given
      const schema = withCustomDraftUrlPrefix(Joi.string().uri());

      // when
      try {
        await schema.validateAsync('https://1024pix.github.io/placeholder.html');
        throw new Error('Joi validation should have thrown');
      } catch (joiError) {
        // then
        expect(joiError.message).to.equal(
          '"value" doit commencer par l\'une des valeurs suivantes : https://1024pix.github.io/atelier-contenus, https://1024pix.github.io/pix-epreuves-externes',
        );
      }
    });
  });
});
