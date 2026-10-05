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
 * @typedef {import('../../../../lib/infrastructure/translations/tube.js').fields} TranslatedTubeFieldList
 * @typedef {TranslatedTubeFieldList[number]} TranslatedTubeField
 */

/**
 * @param {{
 *   challenge?: Parameters<typeof buildChallengeDatasourceObject>[0]
 *   localizedChallenge?: Omit<Parameters<typeof buildLocalizedChallenge>[0], 'id' | 'challengeId'>
 *   challengeTranslations?: Partial<Record<TranslatedChallengeField, string>>
 *   skill?: Omit<Parameters<typeof buildSkillDatasourceObject>[0], 'id'>
 *   framework?: Parameters<typeof buildFramework>[0]
 *   tube?: Parameters<typeof buildTube>[0] & Partial<Record<TranslatedTubeField, number>>
 * }} groupToBuild
 */
export function buildChallengeInGroup({ challenge, localizedChallenge, challengeTranslations, skill, framework, tube }) {
  const randomId = idGenerator.next().value;

  const challengeDTO = buildChallengeDatasourceObject({
    id: `challenge${randomId}`,
    competenceId: `competence${randomId}`,
    skillId: `skill${randomId}`,
    ...challenge,
  });

  const localizedChallengeDTO = {
    id: challengeDTO.id,
    challengeId: challengeDTO.id,
    locale: 'fr',
    embedUrl: challengeDTO.embedUrl,
    geography: challengeDTO.geography,
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

  const skillDTO = buildSkillDatasourceObject({
    tubeId: `tube${randomId}`,
    createdAt: challengeDTO.createdAt,
    ...skill,
    id: challengeDTO.skillId,
  });

  const tubeDTO = { id: skillDTO.tubeId, name: '@tube', thematicId: `thematic${randomId}`, ...tube };

  const thematicDTO = { id: tubeDTO.thematicId, competenceId: challengeDTO.competenceId };

  const competenceDTO = { id: thematicDTO.competenceId, index: '1.1', areaId: `area${randomId}` };

  const areaDTO = { id: competenceDTO.areaId, code: '1', frameworkId: framework?.id ?? `framework${randomId}` };

  const frameworkDTO = { id: areaDTO.frameworkId, name: 'Pix', ...framework };

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
  const challengeTranslationDTOs = Object.keys(challengeTranslationsValues).map((key) => ({
    key: `challenge.${challengeDTO.id}.${key}`,
    locale: localizedChallengeDTO.locale,
    value: challengeTranslationsValues[key],
  }));

  const skillTranslationValues = { hint: 'il faut bien répondre à la question sinon tu auras faux' };
  const skillTranslationDTOs = Object.keys(skillTranslationValues).map((key) => ({
    key: `skill.${skillDTO.id}.${key}`,
    locale: 'fr',
    value: skillTranslationValues[key],
  }));

  const tubeTranslationValues = {
    practicalTitle: tube?.practicalTitle ?? 'Tube pratique',
    practicalDescription: tube?.practicalDescription ?? 'Le tube de l\'été',
  };
  const tubeTranslationDTOs = Object.keys(tubeTranslationValues).map((key) => ({
    key: `tube.${tubeDTO.id}.${key}`,
    locale: 'fr',
    value: tubeTranslationValues[key],
  }));

  const thematicTranslationValues = { name: 'Tema la thématique' };
  const thematicTranslationDTOs = Object.keys(thematicTranslationValues).map((key) => ({
    key: `thematic.${thematicDTO.id}.${key}`,
    locale: 'fr',
    value: thematicTranslationValues[key],
  }));

  const competenceTranslationValues = { name: 'La pêche', description: 'Comment attraper des poissons et les relacher OU les manger' };
  const competenceTranslationDTOs = Object.keys(competenceTranslationValues).map((key) => ({
    key: `competence.${competenceDTO.id}.${key}`,
    locale: 'fr',
    value: competenceTranslationValues[key],
  }));

  const areaTranslationValues = { title: 'Domaine domaniale' };
  const areaTranslationDTOs = Object.keys(areaTranslationValues).map((key) => ({
    key: `area.${areaDTO.id}.${key}`,
    locale: 'fr',
    value: areaTranslationValues[key],
  }));

  return {
    framework: buildFramework(frameworkDTO),
    area: buildArea(areaDTO),
    competence: buildCompetence(competenceDTO),
    thematic: buildThematic(thematicDTO),
    tube: buildTube(tubeDTO),
    skill: buildSkill({ ...skillDTO, tutorialIds: skill?.tutorialIds ?? [], learningMoreTutorialIds: skill?.learningMoreTutorialIds ?? [] }),
    challenge: buildChallenge(challengeDTO),
    localizedChallenge: buildLocalizedChallenge(localizedChallengeDTO),
    translations: [
      ...challengeTranslationDTOs,
      ...skillTranslationDTOs,
      ...tubeTranslationDTOs,
      ...thematicTranslationDTOs,
      ...competenceTranslationDTOs,
      ...areaTranslationDTOs,
    ].map(buildTranslation),
  };
}

const idGenerator = (function* () {
  let i = 1;
  while (true) {
    yield i.toString().padStart(5, '0');
    i++;
  }
})();
