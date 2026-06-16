import { Tag } from '../../domain/models/index.js';
import { generateNewId } from '../utils/id-generator.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { escapeLikeWildcards } from './sql-utils.js';

const TABLE_NAME = 'tutorial_tags';

export async function create(tag) {
  const knexConn = DomainTransaction.getConnection();
  const dto = { id: generateNewId('tag'), title: tag.title };

  await knexConn(TABLE_NAME).insert(dto);

  return toDomain(dto);
}

export async function get(id) {
  const knexConn = DomainTransaction.getConnection();
  const dto = await knexConn.select('*').from(TABLE_NAME).where('id', id).first();
  if (!dto) return null;

  return toDomain(dto);
}

export async function getMany(ids) {
  if (!ids?.length) return [];

  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn.select('*').from(TABLE_NAME).whereIn('id', ids).orderBy('id');

  return dtos.map(toDomain);
}

export async function searchByTitle(title) {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn
    .select('*')
    .from(TABLE_NAME)
    .whereILike('title', `%${escapeLikeWildcards(title)}%`)
    .orderByRaw('?? collate ??', ['title', 'fr-x-icu'])
    .limit(4);

  return dtos.map(toDomain);
}

export async function findByTitle(title) {
  const knexConn = DomainTransaction.getConnection();
  const dto = await knexConn
    .select('*')
    .from(TABLE_NAME)
    .where(knexConn.raw('LOWER(??)', 'title'), title.toLowerCase())
    .first();

  if (!dto) return null;

  return toDomain(dto);
}

function toDomain({ id, ...dto }) {
  return new Tag({ id, airtableId: id, ...dto });
}
