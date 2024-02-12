import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import _ from 'lodash';
import { knex, disconnect } from '../../db/knex-database-connection.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function fillMissingAttachmentsChallengeIds({ airtableClient }) {
  const attachmentsWithoutChallengeId = await fetchAttachmentsWithoutChallengeId({ airtableClient });

  const attachments = [];

  for (const attachment of attachmentsWithoutChallengeId) {
    const challengeId = await knex('localized_challenges')
      .pluck('challengeId')
      .where({ id: attachment.localizedChallengeId });

    attachments.push({
      id: attachment.id,
      challengeId: challengeId[0],
    });
  }

  const formula = `OR(${attachments.map(({ challengeId }) => `{id persistant} = "${challengeId}"`).join(',')})`;

  const airtableChallenges = await airtableClient
    .table('Epreuves')
    .select({
      fields: [
        'id persistant',
      ],
      filterByFormula: formula,
    })
    .all();

  const attachmentsWithChallengeId = attachments.map((attachment) => {
    const airtableChallenge = airtableChallenges.find((challenge) => challenge.get('id persistant') === attachment.challengeId);

    return {
      id: attachment.id,
      fields: {
        challengeId: [airtableChallenge.id],
      }
    };
  });

  for (const attachmentChunk of _.chunk(attachmentsWithChallengeId, 10)) {
    await airtableClient.table('Attachments').update(attachmentChunk);
  }
}

async function fetchAttachmentsWithoutChallengeId({ airtableClient }) {
  const rawAttachments = await airtableClient
    .table('Attachments')
    .select({
      fields: [
        'Record ID',
        'localizedChallengeId',
      ],
      filterByFormula: '{challengeId} = BLANK()'
    })
    .all();

  return rawAttachments.map((rawAttachment) => {
    return {
      id: rawAttachment.get('Record ID'),
      localizedChallengeId: rawAttachment.get('localizedChallengeId'),
    };
  });
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await fillMissingAttachmentsChallengeIds({ airtableClient });
    console.log('All attachments are now linked to a Challenge!');
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
