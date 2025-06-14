import { AreaForRelease } from '../../domain/models/release/index.js';
import { AreaForReplication } from '../../domain/models/replication/index.js';

/**
 * @typedef {import('../../../lib/domain/models').Area} Area
 * @typedef {import('../../../lib/domain/models/release').AreaForRelease} AreaForRelease
 * @typedef {import('../../../lib/domain/models/replication').AreaForReplication} AreaForReplication
 */

/**
 * @param {Area|Area[]} areas
 * @returns {AreaForRelease|AreaForRelease[]}
 */
export function forRelease(areas) {
  if (Array.isArray(areas)) {
    return areas.map((area) => new AreaForRelease(area));
  }
  return new AreaForRelease(areas);
}

/**
 @param {Area|Area[]} areas
 @returns {AreaForReplication|AreaForReplication[]}
 */
export function forReplication(areas) {
  if (Array.isArray(areas)) {
    return areas.map((area) => new AreaForReplication(area));
  }
  return new AreaForReplication(areas);
}

export function filterAreaFields({
  id,
  code,
  title_i18n,
  name,
  competenceIds,
  color,
  frameworkId,
}) {
  return {
    id,
    code,
    title_i18n,
    name,
    competenceIds,
    color,
    frameworkId,
  };
}

export function filterAreasFields(frameworks) {
  return frameworks.map(filterAreaFields);
}
