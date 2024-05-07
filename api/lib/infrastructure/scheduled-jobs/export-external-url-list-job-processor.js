import './job-process.js';
import { exportExternalUrlsFromRelease } from '../../domain/usecases/index.js';
import { releaseRepository, urlErrorRepository } from '../repositories/index.js';
import { UrlUtils } from '../utils/url-utils.js';

export default function exportExternalUrlsJobProcessor() {
  return exportExternalUrlsFromRelease({ releaseRepository, urlErrorRepository, UrlUtils });
}
