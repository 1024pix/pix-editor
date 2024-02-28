import { databaseBuffer } from '../database-buffer.js';

export function buildRelease({
  id = databaseBuffer.nextId++,
  content,
  createdAt = new Date(),
} = {}) {

  const values = { id, content, createdAt };

  return databaseBuffer.pushInsertable({
    tableName: 'releases',
    values,
  });
}

