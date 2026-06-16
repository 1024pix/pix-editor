import { Tutorial } from '../../domain/models/index.js';
import { generateNewId } from '../utils/id-generator.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { escapeLikeWildcards } from './sql-utils.js';

const TABLE_NAME = 'tutorials';
const TAGS_RELATION_TABLE_NAME = 'tutorials-tutorial_tags';

export async function create(tutorial) {
  return DomainTransaction.execute(async () => {
    const knexConn = DomainTransaction.getConnection();
    const id = generateNewId('tutorial');

    await knexConn
      .insert({
        id,
        title: tutorial.title,
        duration: tutorial.duration,
        source: tutorial.source,
        format: tutorial.format,
        link: tutorial.link,
        license: tutorial.license,
        level: tutorial.level,
        crush: tutorial.crush,
        locale: tutorial.locale,
      })
      .into(TABLE_NAME);

    if (tutorial.tagAirtableIds?.length) {
      await knexConn
        .insert(
          tutorial.tagAirtableIds.map((tutorialTagId) => ({
            tutorialId: id,
            tutorialTagId,
          })),
        )
        .into(TAGS_RELATION_TABLE_NAME);
    }

    const dto = await selectTutorials().where('tutorials.id', id).first();

    return toDomain(dto);
  });
}

export async function update(tutorial) {
  return DomainTransaction.execute(async () => {
    const knexConn = DomainTransaction.getConnection();

    await knexConn(TABLE_NAME)
      .update({
        title: tutorial.title,
        duration: tutorial.duration,
        source: tutorial.source,
        format: tutorial.format,
        link: tutorial.link,
        license: tutorial.license,
        level: tutorial.level,
        crush: tutorial.crush,
        locale: tutorial.locale,
        updatedAt: knexConn.fn.now(),
      })
      .where('id', tutorial.id);

    await knexConn
      .delete()
      .from(TAGS_RELATION_TABLE_NAME)
      .where('tutorialId', tutorial.id)
      .whereNotIn('tutorialTagId', tutorial.tagAirtableIds);
    if (tutorial.tagAirtableIds.length !== 0) {
      await knexConn
        .insert(
          tutorial.tagAirtableIds.map((tutorialTagId) => ({
            tutorialId: tutorial.id,
            tutorialTagId,
            updatedAt: knexConn.fn.now(),
          })),
        )
        .into(TAGS_RELATION_TABLE_NAME)
        .onConflict(['tutorialId', 'tutorialTagId'])
        .merge({ updatedAt: knexConn.fn.now() });
    }

    const dto = await selectTutorials().where('tutorials.id', tutorial.id).first();

    return toDomain(dto);
  });
}

export async function get(id) {
  const dto = await selectTutorials().where('id', id).first();
  if (!dto) return null;

  return toDomain(dto);
}

export async function searchByTitle(title) {
  const dtos = await selectTutorials()
    .whereILike('title', `%${escapeLikeWildcards(title)}%`)
    .orderByRaw('?? collate ??', ['title', 'fr-x-icu'])
    .limit(100);

  return dtos.map(toDomain);
}

export async function searchBySource(source) {
  const dtos = await selectTutorials()
    .whereILike('source', `%${escapeLikeWildcards(source)}%`)
    .orderByRaw('?? collate ??', ['title', 'fr-x-icu'])
    .limit(4);

  return dtos.map(toDomain);
}

export async function searchByTagTitles(tagTitles) {
  const knexConn = DomainTransaction.getConnection();
  let tutorialsQuery = selectTutorials().orderByRaw('?? collate ??', ['title', 'fr-x-icu']).limit(100);

  for (const tagTitle of tagTitles) {
    tutorialsQuery = tutorialsQuery.whereIn(
      'id',
      knexConn
        .select('tutorials-tutorial_tags.tutorialId')
        .from('tutorial_tags')
        .join('tutorials-tutorial_tags', 'tutorials-tutorial_tags.tutorialTagId', 'tutorial_tags.id')
        .whereILike('tutorial_tags.title', `%${escapeLikeWildcards(tagTitle)}%`),
    );
  }

  const dtos = await tutorialsQuery;

  return dtos.map(toDomain);
}

export async function getMany(ids) {
  if (!ids?.length) return [];

  const dtos = await selectTutorials().whereIn('id', ids).orderBy('id');

  return dtos.map(toDomain);
}

export async function list({ forUpdate = false } = {}) {
  const query = selectTutorials().orderBy('id');
  if (forUpdate) query.forUpdate();

  const dtos = await query;

  return dtos.map(toDomain);
}

async function _delete(ids) {
  return DomainTransaction.execute(async () => {
    const knexConn = DomainTransaction.getConnection();
    await knexConn.delete().from('tutorials-tutorial_tags').whereIn('tutorialId', ids);
    await knexConn.delete().from('tutorials').whereIn('id', ids);
  });
}

export { _delete as delete };

function selectTutorials() {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .select(
      '*',
      knexConn.raw(
        'coalesce((??), \'[]\') as "tagIds"',
        knexConn
          .select(
            knexConn.raw('json_agg(?? order by ??)', ['tutorials-tutorial_tags.tutorialTagId', 'tutorials-tutorial_tags.tutorialTagId']),
          )
          .from('tutorials-tutorial_tags')
          .where('tutorials-tutorial_tags.tutorialId', '=', knexConn.ref('tutorials.id')),
      ),
    )
    .from('tutorials');
}

function toDomain({ id, tagIds, ...dto }) {
  return new Tutorial({ id, airtableId: id, tagIds, tagAirtableIds: tagIds, ...dto });
}
