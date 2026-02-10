import * as path from 'node:path';

import { EmbedAlreadyExistsError } from '../errors.js';
import { embedConfigRepository, embedRepository, translationRepository } from '../../infrastructure/repositories/index.js';
import * as pixEpreuves from '../../infrastructure/services/pix-epreuves.js';
import { i18nextToTranslations } from '../../infrastructure/translations/embed.js';
import { knex } from '../../../db/knex-database-connection.js';

/**
 * @param {import('../models').Embed} embed
 */
export async function installEmbed({ ref, manifestPath }) {
  return knex.transaction(async (transaction) => {
    const manifestFile = await pixEpreuves.getFile(ref, manifestPath);

    const manifestDto = JSON.parse(manifestFile.content);

    const existingEmbed = await embedRepository.getByName(manifestDto.name, { transaction });
    if (existingEmbed) {
      throw new EmbedAlreadyExistsError(existingEmbed.name);
    }

    const embedDto = {
      ...manifestDto,
      ref,
      manifestPath,
      manifestSha: manifestFile.sha,
    };

    const createdEmbed = await embedRepository.create(embedDto, { transaction });

    const embedDirectory = path.dirname(manifestPath);

    if (manifestDto.localesDirectories) {
      for (const localesDirectory of manifestDto.localesDirectories) {
        const localesFiles = await pixEpreuves.getDirectory(ref, path.join(embedDirectory, localesDirectory));

        for (const { path: localeFilePath } of localesFiles) {
          const locale = path.basename(localeFilePath, '.json');

          const { content } = await pixEpreuves.getFile(ref, localeFilePath);

          const translations = i18nextToTranslations(JSON.parse(content), locale);

          await translationRepository.save({ translations, transaction });
        }
      }
    }

    const configFiles = await pixEpreuves.getDirectory(ref, path.join(embedDirectory, manifestDto.configDirectory));

    for (const { path: configFilePath, sha } of configFiles) {
      const name = path.basename(configFilePath, '.json');

      const { content } = await pixEpreuves.getFile(ref, configFilePath);

      await embedConfigRepository.save({
        embedId: createdEmbed.id,
        name,
        data: content,
        sha,
      }, { transaction });
    }

    return createdEmbed;
  });
}
