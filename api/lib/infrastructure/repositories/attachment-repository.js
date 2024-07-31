import { attachmentDatasource, challengeDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as localizedChallengeRepository from './localized-challenge-repository.js';
import _ from 'lodash';
import { Attachment } from '../../domain/models/index.js';
import * as localizedChallengesAttachmentsRepository from './localized-challenges-attachments-repository.js';

export async function list() {
  const datasourceAttachments = await attachmentDatasource.list();
  const translations = await translationRepository.listByPattern('challenge.%.illustrationAlt');
  const localizedChallenges = await localizedChallengeRepository.list();

  return toDomainList(datasourceAttachments, translations, localizedChallenges);
}

export async function listByLocalizedChallengeIds(localizedChallengeIds) {
  const datasourceAttachments = await attachmentDatasource.filterByLocalizedChallengeIds(localizedChallengeIds);
  if (!datasourceAttachments) return [];
  const translations = await translationRepository.listByPattern('challenge.%.illustrationAlt');
  const localizedChallenges = await localizedChallengeRepository.getMany({ ids: localizedChallengeIds });

  return toDomainList(datasourceAttachments, translations, localizedChallenges);
}

export async function createBatch(attachments) {
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
    await localizedChallengesAttachmentsRepository.save({
      localizedChallengeId: createdAttachmentsDto.localizedChallengeId,
      attachmentId: createdAttachmentsDto.id,
    });
  }
  const translations = await translationRepository.listByPattern('challenge.%.illustrationAlt');
  const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds: attachments.map((attachment) => attachment.challengeId) });
  return toDomainList(createdAttachmentsDtos, translations, localizedChallenges);
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

export function toDomain(attachment, translation) {
  return new Attachment({
    ...attachment,
    alt: translation?.value ?? null,
  });
}
