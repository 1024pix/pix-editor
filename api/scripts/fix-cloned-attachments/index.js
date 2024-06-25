import { fileURLToPath } from 'node:url';
import { disconnect, knex } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';
import {
  attachmentRepository,
  challengeRepository,
  skillRepository,
} from '../../lib/infrastructure/repositories/index.js';
import { generateNewId } from '../../lib/infrastructure/utils/id-generator.js';
import { Challenge, Skill } from '../../lib/domain/models/index.js';
import _ from 'lodash';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function fix({ dryRun, scriptExectIdToFix, scriptExectId }) {
  const originSkillIds = await _getOriginSkillIds(scriptExectIdToFix);
  const cloneSkillIds = await _getCloneSkillIds(scriptExectIdToFix);
  const skills = await skillRepository.list();
  const originSkills = skills.filter((skill) => originSkillIds.includes(skill.id) && skill.status === Skill.STATUSES.ARCHIVE);
  const cloneSkills = skills.filter((skill) => cloneSkillIds.includes(skill.id));

  logger.info(`${originSkills.length} skills to fix...`);
  for (const originSkill of originSkills) {
    const correspondingCloneSkill = cloneSkills.find((cloneSkill) => cloneSkill.name === originSkill.name);
    if (!correspondingCloneSkill) {
      await _logInHistoricAndPrint({ persistantId: originSkill.id, errorStr: 'clone non trouvé', details: `RAS Erreur lors du rematching acquis origine/cloné. Nom de l'acquis ${originSkill.name}.` }, dryRun, scriptExectId);
      throw new Error('clone non trouvé');
    }
    const skillChallenges = await challengeRepository.listBySkillId(originSkill.id);

    const challengesToClone = await _getChallengesToClone({ skillChallenges, originSkillId: originSkill.id, scriptExectIdToFix });
    if (challengesToClone.length === 0) {
      logger.info(`Acquis ${originSkill.id} n'a pas d'épreuve à cloner, rien à corriger...`);
      continue;
    }

    const clonedChallenges = await _fixFor({ originSkill, cloneSkill: correspondingCloneSkill, skillChallenges: challengesToClone, dryRun, scriptExectId });
    await _addToPhraseToFocus({ challenges: clonedChallenges, scriptExectId });
    await _logInHistoricAndPrint({ persistantId: originSkill.id, errorStr: '', details: 'OK' }, dryRun, scriptExectId);
  }

  await _obsoleteChallenges({ cloneSkills, challengeRepository, dryRun, scriptExectIdToFix });
  logger.info('Done');
}

async function _getOriginSkillIds(scriptExectIdToFix) {
  return _.uniq(await knex('historic_focus')
    .pluck('persistantId')
    .where({ scriptExectId: scriptExectIdToFix }));
}

async function _getCloneSkillIds(scriptExectIdToFix) {
  return _.uniq(await knex('focus_phrase')
    .pluck('persistantId')
    .where({ type: 'skill', scriptExectId: scriptExectIdToFix }));
}

async function _getCloneChallengeIds(scriptExectIdToFix) {
  return _.uniq(await knex('focus_phrase')
    .pluck('persistantId')
    .where({ type: 'challenge', scriptExectId: scriptExectIdToFix }));
}

async function _obsoleteChallenges({ cloneSkills, scriptExectIdToFix, challengeRepository, dryRun }) {
  const challengeIds = await _getCloneChallengeIds(scriptExectIdToFix);
  const challenges = await challengeRepository.getMany(challengeIds);
  challenges.forEach((challenge) => challenge.obsolete());
  const allSkillIds = _.uniq(challenges.map((chal) => chal.skillId));
  const filteredClonedSkills = cloneSkills.filter((skill) => allSkillIds.includes(skill.id));
  if (!dryRun) {
    try {
      await challengeRepository.updateBatch(challenges);
    } catch (err) {
      await _logInHistoricAndPrint({
        persistantId: challenges.map((chal) => chal.id).join(','),
        errorStr: JSON.stringify(err),
        details: `Erreur lors de la péremption des épreuves. A priori les clones sont sains. On peut envisager de périmer les épreuves nous-mêmes (mettre date + status ou via PixEditor).
          Acquis concernés : ${filteredClonedSkills.map((skill) => skill.name).join(', ')}.`
      }, dryRun);
      throw err;
    }
  }
}
async function _getChallengesToClone({ skillChallenges, originSkillId, scriptExectIdToFix }) {
  const { createdAt } = await knex('historic_focus').select('createdAt').where({
    persistantId: originSkillId,
    scriptExectId: scriptExectIdToFix
  }).orderBy('createdAt', 'DESC').first();

  const bottomDate = createdAt.getTime() - (10 * 60 * 1000);
  const topDate = createdAt.getTime() + (10 * 60 * 1000);

  const protoToClone = skillChallenges.find((challenge) => {
    const archiveDate = new Date(challenge.archivedAt);
    return challenge.genealogy === 'Prototype 1' && challenge.isArchive &&
      (archiveDate.getTime() > bottomDate && archiveDate.getTime() < topDate);
  });

  if (!protoToClone?.files?.length > 0) {
    return [];
  }
  const declinaisonsToClone = skillChallenges
    .filter((challenge) => {
      return challenge.version === protoToClone.version && challenge.genealogy === 'Décliné 1' && (challenge.isPerime || challenge.isArchive);
    })
    .filter((challenge) => {
      if (challenge.isPerime) {
        const obsoleteDate = new Date(challenge.madeObsoleteAt);
        return obsoleteDate.getTime() > bottomDate && obsoleteDate.getTime() < topDate;
      }
      const archiveDate = new Date(challenge.archivedAt);
      return archiveDate.getTime() > bottomDate && archiveDate.getTime() < topDate;
    });
  return [protoToClone, ...declinaisonsToClone];
}

async function _fixFor({ originSkill, cloneSkill, skillChallenges, dryRun, scriptExectId }) {
  const clonedAttachments = [];
  const clonedChallenges = [];
  try {
    const localizedChallengeIds = skillChallenges.flatMap((ch) => ch.localizedChallenges.map((loc) => loc.id));
    const attachments = await attachmentRepository.listByLocalizedChallengeIds(localizedChallengeIds);
    for (const challenge of skillChallenges) {
      const res = challenge.cloneChallengeAndAttachments({
        competenceId: originSkill.competenceId,
        skillId: cloneSkill.id,
        generateNewIdFnc: generateNewId,
        alternativeVersion: challenge.alternativeVersion,
        prototypeVersion: 2, // todo change me if you réexcute me again get the real prototype number im too tired
        attachments,
      });
      clonedChallenges.push(res.clonedChallenge);
      clonedAttachments.push(...res.clonedAttachments);
    }

    for (const clonedChallenge of clonedChallenges) {
      clonedChallenge.focusable = true;

      const sourceChallenge = Challenge.getCloneSource(clonedChallenge);
      clonedChallenge.status = sourceChallenge.isArchive ? Challenge.STATUSES.VALIDE : Challenge.STATUSES.PROPOSE;

      for (const clonedLocalizedChallenge of clonedChallenge.localizedChallenges) {
        const sourceLocalizedChallenge = Challenge.getCloneSource(clonedLocalizedChallenge);
        clonedLocalizedChallenge.status = sourceLocalizedChallenge.status;
      }
    }
  } catch (err) {
    await _logInHistoricAndPrint({ persistantId: originSkill.id, errorStr: JSON.stringify(err), details: `RAS Erreur lors d'une lecture sur Airtable. Rien à nettoyer. ID Clone : ${cloneSkill.id}` }, dryRun, scriptExectId);
    throw err;
  }

  if (!dryRun) {
    try {
      await challengeRepository.createBatch(clonedChallenges);
    } catch (err) {
      await _logInHistoricAndPrint({
        persistantId: originSkill.id,
        errorStr: JSON.stringify(err),
        details: `Erreur lors de la création en masse des épreuves clonées. Potentielles données à nettoyer (liste dans l'ordre de création):
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
        persistantId: originSkill.id,
        errorStr: JSON.stringify(err),
        details: `Erreur lors de la création en masse des attachments clonés. Potentielles données à nettoyer (liste dans l'ordre de création):
          challenges ${clonedChallenges.map((chal) => chal.id).join(', ')} sur Airtable,
          translations avec les patterns ${clonedChallenges.map((chal) => `"challenge.${chal.id}%"`).join(', ')} sur PG,
          localizedChallenges dont les challengeIds sont ${clonedChallenges.map((chal) => chal.id).join(', ')} sur PG,
          attachments dont les challengeIds persistant sont ${clonedChallenges.map((chal) => chal.id).join(', ')} sur Airtable,
          localized_challenges-attachments dont les localizedChallengeIds sont ${clonedChallenges.flatMap((chal) => chal.localizedChallenges.map((loc) => loc.id)).join(', ')} sur PG`,
      }, dryRun, scriptExectId);
      throw err;
    }
  }
  logger.info(`Skill ${originSkill.id} moved to focus with fixed attachments along with ${clonedChallenges.length} challenges and ${clonedAttachments.length} attachments !`);
  return clonedChallenges;
}

async function _logInHistoricAndPrint(historicLine, dryRun, scriptExectId) {
  await knex('historic_focus').insert({ ...historicLine, dryRun, scriptExectId });
  if (historicLine.details !== 'OK') logger.error(JSON.stringify(historicLine));
}

async function _addToPhraseToFocus({ challenges, scriptExectId }) {
  await knex('focus_phrase').insert(challenges.map((challenge) => ({
    type: 'challenge',
    persistantId: challenge.id,
    originPersistantId: Challenge.getCloneSource(challenge).id,
    scriptExectId,
  })));
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const dryRun = process.env.DRY_RUN !== 'false';
    const scriptExectIdToFix = process.env.SCRIPT_ID;

    if (dryRun) logger.warn('Dry run: no actual modification will be performed, use DRY_RUN=false to disable');

    const scriptExectId = `${Date.now()}`;
    await fix({ dryRun, scriptExectIdToFix, scriptExectId });
    logger.info('All done');
  } catch (e) {
    logger.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();

