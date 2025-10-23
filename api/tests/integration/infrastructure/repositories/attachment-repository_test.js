import { afterEach, describe, describe as context, expect, it, vi, beforeEach } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as attachmentRepository from '../../../../lib/infrastructure/repositories/attachment-repository.js';
import * as airtableClient from '../../../../lib/infrastructure/airtable.js';
import { challengeDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import _ from 'lodash';

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
      const airtableScope = airtableBuilder
        .mockList({ tableName: 'Attachments' })
        .returns([
          airtableBuilder.factory.buildAttachment({
            id: 'attachmentId1',
            type: 'illustration',
            mimeType: 'mimeType1',
            filename: 'filename_1',
            url: 'http://1',
            challengeId: 'challengeId1',
            airtableChallengeId: 'challengeAirtableId1',
            localizedChallengeId: 'localizedChallengeId1',
          }),
          airtableBuilder.factory.buildAttachment({
            id: 'attachmentId1Nl',
            type: 'illustration',
            mimeType: 'mimeType1NL',
            filename: 'filename_1NL',
            url: 'http://1-nl',
            challengeId: challengeId1,
            airtableChallengeId: 'challengeAirtableId1',
            localizedChallengeId: 'localizedChallengeId1Nl',
          }),
          airtableBuilder.factory.buildAttachment({
            id: 'attachmentId2',
            type: 'illustration',
            mimeType: 'mimeType2',
            filename: 'filename_2',
            url: 'http://2',
            challengeId: challengeId2,
            airtableChallengeId: 'challengeAirtableId2',
            localizedChallengeId: 'localizedChallengeId2',
          }),
          airtableBuilder.factory.buildAttachment({
            id: 'attachmentId3',
            type: 'attachment',
            mimeType: 'mimeType3',
            filename: 'filename_3',
            url: 'http://3',
            challengeId: challengeId2,
            airtableChallengeId: 'challengeAirtableId2',
            localizedChallengeId: 'localizedChallengeId2',
          }),
        ])
        .activate().nockScope;

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId1',
        challengeId: challengeId1,
      });
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        attachmentId: 'attachmentId1',
        localizedChallengeId: 'localizedChallengeId1',
      });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId2',
        challengeId: challengeId2,
      });
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        attachmentId: 'attachmentId2',
        localizedChallengeId: 'localizedChallengeId2',
      });

      await databaseBuilder.commit();

      // when
      const attachments = await attachmentRepository.list();

      // then
      expect(attachments).toEqual([
        domainBuilder.buildAttachment({
          id: 'attachmentId1',
          type: 'illustration',
          mimeType: 'mimeType1',
          filename: 'filename_1',
          url: 'http://1',
          challengeId: 'challengeId1',
          airtableChallengeId: 'challengeAirtableId1',
          localizedChallengeId: 'localizedChallengeId1',
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentId1Nl',
          type: 'illustration',
          mimeType: 'mimeType1NL',
          filename: 'filename_1NL',
          url: 'http://1-nl',
          challengeId: 'challengeId1',
          airtableChallengeId: 'challengeAirtableId1',
          localizedChallengeId: 'localizedChallengeId1Nl',
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentId2',
          type: 'illustration',
          mimeType: 'mimeType2',
          filename: 'filename_2',
          url: 'http://2',
          challengeId: 'challengeId2',
          airtableChallengeId: 'challengeAirtableId2',
          localizedChallengeId: 'localizedChallengeId2',
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentId3',
          type: 'attachment',
          mimeType: 'mimeType3',
          filename: 'filename_3',
          url: 'http://3',
          challengeId: 'challengeId2',
          airtableChallengeId: 'challengeAirtableId2',
          localizedChallengeId: 'localizedChallengeId2',
        }),
      ]);

      airtableScope.done();
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
      await databaseBuilder.commit();
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Attachments') expect.unreachable('Airtable tableName should be Attachments');
        if (
          options?.filterByFormula !==
          'OR({localizedChallengeId} = "challengeId1",{localizedChallengeId} = "localizedChallengeNLForChallengeA",{localizedChallengeId} = "challengeId2")'
        )
          expect.unreachable('Wrong filterByFormula');
        return [
          {
            id: attachment_NL_forChallengeA_data.id,
            fields: {
              'Record ID': attachment_NL_forChallengeA_data.id,
              url: attachment_NL_forChallengeA_data.url,
              size: attachment_NL_forChallengeA_data.size,
              type: attachment_NL_forChallengeA_data.type,
              mimeType: attachment_NL_forChallengeA_data.mimeType,
              filename: attachment_NL_forChallengeA_data.filename,
              'challengeId persistant': [attachment_NL_forChallengeA_data.challengeId],
              challengeId: ['airtableChallengeId1'],
              localizedChallengeId: attachment_NL_forChallengeA_data.localizedChallengeId,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
          {
            id: attachment_FR_forChallengeA_data.id,
            fields: {
              'Record ID': attachment_FR_forChallengeA_data.id,
              url: attachment_FR_forChallengeA_data.url,
              size: attachment_FR_forChallengeA_data.size,
              type: attachment_FR_forChallengeA_data.type,
              mimeType: attachment_FR_forChallengeA_data.mimeType,
              filename: attachment_FR_forChallengeA_data.filename,
              'challengeId persistant': [attachment_FR_forChallengeA_data.challengeId],
              challengeId: ['airtableChallengeId1'],
              localizedChallengeId: attachment_FR_forChallengeA_data.localizedChallengeId,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
          {
            id: attachment_FR_forChallengeB_data.id,
            fields: {
              'Record ID': attachment_FR_forChallengeB_data.id,
              url: attachment_FR_forChallengeB_data.url,
              size: attachment_FR_forChallengeB_data.size,
              type: attachment_FR_forChallengeB_data.type,
              mimeType: attachment_FR_forChallengeB_data.mimeType,
              filename: attachment_FR_forChallengeB_data.filename,
              'challengeId persistant': [attachment_FR_forChallengeB_data.challengeId],
              challengeId: ['airtableChallengeId2'],
              localizedChallengeId: attachment_FR_forChallengeB_data.localizedChallengeId,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const attachments = await attachmentRepository.listByLocalizedChallengeIds([
        challengeId1,
        'localizedChallengeNLForChallengeA',
        challengeId2,
      ]);

      // then
      expect(attachments).toStrictEqual([
        domainBuilder.buildAttachment({
          id: attachment_NL_forChallengeA_data.id,
          url: attachment_NL_forChallengeA_data.url,
          type: attachment_NL_forChallengeA_data.type,
          size: attachment_NL_forChallengeA_data.size,
          mimeType: attachment_NL_forChallengeA_data.mimeType,
          filename: attachment_NL_forChallengeA_data.filename,
          challengeId: attachment_NL_forChallengeA_data.challengeId,
          airtableChallengeId: 'airtableChallengeId1',
          localizedChallengeId: attachment_NL_forChallengeA_data.localizedChallengeId,
        }),
        domainBuilder.buildAttachment({
          id: attachment_FR_forChallengeA_data.id,
          url: attachment_FR_forChallengeA_data.url,
          type: attachment_FR_forChallengeA_data.type,
          size: attachment_FR_forChallengeA_data.size,
          mimeType: attachment_FR_forChallengeA_data.mimeType,
          filename: attachment_FR_forChallengeA_data.filename,
          challengeId: attachment_FR_forChallengeA_data.challengeId,
          airtableChallengeId: 'airtableChallengeId1',
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
          airtableChallengeId: 'airtableChallengeId2',
          localizedChallengeId: attachment_FR_forChallengeB_data.localizedChallengeId,
        }),
      ]);
    });

    it('should return an empty array when no localized challenge ids provided', async () => {
      // given
      await databaseBuilder.commit();
      vi.spyOn(airtableClient, 'findRecords').mockImplementation(() => {
        expect.unreachable('I should not be trying to reach airtable');
      });

      // when
      const attachments = await attachmentRepository.listByLocalizedChallengeIds([]);

      // then
      expect(attachments).toStrictEqual([]);
    });

    it('should return an empty array when no attachment found for provided localized challenge ids', async () => {
      // given
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Attachments') expect.unreachable('Airtable tableName should be Attachments');
        if (options?.filterByFormula !== 'OR({localizedChallengeId} = "someLocalizedChallengeId")')
          expect.unreachable('Wrong filterByFormula');
        return [];
      });

      // when
      const attachments = await attachmentRepository.listByLocalizedChallengeIds(['someLocalizedChallengeId']);

      // then
      expect(attachments).toStrictEqual([]);
    });
  });

  describe('#createBatch', () => {
    afterEach(() => {
      return knex('localized_challenges-attachments').truncate();
    });

    it('should create several attachments in airtable and the links to the localized challenge', async () => {
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
      const airtableIdsByIds = {
        challengeId1: 'airtableChallengeId1',
        challengeId2: 'airtableChallengeId2',
      };
      vi.spyOn(challengeDatasource, 'getAirtableIdsByIds').mockImplementation((necessaryChallengeIds) => {
        if (necessaryChallengeIds.join(',') !== 'challengeId1,challengeId2')
          expect.unreachable('Wrong challenge ids for fetching corresponding airtable ids');
        return airtableIdsByIds;
      });
      vi.spyOn(airtableClient, 'createRecords').mockImplementation((tableName, airtableRequestBodies) => {
        if (tableName !== 'Attachments') expect.unreachable('Airtable tableName should be Attachments');
        if (
          airtableRequestBodies.length !== 2 ||
          !_.isEqual(airtableRequestBodies[0], {
            fields: {
              url: attachmentA.url,
              size: attachmentA.size,
              type: attachmentA.type,
              mimeType: attachmentA.mimeType,
              filename: attachmentA.filename,
              challengeId: ['airtableChallengeId1'],
              localizedChallengeId: attachmentA.localizedChallengeId,
            },
          }) ||
          !_.isEqual(airtableRequestBodies[1], {
            fields: {
              url: attachmentB.url,
              size: attachmentB.size,
              type: attachmentB.type,
              mimeType: attachmentB.mimeType,
              filename: attachmentB.filename,
              challengeId: ['airtableChallengeId2'],
              localizedChallengeId: attachmentB.localizedChallengeId,
            },
          })
        )
          expect.unreachable('Attachments to create to airtable wrong bodies');
        return [
          {
            id: 'airtableIdAttachmentA',
            fields: {
              'Record ID': 'airtableIdAttachmentA',
              url: attachmentA.url,
              size: attachmentA.size,
              type: attachmentA.type,
              mimeType: attachmentA.mimeType,
              filename: attachmentA.filename,
              'challengeId persistant': [attachmentA.challengeId],
              challengeId: ['airtableChallengeA'],
              localizedChallengeId: attachmentA.localizedChallengeId,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
          {
            id: 'airtableIdAttachmentB',
            fields: {
              'Record ID': 'airtableIdAttachmentB',
              url: attachmentB.url,
              size: attachmentB.size,
              type: attachmentB.type,
              mimeType: attachmentB.mimeType,
              filename: attachmentB.filename,
              'challengeId persistant': [attachmentB.challengeId],
              challengeId: ['airtableChallengeB'],
              localizedChallengeId: attachmentB.localizedChallengeId,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const attachments = await attachmentRepository.createBatch([attachmentA, attachmentB]);

      // then
      expect(attachments).toStrictEqual([
        domainBuilder.buildAttachment({
          id: 'airtableIdAttachmentA',
          url: attachmentA.url,
          type: attachmentA.type,
          size: attachmentA.size,
          mimeType: attachmentA.mimeType,
          filename: attachmentA.filename,
          challengeId: attachmentA.challengeId,
          airtableChallengeId: 'airtableChallengeA',
          localizedChallengeId: attachmentA.localizedChallengeId,
        }),
        domainBuilder.buildAttachment({
          id: 'airtableIdAttachmentB',
          url: attachmentB.url,
          type: attachmentB.type,
          size: attachmentB.size,
          mimeType: attachmentB.mimeType,
          filename: attachmentB.filename,
          challengeId: attachmentB.challengeId,
          airtableChallengeId: 'airtableChallengeB',
          localizedChallengeId: attachmentB.localizedChallengeId,
        }),
      ]);
      const allLocalizedChallengeAttachments = await knex('localized_challenges-attachments')
        .select(['attachmentId', 'localizedChallengeId'])
        .orderBy('attachmentId');
      expect(allLocalizedChallengeAttachments).toStrictEqual([
        {
          attachmentId: 'airtableIdAttachmentA',
          localizedChallengeId: attachmentA.localizedChallengeId,
        },
        {
          attachmentId: 'airtableIdAttachmentB',
          localizedChallengeId: attachmentB.localizedChallengeId,
        },
      ]);
    });
  });

  describe('#create', () => {
    afterEach(() => {
      return knex('localized_challenges-attachments').truncate();
    });

    it('should create an attachment in airtable with relationship to airtable challenge and create the link to the localized challenge', async () => {
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
      const airtableIdsByIds = {
        challengeId1: 'airtableChallengeId',
      };
      vi.spyOn(challengeDatasource, 'getAirtableIdsByIds').mockImplementation((necessaryChallengeIds) => {
        if (necessaryChallengeIds.join('') !== 'challengeId1')
          expect.unreachable('Wrong challenge id for fetching corresponding airtable id');
        return airtableIdsByIds;
      });
      vi.spyOn(airtableClient, 'createRecord').mockImplementation((tableName, airtableRequestBody) => {
        if (tableName !== 'Attachments') expect.unreachable('Airtable tableName should be Attachments');
        if (
          !_.isEqual(airtableRequestBody, {
            fields: {
              url: attachment.url,
              size: attachment.size,
              type: attachment.type,
              mimeType: attachment.mimeType,
              filename: attachment.filename,
              challengeId: ['airtableChallengeId'],
              localizedChallengeId: 'challengeIdES',
            },
          })
        )
          expect.unreachable('Attachments to create to airtable wrong bodies');
        return {
          id: 'airtableIdAttachment',
          fields: {
            'Record ID': 'airtableIdAttachment',
            url: attachment.url,
            size: attachment.size,
            type: attachment.type,
            mimeType: attachment.mimeType,
            filename: attachment.filename,
            'challengeId persistant': [challengeId1],
            challengeId: ['airtableChallengeId'],
            localizedChallengeId: 'challengeIdES',
          },
          get: function (field) {
            return this.fields[field];
          },
        };
      });

      // when
      const createdAttachment = await attachmentRepository.create(attachment);

      // then
      const expectedAttachment = domainBuilder.buildAttachment({
        id: 'airtableIdAttachment',
        url: attachment.url,
        type: attachment.type,
        size: attachment.size,
        mimeType: attachment.mimeType,
        filename: attachment.filename,
        challengeId: challengeId1,
        localizedChallengeId: 'challengeIdES',
        airtableChallengeId: 'airtableChallengeId',
      });
      expect(createdAttachment).toStrictEqual(expectedAttachment);
      const localizedChallengeAttachment = await knex('localized_challenges-attachments')
        .select(['attachmentId', 'localizedChallengeId'])
        .where({ localizedChallengeId: attachment.localizedChallengeId })
        .first();
      expect(localizedChallengeAttachment).toStrictEqual({
        attachmentId: 'airtableIdAttachment',
        localizedChallengeId: attachment.localizedChallengeId,
      });
    });
  });

  describe('#update', () => {
    it('should update an attachment in airtable', async () => {
      // given
      const attachment = domainBuilder.buildAttachment({
        id: 'recABC123',
        url: 'url/to/attachment',
        type: 'some other type',
        size: 123,
        mimeType: 'image/jpeg',
        filename: 'attachment_filename',
        challengeId: challengeId1,
        airtableChallengeId: 'challengeAirtableId',
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
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        attachmentId: 'recABC123',
        localizedChallengeId: 'localizedChallengeId',
      });
      await databaseBuilder.commit();
      vi.spyOn(airtableClient, 'updateRecord').mockImplementation((tableName, airtableRequestBody) => {
        if (tableName !== 'Attachments') expect.unreachable('Airtable tableName should be Attachments');
        if (
          !_.isEqual(airtableRequestBody, {
            id: attachment.id,
            fields: {
              url: attachment.url,
              size: attachment.size,
              type: attachment.type,
              mimeType: attachment.mimeType,
              filename: attachment.filename,
              challengeId: ['challengeAirtableId'],
              localizedChallengeId: attachment.localizedChallengeId,
            },
          })
        )
          expect.unreachable('Attachments to update to airtable wrong bodies');
        return {
          id: attachment.id,
          fields: {
            'Record ID': attachment.id,
            url: attachment.url,
            size: attachment.size,
            type: attachment.type,
            mimeType: attachment.mimeType,
            filename: attachment.filename,
            'challengeId persistant': [challengeId1],
            challengeId: ['airtableChallengeId'],
            localizedChallengeId: attachment.localizedChallengeId,
          },
          get: function (field) {
            return this.fields[field];
          },
        };
      });

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
        airtableChallengeId: 'airtableChallengeId',
      });
      expect(updatedAttachment).toStrictEqual(expectedAttachment);
      const localizedChallengeAttachment = await knex('localized_challenges-attachments')
        .select(['attachmentId', 'localizedChallengeId'])
        .where({ localizedChallengeId: attachment.localizedChallengeId })
        .first();
      expect(localizedChallengeAttachment).toStrictEqual({
        attachmentId: attachment.id,
        localizedChallengeId: attachment.localizedChallengeId,
      });
    });
  });

  describe('#get', () => {
    context('when attachment does not exist', function () {
      it('should return null', async () => {
        // given
        vi.spyOn(airtableClient, 'findRecord').mockImplementation((tableName, _) => {
          if (tableName !== 'Attachments') expect.unreachable('Airtable tableName should be Attachments');
          throw {
            statusCode: 404,
          };
        });

        // when
        const nullAtt = await attachmentRepository.get('recABC123');

        // then
        expect(nullAtt).to.be.null;
      });
    });
    context('when attachment exists', function () {
      it('should return the attachment by id', async () => {
        // given
        const expectedAttachment = domainBuilder.buildAttachment({
          id: 'recABC123',
          url: 'url/to/attachment',
          type: 'some other type',
          size: 123,
          mimeType: 'image/jpeg',
          filename: 'attachment_filename',
          challengeId: challengeId1,
          localizedChallengeId: 'localizedChallengeId',
          airtableChallengeId: 'airtableChallengeId',
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
        databaseBuilder.factory.buildLocalizedChallengeAttachment({
          attachmentId: 'recABC123',
          localizedChallengeId: 'localizedChallengeId',
        });
        await databaseBuilder.commit();
        vi.spyOn(airtableClient, 'findRecord').mockImplementation((tableName, id) => {
          if (tableName !== 'Attachments') expect.unreachable('Airtable tableName should be Attachments');
          if (id !== 'recABC123') expect.unreachable('Wrong id given in findRecord');
          return {
            id: expectedAttachment.id,
            fields: {
              'Record ID': expectedAttachment.id,
              url: expectedAttachment.url,
              size: expectedAttachment.size,
              type: expectedAttachment.type,
              mimeType: expectedAttachment.mimeType,
              filename: expectedAttachment.filename,
              'challengeId persistant': [expectedAttachment.challengeId],
              challengeId: [expectedAttachment.airtableChallengeId],
              localizedChallengeId: expectedAttachment.localizedChallengeId,
            },
            get: function (field) {
              return this.fields[field];
            },
          };
        });

        // when
        const attachment = await attachmentRepository.get('recABC123');

        // then
        expect(attachment).toStrictEqual(expectedAttachment);
      });
    });
  });

  describe('#remove', () => {
    it('delete the attachment on Airtable and localized challenge attachment', async () => {
      // given
      const attachmentId = 'attachmentId';
      const loc1Id = databaseBuilder.factory.buildLocalizedChallenge({ id: 'loc1', challengeId: challengeId1 }).id;
      const loc2Id = databaseBuilder.factory.buildLocalizedChallenge({ id: 'loc2', challengeId: challengeId2 }).id;
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        attachmentId,
        localizedChallengeId: loc1Id,
      });
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        attachmentId: 'someOtherAttachmentId',
        localizedChallengeId: loc2Id,
      });
      await databaseBuilder.commit();
      vi.spyOn(airtableClient, 'deleteRecords').mockImplementation((tableName, recordIds) => {
        if (tableName !== 'Attachments') expect.unreachable('Airtable tableName should be Attachments');
        if (!_.isEqual(recordIds, ['attachmentId']))
          expect.unreachable('Attachments to delete to airtable : wrong attachments');
      });

      // when
      await attachmentRepository.remove(attachmentId);

      // then
      const localizedChallengeAttachmentsLeft = await knex('localized_challenges-attachments').pluck('attachmentId');
      expect(localizedChallengeAttachmentsLeft).toStrictEqual(['someOtherAttachmentId']);
    });
  });
});
