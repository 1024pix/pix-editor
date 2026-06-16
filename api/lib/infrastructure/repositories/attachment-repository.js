import { Attachment } from '../../domain/models/index.js';
import { AttachmentForReplication } from '../../domain/models/replication/index.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import * as idGenerator from '../utils/id-generator.js';

export async function get(id) {
  const knexConn = DomainTransaction.getConnection();
  const dto = await knexConn.select('*').from('attachments').where('id', id).first();

  if (!dto) return null;
  return toDomain(dto);
}

export async function list() {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn.select('*').from('attachments').orderBy('id');

  return toDomainList(dtos);
}

/**
 * @param {AbortSignal=} signal
 */
export async function* streamForReplication(signal) {
  const knexConn = DomainTransaction.getConnection();
  const stream = knexConn
    .select(
      'attachments.id',
      'attachments.type',
      'attachments.url',
      'attachments.size',
      'attachments.filename',
      'attachments.localizedChallengeId as challengeId',
      'illustration_alt_translations.value as alt',
    )
    .from('attachments')
    .leftOuterJoin('localized_challenges', 'localized_challenges.id', 'attachments.localizedChallengeId')
    .leftOuterJoin('translations as illustration_alt_translations', function() {
      this.onVal('illustration_alt_translations.model', 'challenge')
        .on('illustration_alt_translations.entityId', 'localized_challenges.challengeId')
        .on('illustration_alt_translations.locale', 'localized_challenges.locale')
        .on(knexConn.raw('?? like ?', ['illustration_alt_translations.key', '%.illustrationAlt']));
    })
    .orderBy('id')
    .stream();

  signal?.addEventListener('abort', () => {
    stream.destroy();
  });

  for await (const dto of stream) {
    yield toDomainForReplication(dto);
  }
}

export async function listByLocalizedChallengeIds(localizedChallengeIds) {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn
    .select('*')
    .from('attachments')
    .whereIn('localizedChallengeId', localizedChallengeIds)
    .orderBy('id');

  return toDomainList(dtos);
}

export async function listByLocalizedChallengeId(localizedChallengeId) {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn.select('*').from('attachments').where('localizedChallengeId', localizedChallengeId);

  return toDomainList(dtos);
}

export async function createBatch(attachments) {
  if (!attachments || attachments.length === 0) return [];

  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn
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
  const knexConn = DomainTransaction.getConnection();
  const id = idGenerator.generateNewId('attachment');

  const [dto] = await knexConn
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
  const knexConn = DomainTransaction.getConnection();
  const [dto] = await knexConn('attachments')
    .update({
      filename: attachment.filename,
      updatedAt: knexConn.fn.now(),
    })
    .where('id', attachment.id)
    .returning('*');

  return toDomain(dto);
}

export async function remove(attachmentId) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn.delete().from('attachments').where('id', attachmentId);
}

/**
 * @param {object[]} dtos
 */
function toDomainList(dtos) {
  return dtos.map(toDomain);
}

export function toDomain({ challengeId, ...dto }) {
  return new Attachment({ challengeId, airtableChallengeId: challengeId, ...dto });
}

function toDomainForReplication(dto) {
  return new AttachmentForReplication(dto);
}
