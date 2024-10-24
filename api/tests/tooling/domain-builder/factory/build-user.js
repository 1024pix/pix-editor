import { User } from '../../../../lib/domain/models/index.js';

export function buildUser({
  id = 123,
  name = 'Bijou',
  trigram = 'BOU',
  apiKey = 'someApiKey',
  access = 'editor',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-02'),
} = {}) {
  return new User({
    id,
    name,
    trigram,
    apiKey,
    access,
    createdAt,
    updatedAt,
  });
}
