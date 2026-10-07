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

    return DomainTransaction.execute(async () => {
      const knex = DomainTransaction.getConnection();

      try {
        const frameworks = await frameworkRepository.list();
        const framework = frameworks.find((framework) => framework.id === options.frameworkId);
        if (!framework) {
          logger.error({ frameworkId: options.frameworkId }, `Framework with id '${options.frameworkId}' does not exist.`);
          return await knex.rollback();
        }

        const areaIds = (await areaRepository.listByFrameworkId(framework.id))
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

        const staticCourseIds = (await knex.select('*').from('static_courses'))
          .map((staticCourse) => ({ ...staticCourse, challengeIds: staticCourse.challengeIds.split(',') }))
          .filter((staticCourse) => staticCourse.challengeIds.some((challengeId) => localizedChallengeIds.includes(challengeId)))
          .map((staticCourse) => staticCourse.id);

        const entityIds = [
          ...areaIds,
          ...competenceIds,
          ...thematicIds,
          ...tubeIds,
          ...skillIds,
          ...challengeIds,
          ...localizedChallengeIds,
          ...staticCourseIds,
        ];

        logger.info(
          {
            frameworkId: framework.id,
            areaIds,
            competenceIds,
            thematicIds,
            tubeIds,
            skillIds,
            challengeIds,
            localizedChallengeIds,
            staticCourseIds,
            deletedEntitiesCount: entityIds.length,
          },
          `About to delete framework '${framework.name}'`,
        );

        const deletedTranslations = await knex('translations').whereIn('entityId', entityIds).del('key');
        logger.info(
          {
            frameworkId: framework.id,
            deletedTranslationsCount: deletedTranslations.length,
          },
          `Deleted translations from framework '${framework.name}'`,
        );

        await knex('static_courses_tags_link').whereIn('staticCourseId', staticCourseIds).del();
        const deletedStaticCourses = await knex('static_courses').whereIn('id', staticCourseIds).del('*');
        logger.info(
          {
            frameworkId: framework.id,
            deletedStaticCoursesCount: deletedStaticCourses.length,
          },
          `Deleted static courses using challenges from framework '${framework.name}'`,
        );

        await knex('frameworks').where('id', framework.id).del();

        if (options.dryRun) {
          logger.info(
            { frameworkId: framework.id },
            `Dry run is enabled, stopping before deleting framework '${framework.name}'`,
          );
          await knex.rollback();
          return;
        }
        await knex.commit();
        logger.info({ frameworkId: framework.id }, `Successfully deleted framework '${framework.name}'`);

        return options.frameworkId;
      } catch (error) {
        logger.error({ error, frameworkId: options.frameworkId }, 'unhandled error found');
        await knex.rollback();
      }
    }, { isolationLevel: 'serializable' });
  }
}

await ScriptRunner.execute(import.meta.url, DeleteFrameworkByIdScript);
