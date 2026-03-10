import './job-process.js';
import { child } from '../logger.js';
import { knex } from '../../../db/knex-database-connection.js';

const logger = child('job:release-table-cleaning-and-retention', { event: 'release-table-cleaning-and-retention' });
const MONTHS_FULL_DATA = 3;

export default async function releasesTableCleaningAndRetention() {
  const deletedReleasesCount = await knex.transaction(async (transaction) => {
    try {
      const now = new Date();
      const dailyRetentionDate = new Date(now.getFullYear(), now.getMonth() - MONTHS_FULL_DATA, now.getDate());

      const releaseDtos = await transaction
        .select(
          'id',
          transaction.raw('to_char(??, ?) as ??', [
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

      const deletedReleasesCount = await transaction.delete().from('releases').whereIn('id', releaseIdsToDelete);
      logger.info(`${deletedReleasesCount} rows deleted`);

      return deletedReleasesCount;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  if (deletedReleasesCount === 0) return;

  await knex.raw('VACUUM ANALYZE releases');
}
