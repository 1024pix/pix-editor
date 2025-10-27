/**
 * @param {import('../../domain/models').Tube[]} tubes
 * @param {import('../../domain/models').Challenge[]} challenges
 */
export function transformTubes(tubes, challenges) {
  return tubes.map((tube) => transformTube(tube, challenges));
}

/**
 * @param {import('../../domain/models').Tube} tube
 * @param {import('../../domain/models').Challenge[]} challenges
 */
export function transformTube(tube, challenges) {
  const { id, thematicId, competenceId, name, practicalDescription_i18n, practicalTitle_i18n, skillIds } = tube;

  const tubeValidatedPrototypes = challenges?.filter(
    (challenge) => skillIds.includes(challenge.skillId) && challenge.isPrototype && challenge.isValide,
  );
  const isMobileCompliant =
    tubeValidatedPrototypes?.length > 0 && tubeValidatedPrototypes.every((challenge) => challenge.isMobileCompliant);
  const isTabletCompliant =
    tubeValidatedPrototypes?.length > 0 && tubeValidatedPrototypes.every((challenge) => challenge.isTabletCompliant);

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
