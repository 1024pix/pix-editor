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
    logger.info(`${airtablePixCompetences.length} compétences Pix trouvées.`);
    const airtableThematicIds = airtablePixCompetences.flatMap((airtablePixCompetence) => airtablePixCompetence.fields['Thematiques']);
    const airtablePixThematics = await airtable.findRecords(
      'Thematiques',
      {
        filterByFormula: whereRecordIdInFormula(airtableThematicIds, 'Record Id'),
      },
    );
    logger.info(`${airtablePixThematics.length} thématiques Pix trouvées.`);
    const airtableTubeIds = airtablePixThematics.flatMap((airtablePixThematic) => airtablePixThematic.fields['Tubes']);
    const airtablePixTubes = await airtable.findRecords(
      'Tubes',
      {
        filterByFormula: whereRecordIdInFormula(airtableTubeIds, 'Record Id'),
      },
    );
    logger.info(`${airtablePixTubes.length} sujets Pix trouvés.`);
    const airtableSkillIds = airtablePixTubes.flatMap((airtablePixTube) => airtablePixTube.fields['Acquis']);
    const airtableSkills = await airtable.findRecords(
      'Acquis',
      {
        filterByFormula: whereRecordIdInFormula(airtableSkillIds, 'Record Id'),
      },
    );
    logger.info(`${airtableSkills.length} acquis Pix trouvés.`);
    const airtableChallengeIds = airtableSkills.flatMap((airtablePixSkill) => airtablePixSkill.fields['Epreuves']);
    const airtableChallenges = await airtable.findRecords(
      'Epreuves',
      {
        filterByFormula: whereRecordIdInFormula(airtableChallengeIds, 'Record ID'),
      },
    );
    logger.info(`${airtableChallenges.length} épreuves Pix trouvées.`);
    const airtableAttachmentIds = airtableChallenges.flatMap((airtableChallenge) => airtableChallenge.fields['files']);
    const airtableAttachments = await airtable.findRecords(
      'Attachments',
      {
        filterByFormula: whereRecordIdInFormula(airtableAttachmentIds, 'Record ID'),
      },
    );
    logger.info(`${airtableChallenges.length} pièces jointes Pix trouvées.`);

    logger.info('Suppression des thématiques...');
    for (const chunkThematics of chunk(airtablePixThematics, 10)) {
      const chunkAirtableThematicsIds = chunkThematics.map((thematic) => thematic['id']);
      await airtable.deleteRecords('Thematiques', chunkAirtableThematicsIds);
    }
    logger.info('Suppression des thématiques OK');

    logger.info('Suppression des sujets...');
    for (const chunkTubes of chunk(airtablePixTubes, 10)) {
      const chunkAirtableTubesIds = chunkTubes.map((tube) => tube['id']);
      await airtable.deleteRecords('Tubes', chunkAirtableTubesIds);
    }
    logger.info('Suppression des sujets OK');

    logger.info('Suppression des acquis...');
    for (const chunkSkills of chunk(airtableSkills, 10)) {
      const chunkAirtableSkillsIds = chunkSkills.map((skill) => skill['id']);
      await airtable.deleteRecords('Acquis', chunkAirtableSkillsIds);
    }
    logger.info('Suppression des acquis OK');

    logger.info('Suppression des épreuves...');
    for (const chunkChallenges of chunk(airtableChallenges, 10)) {
      const chunkAirtableChallengesIds = chunkChallenges.map((challenge) => challenge['id']);
      await airtable.deleteRecords('Epreuves', chunkAirtableChallengesIds);
    }
    logger.info('Suppression des épreuves OK');

    logger.info('Suppression des pièces jointes...');
    for (const chunkAttachments of chunk(airtableAttachments, 10)) {
      const chunkAirtableAttachmentsIds = chunkAttachments.map((attachment) => attachment['id']);
      await airtable.deleteRecords('Attachments', chunkAirtableAttachmentsIds);
    }
    logger.info('Suppression des pièces jointes OK');

    await knex.transaction(async (trx) => {
      const attachmentIds = airtableAttachments.map((attachment) => attachment['id']);
      logger.info(`${attachmentIds.length} pièces jointes concernées pour la suppression des localized_challenges-attachments correspondant`);
      let deletedRecords = await trx('localized_challenges-attachments').whereIn('attachmentId', attachmentIds).delete().returning('attachmentId');
      logger.info(`${deletedRecords.length} localized_challenges-attachments supprimés`);
      const challengeIds = airtableChallenges.map((challenge) => challenge.fields['id persistant']);
      logger.info(`${challengeIds.length} épreuves concernées pour la suppression des localized_challenges correspondant`);
      deletedRecords = await trx('localized_challenges').whereIn('challengeId', challengeIds).delete().returning('id');
      logger.info(`${deletedRecords.length} localized_challenges supprimés`);

      const thematicIds = airtablePixThematics.map((thematic) => thematic['id']);
      logger.info(`${thematicIds.length} thématiques concernées pour la suppression des traductions correspondantes`);
      deletedRecords = await trx('translations').whereIn('entityId', thematicIds).delete().returning('key');
      logger.info(`${deletedRecords.length} traductions de thématiques supprimées`);

      const tubeIds = airtablePixTubes.map((tube) => tube.fields['id persistant']);
      logger.info(`${thematicIds.length} sujets concernés pour la suppression des traductions correspondantes`);
      deletedRecords = await trx('translations').whereIn('entityId', tubeIds).delete().returning('key');
      logger.info(`${deletedRecords.length} traductions de sujets supprimées`);

      const skillIds = airtableSkills.map((skill) => skill.fields['id persistant']);
      logger.info(`${skillIds.length} acquis concernés pour la suppression des traductions correspondantes`);
      deletedRecords = await trx('translations').whereIn('entityId', skillIds).delete().returning('key');
      logger.info(`${deletedRecords.length} traductions d\'acquis supprimées`);
      logger.info(`${challengeIds.length} épreuves concernées pour la suppression des traductions correspondantes`);
      deletedRecords = await trx('translations').whereIn('entityId', challengeIds).delete().returning('key');
      logger.info(`${deletedRecords.length} traductions d\'épreuves supprimées`);
      logger.info(`${challengeIds.length} pièces jointes concernées pour la suppression des traductions correspondantes`);
      deletedRecords = await trx('translations').whereIn('entityId', attachmentIds).delete().returning('key');
      logger.info(`${deletedRecords.length} traductions de pièces jointes supprimées`);
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
