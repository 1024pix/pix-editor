import './job-process.js';
import { validateUrlsFromRelease } from '../../domain/usecases/index.js';
import { localizedChallengeRepository, releaseRepository, urlErrorRepository } from '../repositories/index.js';

export default function checkUrlsJobProcessor() {
  return validateUrlsFromRelease({ releaseRepository, urlErrorRepository, localizedChallengeRepository });
}
