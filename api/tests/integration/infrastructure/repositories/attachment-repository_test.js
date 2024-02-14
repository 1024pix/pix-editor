import { describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as attachmentRepository from '../../../../lib/infrastructure/repositories/attachment-repository.js';

describe('Integration | Repository | attachment-repository', () => {

  describe('#list', () => {
    it('should return the list of all attachments with an alt illustration', async () => {
      // given
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId1',
        challengeId: 'challengeId1',
        locale: 'fr',
      });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId1Nl',
        challengeId: 'challengeId1',
        locale: 'nl',
      });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId2',
        challengeId: 'challengeId2',
        locale: 'en',
      });

      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeId1.illustrationAlt',
        locale: 'fr',
        value: 'illustration text alt 1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeId1.illustrationAlt',
        locale: 'nl',
        value: 'illustration text alt 1 nl',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeId2.illustrationAlt',
        locale: 'en',
        value: 'illustration text alt 2',
      });

      const airtableScope = airtableBuilder.mockList({ tableName: 'Attachments' }).returns([

        airtableBuilder.factory.buildAttachment({
          id: 'attachmentId1',
          type: 'illustration',
          url: 'http://1',
          challengeId: 'challengeId1',
          localizedChallengeId: 'localizedChallengeId1'
        }),
        airtableBuilder.factory.buildAttachment({
          id: 'attachmentId1Nl',
          type: 'illustration',
          url: 'http://1-nl',
          challengeId: 'challengeId1',
          localizedChallengeId: 'localizedChallengeId1Nl'
        }),
        airtableBuilder.factory.buildAttachment({
          id: 'attachmentId2',
          type: 'illustration',
          url: 'http://2',
          challengeId: 'challengeId2',
          localizedChallengeId: 'localizedChallengeId2'
        }),
        airtableBuilder.factory.buildAttachment({
          id: 'attachmentId3',
          type: 'attachment',
          url: 'http://3',
          challengeId: 'challengeId2',
          localizedChallengeId: 'localizedChallengeId2'
        }),
      ]).activate().nockScope;

      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        attachmentId: 'attachmentId1',
        localizedChallengeId: 'localizedChallengeId1'
      });

      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        attachmentId: 'attachmentId2',
        localizedChallengeId: 'localizedChallengeId2'
      });

      await databaseBuilder.commit();

      // when
      const attachments = await attachmentRepository.list();

      // then
      expect(attachments).toEqual([
        domainBuilder.buildAttachment({
          id: 'attachmentId1',
          type: 'illustration',
          alt: 'illustration text alt 1',
          url: 'http://1',
          challengeId: 'challengeId1',
          localizedChallengeId: 'localizedChallengeId1',
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentId1Nl',
          type: 'illustration',
          alt: 'illustration text alt 1 nl',
          url: 'http://1-nl',
          challengeId: 'challengeId1',
          localizedChallengeId: 'localizedChallengeId1Nl',
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentId2',
          type: 'illustration',
          alt: 'illustration text alt 2',
          url: 'http://2',
          challengeId: 'challengeId2',
          localizedChallengeId: 'localizedChallengeId2',
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentId3',
          type: 'attachment',
          alt: null,
          url: 'http://3',
          challengeId: 'challengeId2',
          localizedChallengeId: 'localizedChallengeId2',
        }),
      ]);

      airtableScope.done();
    });
  });
});
