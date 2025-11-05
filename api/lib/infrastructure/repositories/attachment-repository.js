import _ from 'lodash';
import { attachmentDatasource, challengeDatasource } from '../datasources/airtable/index.js';
import { Attachment } from '../../domain/models/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areNullableValuesEqual, compareDtos } from './migration-from-airtable.js';

export async function get(id) {
  const [airtableDto, pgDto] = await Promise.all([
    attachmentDatasource.find(id),
    knex.select('*').from('attachments').where('id', id).first(),
  ]);

  compareDtos(airtableDto, pgDto, compareAttachmentDtos);

  if (!airtableDto) return null;
  return toDomain(airtableDto);
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

export async function listByLocalizedChallengeId(localizedChallengeId) {
  const datasourceAttachments = await attachmentDatasource.filterByLocalizedChallengeId(localizedChallengeId);
  if (!datasourceAttachments) return [];
  return toDomainList(datasourceAttachments);
}

export async function createBatch(attachments) {
  return knex.transaction(async (transaction) => {
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

    await transaction
      .insert(
        createdAttachmentsDtos.map((airtableDto) => ({
          id: airtableDto.id,
          url: airtableDto.url,
          size: airtableDto.size,
          type: airtableDto.type,
          mimeType: airtableDto.mimeType,
          filename: airtableDto.filename,
          challengeId: airtableDto.challengeId,
          localizedChallengeId: airtableDto.localizedChallengeId,
        })),
      )
      .into('attachments');

    return toDomainList(createdAttachmentsDtos);
  });
}

export async function create(attachment) {
  return knex.transaction(async (transaction) => {
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

    await transaction
      .insert({
        id: createdAttachmentDTO.id,
        url: attachment.url,
        size: attachment.size,
        type: attachment.type,
        mimeType: attachment.mimeType,
        filename: attachment.filename,
        challengeId: attachment.challengeId,
        localizedChallengeId: attachment.localizedChallengeId,
      })
      .into('attachments');

    return toDomain(createdAttachmentDTO);
  });
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

  await knex('attachments')
    .update({
      filename: attachment.filename,
      updatedAt: knex.fn.now(),
    })
    .where('id', attachment.id);

  return toDomain(updatedAttachmentDTO);
}

export async function remove(attachmentId) {
  return knex.transaction(async (transaction) => {
    await attachmentDatasource.delete([attachmentId]);
    await transaction.delete().from('attachments').where('id', attachmentId);
  });
}

function compareAttachmentDtos(airtableDto, pgDto) {
  const diff = [];
  if (airtableDto.id !== pgDto.id) diff.push(`attachment airtable id "${airtableDto.id}" != postgres id "${pgDto.id}"`);
  if (airtableDto.url !== pgDto.url)
    diff.push(`attachment airtable url "${airtableDto.url}" != postgres url "${pgDto.url}"`);
  if (airtableDto.size !== pgDto.size)
    diff.push(`attachment airtable size "${airtableDto.size}" != postgres size "${pgDto.size}"`);
  if (airtableDto.type !== pgDto.type)
    diff.push(`attachment airtable type "${airtableDto.type}" != postgres type "${pgDto.type}"`);
  if (!areNullableValuesEqual(airtableDto.mimeType, pgDto.mimeType))
    diff.push(`attachment airtable mimeType "${airtableDto.mimeType}" != postgres mimeType "${pgDto.mimeType}"`);
  if (airtableDto.filename !== pgDto.filename)
    diff.push(`attachment airtable filename "${airtableDto.filename}" != postgres filename "${pgDto.filename}"`);
  if (!areNullableValuesEqual(airtableDto.challengeId, pgDto.challengeId))
    diff.push(
      `attachment airtable challengeId "${airtableDto.challengeId}" != postgres challengeId "${pgDto.challengeId}"`,
    );
  if (airtableDto.localizedChallengeId !== pgDto.localizedChallengeId)
    diff.push(
      `attachment airtable localizedChallengeId "${airtableDto.localizedChallengeId}" != postgres localizedChallengeId "${pgDto.localizedChallengeId}"`,
    );
  return diff;
}

function toDomainList(datasourceAttachments) {
  return datasourceAttachments.map(toDomain);
}

export function toDomain(attachment) {
  return new Attachment(attachment);
}
