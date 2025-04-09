import { Script } from '../lib/application/scripts/script.js';
import { ScriptRunner } from '../lib/application/scripts/script-runner.js';
import * as airtable from '../lib/infrastructure/airtable.js';
import { knex } from '../db/knex-database-connection.js';

export class ResetLearningContentInIntegrationEnvironment extends Script {
  constructor() {
    super({
      description: 'Refresh INTEGRATION environment dataset',
      permanent: false,
    });
  }

  async handle({ logger }) {
    const airtablePixCompetences = await airtable.findRecords(
      'Competences',
      {
        filterByFormula: '{Origine} = "Pix"',
      },
    );
    const airtableThematicIds = airtablePixCompetences.flatMap((airtablePixCompetence) => airtablePixCompetence.fields['Thematiques']);
    const airtablePixThematics = await airtable.findRecords(
      'Thematiques',
      {
        filterByFormula: whereRecordIdInFormula(airtableThematicIds, 'Record Id'),
      },
    );
    const airtableTubeIds = airtablePixThematics.flatMap((airtablePixThematic) => airtablePixThematic.fields['Tubes']);
    const airtablePixTubes = await airtable.findRecords(
      'Tubes',
      {
        filterByFormula: whereRecordIdInFormula(airtableTubeIds, 'Record Id'),
      },
    );
    const airtableSkillIds = airtablePixTubes.flatMap((airtablePixTube) => airtablePixTube.fields['Acquis']);
    const airtableSkills = await airtable.findRecords(
      'Acquis',
      {
        filterByFormula: whereRecordIdInFormula(airtableSkillIds, 'Record Id'),
      },
    );
    const airtableChallengeIds = airtableSkills.flatMap((airtablePixSkill) => airtablePixSkill.fields['Epreuves']);
    const airtableChallenges = await airtable.findRecords(
      'Epreuves',
      {
        filterByFormula: whereRecordIdInFormula(airtableChallengeIds, 'Record ID'),
      },
    );
    const airtableAttachmentIds = airtableChallenges.flatMap((airtableChallenge) => airtableChallenge.fields['files']);
    const airtableAttachments = await airtable.findRecords(
      'Attachments',
      {
        filterByFormula: whereRecordIdInFormula(airtableAttachmentIds, 'Record ID'),
      },
    );

    for (const chunkThematics of chunk(airtablePixThematics, 10)) {
      const chunkAirtableThematicsIds = chunkThematics.map((thematic) => thematic['id']);
      await airtable.deleteRecords('Thematiques', chunkAirtableThematicsIds);
    }

    for (const chunkTubes of chunk(airtablePixTubes, 10)) {
      const chunkAirtableTubesIds = chunkTubes.map((tube) => tube['id']);
      await airtable.deleteRecords('Tubes', chunkAirtableTubesIds);
    }

    for (const chunkSkills of chunk(airtableSkills, 10)) {
      const chunkAirtableSkillsIds = chunkSkills.map((skill) => skill['id']);
      await airtable.deleteRecords('Acquis', chunkAirtableSkillsIds);
    }

    for (const chunkChallenges of chunk(airtableChallenges, 10)) {
      const chunkAirtableChallengesIds = chunkChallenges.map((challenge) => challenge['id']);
      await airtable.deleteRecords('Epreuves', chunkAirtableChallengesIds);
    }

    for (const chunkAttachments of chunk(airtableAttachments, 10)) {
      const chunkAirtableAttachmentsIds = chunkAttachments.map((attachment) => attachment['id']);
      await airtable.deleteRecords('Attachments', chunkAirtableAttachmentsIds);
    }

    await knex.transaction(async (trx) => {
      const attachmentIds = airtableAttachments.map((attachment) => attachment['id']);
      await trx('localized_challenges-attachments').whereIn('attachmentId', attachmentIds).delete();
      const challengeIds = airtableChallenges.map((challenge) => challenge.fields['id persistant']);
      await trx('localized_challenges').whereIn('challengeId', challengeIds).delete();

      const thematicIds = airtablePixThematics.map((thematic) => thematic['id']);
      await trx('translations').whereIn('entityId', thematicIds).delete();

      const tubeIds = airtablePixTubes.map((tube) => tube.fields['id persistant']);
      await trx('translations').whereIn('entityId', tubeIds).delete();

      const skillIds = airtableSkills.map((skill) => skill.fields['id persistant']);
      await trx('translations').whereIn('entityId', skillIds).delete();
      await trx('translations').whereIn('entityId', challengeIds).delete();
      await trx('translations').whereIn('entityId', attachmentIds).delete();
    });
  }
}

function whereRecordIdInFormula(recordIds, recordIdField) {
  return 'OR(' + recordIds.map((recordId) => `{${recordIdField}} = "${recordId}"`).join(',') + ')';
}

function chunk(input, size) {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
}

await ScriptRunner.execute(import.meta.url, ResetLearningContentInIntegrationEnvironment);
