import _ from 'lodash';
import { attachmentDatasource, challengeDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as localizedChallengeRepository from './localized-challenge-repository.js';
import { Attachment } from '../../domain/models/index.js';
import * as localizedChallengesAttachmentsRepository from './localized-challenges-attachments-repository.js';

export async function get(id) {
  const datasourceAttachment = await attachmentDatasource.find(id);
  if (!datasourceAttachment) return null;
  const translations = await translationRepository.listByPattern(`challenge.${datasourceAttachment.challengeId}.illustrationAlt`);
  const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds: [datasourceAttachment.challengeId] });

  const [attachment] = toDomainList([datasourceAttachment], translations, localizedChallenges);
  return attachment;
}

export async function list() {
  const [datasourceAttachments, translations, localizedChallenges] = await Promise.all([
    attachmentDatasource.list(),
    translationRepository.listByPattern('challenge.%.illustrationAlt'),
    localizedChallengeRepository.list(),
  ]);

  return toDomainList(datasourceAttachments, translations, localizedChallenges);
}

export async function listByLocalizedChallengeIds(localizedChallengeIds) {
  const [datasourceAttachments, translations, localizedChallenges] = await Promise.all([
    attachmentDatasource.filterByLocalizedChallengeIds(localizedChallengeIds),
    translationRepository.listByPattern('challenge.%.illustrationAlt'),
    localizedChallengeRepository.getMany({ ids: localizedChallengeIds }),
  ]);

  if (!datasourceAttachments) return [];

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

export async function create(attachment) {
  const airtableChallengeIdsByIds = await challengeDatasource.getAirtableIdsByIds([attachment.challengeId]);
  const attachmentDTO = {
    url: attachment.url,
    size: attachment.size,
    type: attachment.type,
    mimeType: attachment.mimeType,
    filename: attachment.filename,
    challengeId: airtableChallengeIdsByIds[attachment.challengeId],
    localizedChallengeId: attachment.localizedChallengeId,
  };
  const createdAttachmentDTO = await attachmentDatasource.create(attachmentDTO);
  await localizedChallengesAttachmentsRepository.save({
    localizedChallengeId: createdAttachmentDTO.localizedChallengeId,
    attachmentId: createdAttachmentDTO.id,
  });
  const translations = await translationRepository.listByPattern(`challenge.${createdAttachmentDTO.challengeId}.illustrationAlt`);
  const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds: [createdAttachmentDTO.challengeId] });

  const [createdAttachment] = toDomainList([createdAttachmentDTO], translations, localizedChallenges);
  return createdAttachment;
}

export async function update(attachment) {
  const attachmentDTO = {
    id: attachment.id,
    url: attachment.url,
    size: attachment.size,
    type: attachment.type,
    mimeType: attachment.mimeType,
    filename: attachment.filename,
    challengeId: attachment.airtableChallengeId,
    localizedChallengeId: attachment.localizedChallengeId,
  };
  const updatedAttachmentDTO = await attachmentDatasource.update(attachmentDTO);
  const translations = await translationRepository.listByPattern(`challenge.${updatedAttachmentDTO.challengeId}.illustrationAlt`);
  const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds: [updatedAttachmentDTO.challengeId] });

  const [updatedAttachment] = toDomainList([updatedAttachmentDTO], translations, localizedChallenges);
  return updatedAttachment;
}

export async function remove(attachmentId) {
  await attachmentDatasource.delete([attachmentId]);
  await localizedChallengesAttachmentsRepository.deleteByAttachmentId(attachmentId);
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
