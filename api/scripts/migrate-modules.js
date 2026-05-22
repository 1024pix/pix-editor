import { basename } from 'node:path';

import { Octokit } from '@octokit/rest';

import { Module } from '../lib/domain/models/index.js';
import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { moduleRepository } from '../lib/infrastructure/repositories/index.js';
import { knex } from '../db/knex-database-connection.js';

const owner = '1024pix';
const repo = 'pix';
const ref = 'dev';
const modulesDirectory = 'api/src/devcomp/infrastructure/datasources/learning-content/modules/';

export class MigrateModules extends Script {
  constructor() {
    super({
      description: 'Script de migration des modules',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not perform any deletion.',
          demandOption: true,
          default: true,
        },
        accessToken: {
          type: 'string',
          describe: 'Github access token',
          demandOption: true,
        },
      },
    });
  }

  async handle({ options, logger }, { octokit = new Octokit({ auth: options.accessToken }) } = {}) {
    logger.info({ dryRun: options.dryRun }, 'Script options');

    const moduleFiles = await getDirectory(octokit, ref, modulesDirectory, { logger });

    logger.info(`🔍  Found ${moduleFiles.length} modules to be stored`);

    await knex.transaction(async (transaction) => {
      for (const { path } of moduleFiles) {
        const { content } = await getFile(octokit, ref, path, { logger });
        const internalTitle = basename(path, '.json');

        const module = new Module({
          ...JSON.parse(content),
          internalTitle,
        });
        logger.info({ id: module.id, title: module.title }, 'Saving module');
        await moduleRepository.save(module, transaction);
      }

      if (options.dryRun) {
        await transaction.rollback();
      }
    });
  }
}

async function getFile(octokit, ref, path, { encoding = 'utf8', logger } = {}) {
  const data = await getContent(octokit, ref, path, { logger });

  if (data.type !== 'file') {
    logger.error({ path, ref }, 'given path is not a file');
    throw new Error('error while fetching content from repository');
  }

  const content = Buffer.from(data.content, data.encoding);

  return { content: content.toString(encoding) };
}

async function getDirectory(octokit, ref, path, { logger } = {}) {
  const data = await getContent(octokit, ref, path, { logger });

  if (!Array.isArray(data)) {
    logger.error({ path, ref }, 'given path is not a directory');
    throw new Error('error while fetching content from repository');
  }

  return data;
}

async function getContent(octokit, ref, path, { logger } = {}) {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      ref,
      path,
    });

    return data;
  } catch (err) {
    logger.error({ err }, 'error while fetching content');
    throw new Error('error while fetching content from repository');
  }
}

await ScriptRunner.execute(import.meta.url, MigrateModules);
