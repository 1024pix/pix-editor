import './job-process.js';
import { child } from '../logger.js';
import { knex } from '../../../db/knex-database-connection.js';

const logger = child('releases-cleaning-and-retention-job', { event: 'lcms:releases-cleaning' });
const MONTHS_FULL_DATA = 3;

export default async function releasesTableCleaningAndRetention(dependencies = { logger: logger }) {
  const trx = await knex.transaction();
  let rowDeletedCount = 0;
  try {
    const now = new Date();
    const dailyRetentionDate = new Date(now.getFullYear(), now.getMonth() - MONTHS_FULL_DATA, now.getDate());
    const releaseDTOs = await trx('releases').select('id', 'createdAt').where('createdAt', '<', dailyRetentionDate);
    const groupedByMonth = Object.groupBy(releaseDTOs, (dto) => {
      return dto.createdAt.getMonth().toString();
    });
    const releaseIdsToDelete = [];
    for (const releasesInSameMonth of Object.values(groupedByMonth)) {
      releaseIdsToDelete.push(
        ...releasesInSameMonth
          .sort(byCreatedAtAsc)
          .slice(1)
          .map((release) => release.id),
      );
    }
    const deletedReleases = await trx('releases').whereIn('id', releaseIdsToDelete).del(['id']);
    rowDeletedCount = deletedReleases.length;
    dependencies.logger.info(`${rowDeletedCount} rows deleted`);
    trx.commit();
  } catch (err) {
    trx.rollback();
    dependencies.logger.error(err);
  }
  if (rowDeletedCount > 0) {
    await knex.raw('VACUUM ANALYZE releases');
  }
}

function byCreatedAtAsc(releaseA, releaseB) {
  return releaseA.createdAt - releaseB.createdAt;
}
