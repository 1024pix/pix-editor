import { knex } from '../../../db/knex-database-connection.js';
import { Embed } from '../../domain/models/index.js';

export async function create(embedDto, { transaction: knexConn = knex } = {}) {
  const [createdEmbedDto] = await knexConn.insert({
    name: embedDto.name,
    pathname: embedDto.pathname,
    redirections: embedDto.redirections,
    ref: embedDto.ref,
    manifestPath: embedDto.manifestPath,
    manifestSha: embedDto.manifestSha,
    localesDirectories: embedDto.localesDirectories,
    configDirectory: embedDto.configDirectory,
  })
    .into('embeds')
    .returning('*');

  return toDomain(createdEmbedDto);
}

export async function getByName(name, { transaction: knexConn = knex } = {}) {
  const dto = await knexConn.select('*').from('embeds').where('name', name).first();
  if (!dto) return undefined;
  return toDomain(dto);
}

function toDomain(dto) {
  return new Embed(dto);
}
