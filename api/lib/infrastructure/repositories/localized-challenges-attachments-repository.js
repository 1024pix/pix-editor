import { knex } from '../../../db/knex-database-connection.js';

export async function save({ attachmentId, localizedChallengeId }) {
  await knex('localized_challenges-attachments')
    .insert({ attachmentId, localizedChallengeId });
}

export async function deleteByAttachmentId(attachmentId) {
  await knex('localized_challenges-attachments').delete().where({ attachmentId });
}
