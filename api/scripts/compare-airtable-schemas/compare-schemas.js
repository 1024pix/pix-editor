import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

function fromIdentifierToTableName(key) {
  return key.split('.')[0];
}

function fromIdentifierToFieldName(key) {
  return key.split('.').slice(0, 2).join('.');
}

function findMissingTables(aIdentifiers, bIdentifiers) {
  const aTables = new Set(aIdentifiers.map(fromIdentifierToTableName));
  const bTables = new Set(bIdentifiers.map(fromIdentifierToTableName));
  return Array.from(aTables.difference(bTables));
}

function findMissingFields(aIdentifiers, bIdentifiers, alreadyMissingTables) {
  const aTables = new Set(aIdentifiers
    .filter((identifier) => {
      const table = fromIdentifierToTableName(identifier);
      return !alreadyMissingTables.includes(table);
    })
    .map(fromIdentifierToFieldName));
  const bTables = new Set(bIdentifiers.map(fromIdentifierToFieldName));
  return Array.from(aTables.difference(bTables));
}

function findDifferentFieldTypes(aIdentifiers, bIdentifiers, alreadyMissingTables, alreadyMissingFields) {
  const aTables = new Set(aIdentifiers
    .filter((identifier) => {
      const table = fromIdentifierToTableName(identifier);
      const field = fromIdentifierToFieldName(identifier);
      return !(alreadyMissingTables.includes(table) || alreadyMissingFields.includes(field));
    }));
  const bTables = new Set(bIdentifiers);
  return Array.from(aTables.difference(bTables));
}

async function main() {
  if (!isLaunchedFromCommandLine) return;
  try {
    const bases = ['REVIEW_APPS', 'INTEGRATION', 'PRODUCTION'];
    const basesIdentifiers = [];
    for (const base of bases) {
      const rawFile = await readFile(`COMPARE_SCRIPT_schema_keys_for_${base}.json`, { encoding: 'utf-8' });
      const identifiers = JSON.parse(rawFile);
      basesIdentifiers.push([base, identifiers]);
    }

    for (const [base, identifiers] of basesIdentifiers) {
      const otherBasesIdentifiers = basesIdentifiers.filter(([b]) => b !== base);
      for (const [otherBase, otherIdentifiers] of otherBasesIdentifiers) {
        console.info(`🧐 Comparing ${base} to ${otherBase} ...`);

        const missingTablesInOtherBase = findMissingTables(identifiers, otherIdentifiers);
        const missingFieldsInOtherBase = findMissingFields(identifiers, otherIdentifiers, missingTablesInOtherBase);
        const differentFieldTypesInOtherBase = findDifferentFieldTypes(identifiers, otherIdentifiers, missingTablesInOtherBase, missingFieldsInOtherBase);

        const res = {
          [`missingTablesIn_${otherBase}`]: missingTablesInOtherBase,
          [`missingFieldsIn_${otherBase}`]: missingFieldsInOtherBase,
          [`differentFieldTypesIn_${otherBase}`]: differentFieldTypesInOtherBase,
        };

        const fileName = `COMPARE_SCRIPT_fields_in_${base}_but_not_in_${otherBase}.json`;
        await writeFile(fileName, JSON.stringify(res, null, 2));
      }
    }
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

main();
