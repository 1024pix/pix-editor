import { challengeRepository } from '../../infrastructure/repositories/index.js';

export async function createChallenge(challenge, dependencies = { challengeRepository }) {

  return dependencies.challengeRepository.create(challenge);
}
