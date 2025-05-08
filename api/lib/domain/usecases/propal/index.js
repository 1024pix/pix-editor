import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import _ from 'lodash';
import * as Sentry from '@sentry/node';
import { knex } from '../../../../db/knex-database-connection.js';
import * as injectableRepositories from '../../../infrastructure/repositories/propal/index.js';
import * as transformers from '../../../infrastructure/transformers/index.js';
import { child } from '../../../infrastructure/logger.js';
import * as updatedRecordNotifier from '../../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../../infrastructure/pix-api-client.js';

const path = dirname(fileURLToPath(import.meta.url));
const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = {};
for (const [usecaseName, usecaseFnc] of Object.entries(usecasesWithoutInjectedDependencies)) {
  usecases[usecaseName] = (params) => {
    if (usecaseFnc.NEED_TRX) {
      return knex.transaction((trx) => {
        const deps = buildDependencies(usecaseName, trx);
        const injectedUsecase =  _.partial(injectDefaults, deps, usecaseFnc)();
        return injectedUsecase(params);
      });
    } else {
      const deps = buildDependencies(usecaseName, null);
      const injectedUsecase =  _.partial(injectDefaults, deps, usecaseFnc)();
      return injectedUsecase(params);
    }
  };
}

export { usecases };

function buildDependencies(usecaseName, trx) {
  const staticDependencies = {
    ...transformers,
    pixApiClient,
    updatedRecordNotifier,
    Sentry,
  };
  const dynamicDependencies = buildDynamicDependencies(usecaseName, trx);
  return {
    ...staticDependencies,
    ...dynamicDependencies,
  };
}

function buildDynamicDependencies(usecaseName, trx) {
  const repositories = buildRepositoryDependencies(trx);
  const logger = child(`usecase:${usecaseName}`, { event: usecaseName });
  return {
    ...repositories,
    logger,
  };
}

function buildRepositoryDependencies(trx) {
  const instanciatedRepositories = {};
  for (const [repoClassName, repoClassConstructor] of Object.entries(injectableRepositories)) {
    // Comme ça, ça ressemble à l'argument nommé dans les usecases, c'est-à-dire la version avec la première lettre en minuscule
    instanciatedRepositories[repoClassName.charAt(0).toLowerCase() + repoClassName.slice(1)] = new repoClassConstructor({ knexTransaction: trx });
  }
  return instanciatedRepositories;
}

export async function importNamedExportsFromDirectory({ path, ignoredFileNames = [] }) {
  const imports = {};
  const exportsLocations = {};
  const files = await readdir(path, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      continue;
    }

    if (!file.name.endsWith('.js') || ignoredFileNames.includes(file.name)) {
      continue;
    }

    const fileURL = pathToFileURL(join(path, file.name));
    const module = await import(fileURL);
    const namedExports = Object.entries(module);

    for (const [exportName, exportedValue] of namedExports) {
      if (exportName === 'default') {
        continue;
      }
      if (imports[exportName]) {
        throw new Error(`Duplicate export name ${exportName} : ${exportsLocations[exportName]} and ${file.name}`);
      }
      imports[exportName] = exportedValue;
      exportsLocations[exportName] = file.name;
    }
  }
  return imports;
}

function injectDefaults(defaults, targetFn) {
  return (args) => targetFn(Object.assign(Object.create(defaults), args));
}
