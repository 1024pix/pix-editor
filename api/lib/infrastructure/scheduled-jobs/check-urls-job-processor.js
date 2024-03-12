import './job-process.js';
import { validateUrlsFromRelease } from '../../domain/usecases/validate-urls-from-release.js';
import { releaseRepository, urlErrorRepository } from '../repositories/index.js';

export default function checkUrlsJobProcessor() {
  return validateUrlsFromRelease({ releaseRepository, urlErrorRepository });
}
