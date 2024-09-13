import { ChallengeForRelease } from '../../domain/models/release/index.js';
import _ from 'lodash';

export function transform({ tubes, skills, challenges, thematics }) {
  return tubes.map(filterTubeFields)
    .map((tube) => _addLinks({ tube, skills, thematics }))
    .map((tube) => _addDeviceCompliance({ tube, skills, challenges }));
}

function _addLinks({ tube, skills, thematics }) {
  return {
    ...tube,
    thematicId: _findThematicId(tube.id, thematics),
    skillIds: _findSkillIds(tube.id, skills),
  };
}

export function filterTubeFields(tube) {
  const fieldsToInclude = [
    'id',
    'name',
    'practicalTitle_i18n',
    'practicalDescription_i18n',
    'competenceId',
  ];

  return _.pick(tube, fieldsToInclude);
}

function _findThematicId(tubeId, thematics) {
  const correspondingThematic = thematics.find((thematic) => thematic.tubeIds?.includes(tubeId));
  return correspondingThematic?.id || null;
}

function _findSkillIds(tubeId, skills) {
  return skills.filter((skill) => skill.tubeId === tubeId).map((skill) => skill.id);
}

function _addDeviceCompliance({ tube, skills, challenges }) {
  const tubeChallenges = _filterValidatedPrototypeTubeChallenges(skills, challenges, tube.id);
  return {
    ...tube,
    isMobileCompliant: tubeChallenges?.length > 0 && tubeChallenges.every(_isChallengeSmartphoneCompliant),
    isTabletCompliant: tubeChallenges?.length > 0 && tubeChallenges.every(_isChallengeTabletCompliant),
  };
}

function _filterValidatedPrototypeTubeChallenges(skills, challenges, tubeId) {
  return challenges.filter((challenge) => {
    if (challenge.status !== ChallengeForRelease.STATUSES.VALIDE) return false;
    if (challenge.genealogy !== ChallengeForRelease.GENEALOGIES.PROTOTYPE) return false;
    const skill = skills.find((skill) => skill.id === challenge.skillId);
    return skill?.tubeId === tubeId;
  });
}

function _isChallengeSmartphoneCompliant(challenge) {
  return [ChallengeForRelease.RESPONSIVES.SMARTPHONE, ChallengeForRelease.RESPONSIVES.TABLETTE_ET_SMARTPHONE]
    .includes(challenge.responsive);
}

function _isChallengeTabletCompliant(challenge) {
  return [ChallengeForRelease.RESPONSIVES.TABLETTE, ChallengeForRelease.RESPONSIVES.TABLETTE_ET_SMARTPHONE]
    .includes(challenge.responsive);
}
