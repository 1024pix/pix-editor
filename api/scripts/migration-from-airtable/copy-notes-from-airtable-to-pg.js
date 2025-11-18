import Airtable from 'airtable';
import { knex } from '../../db/knex-database-connection.js';
import { ScriptRunner } from '../../lib/application/scripts/script-runner.js';
import { Script } from '../../lib/application/scripts/script.js';
import * as config from '../../lib/config.js';

export class CopyNotesFromAirtableToPg extends Script {
  constructor() {
    super({
      description: 'Copie des notes et entrées de changelog de Airtable vers Postgres',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'If true, it does not persist insert/updates made during the script.',
          demandOption: false,
          default: true,
        },
        chunkSize: {
          type: 'number',
          describe: 'size of inserted chunk',
          demandOption: false,
          default: 500,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const airtableClient = new Airtable({ apiKey: config.airtable.apiKey }).base(config.airtable.editorBase);

    logger.info({ dryRun: options.dryRun }, 'Script options');

    const airtableNotes = await airtableClient.table('Notes').select({}).all();
    logger.info({ count: airtableNotes.length }, 'Loaded notes from airtable');

    const notes = airtableNotes
      .filter((record) => record.get('Changelog') === 'non')
      .map((record) => ({
        id: record.get('Record Id'),
        status: record.get('Statut'),
        text: record.get('Texte'),
        author: record.get('Auteur'),
        challengeId: record.get('Record_Id'),
        createdAt: record.get('Date'),
        updatedAt: knex.fn.now(),
      }));

    const postgresOnlyNoteIds = await knex
      .pluck('id')
      .from('notes')
      .whereNotIn('id', knex.select('*').fromRaw('unnest(?::text[])', [notes.map((note) => note.id)]));
    if (postgresOnlyNoteIds.length !== 0) {
      logger.warn({ ids: postgresOnlyNoteIds }, 'Some notes are only in postgres');
    }

    const changelogEntries = airtableNotes
      .filter((record) => record.get('Changelog') === 'oui')
      .map((record) => ({
        id: record.get('Record Id'),
        text: record.get('Texte'),
        author: record.get('Auteur'),
        elementId: record.get('Record_Id'),
        elementType: record.get("Type d'élément"),
        createdAt: record.get('Date'),
      }));

    const postgresOnlyChangelogEntryIds = await knex
      .pluck('id')
      .from('changelog_entries')
      .whereNotIn('id', knex.select('*').fromRaw('unnest(?::text[])', [changelogEntries.map((changelogEntry) => changelogEntry.id)]));
    if (postgresOnlyChangelogEntryIds.length !== 0) {
      logger.warn({ ids: postgresOnlyChangelogEntryIds }, 'Some changelog entries are only in postgres');
    }
    if (options.dryRun) return;

    for (const chunk of chunks(notes, options.chunkSize)) {
      await knex.insert(chunk).into('notes').onConflict('id').merge();
    }
    logger.info({ count: notes.length }, 'Inserted notes into postgres');

    for (const chunk of chunks(changelogEntries, options.chunkSize)) {
      await knex.insert(chunk).into('changelog_entries').onConflict('id').merge();
    }
    logger.info({ count: changelogEntries.length }, 'Inserted changelog entries into postgres');
  }
}

await ScriptRunner.execute(import.meta.url, CopyNotesFromAirtableToPg);

function* chunks(arr, size) {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}
