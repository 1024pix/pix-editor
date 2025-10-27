import _ from 'lodash';
import { attachmentDatasource, challengeDatasource } from '../datasources/airtable/index.js';
import { Attachment } from '../../domain/models/index.js';
import { knex } from '../../../db/knex-database-connection.js';

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
  await knex
    .insert(
      createdAttachmentsDtos.map(({ localizedChallengeId, id: attachmentId }) => ({
        attachmentId,
        localizedChallengeId,
      })),
    )
    .into('localized_challenges-attachments');
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
  await knex
    .insert({
      localizedChallengeId: createdAttachmentDTO.localizedChallengeId,
      attachmentId: createdAttachmentDTO.id,
    })
    .into('localized_challenges-attachments');
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
  await knex.delete().from('localized_challenges-attachments').where('attachmentId', attachmentId);
}

function toDomainList(datasourceAttachments) {
  return datasourceAttachments.map(toDomain);
}

export function toDomain(attachment) {
  return new Attachment(attachment);
}
