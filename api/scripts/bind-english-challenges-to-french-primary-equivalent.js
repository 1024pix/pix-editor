import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';

import {
  attachmentRepository,
  challengeRepository,
  competenceRepository,
  frameworkRepository,
  localizedChallengeRepository,
  skillRepository,
  translationRepository,
} from '../lib/infrastructure/repositories/index.js';
import { Challenge, LocalizedChallenge } from '../lib/domain/models/index.js';
import { extractFromChallenge } from '../lib/infrastructure/translations/challenge.js';
import { knex } from '../db/knex-database-connection.js';

export class BindEnglishChallengesToFrenchPrimaryEquivalent extends Script {
  constructor() {
    super({
      description: 'Script de transformation des épreuves anglaises sous forme de décli en épreuves traduites rattachées à leur équivalent primary français',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not persist any deletion made during the script.',
          demandOption: true,
          default: true,
        },
        frameworkName: {
          type: 'string',
          describe: 'Framework name (not ID)',
          demandOption: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun }, 'Script bindEnglishChallengesToFrenchPrimaryEquivalent has started');

    let processedEnglishChallengesCount = 0;
    let skippedSkillsCount = 0;
    let ignoredSkillsCount = 0;

    // lister les acquis actifs par nom de référentiel
    const activeSkills = await listActiveSkillsByFrameworkName(options.frameworkName);

    // pour chaque acquis, lister les challenges anglais legacy validés ou proposés
    for (const activeSkill of activeSkills) {
      const legacyEnglishChallenges = await listLegacyEnglishChallengesBySkillId(activeSkill.id);
      if (legacyEnglishChallenges.length === 0) {
        logger.info(`Ignored skill ${activeSkill.name} - ${activeSkill.id}`);
        ignoredSkillsCount++;
        continue;
      }
      await knex.transaction(async (transaction) => {
        logger.info(`Now processing ${activeSkill.name} - ${activeSkill.id}`);

        // compteurs
        let clonedTranslationsCount = 0;
        let clonedAttachmentsCount = 0;

        // pour chaque acquis, lister les challenges français validés.
        const skillChallenges = await challengeRepository.listBySkillId(activeSkill.id);
        const activeFrenchChallenges = skillChallenges.filter(byActiveFrenchChallenges);

        // On vérifie qu'il y a suffisamment de challenges français validés pour le nbre de challenges anglais.
        if (legacyEnglishChallenges.length > activeFrenchChallenges.length) {
          logger.error({
            skillId: activeSkill.id,
            activeFrenchChallengeIds: activeFrenchChallenges.map(({ id }) => id),
            legacyEnglishChallengeIds: legacyEnglishChallenges.map(({ id }) => id),
          }, 'Not enough active french challenges without english localized for each english challenge');
          skippedSkillsCount++;
          return;
        }

        // On veut dupliquer les localized anglais et changer le challengeId pour que celui-ci corresponde au challenge ayant un primary français et id += id-en
        for (const legacyEnglishChallenge of legacyEnglishChallenges) {
          const frenchChallenge = activeFrenchChallenges.pop();
          const [localizedToClone] = legacyEnglishChallenge.localizedChallenges;
          const localizedAttachments = await attachmentRepository.listByLocalizedChallengeId(localizedToClone.id);

          // on clone le legacy localized et ses attachments
          // on met les bons ids
          // si challenge anglais === rpoposé ? localized.status = 'pause', si challenge anglais === validé ? localized.status = 'play'
          const { clonedAttachments, clonedLocalizedChallenge } = localizedToClone.clone({
            id: `${localizedToClone.id}-EN`,
            challengeId: frenchChallenge.id,
            status: legacyEnglishChallenge.status === Challenge.STATUSES.VALIDE ? LocalizedChallenge.STATUSES.PLAY : LocalizedChallenge.STATUSES.PAUSE,
            attachments: localizedAttachments,
            validatedAt: localizedToClone.validatedAt,
          });
          clonedAttachmentsCount += clonedAttachments.length;
          logger.info({
            skillId: activeSkill.id,
            clonedEnglishLocalizedId: clonedLocalizedChallenge.id,
            frenchChallengeId: frenchChallenge.id,
          }, 'Binding cloned english localized challenge to french challenge');

          // on clone les clés de trads
          const translations = extractFromChallenge(legacyEnglishChallenge);
          for (const translation of translations) {
            translation.key = translation.key.replace(legacyEnglishChallenge.id, frenchChallenge.id);
            clonedTranslationsCount++;
          }

          // On périme le challenge anglais
          legacyEnglishChallenge.obsolete();

          // on persiste tout
          await localizedChallengeRepository.create({ localizedChallenges: [clonedLocalizedChallenge], transaction });
          await attachmentRepository.createBatch(clonedAttachments, transaction);
          await translationRepository.save({ translations, transaction });
          await challengeRepository.update(legacyEnglishChallenge, transaction);
        }

        logger.info({
          skillId: activeSkill.id,
          obsoletedEnglishChallengesCount: legacyEnglishChallenges.length,
          clonedTranslationsCount,
          clonedAttachmentsCount,
        }, `Finished processing skill ${activeSkill.name}`);

        processedEnglishChallengesCount += legacyEnglishChallenges.length;

        if (options.dryRun) {
          logger.info('Dry run is enabled, not persisting changes');
          await transaction.rollback();
        } else {
          await transaction.commit();
        }
      }).catch((error) => {
        logger.error({
          skillId: activeSkill.id,
          err: error,
        }, `Error in transaction while processing skill ${activeSkill.name}`);
        skippedSkillsCount++;
      });
    }

    logger.info({
      processedEnglishChallengesCount,
      ignoredSkillsCount,
      skippedSkillsCount,
    }, 'DONE');
  }
}

export async function listActiveSkillsByFrameworkName(frameworkName) {
  const frameworks = await frameworkRepository.list();
  if (!frameworks.find(({ name }) => name === frameworkName)) throw new Error('framework with this given name does not exist');

  const activeSkills = [];

  const competences = await competenceRepository._selectCompetences().where('frameworks.name', '=', frameworkName);
  for (const competence of competences) {
    const competenceActiveSkills = await skillRepository.listActiveByCompetenceId(competence.id);
    activeSkills.push(...competenceActiveSkills);
  }

  return activeSkills;
}

export async function listLegacyEnglishChallengesBySkillId(skillId) {
  const challenges = await challengeRepository.listBySkillId(skillId);
  const decliChallenges = challenges.filter((challenge) => challenge.genealogy !== Challenge.GENEALOGIES.PROTOTYPE);
  const validatedAndProposedChallenges = decliChallenges.filter((decli) => decli.status === Challenge.STATUSES.VALIDE || decli.status === Challenge.STATUSES.PROPOSE);
  return validatedAndProposedChallenges.filter((decliChallenge) => decliChallenge.locale === 'en');
}

export function byActiveFrenchChallenges(challenge) {
  return challenge.status === Challenge.STATUSES.VALIDE && challenge.locale === 'fr' && !challenge.localizedChallenges.map((localized) => localized.locale).includes('en');
}

await ScriptRunner.execute(import.meta.url, BindEnglishChallengesToFrenchPrimaryEquivalent);
