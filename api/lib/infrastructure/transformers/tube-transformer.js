/**
 * @param {import('../../domain/models').Tube[]} tubes
 * @param {import('../../domain/models').Thematic[]} thematics
 * @param {import('../../domain/models').Challenge[]} challenges
 */
export function transformTubes(tubes, thematics, challenges) {
  const thematicAirtableIdToId = Object.fromEntries(thematics.map((thematic) => [thematic.airtableId, thematic.id]));
  return tubes.map((tube) => transformTube(tube, thematicAirtableIdToId[tube.thematicAirtableId], challenges));
}

/**
 * @param {import('../../domain/models').Tube} tube
 * @param {string} thematicId
 * @param {import('../../domain/models').Challenge[]} challenges
 */
export function transformTube(tube, thematicId, challenges) {
  const {
    id,
    competenceId,
    name,
    practicalDescription_i18n,
    practicalTitle_i18n,
    skillIds,
  } = tube;

  const tubeValidatedPrototypes = challenges?.filter((challenge) => (
    skillIds.includes(challenge.skillId) && challenge.isPrototype && challenge.isValide
  ));
  const isMobileCompliant = tubeValidatedPrototypes?.length > 0 && tubeValidatedPrototypes.every((challenge) => challenge.isMobileCompliant);
  const isTabletCompliant = tubeValidatedPrototypes?.length > 0 && tubeValidatedPrototypes.every((challenge) => challenge.isTabletCompliant);

  return {
    id,
    competenceId,
    name,
    practicalDescription_i18n,
    practicalTitle_i18n,
    skillIds,
    thematicId,
    isMobileCompliant,
    isTabletCompliant,
  };
}
