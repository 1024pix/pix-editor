import { knex } from '../../../db/knex-database-connection.js';

export async function save({attachmentId, localizedChallengeId}) {
  await knex('localized_challenges-attachments')
    .insert({attachmentId, localizedChallengeId});
}
