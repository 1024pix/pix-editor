import { JobScheduleController } from '../../application/jobs/job-schedule-controller.js';
import * as config from '../../config.js';
import { exportExternalUrlsFromRelease } from '../../domain/usecases/index.js';
import {
  localizedChallengeRepository,
  releaseRepository,
  urlRepository,
  whitelistedUrlRepository,
} from '../repositories/index.js';
import * as UrlUtils from '../utils/url-utils.js';

export class ExportExternalUrlListJobController extends JobScheduleController {
  constructor() {
    super('ExportExternalUrlListJob', { jobCron: config.scheduledJobs.exportExternalUrlListTime });
  }

  get isJobEnabled() {
    return config.pgBoss.exportExternalUrlListJobEnabled;
  }

  async handle() {
    return exportExternalUrlsFromRelease({
      releaseRepository,
      urlRepository,
      localizedChallengeRepository,
      whitelistedUrlRepository,
      UrlUtils,
    });
  }
}
