import { CompetenceForRelease } from '../../domain/models/release/index.js';
import { CompetenceForReplication } from '../../domain/models/replication/index.js';

/**
 * @typedef {import('../../../lib/domain/models').Competence} Competence
 * @typedef {import('../../../lib/domain/models/release').CompetenceForRelease} CompetenceForRelease
 * @typedef {import('../../../lib/domain/models/replication').CompetenceForReplication} CompetenceForReplication
 */

/**
 * @param {Competence|Competence[]} competences
 * @returns {CompetenceForRelease|CompetenceForRelease[]}
 */
export function forRelease(competences) {
  if (Array.isArray(competences)) {
    return competences.map((competence) => new CompetenceForRelease(competence));
  }
  return new CompetenceForRelease(competences);
}

/**
 @param {Competence|Competence[]} competences
 @returns {CompetenceForReplication|CompetenceForReplication[]}
 */
export function forReplication(competences) {
  if (Array.isArray(competences)) {
    return competences.map((competence) => new CompetenceForReplication(competence));
  }
  return new CompetenceForReplication(competences);
}
