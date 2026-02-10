import { Octokit } from '@octokit/rest';

import * as config from '../../config.js';
import { InfrastructureError } from '../errors.js';
import { child } from '../logger.js';

const logger = child('services:pix-epreuves', { event: 'pix-epreuves' });

const octokit = new Octokit({ auth: config.pixEpreuves.githubAccessToken });

export async function getFile(ref, path, { encoding = 'utf8' } = {}) {
  const data = await getContent(ref, path);

  if (data.type !== 'file') {
    logger.error({ path, ref }, 'given path is not a file');
    throw new InfrastructureError('error while fetching content from pix-epreuves');
  }

  const content = Buffer.from(data.content, data.encoding);

  if (!encoding) return { content, sha: data.sha };

  return { content: content.toString(encoding), sha: data.sha };
}

export async function getDirectory(ref, path) {
  const data = await getContent(ref, path);

  if (!Array.isArray(data)) {
    logger.error({ path, ref }, 'given path is not a directory');
    throw new InfrastructureError('error while fetching content from pix-epreuves');
  }

  return data;
}

async function getContent(ref, path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: config.pixEpreuves.githubOwner,
      repo: config.pixEpreuves.githubRepo,
      ref,
      path,
    });

    return data;
  } catch (err) {
    logger.error({ err }, 'error while fetching content');
    throw new InfrastructureError('error while fetching content from pix-epreuves');
  }
}
