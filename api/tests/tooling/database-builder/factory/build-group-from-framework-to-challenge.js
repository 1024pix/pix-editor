import { LocalizedChallenge } from '../../../../lib/domain/models/index.js';
import { buildChallengeDatasourceObject, buildSkillDatasourceObject } from '../../domain-builder/factory/index.js';
import { buildFramework } from './build-framework.js';
import { buildArea } from './build-area.js';
import { buildCompetence } from './build-competence.js';
import { buildThematic } from './build-thematic.js';
import { buildTube } from './build-tube.js';
import { buildSkill } from './build-skill.js';
import { buildChallenge } from './build-challenge.js';
import { buildLocalizedChallenge } from './build-localized-challenge.js';
import { buildTranslation } from './build-translation.js';

export function buildChallengeInGroup({ challenge, localizedChallenge, challengeTranslations, skill }) {
  const chalengeDTO = buildChallengeDatasourceObject({
    id: 'challenge1',
    competenceId: 'competence1',
    skillId: 'skill1',
    ...challenge,
  });

  const localizedChallengeDTO = {
    id: chalengeDTO.id,
    challengeId: chalengeDTO.id,
    locale: 'fr',
    embedUrl: chalengeDTO.embedUrl,
    geography: chalengeDTO.geography,
    urlsToConsult: ['truc.fr'],
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
    isAwarenessChallenge: true,
    toRephrase: true,
    hasEmbedInternalValidation: true,
    noValidationNeeded: true,
    ...localizedChallenge,
  };

  const challengeTranslationsValues = {
    instruction: 'Le cœur des boys',
    alternativeInstruction: ' j\'ai blessé',
    embedTitle: 'j\'ai ghost',
    illustrationAlt: 'Gadget de Spice Girl',
    solution: '1, 5',
    solutionToDisplay: 'c 1 et 5',
    proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
    ...challengeTranslations,
  };

  const skillDTO = buildSkillDatasourceObject({
    tubeId: 'tube1',
    createdAt: chalengeDTO.createdAt,
    ...skill,
    id: chalengeDTO.skillId,
  });

  const translationDTOs = Object.keys(challengeTranslationsValues).map((key) => ({
    key: `challenge.${chalengeDTO.id}.${key}`,
    locale: localizedChallengeDTO.locale,
    value: challengeTranslationsValues[key],
  }));

  return {
    framework: buildFramework({ id: 'framework1', name: 'Pix' }),
    area: buildArea({ id: 'area1', code: '1', frameworkId: 'framework1' }),
    competence: buildCompetence({ id: chalengeDTO.competenceId, index: '1.1', areaId: 'area1' }),
    thematic: buildThematic({ id: 'thematic1', competenceId: chalengeDTO.competenceId }),
    tube: buildTube({ id: skillDTO.tubeId, name: '@tube', thematicId: 'thematic1' }),
    skill: buildSkill({ ...skillDTO, tutorialIds: [], learningMoreTutorialIds: [] }),
    challenge: buildChallenge(chalengeDTO),
    localizedChallenge: buildLocalizedChallenge(localizedChallengeDTO),
    translations: translationDTOs.map(buildTranslation),
  };
}

