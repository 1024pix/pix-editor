import { Script } from '../../../lib/application/scripts/script.js';
import { ScriptRunner } from '../../../lib/application/scripts/script-runner.js';
import releasesTableCleaningAndRetention from '../../../lib/infrastructure/scheduled-jobs/release-table-cleaning-and-retention-job-processor.js';

export class CleanReleases extends Script {
  constructor() {
    super({
      description: 'Manual trigger of the job "release-table-cleaning-and-retention-job-processor.js"',
      permanent: true,
      options: {},
    });
  }

  async handle({ options: _, logger }) {
    await releasesTableCleaningAndRetention({ logger });
  }
}

await ScriptRunner.execute(import.meta.url, CleanReleases);
