import { describe, describe as context, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Translation', function() {
  context('get entityId', function() {
    it('should generate the expected entityId', function() {
      // given
      const translation = domainBuilder.buildTranslation({
        key: 'challenge.idDuChallenge.champ',
      });

      // when
      const entityId = translation.entityId;

      // then
      expect(entityId).to.equal('idDuChallenge');
    });
  });
});
