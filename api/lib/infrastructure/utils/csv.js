import fs, { promises } from 'node:fs';

const { readFile, access } = promises;

import lodash from 'lodash';

const { isEmpty, difference } = lodash;

import papa from 'papaparse';

const ERRORS = {
  MISSING_REQUIRED_FIELD_NAMES: 'MISSING_REQUIRED_FIELD_NAMES',
  EMPTY_FILE: 'EMPTY_FILE',
};
const OPTIONS_WITH_HEADER = {
  skipEmptyLines: true,
  header: true,
  transform: (value) => {
    if (typeof value === 'string') {
      value = value.trim();
    }

    return value;
  },
};

async function checkCsvHeader({ filePath, requiredFieldNames = [] }) {
  if (isEmpty(requiredFieldNames)) {
    throw new Error(ERRORS.MISSING_REQUIRED_FIELD_NAMES);
  }

  const data = await _parseCsv(filePath, { skipEmptyLines: true, preview: 1 });
  if (isEmpty(data)) {
    throw new Error(ERRORS.EMPTY_FILE + 'Le fichier ne contient aucune donnée');
  }

  const fieldNames = data[0].map((fieldName) => fieldName?.trim());
  const missingRequiredFieldNames = difference(requiredFieldNames, fieldNames);

  if (!isEmpty(missingRequiredFieldNames)) {
    throw new Error(
      ERRORS.MISSING_REQUIRED_FIELD_NAMES + `Colonne(s) manquante(s) ou erronée(s) : ${missingRequiredFieldNames}`,
    );
  }
}

function parseCsvWithHeader(filePath, options = OPTIONS_WITH_HEADER) {
  return _parseCsv(filePath, options);
}

async function _parseCsv(filePath, options) {
  const cleanedData = await readCsvFile(filePath);
  return parseCsvData(cleanedData, options);
}

async function readCsvFile(filePath) {
  try {
    await access(filePath, fs.constants.F_OK);
  } catch {
    throw new Error(`Aucun fichier nommé ${filePath} n'a été trouvé !`);
  }

  const rawData = await readFile(filePath, 'utf8');

  return rawData.replace(/^\uFEFF/, '');
}

async function parseCsvData(cleanedData, options) {
  const { data } = papa.parse(cleanedData, options);
  return data;
}

export { checkCsvHeader, parseCsvWithHeader };
