import checkUrlsJobProcessor from '../../../lib/infrastructure/scheduled-jobs/check-urls-job-processor.js';
import { Script } from '../../../lib/application/scripts/script.js';
import { ScriptRunner } from '../../../lib/application/scripts/script-runner.js';

export class MoulinetteUrlsCassees extends Script {
  constructor() {
    super({
      description: 'Manual trigger of the job "check-urls-job-processor.js"',
      permanent: true,
      options: {},
    });
  }

  async handle({ options: _, logger: __ }) {
    await checkUrlsJobProcessor();
  }
}

await ScriptRunner.execute(import.meta.url, MoulinetteUrlsCassees);
