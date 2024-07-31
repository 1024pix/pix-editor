import { afterEach, describe, expect, it, vi } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as attachmentRepository from '../../../../lib/infrastructure/repositories/attachment-repository.js';
import * as airtableClient from '../../../../lib/infrastructure/airtable.js';
import { challengeDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import _ from 'lodash';

describe('Integration | Repository | attachment-repository', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#list', () => {
    it('should return the list of all attachments with an alt illustration', async () => {
      // given
      const challengeId1 = 'challengeId1';
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId1,
        challengeId: challengeId1,
        locale: 'fr',
      });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId1',
        challengeId: challengeId1,
        locale: 'fr-fr',
      });

      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId1Nl',
        challengeId: challengeId1,
        locale: 'nl',
      });

      const challengeId2 = 'challengeId2';
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeId2,
        challengeId: challengeId2,
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeId2',
        challengeId: challengeId2,
        locale: 'en',
      });

      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeId1.illustrationAlt',
        locale: 'fr-fr',
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
          mimeType: 'mimeType1',
          filename: 'filename_1',
          url: 'http://1',
          challengeId: 'challengeId1',
          localizedChallengeId: 'localizedChallengeId1'
        }),
        airtableBuilder.factory.buildAttachment({
          id: 'attachmentId1Nl',
          type: 'illustration',
          mimeType: 'mimeType1NL',
          filename: 'filename_1NL',
          url: 'http://1-nl',
          challengeId: 'challengeId1',
          localizedChallengeId: 'localizedChallengeId1Nl'
        }),
        airtableBuilder.factory.buildAttachment({
          id: 'attachmentId2',
          type: 'illustration',
          mimeType: 'mimeType2',
          filename: 'filename_2',
          url: 'http://2',
          challengeId: 'challengeId2',
          localizedChallengeId: 'localizedChallengeId2'
        }),
        airtableBuilder.factory.buildAttachment({
          id: 'attachmentId3',
          type: 'attachment',
          mimeType: 'mimeType3',
          filename: 'filename_3',
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
          mimeType: 'mimeType1',
          filename: 'filename_1',
          url: 'http://1',
          challengeId: 'challengeId1',
          localizedChallengeId: 'localizedChallengeId1',
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentId1Nl',
          type: 'illustration',
          alt: 'illustration text alt 1 nl',
          mimeType: 'mimeType1NL',
          filename: 'filename_1NL',
          url: 'http://1-nl',
          challengeId: 'challengeId1',
          localizedChallengeId: 'localizedChallengeId1Nl',
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentId2',
          type: 'illustration',
          alt: 'illustration text alt 2',
          mimeType: 'mimeType2',
          filename: 'filename_2',
          url: 'http://2',
          challengeId: 'challengeId2',
          localizedChallengeId: 'localizedChallengeId2',
        }),
        domainBuilder.buildAttachment({
          id: 'attachmentId3',
          type: 'attachment',
          mimeType: 'mimeType3',
          filename: 'filename_3',
          alt: null,
          url: 'http://3',
          challengeId: 'challengeId2',
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
        challengeId: 'challengeA',
        localizedChallengeId: 'localizedChallengeNLForChallengeA',
      };
      const attachment_FR_forChallengeA_data = {
        id: 'attachment_FR_forChallengeA_data_id',
        url: 'url attachment_FR_forChallengeA_data',
        size: 123,
        type: 'illustration',
        mimeType: 'images/jpeg',
        filename: 'attachment_fr_challengeA_filename',
        challengeId: 'challengeA',
        localizedChallengeId: 'challengeA',
      };
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA.illustrationAlt',
        locale: 'fr',
        value: 'La trad fr pour attachment FR',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA.illustrationAlt',
        locale: 'nl',
        value: 'La trad nl pour attachment NL',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeA',
        challengeId: 'challengeA',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeNLForChallengeA',
        challengeId: 'challengeA',
        locale: 'nl',
      });
      const attachment_FR_forChallengeB_data = {
        id: 'attachment_FR_forChallengeB_data_id',
        url: 'url attachment_FR_forChallengeB_data',
        size: 456,
        type: 'attachment',
        mimeType: 'text/csv',
        filename: 'attachment_fr_challengeB_filename',
        challengeId: 'challengeB',
        localizedChallengeId: 'challengeB',
      };
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeB.illustrationAlt',
        locale: 'fr',
        value: 'I SHOULD NOT EXIST BECAUSE ATTACHMENT IS NOT AN ILLUSTRATION',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeB',
        challengeId: 'challengeB',
        locale: 'fr',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeC.illustrationAlt',
        locale: 'fr',
        value: 'some irrelevant translation for unknown challenge',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeC',
        challengeId: 'challengeC',
        locale: 'fr',
      });
      await databaseBuilder.commit();
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Attachments') expect.unreachable('Airtable tableName should be Attachments');
        if (options?.filterByFormula !== 'OR(({localizedChallengeId} = "challengeA"),({localizedChallengeId} = "localizedChallengeNLForChallengeA"),({localizedChallengeId} = "challengeB"))') expect.unreachable('Wrong filterByFormula');
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
              'localizedChallengeId': attachment_NL_forChallengeA_data.localizedChallengeId,
            },
            get: function(field) { return this.fields[field]; },
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
              'localizedChallengeId': attachment_FR_forChallengeA_data.localizedChallengeId,
            },
            get: function(field) { return this.fields[field]; },
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
              'localizedChallengeId': attachment_FR_forChallengeB_data.localizedChallengeId,
            },
            get: function(field) { return this.fields[field]; },
          },
        ];
      });

      // when
      const attachments = await attachmentRepository.listByLocalizedChallengeIds(['challengeA', 'localizedChallengeNLForChallengeA', 'challengeB']);

      // then
      expect(attachments).toStrictEqual([
        domainBuilder.buildAttachment({
          id: attachment_NL_forChallengeA_data.id,
          url: attachment_NL_forChallengeA_data.url,
          type: attachment_NL_forChallengeA_data.type,
          alt: 'La trad nl pour attachment NL',
          size: attachment_NL_forChallengeA_data.size,
          mimeType: attachment_NL_forChallengeA_data.mimeType,
          filename: attachment_NL_forChallengeA_data.filename,
          challengeId: attachment_NL_forChallengeA_data.challengeId,
          localizedChallengeId: attachment_NL_forChallengeA_data.localizedChallengeId,
        }),
        domainBuilder.buildAttachment({
          id: attachment_FR_forChallengeA_data.id,
          url: attachment_FR_forChallengeA_data.url,
          type: attachment_FR_forChallengeA_data.type,
          alt: 'La trad fr pour attachment FR',
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
          alt: null,
          size: attachment_FR_forChallengeB_data.size,
          mimeType: attachment_FR_forChallengeB_data.mimeType,
          filename: attachment_FR_forChallengeB_data.filename,
          challengeId: attachment_FR_forChallengeB_data.challengeId,
          localizedChallengeId: attachment_FR_forChallengeB_data.localizedChallengeId,
        }),
      ]);
    });

    it('should return an empty array when no localized challenge ids provided', async () => {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA.illustrationAlt',
        locale: 'nl',
        value: 'La trad nl pour attachment NL',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeA',
        challengeId: 'challengeA',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeNLForChallengeA',
        challengeId: 'challengeA',
        locale: 'nl',
      });
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
        if (options?.filterByFormula !== 'OR(({localizedChallengeId} = "someLocalizedChallengeId"))') expect.unreachable('Wrong filterByFormula');
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

    it('should create several attachments in airtable, in storage and the links to the localized challenge', async () => {
      // given
      const attachmentA = domainBuilder.buildAttachment({
        id: null,
        url: 'url/to/clone/attachmentA',
        type: 'illustration',
        alt: 'useless alt',
        size: 123,
        mimeType: 'image/jpeg',
        filename: 'attachmentA_filename',
        challengeId: 'challengeA',
        localizedChallengeId: 'localizedChallengeA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA.illustrationAlt',
        locale: 'fr',
        value: 'wrong illustrationAlt, wrong locale',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA.illustrationAlt',
        locale: 'nl',
        value: 'good illustrationAlt',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeA',
        challengeId: 'challengeA',
        locale: 'fr',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'localizedChallengeA',
        challengeId: 'challengeA',
        locale: 'nl',
      });
      const attachmentB = domainBuilder.buildAttachment({
        id: null,
        url: 'url/to/clone/attachmentB',
        type: 'attachment',
        alt: null,
        size: 456,
        mimeType: 'text/csv',
        filename: 'attachmentB_filename',
        challengeId: 'challengeB',
        localizedChallengeId: 'challengeB',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeB',
        challengeId: 'challengeB',
        locale: 'fr',
      });
      await databaseBuilder.commit();
      const airtableIdsByIds = {
        'challengeA': 'airtableChallengeA',
        'challengeB': 'airtableChallengeB',
      };
      vi.spyOn(challengeDatasource, 'getAirtableIdsByIds').mockImplementation((necessaryChallengeIds) => {
        if (necessaryChallengeIds.join(',') !== 'challengeA,challengeB')
          expect.unreachable('Wrong challenge ids for fetching corresponding airtable ids');
        return airtableIdsByIds;
      });
      vi.spyOn(airtableClient, 'createRecords').mockImplementation((tableName, airtableRequestBodies) => {
        if (tableName !== 'Attachments') expect.unreachable('Airtable tableName should be Attachments');
        if (
          airtableRequestBodies.length !== 2
          || !_.isEqual(airtableRequestBodies[0], { fields: {
            url: attachmentA.url,
            size: attachmentA.size,
            type: attachmentA.type,
            mimeType: attachmentA.mimeType,
            filename: attachmentA.filename,
            challengeId: ['airtableChallengeA'],
            localizedChallengeId: attachmentA.localizedChallengeId,
          } })
          || !_.isEqual(airtableRequestBodies[1], { fields: {
            url: attachmentB.url,
            size: attachmentB.size,
            type: attachmentB.type,
            mimeType: attachmentB.mimeType,
            filename: attachmentB.filename,
            challengeId: ['airtableChallengeB'],
            localizedChallengeId: attachmentB.localizedChallengeId,
          } })
        ) expect.unreachable('Attachments to create to airtable wrong bodies');
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
              'localizedChallengeId': attachmentA.localizedChallengeId,
            },
            get: function(field) { return this.fields[field]; },
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
              'localizedChallengeId': attachmentB.localizedChallengeId,
            },
            get: function(field) { return this.fields[field]; },
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
          alt: 'good illustrationAlt',
          size: attachmentA.size,
          mimeType: attachmentA.mimeType,
          filename: attachmentA.filename,
          challengeId: attachmentA.challengeId,
          localizedChallengeId: attachmentA.localizedChallengeId,
        }),
        domainBuilder.buildAttachment({
          id: 'airtableIdAttachmentB',
          url: attachmentB.url,
          type: attachmentB.type,
          alt: null,
          size: attachmentB.size,
          mimeType: attachmentB.mimeType,
          filename: attachmentB.filename,
          challengeId: attachmentB.challengeId,
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
});
