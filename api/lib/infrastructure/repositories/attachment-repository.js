import { Attachment } from '../../domain/models/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import * as idGenerator from '../utils/id-generator.js';

export async function get(id) {
  const dto = await knex.select('*').from('attachments').where('id', id).first();

  if (!dto) return null;
  return toDomain(dto);
}

export async function list() {
  const dtos = await knex.select('*').from('attachments').orderBy('id');

  return toDomainList(dtos);
}

export async function listByLocalizedChallengeIds(localizedChallengeIds) {
  const dtos = await knex
    .select('*')
    .from('attachments')
    .whereIn('localizedChallengeId', localizedChallengeIds)
    .orderBy('id');

  return toDomainList(dtos);
}

export async function listByLocalizedChallengeId(localizedChallengeId) {
  const dtos = await knex.select('*').from('attachments').where('localizedChallengeId', localizedChallengeId);

  return toDomainList(dtos);
}

export async function createBatch(attachments) {
  if (!attachments || attachments.length === 0) return [];

  const dtos = await knex
    .insert(
      attachments.map((attachment) => ({
        id: idGenerator.generateNewId('attachment'),
        url: attachment.url,
        size: attachment.size,
        type: attachment.type,
        mimeType: attachment.mimeType,
        filename: attachment.filename,
        challengeId: attachment.challengeId,
        localizedChallengeId: attachment.localizedChallengeId,
      })),
    )
    .into('attachments')
    .returning('*')
    .orderBy('id');

  return toDomainList(dtos);
}

export async function create(attachment) {
  const id = idGenerator.generateNewId('attachment');

  const [dto] = await knex
    .insert({
      id,
      url: attachment.url,
      size: attachment.size,
      type: attachment.type,
      mimeType: attachment.mimeType,
      filename: attachment.filename,
      challengeId: attachment.challengeId,
      localizedChallengeId: attachment.localizedChallengeId,
    })
    .into('attachments')
    .returning('*');

  return toDomain(dto);
}

export async function update(attachment) {
  const [dto] = await knex('attachments')
    .update({
      filename: attachment.filename,
      updatedAt: knex.fn.now(),
    })
    .where('id', attachment.id)
    .returning('*');

  return toDomain(dto);
}

export async function remove(attachmentId) {
  await knex.delete().from('attachments').where('id', attachmentId);
}

function toDomainList(dtos) {
  return dtos.map(toDomain);
}

export function toDomain({ challengeId, ...dto }) {
  return new Attachment({ challengeId, airtableChallengeId: challengeId, ...dto });
}
