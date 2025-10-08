import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { challengeRepository } from '../lib/infrastructure/repositories/index.js';
import { Challenge } from '../lib/domain/models/index.js';

export class ScanChallengesForDiscrepanciesBetweenPrototypesAndAlternatives extends Script {
  constructor() {
    super({
      description: 'Script pour détecter les différences dans les champs communs entre le prototype et les déclinaisons d\'une même version',
      permanent: false,
      options: {},
    });
  }

  async handle({ options: _, logger }) {
    logger.info('Script ScanChallengesForDiscrepanciesBetweenPrototypesAndAlternatives has started');
    const allChallenges = await challengeRepository.list();
    const { prototypes, alternatives } = partitionPrototypesAndAlternatives(allChallenges);

    for (const prototype of prototypes) {
      const belongsToCurrentPrototype = (alt) => belongsToPrototype(prototype, alt);
      const alternativesForProto = alternatives.filter(belongsToCurrentPrototype);
      const indexes = alternativesForProto.map((alt) => alternatives.indexOf(alt)).sort(desc);
      indexes.forEach((index) => alternatives.splice(index, 1));
      for (const alternative of alternativesForProto) {
        for (const commonField of Challenge.PROTO_FIELDS) {
          if (commonField === 'contextualizedFields') {
            if (JSON.stringify(alternative[commonField]?.sort() ?? '') !== JSON.stringify(prototype[commonField]?.sort() ?? '')) {
              logger.error(`Proto: ${prototype.id} | Alternative: ${alternative.id} : different value for field "${commonField}"`);
            }
          } else {
            if (alternative[commonField] !== prototype[commonField]) {
              logger.error(`Proto: ${prototype.id} | Alternative: ${alternative.id} : different value for field "${commonField}"`);
            }
          }
        }
      }
    }
    for (const orphanAlternative of alternatives) {
      logger.error(`Alternative: ${orphanAlternative.id} - cannot found related prototype`);
    }
  }
}

function partitionPrototypesAndAlternatives(challenges) {
  return {
    prototypes: challenges.filter((challenge) => challenge.isPrototype),
    alternatives: challenges.filter((challenge) => !challenge.isPrototype),
  };
}

function belongsToPrototype(prototype, alternative) {
  return alternative.skillId === prototype.skillId && alternative.version === prototype.version;
}

function desc(a, b) {
  return b - a;
}

await ScriptRunner.execute(import.meta.url, ScanChallengesForDiscrepanciesBetweenPrototypesAndAlternatives);
