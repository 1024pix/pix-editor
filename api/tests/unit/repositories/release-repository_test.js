import { describe, expect, it, vi } from 'vitest';
import { airtableBuilder, domainBuilder } from '../../test-helper.js';
import { attachmentDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { serializeEntity } from '../../../lib/infrastructure/repositories/release-repository.js';
import { challengeRepository } from '../../../lib/infrastructure/repositories/index.js';
import { Attachment } from '../../../lib/domain/models/index.js';
import { ChallengeForRelease } from '../../../lib/domain/models/release/index.js';

describe('Unit | Repository | release-repository', () => {
  describe('#serializeEntity', () => {
    it('serializes attachment', async () => {
      const entity = airtableBuilder.factory.buildAttachment({
        id: 'recAttachment',
        url: 'http://example.com/test',
        type: Attachment.TYPES.ILLUSTRATION,
        challengeId: 'recChallenge'
      });
      const attachmentRecords = [
        domainBuilder.buildAttachment({
          id: 'recAttachment2',
          url: 'http://example.com/attachment',
          type: Attachment.TYPES.ATTACHMENT,
          challengeId: 'recChallenge'
        }),
        domainBuilder.buildAttachment({
          id: 'recAttachment',
          alt: 'texte alternatif à l\'image',
          url: 'http://example.com/test',
          type: Attachment.TYPES.ILLUSTRATION,
          challengeId: 'recChallenge'
        }),
      ];

      const challenge = domainBuilder.buildChallenge({
        id: 'recChallenge',
        type: ChallengeForRelease.TYPES.QCM,
        t1Status: 'Activé',
        t2Status: 'Désactivé',
        t3Status: 'Activé',
        status: ChallengeForRelease.STATUSES.VALIDE,
        skillId: 'recUDrCWD76fp5MsE',
        timer: 1234,
        competenceId: 'recsvLz0W2ShyfD63',
        embedUrl: 'https://github.io/page/epreuve.html',
        embedTitle: 'Epreuve de selection de dossier',
        embedHeight: 500,
        format: ChallengeForRelease.FORMATS.MOTS,
        autoReply: false,
        illustrationAlt: 'texte alternatif à l\'image',
        files: [{
          fileId: 'recAttachment',
          localizedChallengeId: 'recChallenge'
        },
        {
          fileId: 'recAttachment2',
          localizedChallengeId: 'recChallenge'
        }],
      });
      const type = 'Attachments';

      vi.spyOn(challengeRepository, 'filter').mockImplementation(async ({ filter: { ids } }) => {
        if (ids.length === 1 && ids[0] === 'recChallenge') return [challenge];
      });
      vi.spyOn(attachmentDatasource, 'filterByLocalizedChallengeId').mockImplementation(async (spyId) => {
        if (spyId === 'recChallenge') return attachmentRecords;
      });

      const { updatedRecord, model } = await serializeEntity({ entity, type });

      expect(updatedRecord.illustrationUrl).to.equal('http://example.com/test');
      expect(updatedRecord.illustrationAlt).to.equal('texte alternatif à l\'image');
      expect(updatedRecord.attachments).to.deep.equal(['http://example.com/attachment']);
      expect(model).to.equal('challenges');
    });
  });
});
