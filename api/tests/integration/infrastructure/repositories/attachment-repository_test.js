import { describe, describe as context, expect, it, vi, beforeEach } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as attachmentRepository from '../../../../lib/infrastructure/repositories/attachment-repository.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';

describe('Integration | Repository | attachment-repository', () => {
  const challengeId1 = 'challengeId1';
  const challengeId2 = 'challengeId2';

  beforeEach(async () => {
    databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
    databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
    databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
    databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
    databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
    databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
    databaseBuilder.factory.buildChallenge(
      domainBuilder.buildChallengeDatasourceObject({ id: challengeId1, skillId: 'skill1' }),
    );
    databaseBuilder.factory.buildChallenge(
      domainBuilder.buildChallengeDatasourceObject({ id: challengeId2, skillId: 'skill1' }),
    );
    await databaseBuilder.commit();
  });

  describe('#list', () => {
    it('should return the list of all attachments', async () => {
      // given
      const attachments = [
        {
          id: 'attachmentId1',
          type: 'illustration',
          mimeType: 'mimeType1',
          filename: 'filename_1',
          url: 'http://1',
          size: 1,
          challengeId: 'challengeId1',
          localizedChallengeId: 'localizedChallengeId1',
        },
        {
          id: 'attachmentId1Nl',
          type: 'illustration',
          mimeType: 'mimeType1NL',
          filename: 'filename_1NL',
          url: 'http://1-nl',
          size: 2,
          challengeId: challengeId1,
          localizedChallengeId: 'localizedChallengeId1Nl',
        },
        {
          id: 'attachmentId2',
          type: 'illustration',
          mimeType: 'mimeType2',
          filename: 'filename_2',
          url: 'http://2',
          size: 3,
          challengeId: challengeId2,
          localizedChallengeId: 'localizedChallengeId2',
        },
        {
          id: 'attachmentId3',
          type: 'attachment',
          mimeType: 'mimeType3',
          filename: 'filename_3',
          url: 'http://3',
          size: 4,
          challengeId: challengeId2,
          localizedChallengeId: 'localizedChallengeId2',
        },
      ].map(domainBuilder.buildAttachmentDatasourceObject);

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId1',
        challengeId: challengeId1,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId1Nl',
        challengeId: challengeId1,
        locale: 'nl',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId2',
        challengeId: challengeId2,
      });

      attachments.forEach(databaseBuilder.factory.buildAttachment);

      await databaseBuilder.commit();

      // when
      const result = await attachmentRepository.list();

      // then
      expect(result).toStrictEqual(attachments.map(domainBuilder.buildAttachment));
    });
  });

  describe('#listByLocalizedChallengeIds', () => {
    it('should retrieve attachments by given localized challenge ids', async () => {
      // given
      const attachment_NL_forChallengeA_data = {
        id: 'attachment_NL_forChallengeA_data_id',
        url: 'url attachment_NL_forChallengeA_data',
        size: 123,
        type: 'illustration',
        mimeType: 'images/jpeg',
        filename: 'attachment_nl_challengeA_filename',
        challengeId: challengeId1,
        localizedChallengeId: 'localizedChallengeNLForChallengeA',
      };
      const attachment_FR_forChallengeA_data = {
        id: 'attachment_FR_forChallengeA_data_id',
        url: 'url attachment_FR_forChallengeA_data',
        size: 123,
        type: 'illustration',
        mimeType: 'images/jpeg',
        filename: 'attachment_fr_challengeA_filename',
        challengeId: challengeId1,
        localizedChallengeId: challengeId1,
      };
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId1,
        challengeId: challengeId1,
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeNLForChallengeA',
        challengeId: challengeId1,
        locale: 'nl',
      });
      const attachment_FR_forChallengeB_data = {
        id: 'attachment_FR_forChallengeB_data_id',
        url: 'url attachment_FR_forChallengeB_data',
        size: 456,
        type: 'attachment',
        mimeType: 'text/csv',
        filename: 'attachment_fr_challengeB_filename',
        challengeId: challengeId2,
        localizedChallengeId: challengeId2,
      };
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId2,
        challengeId: challengeId2,
        locale: 'fr',
      });
      [
        attachment_FR_forChallengeA_data,
        attachment_NL_forChallengeA_data,
        attachment_FR_forChallengeB_data,
      ].forEach(
        (attachment) =>
          databaseBuilder.factory.buildAttachment(domainBuilder.buildAttachmentDatasourceObject(attachment)),
      );
      await databaseBuilder.commit();

      // when
      const attachments = await attachmentRepository.listByLocalizedChallengeIds([
        challengeId1,
        'localizedChallengeNLForChallengeA',
        challengeId2,
      ]);

      // then
      expect(attachments).toStrictEqual([
        domainBuilder.buildAttachment({
          id: attachment_FR_forChallengeA_data.id,
          url: attachment_FR_forChallengeA_data.url,
          type: attachment_FR_forChallengeA_data.type,
          size: attachment_FR_forChallengeA_data.size,
          mimeType: attachment_FR_forChallengeA_data.mimeType,
          filename: attachment_FR_forChallengeA_data.filename,
          challengeId: attachment_FR_forChallengeA_data.challengeId,
          localizedChallengeId: attachment_FR_forChallengeA_data.localizedChallengeId,
        }),
        domainBuilder.buildAttachment({
          id: attachment_FR_forChallengeB_data.id,
          url: attachment_FR_forChallengeB_data.url,
          type: attachment_FR_forChallengeB_data.type,
          size: attachment_FR_forChallengeB_data.size,
          mimeType: attachment_FR_forChallengeB_data.mimeType,
          filename: attachment_FR_forChallengeB_data.filename,
          challengeId: attachment_FR_forChallengeB_data.challengeId,
          localizedChallengeId: attachment_FR_forChallengeB_data.localizedChallengeId,
        }),
        domainBuilder.buildAttachment({
          id: attachment_NL_forChallengeA_data.id,
          url: attachment_NL_forChallengeA_data.url,
          type: attachment_NL_forChallengeA_data.type,
          size: attachment_NL_forChallengeA_data.size,
          mimeType: attachment_NL_forChallengeA_data.mimeType,
          filename: attachment_NL_forChallengeA_data.filename,
          challengeId: attachment_NL_forChallengeA_data.challengeId,
          localizedChallengeId: attachment_NL_forChallengeA_data.localizedChallengeId,
        }),
      ]);
    });

    it('should return an empty array when no localized challenge ids provided', async () => {
      // when
      const attachments = await attachmentRepository.listByLocalizedChallengeIds([]);

      // then
      expect(attachments).toStrictEqual([]);
    });

    it('should return an empty array when no attachment found for provided localized challenge ids', async () => {
      // when
      const attachments = await attachmentRepository.listByLocalizedChallengeIds(['someLocalizedChallengeId']);

      // then
      expect(attachments).toStrictEqual([]);
    });
  });

  describe('#createBatch', () => {
    it('should create several attachments', async () => {
      // given
      const attachmentA = domainBuilder.buildAttachment({
        id: null,
        url: 'url/to/clone/attachmentA',
        type: 'illustration',
        size: 123,
        mimeType: 'image/jpeg',
        filename: 'attachmentA_filename',
        challengeId: challengeId1,
        localizedChallengeId: 'localizedChallengeA',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeA',
        challengeId: challengeId1,
        locale: 'nl',
      });
      const attachmentB = domainBuilder.buildAttachment({
        id: null,
        url: 'url/to/clone/attachmentB',
        type: 'attachment',
        size: 456,
        mimeType: 'text/csv',
        filename: 'attachmentB_filename',
        challengeId: challengeId2,
        localizedChallengeId: challengeId2,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId2,
        challengeId: challengeId2,
        locale: 'fr',
      });
      await databaseBuilder.commit();

      const generateNewId = vi
        .spyOn(idGenerator, 'generateNewId')
        .mockReturnValueOnce('attachmentA')
        .mockReturnValueOnce('attachmentB');

      // when
      const attachments = await attachmentRepository.createBatch([attachmentA, attachmentB]);

      // then
      expect(attachments).toStrictEqual([
        domainBuilder.buildAttachment({
          id: 'attachmentA',
          url: attachmentA.url,
          type: attachmentA.type,
          size: attachmentA.size,
          mimeType: attachmentA.mimeType,
          filename: attachmentA.filename,
          challengeId: attachmentA.challengeId,
          localizedChallengeId: attachmentA.localizedChallengeId,
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentB',
          url: attachmentB.url,
          type: attachmentB.type,
          size: attachmentB.size,
          mimeType: attachmentB.mimeType,
          filename: attachmentB.filename,
          challengeId: attachmentB.challengeId,
          localizedChallengeId: attachmentB.localizedChallengeId,
        }),
      ]);

      await expect(knex.select('*').from('attachments').orderBy('id')).resolves.toStrictEqual([
        {
          id: 'attachmentA',
          url: attachmentA.url,
          type: attachmentA.type,
          size: attachmentA.size,
          mimeType: attachmentA.mimeType,
          filename: attachmentA.filename,
          challengeId: attachmentA.challengeId,
          localizedChallengeId: attachmentA.localizedChallengeId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: 'attachmentB',
          url: attachmentB.url,
          type: attachmentB.type,
          size: attachmentB.size,
          mimeType: attachmentB.mimeType,
          filename: attachmentB.filename,
          challengeId: attachmentB.challengeId,
          localizedChallengeId: attachmentB.localizedChallengeId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      expect(generateNewId).toHaveBeenNthCalledWith(1, 'attachment');
      expect(generateNewId).toHaveBeenNthCalledWith(2, 'attachment');
    });
  });

  describe('#create', () => {
    it('should create an attachment', async () => {
      // given
      const attachment = domainBuilder.buildAttachment({
        id: null,
        url: 'url/to/attachment',
        type: 'some other type',
        size: 123,
        mimeType: 'image/jpeg',
        filename: 'attachment_filename',
        challengeId: challengeId1,
        localizedChallengeId: 'challengeIdES',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId1,
        challengeId: challengeId1,
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeIdES',
        challengeId: challengeId1,
        locale: 'es',
      });
      await databaseBuilder.commit();

      const id = 'attachment1';
      const generateNewId = vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce(id);

      // when
      const createdAttachment = await attachmentRepository.create(attachment);

      // then
      const expectedAttachment = domainBuilder.buildAttachment({
        id,
        url: attachment.url,
        type: attachment.type,
        size: attachment.size,
        mimeType: attachment.mimeType,
        filename: attachment.filename,
        challengeId: challengeId1,
        localizedChallengeId: 'challengeIdES',
      });
      expect(createdAttachment).toStrictEqual(expectedAttachment);

      await expect(knex.select('*').from('attachments')).resolves.toStrictEqual([
        {
          id,
          url: attachment.url,
          type: attachment.type,
          size: attachment.size,
          mimeType: attachment.mimeType,
          filename: attachment.filename,
          challengeId: challengeId1,
          localizedChallengeId: 'challengeIdES',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      expect(generateNewId).toHaveBeenCalledExactlyOnceWith('attachment');
    });
  });

  describe('#update', () => {
    it('should update an attachment', async () => {
      // given
      const attachmentDto = {
        id: 'recABC123',
        url: 'url/to/attachment',
        type: 'some other type',
        size: 123,
        mimeType: 'image/jpeg',
        filename: 'attachment_filename',
        challengeId: challengeId1,
        localizedChallengeId: 'localizedChallengeId',
      };
      const attachment = domainBuilder.buildAttachment(attachmentDto);

      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId1,
        challengeId: challengeId1,
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId',
        challengeId: challengeId1,
        locale: 'nl',
      });
      databaseBuilder.factory.buildAttachment({
        ...attachmentDto,
        filename: 'old attachment_filename',
      });
      await databaseBuilder.commit();

      // when
      const updatedAttachment = await attachmentRepository.update(attachment);

      // then
      const expectedAttachment = domainBuilder.buildAttachment({
        id: attachment.id,
        url: attachment.url,
        type: attachment.type,
        size: attachment.size,
        mimeType: attachment.mimeType,
        filename: attachment.filename,
        challengeId: challengeId1,
        localizedChallengeId: attachment.localizedChallengeId,
      });
      expect(updatedAttachment).toStrictEqual(expectedAttachment);

      await expect(knex.select('*').from('attachments')).resolves.toStrictEqual([
        {
          id: 'recABC123',
          url: 'url/to/attachment',
          type: 'some other type',
          size: 123,
          mimeType: 'image/jpeg',
          filename: 'attachment_filename',
          challengeId: challengeId1,
          localizedChallengeId: 'localizedChallengeId',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });

  describe('#get', () => {
    context('when attachment does not exist', function() {
      it('should return null', async () => {
        // when
        const nullAtt = await attachmentRepository.get('recABC123');

        // then
        expect(nullAtt).to.be.null;
      });
    });

    context('when attachment exists', function() {
      it('should return the attachment by id', async () => {
        // given
        const attachment = domainBuilder.buildAttachmentDatasourceObject({
          id: 'recABC123',
          url: 'url/to/attachment',
          type: 'some other type',
          size: 123,
          mimeType: 'image/jpeg',
          filename: 'attachment_filename',
          challengeId: challengeId1,
          localizedChallengeId: 'localizedChallengeId',
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: challengeId1,
          challengeId: challengeId1,
          locale: 'fr',
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'localizedChallengeId',
          challengeId: challengeId1,
          locale: 'nl',
        });
        databaseBuilder.factory.buildAttachment(attachment);
        await databaseBuilder.commit();

        // when
        const result = await attachmentRepository.get('recABC123');

        // then
        expect(result).toStrictEqual(domainBuilder.buildAttachment(attachment));
      });
    });
  });

  describe('#remove', () => {
    it('delete the attachment', async () => {
      // given
      const attachmentId = 'attachmentId';
      const loc1Id = databaseBuilder.factory.buildLocalizedChallenge({ id: 'loc1', challengeId: challengeId1 }).id;
      const loc2Id = databaseBuilder.factory.buildLocalizedChallenge({ id: 'loc2', challengeId: challengeId2 }).id;

      databaseBuilder.factory.buildAttachment({
        id: attachmentId,
        url: 'url',
        size: 123,
        type: 'type',
        mimeType: 'mimeType',
        filename: 'filename',
        challengeId: challengeId1,
        localizedChallengeId: loc1Id,
      });
      databaseBuilder.factory.buildAttachment({
        id: 'someOtherAttachmentId',
        url: 'url',
        size: 123,
        type: 'type',
        mimeType: 'mimeType',
        filename: 'filename',
        challengeId: challengeId2,
        localizedChallengeId: loc2Id,
      });

      await databaseBuilder.commit();

      // when
      await attachmentRepository.remove(attachmentId);

      // then
      await expect(knex('attachments').pluck('id')).resolves.toStrictEqual(['someOtherAttachmentId']);
    });
  });
});
