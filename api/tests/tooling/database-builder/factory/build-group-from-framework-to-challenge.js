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

/**
 * @typedef {import('../../../../lib/infrastructure/translations/challenge.js').fields} TranslatedChallengeFieldList
 * @typedef {TranslatedChallengeFieldList[number]} TranslatedChallengeField
 */

/**
 * @param {{
 *   challenge?: Parameters<typeof buildChallengeDatasourceObject>[0]
 *   localizedChallenge?: Omit<Parameters<typeof buildLocalizedChallenge>[0], 'id' | 'challengeId'>
 *   challengeTranslations?: Partial<Record<TranslatedChallengeField, string>>
 *   skill?: Omit<Parameters<typeof buildSkillDatasourceObject>[0], 'id'>
 *   framework?: Parameters<typeof buildFramework>[0]
 *   tube?: Parameters<typeof buildTube>[0]
 * }} groupToBuild
 */
export function buildChallengeInGroup({ challenge, localizedChallenge, challengeTranslations, skill, framework, tube }) {
  const randomId = generateRandomId();

  const chalengeDTO = buildChallengeDatasourceObject({
    id: `challenge${randomId}`,
    competenceId: `competence${randomId}`,
    skillId: `skill${randomId}`,
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
    tubeId: `tube${randomId}`,
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
    framework: buildFramework({ id: `framework${randomId}`, name: 'Pix', ...framework }),
    area: buildArea({ id: `area${randomId}`, code: '1', frameworkId: framework?.id ?? `framework${randomId}` }),
    competence: buildCompetence({ id: chalengeDTO.competenceId, index: '1.1', areaId: `area${randomId}` }),
    thematic: buildThematic({ id: `thematic${randomId}`, competenceId: chalengeDTO.competenceId }),
    tube: buildTube({ id: skillDTO.tubeId, name: '@tube', thematicId: `thematic${randomId}`, ...tube }),
    skill: buildSkill({ ...skillDTO, tutorialIds: [], learningMoreTutorialIds: [] }),
    challenge: buildChallenge(chalengeDTO),
    localizedChallenge: buildLocalizedChallenge(localizedChallengeDTO),
    translations: translationDTOs.map(buildTranslation),
  };
}

function generateRandomId() {
  return (Math.random() * 100).toFixed();
}
