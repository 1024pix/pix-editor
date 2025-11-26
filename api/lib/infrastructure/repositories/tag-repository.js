import { Tag } from '../../domain/models/index.js';
import { generateNewId } from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';
import { escapeLikeWildcards } from './sql-utils.js';

const TABLE_NAME = 'tutorial_tags';

export async function create(tag) {
  const dto = { id: generateNewId('tag'), title: tag.title };

  await knex(TABLE_NAME).insert(dto);

  return toDomain(dto);
}

export async function get(id) {
  const dto = await knex.select('*').from(TABLE_NAME).where('id', id).first();
  if (!dto) return null;

  return toDomain(dto);
}

export async function getMany(ids) {
  if (!ids?.length) return [];

  const dtos = await knex.select('*').from(TABLE_NAME).whereIn('id', ids).orderBy('id');

  return dtos.map(toDomain);
}

export async function searchByTitle(title) {
  const dtos = await knex
    .select('*')
    .from(TABLE_NAME)
    .whereILike('title', `%${escapeLikeWildcards(title)}%`)
    .orderByRaw('?? collate ??', ['title', 'fr-x-icu'])
    .limit(4);

  return dtos.map(toDomain);
}

export async function findByTitle(title) {
  const dto = await knex
    .select('*')
    .from(TABLE_NAME)
    .where(knex.raw('LOWER(??)', 'title'), title.toLowerCase())
    .first();

  if (!dto) return null;

  return toDomain(dto);
}

function toDomain({ id, ...dto }) {
  return new Tag({ id, airtableId: id, ...dto });
}
