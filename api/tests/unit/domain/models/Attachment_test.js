import { describe, describe as context, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Attachment', () => {
  context('#clone', () => {
    it('should clone the Attachment with a null ID', () => {
      // given
      const attachment = domainBuilder.buildAttachment({
        id: 'oldId',
        url:'http://cc.c',
        type: 'illustration',
        alt: 'je suis où là ?',
        size: 345,
        mimeType: 'image/png',
        filename: 'nom_du_fichier',
        challengeId: 'challengeId',
        localizedChallengeId: 'localizedChallengeId'
      });

      // when
      const clonedAttachment = attachment.clone({
        challengeId: 'newChallengeId',
        localizedChallengeId: 'newLocalizedChallengeId',
      });

      // then
      const expectedAttachment = domainBuilder.buildAttachment({
        id: null,
        url:'http://cc.c',
        type: 'illustration',
        alt: 'je suis où là ?',
        size: 345,
        mimeType: 'image/png',
        filename: 'nom_du_fichier',
        challengeId: 'newChallengeId',
        localizedChallengeId: 'newLocalizedChallengeId'
      });

      expect(clonedAttachment).toStrictEqual(expectedAttachment);
    });
  });
});
