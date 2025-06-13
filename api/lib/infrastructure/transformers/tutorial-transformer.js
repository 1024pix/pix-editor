import { TutorialForRelease } from '../../domain/models/release/index.js';
import { TutorialForReplication } from '../../domain/models/replication/index.js';

/**
 * @typedef {import('../../../lib/domain/models').Tutorial} Tutorial
 * @typedef {import('../../../lib/domain/models/release').TutorialForRelease} TutorialForRelease
 * @typedef {import('../../../lib/domain/models/replication').TutorialForReplication} TutorialForReplication
 */

/**
 * @param {Tutorial|Tutorial[]} tutorials
 * @returns {TutorialForRelease|TutorialForRelease[]}
 */
export function forRelease(tutorials) {
  if (Array.isArray(tutorials)) {
    return tutorials.map((tutorial) => new TutorialForRelease(tutorial));
  }
  return new TutorialForRelease(tutorials);
}

/**
 * @param {Tutorial|Tutorial[]} tutorials
 * @returns {TutorialForReplication|TutorialForReplication[]}
 */
export function forReplication(tutorials) {
  if (Array.isArray(tutorials)) {
    return tutorials.map((tutorial) => new TutorialForReplication(tutorial));
  }
  return new TutorialForReplication(tutorials);
}
