import { describe, expect, it, vi } from 'vitest';
import { domainBuilder, airtableBuilder } from '../../test-helper.js';
import { attachmentDatasource, challengeDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { serializeEntity } from '../../../lib/infrastructure/repositories/release-repository.js';

describe('Unit | Repository | release-repository', () => {
  describe('#serializeEntity', () => {
    it('serialize a challenge and fetch attachments', async () => {
      const challengeDataObject = domainBuilder.buildChallengeDatasourceObject({ id: 'recChallenge' });
      const entity = airtableBuilder.factory.buildChallenge({
        id: 'recChallenge',
        instruction: challengeDataObject.instruction,
        alternativeInstruction: challengeDataObject.alternativeInstruction,
        proposals: challengeDataObject.proposals,
        type: challengeDataObject.type,
        solution: challengeDataObject.solution,
        solutionToDisplay: challengeDataObject.solutionToDisplay,
        t1Status: challengeDataObject.t1Status,
        t2Status: challengeDataObject.t2Status,
        t3Status: challengeDataObject.t3Status,
        status: challengeDataObject.status,
        skillId: challengeDataObject.skillId,
        timer: challengeDataObject.timer,
        illustrationUrl: challengeDataObject.illustrationUrl,
        attachments: challengeDataObject.attachments || [],
        competenceId: challengeDataObject.competenceId,
        embedUrl: challengeDataObject.embedUrl,
        embedTitle: challengeDataObject.embedTitle,
        embedHeight: challengeDataObject.embedHeight,
        illustrationAlt: challengeDataObject.illustrationAlt,
        format: challengeDataObject.format,
        autoReply: challengeDataObject.autoReply,
      });
      const attachment = domainBuilder.buildAttachment({
        id: '1',
        alt: '',
        type: 'illustration',
        url: 'http://example.com/test',
        challengeId: 'recChallenge',
      });
      const type = 'Epreuves';

      vi.spyOn(attachmentDatasource, 'filterByChallengeId').mockImplementation(async (spyId) => {
        if (spyId === 'recChallenge') return [attachment];
      });

      const { updatedRecord, model } = await serializeEntity({ entity, type });

      expect(updatedRecord.illustrationUrl).to.equal('http://example.com/test');
      expect(model).to.equal('challenges');
    });

    it('serialize an area', async () => {
      const entity = airtableBuilder.factory.buildArea({
        id: '1',
        code: 1,
        color: 'blue',
        name: '1',
        competenceIds: [],
        competenceAirtableIds: [],
        title_i18n: {
          fr: 'Bonjour',
          en: 'Hello',
        },
        frameworkId: 'recFramework0',
      });
      const type = 'Domaines';
      vi.spyOn(attachmentDatasource, 'filterByChallengeId');
      vi.spyOn(challengeDatasource, 'filterById');

      const { updatedRecord, model } = await serializeEntity({ entity, type });

      expect(updatedRecord).to.deep.equal({
        id: '1',
        code: 1,
        color: 'blue',
        name: '1',
        competenceIds: [],
        competenceAirtableIds: [],
        title_i18n: {
          fr: 'Bonjour',
          en: 'Hello',
        },
        frameworkId: 'recFramework0',
      });
      expect(attachmentDatasource.filterByChallengeId).not.toHaveBeenCalled();
      expect(challengeDatasource.filterById).not.toHaveBeenCalled();
      expect(model).to.equal('areas');
    });

    it('serialize attachment', async () => {
      const entity = airtableBuilder.factory.buildAttachment({
        id: 'recAttachment',
        alt: 'texte alternatif à l\'image',
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

      const challenge = domainBuilder.buildChallengeDatasourceObject({
        id: 'recChallenge',
        instruction : 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
        alternativeInstruction : '',
        proposals : '- 1\n- 2\n- 3\n- 4\n- 5',
        type : 'QCM',
        solution : '1, 5',
        solutionToDisplay : '1',
        t1Status : 'Activé',
        t2Status : 'Désactivé',
        t3Status : 'Activé',
        status : 'validé',
        skillId : 'recUDrCWD76fp5MsE',
        timer : 1234,
        competenceId : 'recsvLz0W2ShyfD63',
        embedUrl : 'https://github.io/page/epreuve.html',
        embedTitle : 'Epreuve de selection de dossier',
        embedHeight : 500,
        format : 'mots',
        autoReply : false,
      });
      const type = 'Attachments';

      vi.spyOn(challengeDatasource, 'filterById').mockImplementation(async (spyId) => {
        if (spyId === 'recChallenge') return challenge;
      });
      vi.spyOn(attachmentDatasource, 'filterByChallengeId').mockImplementation(async (spyId) => {
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
