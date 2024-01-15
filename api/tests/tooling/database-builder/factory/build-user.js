import { databaseBuffer } from '../database-buffer.js';

export function buildUser({
  id,
  name,
  trigram,
  access,
  apiKey,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {

  const values = { id, name, trigram, access, apiKey, createdAt, updatedAt };

  return databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });
}

export function buildAdminUser() {
  return buildUser({ name: 'User', trigram: 'ADM', access: 'admin', apiKey: '00000000-0000-0000-0000-000000000000' });
}

export function buildReadonlyUser() {
  return buildUser({ name: 'User', trigram: 'RDO', access: 'readonly', apiKey: '10000000-0000-0000-0000-000000000000' });
}

export function buildEditorUser() {
  return buildUser({ name: 'User', trigram: 'EDI', access: 'editor', apiKey: '20000000-0000-0000-0000-000000000000' });
}
