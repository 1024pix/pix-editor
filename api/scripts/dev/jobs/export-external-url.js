import exportExternalUrlsJobProcessor
  from '../../../lib/infrastructure/scheduled-jobs/export-external-url-list-job-processor.js';
import { Script } from '../../../lib/application/scripts/script.js';
import { ScriptRunner } from '../../../lib/application/scripts/script-runner.js';

export class ExportExternalUrl extends Script {
  constructor() {
    super({
      description: 'Manual trigger of the job "export-external-url-list-job-processor.js"',
      permanent: true,
      options: {},
    });
  }

  async handle({ options: _, logger: __ }) {
    await exportExternalUrlsJobProcessor();
  }
}

await ScriptRunner.execute(import.meta.url, ExportExternalUrl);

