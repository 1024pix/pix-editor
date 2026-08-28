import { databaseBuffer } from '../database-buffer.js';

export function buildBrokenUrl({
  id = databaseBuffer.nextId++,
  statusCode = 400,
  errorMessage = null,
  url = 'http://ui.pix.fr',
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'broken_urls',
    autoId: true,
    values: {
      id,
      statusCode,
      errorMessage,
      url,
    },
  });
}
