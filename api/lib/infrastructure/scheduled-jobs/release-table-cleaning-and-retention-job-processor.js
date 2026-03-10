import './job-process.js';
import { child } from '../logger.js';
import { knex } from '../../../db/knex-database-connection.js';

const logger = child('job:release-table-cleaning-and-retention', { event: 'release-table-cleaning-and-retention' });
const MONTHS_FULL_DATA = 3;

export default async function releasesTableCleaningAndRetention(job) {
  const { chunkSize = 10 } = job.data;
  let totalDeletedCount = 0;

  try {
    const now = new Date();
    const dailyRetentionDate = new Date(now.getFullYear(), now.getMonth() - MONTHS_FULL_DATA, now.getDate());

    const releaseDtos = await knex
      .select(
        'id',
        knex.raw('to_char(??, ?) as ??', [
          'createdAt',
          'YYYYMM',
          'yearMonth',
        ]),
      )
      .from('releases')
      .where('createdAt', '<', dailyRetentionDate)
      .orderBy('createdAt');

    const groupedByMonth = Object.groupBy(releaseDtos, (release) => release.yearMonth);

    const releaseIdsToDelete = Object.values(groupedByMonth).flatMap(
      (releasesInSameMonth) => releasesInSameMonth
        .slice(1)
        .map((release) => release.id),
    );

    for (const chunk of chunks(releaseIdsToDelete, chunkSize)) {
      logger.info({ ids: chunk }, 'will delete releases');
      const deletedReleasesCount = await knex.delete().from('releases').whereIn('id', chunk);
      logger.info(`${deletedReleasesCount} rows deleted`);
      totalDeletedCount += deletedReleasesCount;
    }
  } catch (err) {
    logger.error(err);
    throw err;
  }

  if (totalDeletedCount === 0) return;
  logger.info(`${totalDeletedCount} rows deleted in total`);
  await knex.raw('VACUUM ANALYZE releases');
}

function* chunks(array, chunkSize) {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}
