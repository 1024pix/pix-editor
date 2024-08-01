import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import { disconnect, knex } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';
import {
  attachmentRepository,
  challengeRepository,
  skillRepository,
} from '../../lib/infrastructure/repositories/index.js';
import { generateNewId } from '../../lib/infrastructure/utils/id-generator.js';
import { Challenge, Skill } from '../../lib/domain/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;
export async function moveToFocus({ airtableClient, dryRun, scriptExectId }) {
  const skillsToFocus = await _getSkillsToFocus({ airtableClient });
  const enConstructionSkills = skillsToFocus.filter((skill) => skill.isEnConstruction);
  await _moveEnConstructionSkillsToFocus({ enConstructionSkills, dryRun });

  const actifSkills = skillsToFocus.filter((skill) => skill.isActif);
  logger.info(`${actifSkills.length} actif skills to move to focus...`);
  for (const actifSkill of actifSkills) {
    try {
      await _moveActifSkillToFocus({ actifSkill, dryRun, scriptExectId });
    } catch (err) {
      logger.error(`Une erreur s'est produite pendant le passage en focus de l'acquis ${actifSkill.id}. On quitte...`);
      throw err;
    }
  }

  logger.info('Done');
}

async function _logInHistoricAndPrint(historicLine, dryRun, scriptExectId) {
  await knex('historic_focus').insert({ ...historicLine, dryRun, scriptExectId });
  if (historicLine.details !== 'OK') logger.error(JSON.stringify(historicLine));
}

async function _addToPhraseToFocus({ originSkillId, skillId, challenges, scriptExectId }) {
  await knex('focus_phrase').insert({
    type: 'skill',
    persistantId: skillId,
    originPersistantId: originSkillId,
    scriptExectId,
  });

  if (challenges.length > 0) {
    await knex('focus_phrase').insert(challenges.map((challenge) => ({
      type: 'challenge',
      persistantId: challenge.id,
      originPersistantId: Challenge.getCloneSource(challenge).id,
      scriptExectId,
    })));
  }
}

async function _getSkillsToFocus({ airtableClient }) {
  const airtableSkills = await airtableClient
    .table('Acquis')
    .select({
      fields: [
        'id persistant',
      ],
      filterByFormula: 'AND(({Spoil_focus} = "focusable"), ({Origine} = "Pix"))',
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

async function _moveActifSkillToFocus({ actifSkill, dryRun, scriptExectId }) {
  let skillChallenges;
  try {
    skillChallenges = await challengeRepository.listBySkillId(actifSkill.id);
  } catch (err) {
    await _logInHistoricAndPrint({ persistantId: actifSkill.id, errorStr: JSON.stringify(err), details: 'RAS Erreur lors d\'une lecture sur Airtable. Rien à nettoyer.' }, dryRun, scriptExectId);
    throw err;
  }
  const { clonedSkill, clonedChallenges } = await _cloneSkillAndChallengesAndAttachments({ skill: actifSkill, skillChallenges, dryRun, scriptExectId });
  if (!dryRun) {
    await _addToPhraseToFocus({ originSkillId: actifSkill.id, skillId: clonedSkill.id, challenges: clonedChallenges, scriptExectId });
  }

  await _archiveOldSkill({ skill: actifSkill, skillChallenges, dryRun, scriptExectId });

  await _logInHistoricAndPrint({ persistantId: actifSkill.id, errorStr: '', details: 'OK' }, dryRun, scriptExectId);
}

async function _cloneSkillAndChallengesAndAttachments({ skill, skillChallenges, dryRun, scriptExectId }) {
  let clonedAttachments, clonedChallenges, clonedSkill;
  try {
    const tubeSkills = await skillRepository.listByTubeId(skill.tubeId);

    // Exploitation du duck typing pour tricher
    // tubeDestination : besoin de name, competenceId et id
    const tubeDestination = {
      name: skill.name.substring(0, skill.name.length - 1),
      competenceId: skill.competenceId,
      id: skill.tubeId,
    };

    // Pré-filtrage des épreuves pour ne conserver que les proto validées et les déclinaisons validées/proposées
    const preFilteredSkillChallenges = skillChallenges.filter((challenge) =>
      (challenge.genealogy === Challenge.GENEALOGIES.PROTOTYPE && challenge.isValide)
      || (challenge.genealogy === Challenge.GENEALOGIES.DECLINAISON && (challenge.isValide || challenge.isPropose))
    );

    const localizedChallengeIds = preFilteredSkillChallenges.flatMap((ch) => ch.localizedChallenges.map((loc) => loc.id));
    const attachments = await attachmentRepository.listByLocalizedChallengeIds(localizedChallengeIds);

    const res = skill.cloneSkillAndChallenges({
      tubeDestination,
      level: skill.level,
      skillChallenges: preFilteredSkillChallenges,
      tubeSkills,
      attachments,
      generateNewIdFnc: generateNewId,
    });
    clonedSkill = res.clonedSkill;
    clonedChallenges = res.clonedChallenges;
    clonedAttachments = res.clonedAttachments;

    clonedSkill.status = Skill.STATUSES.ACTIF;

    // On passe l'épreuve en focus
    for (const clonedChallenge of clonedChallenges) {
      clonedChallenge.focusable = true;

      const sourceChallenge = Challenge.getCloneSource(clonedChallenge);
      clonedChallenge.status = sourceChallenge.status;

      for (const clonedLocalizedChallenge of clonedChallenge.localizedChallenges) {
        const sourceLocalizedChallenge = Challenge.getCloneSource(clonedLocalizedChallenge);
        clonedLocalizedChallenge.status = sourceLocalizedChallenge.status;
      }
    }
  } catch (err) {
    await _logInHistoricAndPrint({ persistantId: skill.id, errorStr: JSON.stringify(err), details: 'RAS Erreur lors d\'une lecture sur Airtable. Rien à nettoyer.' }, dryRun, scriptExectId);
    throw err;
  }

  if (!dryRun) {
    try {
      await skillRepository.create(clonedSkill);
    } catch (err) {
      await _logInHistoricAndPrint({
        persistantId: skill.id,
        errorStr: JSON.stringify(err),
        details: `Erreur lors de la création de l'acquis cloné. Potentielles données à nettoyer (liste dans l'ordre de création):
          acquis ${clonedSkill.id} sur Airtable,
          translations avec le pattern "skill.${clonedSkill.id}%" sur PG`,
      }, dryRun, scriptExectId);
      throw err;
    }
    try {
      clonedChallenges.forEach((clonedChallenge) => {
        logger.info({
          clonedChallengeId: clonedChallenge.id,
          sourceChallengeId: Challenge.getCloneSource(clonedChallenge).id,
        }, 'Correspondance entre les challenges clonés et leur source');
      });
      await challengeRepository.createBatch(clonedChallenges);
    } catch (err) {
      await _logInHistoricAndPrint({
        persistantId: skill.id,
        errorStr: JSON.stringify(err),
        details: `Erreur lors de la création en masse des épreuves clonées. Potentielles données à nettoyer (liste dans l'ordre de création):
          acquis ${clonedSkill.id} sur Airtable,
          translations avec le pattern "skill.${clonedSkill.id}%" sur PG',
          challenges ${clonedChallenges.map((chal) => chal.id).join(', ')} sur Airtable,
          translations avec les patterns ${clonedChallenges.map((chal) => `"challenge.${chal.id}%"`).join(', ')} sur PG,
          localizedChallenges dont les challengeIds sont ${clonedChallenges.map((chal) => chal.id).join(', ')} sur PG`,
      }, dryRun, scriptExectId);
      throw err;
    }
    try {
      await attachmentRepository.createBatch(clonedAttachments);
    } catch (err) {
      await _logInHistoricAndPrint({
        persistantId: skill.id,
        errorStr: JSON.stringify(err),
        details: `Erreur lors de la création en masse des attachments clonés. Potentielles données à nettoyer (liste dans l'ordre de création):
          acquis ${clonedSkill.id} sur Airtable,
          translations avec le pattern "skill.${clonedSkill.id}%" sur PG',
          challenges ${clonedChallenges.map((chal) => chal.id).join(', ')} sur Airtable,
          translations avec les patterns ${clonedChallenges.map((chal) => `"challenge.${chal.id}%"`).join(', ')} sur PG,
          localizedChallenges dont les challengeIds sont ${clonedChallenges.map((chal) => chal.id).join(', ')} sur PG,
          pièces jointes et illustrations clonées sur le bucket. Filtrer par date de création pour les trouver.
          A ce stade il est possible qu'un attachment ait été physiquement cloné sans que son modèle Airtable n'ait été enregistré.
          Chercher pour les documents dont le nom est parmi : ${clonedAttachments.map((att) => att.url.split('/').pop()).join(', ')},
          attachments dont les challengeIds persistant sont ${clonedChallenges.map((chal) => chal.id).join(', ')} sur Airtable,
          localized_challenges-attachments dont les localizedChallengeIds sont ${clonedChallenges.flatMap((chal) => chal.localizedChallenges.map((loc) => loc.id)).join(', ')} sur PG.
          `,
      }, dryRun, scriptExectId);
      throw err;
    }
  }
  logger.info(`Skill ${skill.id} moved to focus along with ${clonedChallenges.length} challenges and ${clonedAttachments.length} attachments !`);
  return { clonedSkill, clonedChallenges };
}

async function _archiveOldSkill({ skill, skillChallenges, dryRun, scriptExectId }) {
  skill.archiveSkillAndChallenges({ skillChallenges });
  if (!dryRun) {
    try {
      await skillRepository.update(skill);
    } catch (err) {
      await _logInHistoricAndPrint({
        persistantId: skill.id,
        errorStr: JSON.stringify(err),
        details: 'Erreur lors de l\'archivage de l\'acquis. A priori les clones sont sains. On peut envisager d\'archiver l\'acquis à la main sur Airtable et ses épreuves (status + dates le cas échéant)',
      }, dryRun, scriptExectId);
      throw err;
    }
    try {
      await challengeRepository.updateBatch(skillChallenges);
    } catch (err) {
      await _logInHistoricAndPrint({
        persistantId: skill.id,
        errorStr: JSON.stringify(err),
        details: 'Erreur lors de l\'archivage en masse des épreuves. A priori les clones sont sains. On peut envisager de finir l\'archivage des épreuves à la main sur Airtable',
      }, dryRun, scriptExectId);
      throw err;
    }
  }
  logger.info(`Skill ${skill.id} archived along with its ${skillChallenges.length} challenges !`);
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);
    const dryRun = process.env.DRY_RUN !== 'false';

    if (dryRun) logger.warn('Dry run: no actual modification will be performed, use DRY_RUN=false to disable');

    const scriptExectId = `${Date.now()}`;
    await moveToFocus({ airtableClient, dryRun, scriptExectId });
    logger.info('All done');
  } catch (e) {
    logger.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();

