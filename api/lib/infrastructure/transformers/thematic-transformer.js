import { ThematicForRelease } from '../../domain/models/release/index.js';
import { ThematicForReplication } from '../../domain/models/replication/index.js';

/**
 * @typedef {import('../../../lib/domain/models').Thematic} Thematic
 * @typedef {import('../../../lib/domain/models/release').ThematicForRelease} ThematicForRelease
 * @typedef {import('../../../lib/domain/models/replication').ThematicForReplication} ThematicForReplication
 */

/**
 * @param {Thematic|Thematic[]} thematics
 * @returns {ThematicForRelease|ThematicForRelease[]}
 */
export function forRelease(thematics) {
  if (Array.isArray(thematics)) {
    return thematics.map((thematic) => new ThematicForRelease(thematic));
  }
  return new ThematicForRelease(thematics);
}

/**
 @param {Thematic|Thematic[]} thematics
 @returns {ThematicForReplication|ThematicForReplication[]}
 */
export function forReplication(thematics) {
  if (Array.isArray(thematics)) {
    return thematics.map((thematic) => new ThematicForReplication(thematic));
  }
  return new ThematicForReplication(thematics);
}

export function filterThematicsFields(thematics) {
  return thematics.map(filterThematicFields);
}

export function filterThematicFields({ id, name_i18n, index, competenceId, tubeIds }) {
  return { id,name_i18n,index, competenceId,tubeIds };
}
