import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import { disconnect } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';
import {
  attachmentRepository,
  challengeRepository,
  skillRepository
} from '../../lib/infrastructure/repositories/index.js';
import { generateNewId } from '../../lib/infrastructure/utils/id-generator.js';
import { Skill } from '../../lib/domain/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function moveToFocus({ airtableClient, dryRun }) {
  const skillsToFocus = await _getSkillsToFocus({ airtableClient });
  const enConstructionSkills = skillsToFocus.filter((skill) => skill.isEnConstruction);
  const actifSkills = skillsToFocus.filter((skill) => skill.isActif);

  await _moveEnConstructionSkillsToFocus({ enConstructionSkills, dryRun });
  await _moveActifSkillsToFocus({ actifSkills, dryRun });
}

async function _getSkillsToFocus({ airtableClient }) {
  const airtableSkills = await airtableClient
    .table('Acquis')
    .select({
      fields: [
        'id persistant',
      ],
      filterByFormula: '"en_devenir" = {Spoil_focus}',
    })
    .all();
  const skillIdsToFocus = airtableSkills.map((at) => at.get('id persistant'));
  const allSkills = await skillRepository.list();
  return allSkills.filter((skill) => skillIdsToFocus.includes(skill.id));
}

async function _moveEnConstructionSkillsToFocus({ enConstructionSkills, dryRun }) {
  logger.info(`${enConstructionSkills.length} enConstruction skills to move to focus...`);
  const challengesToPersist = [];
  for (const skill of enConstructionSkills) {
    const challenges = await challengeRepository.listBySkillId(skill.id);
    const proposeChallenges = challenges.filter((challenge) => challenge.isPropose);
    for (const challenge of proposeChallenges) {
      challenge.focusable = true;
      challengesToPersist.push(challenge);
    }
  }
  logger.info(`${challengesToPersist.length} challenges to move to focus from enConstruction skills...`);
  if (!dryRun) {
    for (const challenge of challengesToPersist) {
      await challengeRepository.update(challenge);
    }
  }
  logger.info('Done');
}

async function _moveActifSkillsToFocus({ actifSkills, dryRun }) {
  logger.info(`${actifSkills.length} actif skills to move to focus...`);
  for (const skill of actifSkills) {
    const skillChallenges = await challengeRepository.listBySkillId(skill.id);
    await _cloneSkillAndChallengesAndAttachments({ skill, skillChallenges, dryRun });
    await _archiveOldSkill({ skill, skillChallenges, dryRun });
  }
  return true;
}

async function _cloneSkillAndChallengesAndAttachments({ skill, skillChallenges, dryRun }) {
  const tubeSkills = await skillRepository.listByTubeId(skill.tubeId);
  const challengeIds = skillChallenges.map((ch) => ch.id);
  const attachments = await attachmentRepository.listByChallengeIds(challengeIds);
  // Exploitation du duck typing pour tricher
  // tubeDestination : besoin de name, competenceId et id
  const tubeDestination = {
    name: skill.name.substring(0, skill.name.length - 1),
    competenceId: skill.competenceId,
    id: skill.tubeId,
  };
  // Pré-filtrage des épreuves pour ne conserver que les proto validées et les déclinaisons validées/proposées
  const preFilteredSkillChallenges = skillChallenges.filter((challenge) =>
    (challenge.genealogy === 'Prototype 1' && challenge.isValide)
    || (challenge.genealogy === 'Décliné 1' && (challenge.isValide || challenge.isPropose))
  );
  // Ne me jugez pas, je profite de la fiesta javascript pour "cacher" des données et les récupérer plus tard pour ne pas avoir
  // à altérer la fonction de clonage et pour pouvoir l'utiliser pleinement
  // Quand on clone une épreuve elle passe automatiquement en proposé.
  // Dans notre cas on doit conserver son statut d'avant clonage (validé ou proposé)
  for (const challenge of preFilteredSkillChallenges) {
    challenge.accessibility1 = [challenge.accessibility1, challenge.status];
    for (const localizedChallenge of challenge.localizedChallenges) {
      localizedChallenge.geography = [localizedChallenge.geography, localizedChallenge.status];
    }
  }
  const { clonedSkill, clonedChallenges, clonedAttachments } = skill.cloneSkillAndChallenges({
    tubeDestination,
    level: skill.level,
    skillChallenges: preFilteredSkillChallenges,
    tubeSkills,
    attachments,
    generateNewIdFnc: generateNewId,
  });
  clonedSkill.status = Skill.STATUSES.ACTIF;
  // On passe l'épreuve en focus et, ni vu ni connu, je dépile ma donnée cachée
  // on dit merci JS
  for (const clonedChallenge of clonedChallenges) {
    clonedChallenge.focusable = true;
    clonedChallenge.status = clonedChallenge.accessibility1[1];
    clonedChallenge.accessibility1 = clonedChallenge.accessibility1[0];
    for (const clonedLocalizedChallenge of clonedChallenge.localizedChallenges) {
      clonedLocalizedChallenge.status = clonedLocalizedChallenge.geography[1];
      clonedLocalizedChallenge.geography = clonedLocalizedChallenge.geography[0];
    }
  }
  // et on répare la donnée cachée car je vais persister les épreuves ensuite
  for (const challenge of preFilteredSkillChallenges) {
    challenge.accessibility1 = challenge.accessibility1[0];
    for (const localizedChallenge of challenge.localizedChallenges) {
      localizedChallenge.geography = localizedChallenge.geography[0];
    }
  }
  if (!dryRun) {
    await skillRepository.create(clonedSkill);
    await challengeRepository.createBatch(clonedChallenges);
    await attachmentRepository.createBatch(clonedAttachments);
  }
  logger.info(`Skill ${skill.id} moved to focus along with ${clonedChallenges.length} challenges and ${clonedAttachments.length} attachments !`);
}

async function _archiveOldSkill({ skill, skillChallenges, dryRun }) {
  skill.archiveSkillAndChallenges({ skillChallenges });
  if (!dryRun) {
    await skillRepository.update(skill);
    await challengeRepository.updateBatch(skillChallenges);
  }
  logger.info(`Skill ${skill.id} archived along with its ${skillChallenges.length} challenges !`);
  return 'ok';
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);
    const dryRun = process.env.DRY_RUN !== 'false';

    if (dryRun) logger.warn('Dry run: no actual modification will be performed, use DRY_RUN=false to disable');

    await moveToFocus({ airtableClient, dryRun });
    logger.info('All done');
  } catch (e) {
    logger.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
