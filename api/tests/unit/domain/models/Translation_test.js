import { describe, describe as context, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { Translation } from '../../../../lib/domain/models/Translation.js';

describe('Unit | Domain | Translation', function() {
  context('get entityId', function() {
    it('should generate the expected entityId', function() {
      // given
      const translation = domainBuilder.buildTranslation({ key: 'challenge.idDuChallenge.champ' });

      // when
      const entityId = translation.entityId;

      // then
      expect(entityId).to.equal('idDuChallenge');
    });
  });

  context('get model', function() {
    it('should return the expected model', function() {
      // given
      const translation = domainBuilder.buildTranslation({ key: 'challenge.idDuChallenge.champ' });

      // when
      const model = translation.model;

      // then
      expect(model).to.equal('challenge');
    });
  });

  context('exorciseDevilApostrophe', function() {
    it('returns a model without the escaping apostrophe on proposals field', function() {
      // given
      const translation = {
        key: 'challenge.challengeId.proposals',
        locale: 'fr',
        value: '\'-pouet 1\n -patate douce',
      };

      // when
      const result = new Translation(translation);

      // then
      expect(result).toBeInstanceOf(Translation);
      expect(result).to.deep.equal({
        key: 'challenge.challengeId.proposals',
        locale: 'fr',
        value: '-pouet 1\n -patate douce',
      });
    });

    it('returns a model without the escaping apostrophe on another field', function() {
      // given
      const translation = {
        key: 'challenge.challengeId.instruction',
        locale: 'fr',
        value: '\'-pouet 1\n -patate douce',
      };

      // when
      const result = new Translation(translation);

      // then
      expect(result).toBeInstanceOf(Translation);
      expect(result).to.deep.equal({
        key: 'challenge.challengeId.instruction',
        locale: 'fr',
        value: '\'-pouet 1\n -patate douce',
      });
    });
  });
});
