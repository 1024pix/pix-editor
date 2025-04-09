import Joi from 'joi';

import { checkCsvHeader, parseCsvWithHeader } from '../../infrastructure/utils/csv.js';

/**
 * Create a parser for a CSV file with the given column schema
 * @param {Record<string, Joi.Schema>} columnSchema
 * @returns {Promise<Array<Record<string, any>>>} parsed data
 */
export function csvFileParser(columnSchema = []) {
  return async (filePath) => {
    const columnNames = columnSchema.map((column) => column.name);

    await checkCsvHeader({ filePath, requiredFieldNames: columnNames });

    return parseCsvWithHeader(filePath, {
      header: true,
      skipEmptyLines: true,
      transform: (value, columnName) => {
        const column = columnSchema.find((column) => column.name === columnName);

        if (!column) return value;

        return Joi.attempt(value, column.schema);
      },
    });
  };
}

/**
 * Create a parser for comma separated strings
 * @param {string} separator (default: ',')
 * @returns {Array<string>}
 */
export function commaSeparatedStringParser(separator = ',') {
  return (str) => {
    const data = str.split(separator);
    return Joi.attempt(data, Joi.array().items(Joi.string().trim()));
  };
}

/**
 * Create a parser for comma separated numbers
 * @param {string} separator (default: ',')
 * @returns {Array<number>}
 */
export function commaSeparatedNumberParser(separator = ',') {
  return (nbr) => {
    const data = nbr.split(separator);
    return Joi.attempt(data, Joi.array().items(Joi.number()));
  };
}

/**
 * Create a parser for date strings in the format "YYYY-MM-DD"
 * @returns {Date}
 */
export function isoDateParser() {
  return (date) => {
    const schema = Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .message('Invalid date format. Expected "YYYY-MM-DD".');

    const { error, value: validatedDate } = schema.validate(date);
    if (error) {
      throw new Error(error.message);
    }
    return new Date(validatedDate);
  };
}
