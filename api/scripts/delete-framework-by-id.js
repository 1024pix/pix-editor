import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { frameworkRepository } from '../lib/infrastructure/repositories/index.js';
import {
  areaRepository,
  competenceRepository,
  thematicRepository,
  tubeRepository,
  skillRepository,
  challengeRepository,
  localizedChallengeRepository,
} from '../lib/infrastructure/repositories/index.js';
import { DomainTransaction } from '../lib/domain/DomainTransaction.js';

export class DeleteFrameworkByIdScript extends Script {
  constructor() {
    super({
      description: 'Script de suppression d\'un référentiel par son id',
      permanent: true,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not perform any update.',
          demandOption: true,
          default: true,
        },
        frameworkId: {
          type: 'string',
          describe: 'Id du framework à supprimer',
          demandOption: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    logger.info({ dryRun: options.dryRun, frameworkId: options.frameworkId }, 'Script options');

    const frameworks = await frameworkRepository.list();
    const framework = frameworks.find((framework) => framework.id === options.frameworkId);
    if (!framework) {
      return logger.error(`Framework with id '${options.frameworkId}' does not exist.`);
    }

    const knex = DomainTransaction.getConnection();

    const areaIds = (await areaRepository.listByFrameworkId(options.frameworkId))
      .map((area) => area.id);
    const competenceIds = (await competenceRepository.list())
      .filter((competence) => areaIds.includes(competence.areaId))
      .map((competence) => competence.id);
    const thematicIds = (await thematicRepository.list())
      .filter((thematic) => competenceIds.includes(thematic.competenceId))
      .map((thematic) => thematic.id);
    const tubeIds = (await tubeRepository.list())
      .filter((tube) => thematicIds.includes(tube.thematicId))
      .map((tube) => tube.id);
    const skillIds = (await skillRepository.list())
      .filter((skill) => tubeIds.includes(skill.tubeId))
      .map((skill) => skill.id);
    const challengeIds = (await challengeRepository.list())
      .filter((challenge) => skillIds.includes(challenge.skillId))
      .map((challenge) => challenge.id);
    const localizedChallengeIds = (await localizedChallengeRepository.listByChallengeIds({ challengeIds }))
      .map((localizedChallenge) => localizedChallenge.id);

    const entityIds = [
      ...areaIds,
      ...competenceIds,
      ...thematicIds,
      ...tubeIds,
      ...skillIds,
      ...challengeIds,
      ...localizedChallengeIds,
    ];

    await knex('translations').whereIn('entityId', entityIds).del();
    await knex('frameworks').where('id', options.frameworkId).del();

    return options.frameworkId;
  }
}

await ScriptRunner.execute(import.meta.url, DeleteFrameworkByIdScript);
