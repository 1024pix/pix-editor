import { databaseBuffer } from '../database-buffer.js';

export function buildBrokenUrl({
  id = databaseBuffer.getNextId(),
  statusCode = 400,
  errorMessage = null,
  url = 'http://ui.pix.fr',
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'broken_urls',
    values: {
      id,
      statusCode,
      errorMessage,
      url,
    },
  });
}
