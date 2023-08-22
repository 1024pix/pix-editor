const databaseBuffer = require('../database-buffer');

module.exports = function buildTranslation({ key, locale, value } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'translations',
    autoId: false,
    values: { key, locale, value },
  });
};
