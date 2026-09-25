import fs from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import { duplicateModule } from '../lib/domain/usecases/duplicate-module.js';

export class DuplicateModule extends Script {
  constructor() {
    super({
      description:
        'Duplique un fichier JSON de module Modulix en régénérant tous les identifiants UUID, le shortId, le slug et le titre.',
      permanent: true,
      options: {
        source: {
          type: 'string',
          describe: 'Le chemin du fichier JSON du module source à dupliquer (ex: /chemin/vers/bac-a-sable.json)',
          demandOption: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const { source } = options;

    const sourcePath = resolve(source);
    const sourceDir = dirname(sourcePath);
    const fileNameWithoutExtension = basename(sourcePath, '.json');
    const targetPath = join(sourceDir, `${fileNameWithoutExtension}_copie.json`);

    _assertSourceFileExistsAndHasJSONExtension(sourcePath);
    _assertTargetFileDoesNotExist(targetPath);

    const moduleData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
    const duplicatedModuleData = duplicateModule({ moduleData });

    const duplicatedModuleContent = JSON.stringify(duplicatedModuleData, null, 2);
    fs.writeFileSync(targetPath, `${duplicatedModuleContent}\n`);

    logger.info(`Module dupliqué : ${targetPath}`);
  }
}

function _assertSourceFileExistsAndHasJSONExtension(sourcePath) {
  if (!sourcePath.endsWith('.json')) {
    throw new Error(`Le fichier source doit avoir l'extension .json (reçu : "${sourcePath}")`);
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Le fichier source "${sourcePath}" n'existe pas.`);
  }
}

function _assertTargetFileDoesNotExist(targetPath) {
  if (fs.existsSync(targetPath)) {
    throw new Error(`Le fichier cible "${targetPath}" existe déjà.`);
  }
}

await ScriptRunner.execute(import.meta.url, DuplicateModule);
