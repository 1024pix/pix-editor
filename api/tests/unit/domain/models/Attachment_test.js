import { describe, describe as context, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Attachment', () => {
  context('#clone', () => {
    it('should clone the Attachment with a null ID', () => {
      // given
      const attachment = domainBuilder.buildAttachment({
        id: 'oldId',
        url: 'http://cc.c',
        type: 'illustration',
        size: 345,
        mimeType: 'image/png',
        filename: 'nom_du_fichier',
        challengeId: 'challengeId',
        airtableChallengeId: 'challengeAirtableId',
        localizedChallengeId: 'localizedChallengeId',
      });

      // when
      const clonedAttachment = attachment.clone({
        challengeId: 'newChallengeId',
        localizedChallengeId: 'newLocalizedChallengeId',
      });

      // then
      const expectedAttachment = domainBuilder.buildAttachment({
        id: null,
        url: 'http://cc.c',
        type: 'illustration',
        size: 345,
        mimeType: 'image/png',
        filename: 'nom_du_fichier',
        challengeId: 'newChallengeId',
        localizedChallengeId: 'newLocalizedChallengeId',
        airtableChallengeId: null,
      });

      expect(clonedAttachment).toStrictEqual(expectedAttachment);
    });
  });
  context('#update', () => {
    it('should update allowed attributes from update command', () => {
      // given
      const baseData = {
        id: 'rec123aze',
        filename: 'base filename',
        size: 123,
        url: 'base.url.com',
        type: 'base type',
        mimeType: 'base mime type',
        localizedChallengeId: 'locId123',
        challengeId: 'challenge123',
      };
      const updateCommand = {
        id: 'some id',
        filename: 'some filename',
        size: 456,
        url: 'some.url.com',
        type: 'some type',
        mimeType: 'some mime type',
        localizedChallengeId: 'locId456',
        challengeId: 'challenge456',
      };
      const attachment = domainBuilder.buildAttachment(baseData);

      // when
      attachment.update(updateCommand);

      // then
      const expectedAttachment = domainBuilder.buildAttachment({
        ...baseData,
        filename: 'some filename',
      });
      expect(attachment).toStrictEqual(expectedAttachment);
    });
  });
});
