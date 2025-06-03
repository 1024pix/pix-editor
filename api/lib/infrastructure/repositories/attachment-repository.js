import _ from 'lodash';
import { attachmentDatasource, challengeDatasource } from '../datasources/airtable/index.js';
import { Attachment } from '../../domain/models/index.js';
import * as localizedChallengesAttachmentsRepository from './localized-challenges-attachments-repository.js';

export async function get(id) {
  const datasourceAttachment = await attachmentDatasource.find(id);
  if (!datasourceAttachment) return null;
  return toDomain(datasourceAttachment);
}

export async function list() {
  const datasourceAttachments = await attachmentDatasource.list();
  return toDomainList(datasourceAttachments);
}

export async function listByLocalizedChallengeIds(localizedChallengeIds) {
  const datasourceAttachments = await attachmentDatasource.filterByLocalizedChallengeIds(localizedChallengeIds);
  if (!datasourceAttachments) return [];
  return toDomainList(datasourceAttachments);
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
  return toDomainList(createdAttachmentsDtos);
}

export async function create(attachment) {
  const airtableChallengeIdsByIds = await challengeDatasource.getAirtableIdsByIds([attachment.challengeId]);
  const airtableChallengeId = airtableChallengeIdsByIds[attachment.challengeId];
  const attachmentDTO = {
    url: attachment.url,
    size: attachment.size,
    type: attachment.type,
    mimeType: attachment.mimeType,
    filename: attachment.filename,
    challengeId: airtableChallengeId,
    localizedChallengeId: attachment.localizedChallengeId,
  };
  const createdAttachmentDTO = await attachmentDatasource.create(attachmentDTO);
  await localizedChallengesAttachmentsRepository.save({
    localizedChallengeId: createdAttachmentDTO.localizedChallengeId,
    attachmentId: createdAttachmentDTO.id,
  });
  return toDomain(createdAttachmentDTO);
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
  return toDomain(updatedAttachmentDTO);
}

export async function remove(attachmentId) {
  await attachmentDatasource.delete([attachmentId]);
  await localizedChallengesAttachmentsRepository.deleteByAttachmentId(attachmentId);
}

function toDomainList(datasourceAttachments) {
  return datasourceAttachments.map(toDomain);
}

export function toDomain(attachment) {
  return new Attachment(attachment);
}
