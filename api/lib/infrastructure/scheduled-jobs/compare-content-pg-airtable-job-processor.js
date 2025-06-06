import './job-process.js';
import { toDomain } from '../repositories/attachment-repository.js';
import { attachmentDatasource } from '../datasources/airtable/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import { child } from '../logger.js';

const logger = child('compare-content-pg-airtable-job', { event: 'lcms:pg-migration-attachment' });

export default async function compareContentPgAirtableJobProcessor(dependencies = { logger: logger }) {
  dependencies.logger.info('Comparing attachments...');
  await compareAttachments(dependencies.logger);
  dependencies.logger.info('Comparing attachments DONE');
}

export async function compareAttachments(logger) {
  // Airtable
  const attachmentDatasources = await attachmentDatasource.list();
  const attachmentsFromAirtable = attachmentDatasources.map(toDomain).sort(byId);

  // PG
  const attachmentDtos = await knex('attachments').select('*');
  const attachmentsFromPG = attachmentDtos.map(toDomain).sort(byId);

  // Comparison
  logger.info(`INFO: Nb attachments from PG :${attachmentsFromPG.length} | Nb attachments from Airtable :${attachmentsFromAirtable.length}`);
  if (attachmentsFromPG.length === attachmentsFromAirtable.length) {
    logger.info('OK: Nb of attachments identical');
  } else {
    logger.error('KO: Nb of attachments different');
  }

  const idsNotInPG = [];
  const idsNotInAirtable = [];
  const idsDifferentContent = [];
  const attachmentsFromPGById = new Map(attachmentsFromPG.map((attachmentFromPG) => [attachmentFromPG.id, attachmentFromPG]));
  for (const attachmentFromAirtable of attachmentsFromAirtable) {
    const correspondingAttachmentFromPG = attachmentsFromPGById.get(attachmentFromAirtable.id);
    if (!correspondingAttachmentFromPG) {
      idsNotInPG.push(attachmentFromAirtable.id);
      continue;
    }
    const index = attachmentsFromPG.indexOf(correspondingAttachmentFromPG);
    attachmentsFromPG.splice(index, 1);
    if (!isEqual(attachmentFromAirtable, correspondingAttachmentFromPG)) {
      idsDifferentContent.push(attachmentFromAirtable.id);
    }
  }
  idsNotInAirtable.push(...attachmentsFromPG.map((attachmentFromPG) => attachmentFromPG.id));

  if (idsNotInPG.length === 0 && idsNotInAirtable.length === 0 && idsDifferentContent.length === 0) {
    logger.info('OK: Identical attachments contents from PG and Airtable');
  }
  if (idsNotInPG.length > 0) {
    logger.error(`KO: List of attachment IDS existing in Airtable but not in PG : ${idsNotInPG.join(', ')}`);
  }
  if (idsNotInAirtable.length > 0) {
    logger.error(`KO: List of attachment IDS existing in PG but not in Airtable : ${idsNotInAirtable.join(', ')}`);
  }
  if (idsDifferentContent.length > 0) {
    logger.error(`KO: List of attachment IDS having different content in PG and Airtable : ${idsDifferentContent.join(', ')}`);
  }
}

function byId(a,b) {
  return a.id < b.id ? -1 : 1;
}

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
