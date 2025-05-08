import _ from 'lodash';
import { attachmentDatasource, challengeDatasource } from '../../datasources/airtable/index.js';
import { Attachment } from '../../../domain/models/index.js';
import { KnexRepository } from './KnexRepository.js';
import { TranslationRepository } from './TranslationRepository.js';
import { LocalizedChallengeRepository } from './LocalizedChallengeRepository.js';
import { LocalizedChallengesAttachmentsRepository } from './LocalizedChallengesAttachmentsRepository.js';

export class AttachmentRepository extends KnexRepository {

  constructor({ knexTransaction } = {}) {
    super({ knexTransaction });
    this.translationRepository = new TranslationRepository({ knexTransaction: this.dbConn });
    this.localizedChallengeRepository = new LocalizedChallengeRepository({ knexTransaction: this.dbConn });
    this.localizedChallengesAttachmentsRepository = new LocalizedChallengesAttachmentsRepository({ knexTransaction: this.dbConn });
  }

  async list() {
    const [datasourceAttachments, translations, localizedChallenges] = await Promise.all([
      attachmentDatasource.list(),
      this.translationRepository.listByPattern('challenge.%.illustrationAlt'),
      this.localizedChallengeRepository.list(),
    ]);

    return toDomainList(datasourceAttachments, translations, localizedChallenges);
  }

  async listByLocalizedChallengeIds(localizedChallengeIds) {
    const [datasourceAttachments, translations, localizedChallenges] = await Promise.all([
      attachmentDatasource.filterByLocalizedChallengeIds(localizedChallengeIds),
      this.translationRepository.listByPattern('challenge.%.illustrationAlt'),
      this.localizedChallengeRepository.getMany({ ids: localizedChallengeIds }),
    ]);

    if (!datasourceAttachments) return [];

    return toDomainList(datasourceAttachments, translations, localizedChallenges);
  }

  async createBatch(attachments) {
    if (!attachments || attachments.length === 0) return [];
    const necessaryChallengeIds = _.uniq(attachments.map((attachment) => attachment.challengeId));
    const airtableChallengeIdsByIds = await challengeDatasource.getAirtableIdsByIds(necessaryChallengeIds);
    const attachmentToSaveDTOs = [];

    for (const attachment of attachments) {
      attachmentToSaveDTOs.push({
        url: attachment.url,
        size: attachment.size,
        type: attachment.type,
        mimeType: attachment.mimeType,
        filename: attachment.filename,
        challengeId: airtableChallengeIdsByIds[attachment.challengeId],
        localizedChallengeId: attachment.localizedChallengeId,
      });
    }
    const createdAttachmentsDtos = await attachmentDatasource.createBatch(attachmentToSaveDTOs);
    for (const createdAttachmentsDto of createdAttachmentsDtos) {
      await this.localizedChallengesAttachmentsRepository.save({
        localizedChallengeId: createdAttachmentsDto.localizedChallengeId,
        attachmentId: createdAttachmentsDto.id,
      });
    }
    const translations = await this.translationRepository.listByPattern('challenge.%.illustrationAlt');
    const localizedChallenges = await this.localizedChallengeRepository.listByChallengeIds({ challengeIds: attachments.map((attachment) => attachment.challengeId) });
    return toDomainList(createdAttachmentsDtos, translations, localizedChallenges);
  }
}

function toDomain(attachment, translation) {
  return new Attachment({
    ...attachment,
    alt: translation?.value ?? null,
  });
}

function toDomainList(datasourceAttachments, translations, localizedChallenges) {
  const translationsByChallengeId = _.groupBy(translations, 'entityId');
  const localizedChallengesById = _.keyBy(localizedChallenges, 'id');

  return datasourceAttachments.map((attachment) => {
    if (attachment.type !== Attachment.TYPES.ILLUSTRATION) {
      return toDomain(attachment);
    }
    const challengeTranslations = translationsByChallengeId[attachment.challengeId];
    const locale = localizedChallengesById[attachment.localizedChallengeId].locale;
    const translation = challengeTranslations?.find((translation) => locale === translation.locale);

    return toDomain(attachment, translation);
  });
}
