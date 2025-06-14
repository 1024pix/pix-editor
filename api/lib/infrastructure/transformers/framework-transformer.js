import { FrameworkForRelease } from '../../domain/models/release/index.js';
import { FrameworkForReplication } from '../../domain/models/replication/index.js';

/**
 * @typedef {import('../../../lib/domain/models').Framework} Framework
 * @typedef {import('../../../lib/domain/models/release').FrameworkForRelease} FrameworkForRelease
 * @typedef {import('../../../lib/domain/models/replication').FrameworkForReplication} FrameworkForReplication
 */

/**
 * @param {Framework|Framework[]} frameworks
 * @returns {FrameworkForRelease|FrameworkForRelease[]}
 */
export function forRelease(frameworks) {
  if (Array.isArray(frameworks)) {
    return frameworks.map((framework) => new FrameworkForRelease(framework));
  }
  return new FrameworkForRelease(frameworks);
}

/**
 @param {Framework|Framework[]} frameworks
 @returns {FrameworkForReplication|FrameworkForReplication[]}
 */
export function forReplication(frameworks) {
  if (Array.isArray(frameworks)) {
    return frameworks.map((framework) => new FrameworkForReplication(framework));
  }
  return new FrameworkForReplication(frameworks);
}

export function filterFrameworkFields({ id, name }) {
  return { id, name };
}

export function filterFrameworksFields(frameworks) {
  return frameworks.map(filterFrameworkFields);
}
