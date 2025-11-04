import { Tutorial } from '../../domain/models/index.js';
import { tutorialDatasource } from '../datasources/airtable/index.js';
import { generateNewId } from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areArrayEquals, areNullableValuesEqual, compareDtos, compareDtosLists } from './migration-from-airtable.js';
import { escapeLikeWildcards } from './sql-utils.js';

const TABLE_NAME = 'tutorials';
const TAGS_RELATION_TABLE_NAME = 'tutorials-tutorial_tags';

export async function create(tutorial) {
  return knex.transaction(async (transaction) => {
    tutorial.id = generateNewId('tutorial');

    const [airtableDto] = await Promise.all([
      tutorialDatasource.create(tutorial),
      transaction
        .insert({
          id: tutorial.id,
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
        .into(TABLE_NAME),
    ]);

    if (airtableDto.tagIds.length !== 0) {
      await transaction
        .insert(
          airtableDto.tagIds.map((tutorialTagId) => ({
            tutorialId: tutorial.id,
            tutorialTagId,
          })),
        )
        .into(TAGS_RELATION_TABLE_NAME);
    }

    return toDomain(airtableDto);
  });
}

export async function update(tutorial) {
  return knex.transaction(async (transaction) => {
    const [airtableDto] = await Promise.all([
      tutorialDatasource.update(tutorial),
      transaction(TABLE_NAME)
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
          updatedAt: transaction.fn.now(),
        })
        .where('id', tutorial.id),
    ]);

    await transaction
      .delete()
      .from(TAGS_RELATION_TABLE_NAME)
      .where('tutorialId', tutorial.id)
      .whereNotIn('tutorialTagId', airtableDto.tagIds);
    if (airtableDto.tagIds.length !== 0) {
      await transaction
        .insert(
          airtableDto.tagIds.map((tutorialTagId) => ({
            tutorialId: tutorial.id,
            tutorialTagId,
            updatedAt: transaction.fn.now(),
          })),
        )
        .into(TAGS_RELATION_TABLE_NAME)
        .onConflict(['tutorialId', 'tutorialTagId'])
        .merge({ updatedAt: transaction.fn.now() });
    }

    return toDomain(airtableDto);
  });
}

export async function getByAirtableId(airtableId) {
  const airtableDto = await tutorialDatasource.find(airtableId);
  if (!airtableDto) return null;

  const pgDto = await selectTutorials().where('id', airtableDto.id).first();

  compareDtos(airtableDto, pgDto, compareTutorialDtos);

  return toDomain(airtableDto);
}

export async function getManyByAirtableIds(airtableIds) {
  if (!airtableIds?.length) return [];
  const airtableDtos = await tutorialDatasource.getManyByAirtableIds(airtableIds);
  if (!airtableDtos) return [];

  const pgDtos = await selectTutorials()
    .whereIn(
      'id',
      airtableDtos.map(({ id }) => id),
    )
    .orderBy('id');

  compareDtosLists(airtableDtos, pgDtos, compareTutorialDtos);

  return airtableDtos.map(toDomain);
}

export async function searchByTitle(title) {
  const [airtableDtos, pgDtos] = await Promise.all([
    tutorialDatasource.searchByTitle(title),
    selectTutorials()
      .whereILike('title', `%${escapeLikeWildcards(title)}%`)
      .orderByRaw('?? collate ??', ['title', 'fr-x-icu'])
      .limit(100),
  ]);

  compareDtosLists(airtableDtos ?? [], pgDtos, compareTutorialDtos);

  if (!airtableDtos) return [];
  return airtableDtos.map(toDomain);
}

export async function searchBySource(source) {
  const [airtableDtos, pgDtos] = await Promise.all([
    tutorialDatasource.searchBySource(source),
    selectTutorials()
      .whereILike('source', `%${escapeLikeWildcards(source)}%`)
      .orderByRaw('?? collate ??', ['title', 'fr-x-icu'])
      .limit(4),
  ]);

  compareDtosLists(airtableDtos ?? [], pgDtos, compareTutorialDtos);

  if (!airtableDtos) return [];
  return airtableDtos.map(toDomain);
}

export async function searchByTagTitles(tagTitles) {
  let tutorialsQuery = selectTutorials().orderByRaw('?? collate ??', ['title', 'fr-x-icu']).limit(100);

  for (const tagTitle of tagTitles) {
    tutorialsQuery = tutorialsQuery.whereIn(
      'id',
      knex
        .select('tutorials-tutorial_tags.tutorialId')
        .from('tutorial_tags')
        .join('tutorials-tutorial_tags', 'tutorials-tutorial_tags.tutorialTagId', 'tutorial_tags.id')
        .whereILike('tutorial_tags.title', `%${escapeLikeWildcards(tagTitle)}%`),
    );
  }

  const [airtableDtos, pgDtos] = await Promise.all([tutorialDatasource.searchByTagTitles(tagTitles), tutorialsQuery]);

  compareDtosLists(airtableDtos ?? [], pgDtos, compareTutorialDtos);

  if (!airtableDtos) return [];
  return airtableDtos.map(toDomain);
}

export async function getMany(ids) {
  const [airtableDtos, pgDtos] = await Promise.all([
    tutorialDatasource.filter({ filter: { ids } }),
    selectTutorials().whereIn('id', ids).orderBy('id'),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareTutorialDtos);

  return airtableDtos.map(toDomain);
}

export async function list() {
  const [airtableDtos, pgDtos] = await Promise.all([tutorialDatasource.list(), selectTutorials().orderBy('id')]);

  compareDtosLists(airtableDtos, pgDtos, compareTutorialDtos);

  return airtableDtos.map(toDomain);
}

async function _delete(ids) {
  const airtableIds = Object.entries(await tutorialDatasource.getAirtableIdsByIds(ids)).map(
    ([, airtableId]) => airtableId,
  );
  await tutorialDatasource.delete(airtableIds);
  await knex.delete().from('tutorials-tutorial_tags').whereIn('tutorialId', ids);
  await knex.delete().from('tutorials').whereIn('id', ids);
}

export { _delete as delete };

function selectTutorials() {
  return knex
    .select(
      '*',
      knex.raw(
        'coalesce((??), \'[]\') as "tagIds"',
        knex
          .select(knex.raw('json_agg(??)', 'tutorials-tutorial_tags.tutorialTagId'))
          .from('tutorials-tutorial_tags')
          .where('tutorials-tutorial_tags.tutorialId', '=', knex.ref('tutorials.id')),
      ),
    )
    .from('tutorials');
}

function compareTutorialDtos(airtableTutorial, pgTutorial) {
  const diff = [];
  if (airtableTutorial.id !== pgTutorial.id)
    diff.push(`tutorial airtable id "${airtableTutorial.id}" != postgres id "${pgTutorial.id}"`);
  if (airtableTutorial.title !== pgTutorial.title)
    diff.push(`tutorial airtable title "${airtableTutorial.title}" != postgres title "${pgTutorial.title}"`);
  if (airtableTutorial.duration !== pgTutorial.duration)
    diff.push(
      `tutorial airtable duration "${airtableTutorial.duration}" != postgres duration "${pgTutorial.duration}"`,
    );
  if (airtableTutorial.source !== pgTutorial.source)
    diff.push(`tutorial airtable source "${airtableTutorial.source}" != postgres source "${pgTutorial.source}"`);
  if (airtableTutorial.format !== pgTutorial.format)
    diff.push(`tutorial airtable format "${airtableTutorial.format}" != postgres format "${pgTutorial.format}"`);
  if (airtableTutorial.link !== pgTutorial.link)
    diff.push(`tutorial airtable link "${airtableTutorial.link}" != postgres link "${pgTutorial.link}"`);
  if (!areNullableValuesEqual(airtableTutorial.license, pgTutorial.license))
    diff.push(`tutorial airtable license "${airtableTutorial.license}" != postgres license "${pgTutorial.license}"`);
  if (!areNullableValuesEqual(airtableTutorial.level, pgTutorial.level))
    diff.push(`tutorial airtable level "${airtableTutorial.level}" != postgres level "${pgTutorial.level}"`);
  if (airtableTutorial.crush !== pgTutorial.crush)
    diff.push(`tutorial airtable crush "${airtableTutorial.crush}" != postgres crush "${pgTutorial.crush}"`);
  if (!areNullableValuesEqual(airtableTutorial.locale, pgTutorial.locale))
    diff.push(`tutorial airtable locale "${airtableTutorial.locale}" != postgres locale "${pgTutorial.locale}"`);
  if (!areArrayEquals(airtableTutorial.tagIds, pgTutorial.tagIds))
    diff.push(`tutorial airtable tagIds "${airtableTutorial.tagIds}" != postgres tagIds "${pgTutorial.tagIds}"`);
  return diff;
}

function toDomain(datasourceTutorial) {
  return new Tutorial(datasourceTutorial);
}
