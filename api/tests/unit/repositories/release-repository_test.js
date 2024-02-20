import { describe, expect, it, vi } from 'vitest';
import { domainBuilder, airtableBuilder } from '../../test-helper.js';
import { attachmentDatasource, challengeDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { serializeEntity } from '../../../lib/infrastructure/repositories/release-repository.js';
import { challengeRepository } from '../../../lib/infrastructure/repositories/index.js';
import { Translation } from '../../../lib/domain/models/index.js';

describe('Unit | Repository | release-repository', () => {
  describe('#serializeEntity', () => {
    it('serializes an area', async () => {
      const entity = airtableBuilder.factory.buildArea({
        id: '1',
        code: 1,
        color: 'blue',
        competenceIds: [],
        competenceAirtableIds: [],
        frameworkId: 'recFramework0',
      });
      const type = 'Domaines';
      const translations = [
        new Translation({
          key: 'area.1.title',
          locale: 'fr',
          value: 'Bonjour',
        }),
        new Translation({
          key: 'area.1.title',
          locale: 'en',
          value: 'Hello',
        }),
      ];

      vi.spyOn(attachmentDatasource, 'filterByLocalizedChallengeId');
      vi.spyOn(challengeDatasource, 'filterById');

      const { updatedRecord, model } = await serializeEntity({ entity, type, translations });

      expect(updatedRecord).to.deep.equal({
        id: '1',
        code: 1,
        color: 'blue',
        name: '1. Bonjour',
        competenceIds: [],
        competenceAirtableIds: [],
        title_i18n: {
          fr: 'Bonjour',
          en: 'Hello',
        },
        frameworkId: 'recFramework0',
      });
      expect(attachmentDatasource.filterByLocalizedChallengeId).not.toHaveBeenCalled();
      expect(challengeDatasource.filterById).not.toHaveBeenCalled();
      expect(model).to.equal('areas');
    });

    it('serializes attachment', async () => {
      const entity = airtableBuilder.factory.buildAttachment({
        id: 'recAttachment',
        url: 'http://example.com/test',
        type: 'illustration',
        challengeId: 'recChallenge'
      });
      const attachmentRecords = [
        domainBuilder.buildAttachment({
          id: 'recAttachment2',
          url: 'http://example.com/attachment',
          type: 'attachment',
          challengeId: 'recChallenge'
        }),
        domainBuilder.buildAttachment({
          id: 'recAttachment',
          alt: 'texte alternatif à l\'image',
          url: 'http://example.com/test',
          type: 'illustration',
          challengeId: 'recChallenge'
        }),
      ];

      const challenge = domainBuilder.buildChallenge({
        id: 'recChallenge',
        type: 'QCM',
        t1Status: 'Activé',
        t2Status: 'Désactivé',
        t3Status: 'Activé',
        status: 'validé',
        skillId: 'recUDrCWD76fp5MsE',
        timer: 1234,
        competenceId: 'recsvLz0W2ShyfD63',
        embedUrl: 'https://github.io/page/epreuve.html',
        embedTitle: 'Epreuve de selection de dossier',
        embedHeight: 500,
        format: 'mots',
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
