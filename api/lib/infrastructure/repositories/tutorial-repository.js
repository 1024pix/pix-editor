import { Tutorial } from '../../domain/models/index.js';
import { tutorialDatasource } from '../datasources/airtable/index.js';
import { generateNewId } from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';

const TABLE_NAME = 'tutorials';
const TAGS_RELATION_TABLE_NAME = 'tutorials-tutorial_tags';

export async function create(tutorial) {
  return knex.transaction(async (transaction) => {
    tutorial.id = generateNewId('tutorial');

    const [airtableDto] = await Promise.all([
      tutorialDatasource.create(tutorial),
      transaction.insert({
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
      }).into(TABLE_NAME),
    ]);

    if (airtableDto.tagIds.length !== 0) {
      await transaction.insert(airtableDto.tagIds.map((tutorialTagId) => ({
        tutorialId: tutorial.id,
        tutorialTagId,
      }))).into(TAGS_RELATION_TABLE_NAME);
    }

    return toDomain(airtableDto);
  });
}

export async function update(tutorial) {
  return knex.transaction(async (transaction) => {
    const [airtableDto] = await Promise.all([
      tutorialDatasource.update(tutorial),
      transaction(TABLE_NAME).update({
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
      }).where('id', tutorial.id),
    ]);

    await transaction.delete().from(TAGS_RELATION_TABLE_NAME).where('tutorialId', tutorial.id).whereNotIn('tutorialTagId', airtableDto.tagIds);
    if (airtableDto.tagIds.length !== 0) {
      await transaction.insert(airtableDto.tagIds.map((tutorialTagId) => ({
        tutorialId: tutorial.id,
        tutorialTagId,
        updatedAt: transaction.fn.now(),
      })))
        .into(TAGS_RELATION_TABLE_NAME)
        .onConflict(['tutorialId', 'tutorialTagId'])
        .merge();
    }

    return toDomain(airtableDto);
  });
}

export async function getByAirtableId(tutorialId) {
  const datasourceTutorial = await tutorialDatasource.find(tutorialId);
  if (!datasourceTutorial) return null;
  return toDomain(datasourceTutorial);
}

export async function getManyByAirtableIds(airtableIds) {
  if (!airtableIds?.length) return [];
  const datasourceTutorials = await tutorialDatasource.getManyByAirtableIds(airtableIds);
  if (!datasourceTutorials) return [];
  return datasourceTutorials.map(toDomain);
}

export async function searchByTitle(title) {
  const datasourceTutorials = await tutorialDatasource.searchByTitle(title);
  if (!datasourceTutorials) return [];
  return datasourceTutorials.map(toDomain);
}

export async function searchBySource(source) {
  const datasourceTutorials = await tutorialDatasource.searchBySource(source);
  if (!datasourceTutorials) return [];
  return datasourceTutorials.map(toDomain);
}

export async function searchByTagTitles(tagTitles) {
  const datasourceTutorials = await tutorialDatasource.searchByTagTitles(tagTitles);
  if (!datasourceTutorials) return [];
  return datasourceTutorials.map(toDomain);
}

export async function getMany(ids) {
  const datasourceTutorials = await tutorialDatasource.filter({ filter: { ids } });
  return datasourceTutorials.map(toDomain);
}

async function _delete(ids) {
  const airtableIds = Object.entries(await tutorialDatasource.getAirtableIdsByIds(ids)).map(([, airtableId]) => airtableId);
  await tutorialDatasource.delete(airtableIds);
}

export { _delete as delete };

function toDomain(datasourceTutorial) {
  return new Tutorial(datasourceTutorial);
}
