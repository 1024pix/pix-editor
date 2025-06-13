import { TubeForRelease } from '../../domain/models/release/index.js';
import { TubeForReplication } from '../../domain/models/replication/index.js';

/**
 * @typedef {import('../../../lib/domain/models').Tube} Tube
 * @typedef {import('../../../lib/domain/models').Thematic} Thematic
 * @typedef {import('../../../lib/domain/models').Challenge} Challenge
 * @typedef {import('../../../lib/domain/models/release').TubeForRelease} TubeForRelease
 * @typedef {import('../../../lib/domain/models/replication').TubeForReplication} TubeForReplication
 */

/**
 * @param {Tube|Tube[]} tubes
 * @param {Thematic|Thematic[]} thematics
 * @param {Challenge[]} challenges
 * @returns {TubeForRelease|TubeForRelease[]}
 */
export function forRelease(tubes, thematics, challenges) {
  if (Array.isArray(tubes)) {
    const thematicsByAirtableId = Object.fromEntries(thematics.map((thematic) => [thematic.airtableId, thematic]));
    return tubes.map((tube) => forRelease(tube, thematicsByAirtableId[tube.thematicAirtableId], challenges));
  }

  const data = buildData(tubes, thematics, challenges);
  return new TubeForRelease(data);
}

/**
 * @param {Tube|Tube[]} tubes
 * @param {Thematic|Thematic[]} thematics
 * @param {Challenge[]} challenges
 * @returns {TubeForReplication|TubeForReplication[]}
 */
export function forReplication(tubes, thematics, challenges) {
  if (Array.isArray(tubes)) {
    const thematicsByAirtableId = Object.fromEntries(thematics.map((thematic) => [thematic.airtableId, thematic]));
    return tubes.map((tube) => forReplication(tube, thematicsByAirtableId[tube.thematicAirtableId], challenges));
  }

  const data = buildData(tubes, thematics, challenges);
  return new TubeForReplication(data);
}

/**
 * @param {Tube} tube
 * @param {Thematic} thematic
 * @param {Challenge[]} challenges
 */
function buildData(tube, thematic, challenges) {
  const tubeValidatedPrototypes = challenges?.filter((challenge) => (
    tube.skillIds.includes(challenge.skillId) && challenge.isPrototype && challenge.isValide
  ));
  const isMobileCompliant = tubeValidatedPrototypes?.length > 0 && tubeValidatedPrototypes.every((challenge) => challenge.isMobileCompliant);
  const isTabletCompliant = tubeValidatedPrototypes?.length > 0 && tubeValidatedPrototypes.every((challenge) => challenge.isTabletCompliant);

  return {
    id: tube.id,
    name: tube.name,
    practicalTitle_i18n: tube.practicalTitle_i18n,
    practicalDescription_i18n: tube.practicalDescription_i18n,
    competenceId: tube.competenceId,
    isMobileCompliant,
    isTabletCompliant,
    thematicId: thematic.id,
    skillIds: tube.skillIds,
  };
}
