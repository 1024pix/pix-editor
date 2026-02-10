import { knex } from '../../../db/knex-database-connection.js';
import { EmbedConfig } from '../../domain/models/index.js';

export async function save(embedConfigDto, { transaction: knexConn = knex } = {}) {
  console.log(embedConfigDto);
  const [savedEmbedConfigDto] = await knexConn.insert({
    embedId: embedConfigDto.embedId,
    name: embedConfigDto.name,
    data: embedConfigDto.data,
    sha: embedConfigDto.sha,
  }).into('embed_configs')
    .onConflict(['embedId', 'name'])
    .merge({ updatedAt: knexConn.fn.now() })
    .returning('*');

  return toDomain(savedEmbedConfigDto);
}

function toDomain(dto) {
  return new EmbedConfig(dto);
}
