import _ from 'lodash';
import { TutorialForRelease } from '../../domain/models/release/index.js';
import { TutorialForReplication } from '../../domain/models/replication/index.js';

/**
 * @typedef {import('../../../lib/domain/models').Tutorial} Tutorial
 * @typedef {import('../../../lib/domain/models/release').TutorialForRelease} TutorialForRelease
 * @typedef {import('../../../lib/domain/models/replication').TutorialForReplication} TutorialForReplication
 */

export function filterTutorialsFields(tutorials) {
  const fieldsToInclude = [
    'id',
    'duration',
    'format',
    'link',
    'source',
    'title',
    'locale',
  ];
  return tutorials.map((tutorial) => _.pick(tutorial, fieldsToInclude));
}

/**
 * @param {Tutorial|Tutorial[]} tutorial
 * @returns {TutorialForRelease|TutorialForRelease[]}
 */
export function forRelease(tutorial) {
  if (Array.isArray(tutorial)) {
    return tutorial.map((oneTutorial) => new TutorialForRelease(oneTutorial));
  }
  return new TutorialForRelease(tutorial);
}

/**
 * @param {Tutorial|Tutorial[]} tutorial
 * @returns {TutorialForReplication|TutorialForReplication[]}
 */
export function forReplication(tutorial) {
  if (Array.isArray(tutorial)) {
    return tutorial.map((oneTutorial) => new TutorialForReplication(oneTutorial));
  }
  return new TutorialForReplication(tutorial);
}
