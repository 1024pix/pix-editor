import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { disconnect, knex } from '../../db/knex-database-connection.js';
import { logger } from '../../lib/infrastructure/logger.js';
import dotenv from 'dotenv';
import Airtable from 'airtable';
import _ from 'lodash';

dotenv.config();

// TODO
// les listes des champs ne sont pas complètes car sa mère la p de Airtable ne donne pas de champ quand null \o/
// créer un lookup Thematique 'id persistant' dans tubes

const FRAMEWORK_NAMES = ['Pix', 'Droit'];
const DOMAINS_PER_FRAMEWORK = 2;
const COMPETENCES_PER_DOMAIN = 2;
const THEMATICS_PER_COMPETENCE = 2;
const TUBES_PER_THEMATIC = 2;
const FIELDS_FRAMEWORK = ['Nom', 'Record ID', 'Domaines (identifiants)', 'Domaines (identifiants) (id persistant)', 'Date'];
const FIELDS_FRAMEWORK_WRITE = ['Nom'];
const FIELDS_AREA = ['id persistant', 'Competences (identifiants)', 'Code', '[DEPRECATED] Titre', 'Couleur',
  '[DEPRECATED] id persistant', '[DEPRECATED] Titre fr-fr', '[DEPRECATED] Titre en-us', 'Referentiel',
  'Origine', 'Competences (nom complet)', 'Competences (identifiants) (id persistant)', 'Record ID'];
const FIELDS_AREA_WRITE = ['id persistant', 'Code', 'Couleur'];
const FIELDS_COMPETENCE = ['Domaine', 'Epreuves', 'Sous-domaine', 'Tests', 'Acquis (identifiants)', 'Tubes', 'Epreuves copy',
  'Origine', 'id persistant', 'Thematiques', 'Référence', 'AcquisLevels', 'Origine2', 'Acquis', 'Domaine Code',
  'Acquis (via Tubes)', 'Domaine (id persistant)', 'Acquis (via Tubes) (id persistant)', 'Tubes (via Thematiques)'];
const FIELDS_COMPETENCE_WRITE = ['Sous-domaine', 'id persistant'];
const FIELDS_THEMATIC = ['Nom', 'Competence', 'Titre en-us', 'id persistant', 'Competence (id persistant)', 'Index', 'Record Id'];
const FIELDS_THEMATIC_WRITE = ['Nom', 'Titre en-us', 'id persistant'];
const FIELDS_TUBE = ['Nom', 'Competences', 'Acquis', 'Titre', 'id persistant', 'Thematique', 'Index',
  'Record Id', 'Competence (via Thematique)', 'Competence (via Thematique) (id persistant)',
  'CompetenceAcquisLevels', 'Origine', 'Acquis (id persistant)', 'Competences (id persistant)'];
const FIELDS_TUBE_WRITE = ['Nom', 'Titre', 'id persistant', 'Index'];
const FIELDS_SKILL = ['Statut de l\'indice', 'Epreuves', 'En savoir plus', 'Description', 'Statut de la description',
  'Level', 'Tube', 'Status', 'Internationalisation', 'id persistant', '[DEPRECATED]Indice fr-fr', 'Comprendre (id persistant)',
  '[DEPRECATED]Indice en-us', 'Version', 'Record Id', 'Nom', 'Origine', 'PixValue', 'En savoir plus (id persistant)',
  'Tube (id persistant)', 'Date', 'Epreuves (id persistant)', 'Compétence (via Tube)', 'Compétence (via Tube) (id persistant)'];
// TUTOS LIENS ?
const FIELDS_SKILL_WRITE = ['Statut de l\'indice', 'Description', 'Statut de la description',
  'Level', 'Status', 'Internationalisation', 'id persistant', 'Version','Nom', 'PixValue'];
const FIELDS_CHALLENGE = ['[DEPRECATED]Consigne', 'id', 'Type d\'épreuve', '_Niveau', 'Type péda', 'Auteur',
  'Déclinable', 'T1 - Espaces, casse & accents', 'T2 - Ponctuation', 'T3 - Distance d\'édition',
  'competences', 'Généalogie', 'Statut', 'Acquix', 'Version prototype', 'Version déclinaison',
  'Langue-old', 'Géographie', 'id persistant', 'Version linguistique', 'Langues', 'Imported table 2',
  'Imported table 2 (2)', 'files', 'Attachments copy', 'IsValidated', 'acquis', 'Preview', 'Record ID',
  'domaines', 'Tubes', 'Compétences (via tube)', '[DEPRECATED]FixedURL', 'Acquix (id persistant)',
  'Compétences (via tube) (id persistant)', 'updated_at', 'created_at', 'filesLocalizedChallengeIds',
];
const FIELDS_ATTACHMENT = ['id', 'filename', 'size', 'url', 'mimeType', 'type', 'challengeId',
  'Record ID', 'challengeId persistant', 'createdAt', 'updatedAt', 'localizedChallengeId'];
const FIELDS_TUTORIAL = ['id', 'filename', 'size', 'url', 'mimeType', 'type', 'challengeId',
  'Record ID', 'challengeId persistant', 'createdAt', 'updatedAt', 'localizedChallengeId'];
const FIELDS_TAG = ['Nom', 'Notes', 'Acquis', 'Tutoriels', 'id', 'id persistant', 'Record ID'];

function fromAirtableObjectsToPlainObjects(airtableObjects, fields) {
  return airtableObjects
    .map((airtableObject) => {
      const object = {
        record_id: airtableObject.id,
      };
      for (const field of fields) {
        object[field] = airtableObject.get(field) ?? null;
      }
      return object;
    });
}

async function _retrieveFrameworks(airtableClient) {
  const airtableFrameworks = await airtableClient
    .table('Referentiel')
    .select({
      filterByFormula: `OR(${['Pix 1D', ...FRAMEWORK_NAMES].map((fmwk) => `{Nom} = '${fmwk}'`).join(', ')})`,
    })
    .all();
  const frameworks = fromAirtableObjectsToPlainObjects(airtableFrameworks, FIELDS_FRAMEWORK);
  return {
    pix1DFramework: frameworks.find((framework) => framework['Nom'] === 'Pix 1D'),
    otherFrameworks: frameworks.filter((framework) => framework['Nom'] !== 'Pix 1D'),
  };
}

async function _retrieveAreas(airtableClient, pix1DFramework, otherFrameworks) {
  const pix1DAirtableAreas = await airtableClient
    .table('Domaines')
    .select({
      filterByFormula: `OR(${pix1DFramework['Domaines (identifiants) (id persistant)'].map((areaId) => `{id persistant} = '${areaId}'`).join(', ')})`
    })
    .all();
  const otherAirtableAreas = await airtableClient
    .table('Domaines')
    .select({
      filterByFormula: `OR(${otherFrameworks.flatMap((fmwk) => fmwk['Domaines (identifiants) (id persistant)']).map((areaId) => `{id persistant} = '${areaId}'`).join(', ')})`
    })
    .all();
  const pix1DAreas = fromAirtableObjectsToPlainObjects(pix1DAirtableAreas, FIELDS_AREA);
  pix1DAreas.forEach((pix1DArea) => pix1DArea['framework_name'] = pix1DFramework['Nom']);
  const otherAreasGroupedByFramework = _.groupBy(fromAirtableObjectsToPlainObjects(otherAirtableAreas, FIELDS_AREA), (area) => area['Referentiel'][0]);
  const otherAreas = _.flatMap(otherAreasGroupedByFramework, (areasInFramework, frameworkId) => {
    return areasInFramework
      .map((area) => ({ ...area, framework_name: otherFrameworks.find((fmw) => fmw.record_id === frameworkId)['Nom'] }))
      .sort((areaA, areaB) => areaA['Code'].localeCompare(areaB['Code']))
      .toSpliced(DOMAINS_PER_FRAMEWORK);
  });
  console.log(`${pix1DAreas.length} areas trouvés pour Pix1D`);
  console.log(`${otherAreas.length} areas trouvés pour les frameworks sélectionnés`);
  return {
    pix1DAreas,
    otherAreas,
  };
}

async function _retrieveCompetences(airtableClient, pix1DAreas, otherAreas) {
  const pix1DAirtableCompetences = await airtableClient
    .table('Competences')
    .select({
      filterByFormula: `OR(${pix1DAreas.flatMap((area) => area['Competences (identifiants) (id persistant)']).map((competenceId) => `{id persistant} = '${competenceId}'`).join(', ')})`
    })
    .all();
  const otherAirtableCompetences = await airtableClient
    .table('Competences')
    .select({
      filterByFormula: `OR(${otherAreas.flatMap((area) => area['Competences (identifiants) (id persistant)']).map((competenceId) => `{id persistant} = '${competenceId}'`).join(', ')})`
    })
    .all();
  const pix1DCompetences = fromAirtableObjectsToPlainObjects(pix1DAirtableCompetences, FIELDS_COMPETENCE);
  const otherCompetencesGroupedByArea = _.groupBy(fromAirtableObjectsToPlainObjects(otherAirtableCompetences, FIELDS_COMPETENCE), (competence) => competence['Domaine (id persistant)'][0]);
  const otherCompetences = _.flatMap(otherCompetencesGroupedByArea, (competencesInArea) => {
    return competencesInArea
      .sort((competenceA, competenceB) => {
        const indexA = competenceA['Sous-domaine'].split('.')[1];
        const indexB = competenceB['Sous-domaine'].split('.')[2];
        return indexA.localeCompare(indexB);
      })
      .toSpliced(COMPETENCES_PER_DOMAIN);
  });
  console.log(`${pix1DAreas.length} competences trouvés pour Pix1D`);
  console.log(`${otherAreas.length} competences trouvés pour les areas sélectionnés`);
  return {
    pix1DCompetences,
    otherCompetences,
  };
}

async function _retrieveThematics(airtableClient, pix1DCompetences, otherCompetences) {
  const pix1DAirtableThematics = await airtableClient
    .table('Thematiques')
    .select({
      filterByFormula: `OR(${pix1DCompetences.flatMap((competence) => competence['Thematiques']).map((thematicId) => `{Record ID} = '${thematicId}'`).join(', ')})`
    })
    .all();
  const otherAirtableThematics = await airtableClient
    .table('Thematiques')
    .select({
      filterByFormula: `OR(${otherCompetences.flatMap((competence) => competence['Thematiques']).map((thematicId) => `{Record ID} = '${thematicId}'`).join(', ')})`
    })
    .all();
  const pix1DThematics = fromAirtableObjectsToPlainObjects(pix1DAirtableThematics, FIELDS_THEMATIC);
  const otherThematicsGroupedByCompetence = _.groupBy(fromAirtableObjectsToPlainObjects(otherAirtableThematics, FIELDS_THEMATIC), (thematic) => thematic['Competence (id persistant)'][0]);
  const otherThematics = _.flatMap(otherThematicsGroupedByCompetence, (thematicsInCompetence) => {
    return thematicsInCompetence
      .sort((thematicA, thematicB) => thematicA['Nom'].localeCompare(thematicB['Nom']))
      .toSpliced(THEMATICS_PER_COMPETENCE);
  });
  console.log(`${pix1DThematics.length} thematics trouvés pour Pix1D`);
  console.log(`${otherThematics.length} thématics trouvés pour les competences sélectionnés`);
  return {
    pix1DThematics,
    otherThematics,
  };
}

async function _retrieveTubes(airtableClient, pix1DCompetences, otherCompetences, pix1DThematics, otherThematics) {
  const pix1DAirtableTubes = await airtableClient
    .table('Tubes')
    .select({
      filterByFormula: `OR(${pix1DCompetences.flatMap((competence) => competence['Tubes']).map((tubeId) => `{Record ID} = '${tubeId}'`).join(', ')})`
    })
    .all();
  const otherAirtableTubes = await airtableClient
    .table('Tubes')
    .select({
      filterByFormula: `OR(${otherCompetences.flatMap((competence) => competence['Tubes']).map((tubeId) => `{Record ID} = '${tubeId}'`).join(', ')})`
    })
    .all();
  const pix1DThematicIds = pix1DThematics.map(({ record_id }) => record_id);
  const pix1DTubes = fromAirtableObjectsToPlainObjects(pix1DAirtableTubes, FIELDS_TUBE)
    .filter((pix1DTube) => pix1DThematicIds.includes(pix1DTube['Thematique']));
  const otherThematicIds = otherThematics.map(({ record_id }) => record_id);
  const otherTubesGroupedByThematic = _.filter(
    _.groupBy(fromAirtableObjectsToPlainObjects(otherAirtableTubes, FIELDS_TUBE), (tube) => tube['Thematique'][0]),
    (_, thematicId) => otherThematicIds.includes(thematicId));
  const otherTubes = _.flatMap(otherTubesGroupedByThematic, (tubesInThematic) => {
    return tubesInThematic
      .sort((tubeA, tubeB) => tubeA['Index'] > tubeB['Index'])
      .toSpliced(TUBES_PER_THEMATIC);
  });
  console.log(`${pix1DTubes.length} tubes trouvés pour Pix1D`);
  console.log(`${otherTubes.length} tubes trouvés pour les thematics sélectionnés`);
  return {
    pix1DTubes,
    otherTubes,
  };
}

async function _retrieveSkills(airtableClient, pix1DTubes, otherTubes) {
  const pix1DAirtableSkills = await airtableClient
    .table('Acquis')
    .select({
      filterByFormula: `OR(${pix1DTubes.flatMap((tube) => tube['Acquis']).map((skillId) => `{Record ID} = '${skillId}'`).join(', ')})`
    })
    .all();
  const otherAirtableSkills = await airtableClient
    .table('Acquis')
    .select({
      filterByFormula: `OR(${otherTubes.flatMap((tube) => tube['Acquis']).map((skillId) => `{Record ID} = '${skillId}'`).join(', ')})`
    })
    .all();
  const pix1DSkills = fromAirtableObjectsToPlainObjects(pix1DAirtableSkills, FIELDS_SKILL);
  const otherSkills = fromAirtableObjectsToPlainObjects(otherAirtableSkills, FIELDS_SKILL);
  console.log(`${pix1DSkills.length} skills trouvés pour Pix1D`);
  console.log(`${otherSkills.length} skills trouvés pour les tubes sélectionnés`);
  return {
    pix1DSkills,
    otherSkills,
  };
}

async function _retrieveChallenges(airtableClient, pix1DSkills, otherSkills) {
  const pix1DAirtableChallenges = await airtableClient
    .table('Epreuves')
    .select({
      filterByFormula: `OR(${pix1DSkills.flatMap((skill) => skill['Epreuves']).map((challengeId) => `{Record ID} = '${challengeId}'`).join(', ')})`
    })
    .all();
  const otherAirtableChallenges = await airtableClient
    .table('Epreuves')
    .select({
      filterByFormula: `OR(${otherSkills.flatMap((skill) => skill['Epreuves']).map((challengeId) => `{Record ID} = '${challengeId}'`).join(', ')})`
    })
    .all();
  const pix1DChallenges = fromAirtableObjectsToPlainObjects(pix1DAirtableChallenges, FIELDS_CHALLENGE);
  const otherChallenges = fromAirtableObjectsToPlainObjects(otherAirtableChallenges, FIELDS_CHALLENGE);
  console.log(`${pix1DChallenges.length} challenges trouvés pour Pix1D`);
  console.log(`${otherChallenges.length} challenges trouvés pour les skills sélectionnés`);
  return {
    pix1DChallenges,
    otherChallenges,
  };
}

async function _retrieveAttachments(airtableClient, pix1DChallenges, otherChallenges) {
  const pix1DAirtableAttachments = await airtableClient
    .table('Attachments')
    .select({
      filterByFormula: `OR(${pix1DChallenges.flatMap((challenge) => challenge.record_id).map((challengeId) => `{challengeId} = '${challengeId}'`).join(', ')})`
    })
    .all();
  const otherAirtableAttachments = await airtableClient
    .table('Attachments')
    .select({
      filterByFormula: `OR(${otherChallenges.flatMap((challenge) => challenge.record_id).map((challengeId) => `{challengeId} = '${challengeId}'`).join(', ')})`
    })
    .all();
  const pix1DAttachments = fromAirtableObjectsToPlainObjects(pix1DAirtableAttachments, FIELDS_ATTACHMENT);
  const otherAttachments = fromAirtableObjectsToPlainObjects(otherAirtableAttachments, FIELDS_ATTACHMENT);
  console.log(`${pix1DAttachments.length} attachments trouvés pour Pix1D`);
  console.log(`${otherAttachments.length} attachments trouvés pour les challenges sélectionnés`);
  return {
    pix1DAttachments,
    otherAttachments,
  };
}

async function _retrieveTutorials(airtableClient, pix1DSkills, otherSkills) {
  const pix1DTutorialIds = _.flatMapDeep(pix1DSkills, (pix1DSkill) => [pix1DSkill['Comprendre (id persistant)'], pix1DSkill['En savoir plus (id persistant)']]);
  const pix1DAirtableTutorials = await airtableClient
    .table('Tutoriels')
    .select({
      filterByFormula: `OR(${pix1DTutorialIds.map((tutorialId) => `{id persistant} = '${tutorialId}'`).join(', ')})`
    })
    .all();
  const otherTutorialIds = _.flatMapDeep(otherSkills, (otherSkill) => [otherSkill['Comprendre (id persistant)'], otherSkill['En savoir plus (id persistant)']]);
  const otherAirtableTutorials = await airtableClient
    .table('Tutoriels')
    .select({
      filterByFormula: `OR(${otherTutorialIds.map((tutorialId) => `{id persistant} = '${tutorialId}'`).join(', ')})`
    })
    .all();
  const pix1DTutorials = fromAirtableObjectsToPlainObjects(pix1DAirtableTutorials, FIELDS_TUTORIAL);
  const otherTutorials = fromAirtableObjectsToPlainObjects(otherAirtableTutorials, FIELDS_TUTORIAL);
  console.log(`${pix1DTutorials.length} tutorials trouvés pour Pix1D`);
  console.log(`${otherTutorials.length} tutorials trouvés pour les skills sélectionnés`);
  return {
    pix1DTutorials,
    otherTutorials,
  };
}

async function _retrieveTags(airtableClient) {
  const airtableTags = await airtableClient
    .table('Tags')
    .select()
    .all();
  const tags = fromAirtableObjectsToPlainObjects(airtableTags, FIELDS_TAG);
  console.log(`${tags.length} tags trouvés`);
  return tags;
}

async function _retrieveMissions() {
  const missions = await knex('missions').select('*');
  console.log(`${missions.length} missions trouvés`);
  return missions;
}

async function _retrieveLocalizedChallenges(pix1DChallenges, otherChallenges) {
  const pix1DLocalizedChallenges = await knex('localized_challenges').select('*').whereIn('challengeId', pix1DChallenges.map((chal) => chal['id persistant']));
  const otherLocalizedChallenges = await knex('localized_challenges').select('*').whereIn('challengeId', otherChallenges.map((chal) => chal['id persistant']));
  console.log(`${pix1DLocalizedChallenges.length} localized challenges trouvés pour Pix1D`);
  console.log(`${otherLocalizedChallenges.length} localized challenges trouvés pour les challenges sélectionnés`);
  return {
    pix1DLocalizedChallenges,
    otherLocalizedChallenges,
  };
}

async function _retrieveTranslations(pix1DAreas, pix1DCompetences, pix1DThematics, pix1DTubes, pix1DSkills, pix1DChallenges, otherAreas, otherCompetences, otherThematics, otherTubes, otherSkills, otherChallenges) {
  const pix1DKeys = [
    pix1DAreas.map((area) => `area.${area['id persistant']}`),
    pix1DCompetences.map((competence) => `competence.${competence['id persistant']}`),
    pix1DThematics.map((thematic) => `thematic.${thematic['id persistant']}`),
    pix1DTubes.map((tube) => `tube.${tube['id persistant']}`),
    pix1DSkills.map((skill) => `skill.${skill['id persistant']}`),
    pix1DChallenges.map((challenge) => `challenge.${challenge['id persistant']}`),
  ].flat();
  const pix1DTranslations = [];
  for (const pix1DKeyChunk of _.chunk(pix1DKeys, 1200)) {
    pix1DTranslations.push(...(await knex('translations').select('*').where(function() {
      for (const key of pix1DKeyChunk) {
        this.orWhereLike('key', `${key}%`);
      }
    })));
  }
  const otherKeys = [
    otherAreas.map((area) => `area.${area['id persistant']}`),
    otherCompetences.map((competence) => `competence.${competence['id persistant']}`),
    otherThematics.map((thematic) => `thematic.${thematic['id persistant']}`),
    otherTubes.map((tube) => `tube.${tube['id persistant']}`),
    otherSkills.map((skill) => `skill.${skill['id persistant']}`),
    otherChallenges.map((challenge) => `challenge.${challenge['id persistant']}`),
  ].flat();
  const otherTranslations = [];
  for (const otherKeyChunk of _.chunk(otherKeys, 1200)) {
    otherTranslations.push(...(await knex('translations').select('*').where(function() {
      for (const key of otherKeyChunk) {
        this.orWhereLike('key', `${key}%`);
      }
    })));
  }
  console.log(`${pix1DTranslations.length} translations trouvés pour Pix1D`);
  console.log(`${otherTranslations.length} translations trouvés pour les entities sélectionnés`);
  return {
    pix1DTranslations,
    otherTranslations,
  };
}

async function _pluckLearningContent(airtableClient) {
  const { pix1DFramework, otherFrameworks } = await _retrieveFrameworks(airtableClient);
  const { pix1DAreas, otherAreas } = await _retrieveAreas(airtableClient, pix1DFramework, otherFrameworks);
  const { pix1DCompetences, otherCompetences } = await _retrieveCompetences(airtableClient, pix1DAreas, otherAreas);
  const { pix1DThematics, otherThematics } = await _retrieveThematics(airtableClient, pix1DCompetences, otherCompetences);
  const { pix1DTubes, otherTubes } = await _retrieveTubes(airtableClient, pix1DCompetences, otherCompetences, pix1DThematics, otherThematics);
  const { pix1DSkills, otherSkills } = await _retrieveSkills(airtableClient, pix1DTubes, otherTubes);
  //const { pix1DChallenges, otherChallenges } = await _retrieveChallenges(airtableClient, pix1DSkills, otherSkills);
  //const { pix1DAttachments, otherAttachments } = await _retrieveAttachments(airtableClient, pix1DChallenges, otherChallenges);
  //const { pix1DTutorials, otherTutorials } = await _retrieveTutorials(airtableClient, pix1DSkills, otherSkills);
  //const { pix1DLocalizedChallenges, otherLocalizedChallenges } = await _retrieveLocalizedChallenges(pix1DChallenges, otherChallenges);
  //const { pix1DTranslations, otherTranslations } = await _retrieveTranslations(pix1DAreas, pix1DCompetences, pix1DThematics, pix1DTubes, pix1DSkills, pix1DChallenges, otherAreas, otherCompetences, otherThematics, otherTubes, otherSkills, otherChallenges);
  //const tags = await _retrieveTags(airtableClient);
  //const missions = await _retrieveMissions();
  return {
    pix1DFramework, otherFrameworks,
    pix1DAreas, otherAreas,
    pix1DCompetences, otherCompetences,
    pix1DThematics, otherThematics,
    pix1DTubes, otherTubes,
    pix1DSkills, otherSkills,
    //pix1DChallenges, otherChallenges,
    //pix1DAttachments, otherAttachments,
    //pix1DTutorials, otherTutorials,
    //pix1DLocalizedChallenges, otherLocalizedChallenges,
    //pix1DTranslations, otherTranslations,
    //tags, missions,
  };
}

function escape(str) {
  return (str + '').replace(/[\\"']/g, '\\$&').replace(/\n/g, '\\n');
}

function hasValueForField(object, field) {
  return !_.isNil(object[field]);
}

function _dumpFrameworks(pix1DFramework, otherFrameworks) {
  return `
  const pix1DFrameworkRecords = await airtableClient('Referentiel').create([
    ${_dumpFramework(pix1DFramework, FIELDS_FRAMEWORK_WRITE)}
  ]);
  const otherFrameworkRecords = await airtableClient('Referentiel').create([
    ${otherFrameworks.map((framework) => _dumpFramework(framework, FIELDS_FRAMEWORK_WRITE)).join('\n')}
  ]);
  `;
}

function _dumpFramework(framework, fields) {
  return `{
    fields: {
      ${fields
    .filter((field) => hasValueForField(framework, field))
    .map((field) => `"${field}": "${escape(framework[field])}",`).join('\n')}
    },
  },`;
}

function _dumpAreas(pix1DAreas, otherAreas) {
  return `
  const pix1DFrameworkId = pix1DFrameworkRecords[0].getId();
  const pix1DAreaRecords = await airtableClient('Domaines').create([
    ${pix1DAreas.map((area) => _dumpArea(area, 'pix1DFrameworkId', FIELDS_AREA_WRITE)).join('\n')}
  ]);
  const otherFrameworkIdByName = Object.fromEntries(otherFrameworkRecords.map((record) => [record.get('Nom'), record.getId()]));
  const otherAreaRecords = await airtableClient('Domaines').create([
    ${otherAreas.map((area) => _dumpArea(area, `otherFrameworkIdByName["${area.framework_name}"]`, FIELDS_AREA_WRITE)).join('\n')}
  ]);
  `;
}

function _dumpArea(area, frameworkId, fields) {
  return `{
    fields: {
      ${fields
    .filter((field) => hasValueForField(area, field))
    .map((field) => `"${field}": "${escape(area[field])}",`).join('\n')}
      "Referentiel": [${frameworkId}],
    },
  },`;
}

function _dumpCompetences(pix1DCompetences, otherCompetences) {
  return `
  const pix1DAreaIdByPersistant = Object.fromEntries(pix1DAreaRecords.map((record) => [record.get('id persistant'), record.getId()]));
  const pix1DCompetenceRecords = await airtableClient('Competences').create([
    ${pix1DCompetences.map((competence) => _dumpCompetence(competence, `pix1DAreaIdByPersistant["${competence['Domaine (id persistant)'][0]}"]`, FIELDS_COMPETENCE_WRITE)).join('\n')}
  ]);
  const otherAreaIdByPersistant = Object.fromEntries(otherAreaRecords.map((record) => [record.get('id persistant'), record.getId()]));
  const otherCompetenceRecords = await airtableClient('Competences').create([
    ${otherCompetences.map((competence) => _dumpCompetence(competence, `otherAreaIdByPersistant["${competence['Domaine (id persistant)'][0]}"]`, FIELDS_COMPETENCE_WRITE)).join('\n')}
  ]);
  `;
}

function _dumpCompetence(competence, areaId, fields) {
  return `{
    fields: {
      ${fields
    .filter((field) => hasValueForField(competence, field))
    .map((field) => `"${field}": "${escape(competence[field])}",`).join('\n')}
      "Domaine": [${areaId}],
    },
  },`;
}

function _dumpThematics(pix1DThematics, otherThematics) {
  return `
  const pix1DCompetenceIdByPersistant = Object.fromEntries(pix1DCompetenceRecords.map((record) => [record.get('id persistant'), record.getId()]));
  const pix1DThematicRecords = await airtableClient('Thematiques').create([
    ${pix1DThematics.map((thematic) => _dumpThematic(thematic, `pix1DCompetenceIdByPersistant["${thematic['Competence (id persistant)'][0]}"]`, FIELDS_THEMATIC_WRITE)).join('\n')}
  ]);
  const otherCompetenceIdByPersistant = Object.fromEntries(otherCompetenceRecords.map((record) => [record.get('id persistant'), record.getId()]));
  const otherThematicRecords = await airtableClient('Thematiques').create([
    ${otherThematics.map((thematic) => _dumpThematic(thematic, `otherCompetenceIdByPersistant["${thematic['Competence (id persistant)'][0]}"]`, FIELDS_THEMATIC_WRITE)).join('\n')}
  ]);
  `;
}

function _dumpThematic(thematic, competenceId, fields) {
  return `{
    fields: {
      ${fields
    .filter((field) => hasValueForField(thematic, field))
    .map((field) => `"${field}": "${escape(thematic[field])}",`).join('\n')}
      "Competence": [${competenceId}],
    },
  },`;
}

function _dumpTubes(pix1DTubes, otherTubes) {
  const pix1D = pix1DTubes.length > 0 ? `
  const pix1DThematicIdByPersistant = Object.fromEntries(pix1DThematicRecords.map((record) => [record.get('id persistant'), record.getId()]));
  const pix1DTubeRecords = await airtableClient('Tubes').create([
    ${pix1DTubes.map((tube) => _dumpTube(tube, `pix1DThematicIdByPersistant["${tube['Thematique (id persistant)']?.[0]}"]`, FIELDS_TUBE_WRITE)).join('\n')}
  ]);` : '';
  return pix1D +
  `const otherThematicIdByPersistant = Object.fromEntries(otherThematicRecords.map((record) => [record.get('id persistant'), record.getId()]));
  const otherTubeRecords = await airtableClient('Tubes').create([
    ${otherTubes.map((tube) => _dumpTube(tube, `otherThematicIdByPersistant["${tube['Thematique (id persistant)']?.[0]}"]`, FIELDS_TUBE_WRITE)).join('\n')}
  ]);
  `;
}

function _dumpTube(tube, thematicId, fields) {
  return `{
    fields: {
      ${fields
    .filter((field) => hasValueForField(tube, field))
    .map((field) => `"${field}": "${escape(tube[field])}",`).join('\n')}
      "Thematique": [${thematicId}],
    },
  },`;
}

function _dumpSkills(pix1DSkills, otherSkills) {
  const pix1D = pix1DSkills.length > 0 ? `
  const pix1DTubeIdByPersistant = Object.fromEntries(pix1DTubeRecords.map((record) => [record.get('id persistant'), record.getId()]));
  const pix1DSkillRecords = await airtableClient('Acquis').create([
    ${pix1DSkills.map((skill) => _dumpSkill(skill, `pix1DTubeIdByPersistant["${skill['Tube (id persistant)']?.[0]}"]`, FIELDS_SKILL_WRITE)).join('\n')}
  ]);` : '';
  return pix1D + `
  const otherTubeIdByPersistant = Object.fromEntries(otherTubeRecords.map((record) => [record.get('id persistant'), record.getId()]));
  const otherSkillRecords = await airtableClient('Acquis').create([
    ${otherSkills.map((skill) => _dumpSkill(skill, `otherTubeIdByPersistant["${skill['Tube (id persistant)']?.[0]}"]`, FIELDS_SKILL_WRITE)).join('\n')}
  ]);
  `;
}

function _dumpSkill(skill, tubeId, fields) {
  return `{
    fields: {
      ${fields
    .filter((field) => hasValueForField(skill, field))
    .map((field) => `"${field}": "${escape(skill[field])}",`).join('\n')}
      "Tube": [${tubeId}],
    },
  },`;
}

function _dumpLearningContentForSeeding({
  pix1DFramework, otherFrameworks,
  pix1DAreas, otherAreas,
  pix1DCompetences, otherCompetences,
  pix1DThematics, otherThematics,
  pix1DTubes, otherTubes,
  pix1DSkills, otherSkills,
  pix1DChallenges, otherChallenges,
  pix1DAttachments, otherAttachments,
  pix1DTutorials, otherTutorials,
  pix1DLocalizedChallenges, otherLocalizedChallenges,
  pix1DTranslations, otherTranslations,
  tags, missions,
}) {
  const createFrameworksStr = _dumpFrameworks(pix1DFramework, otherFrameworks);
  const createAreasStr = _dumpAreas(pix1DAreas, otherAreas);
  const createCompetencesStr = _dumpCompetences(pix1DCompetences, otherCompetences);
  const createThematicsStr = _dumpThematics(pix1DThematics, otherThematics);
  const createTubesStr = _dumpTubes(pix1DTubes, otherTubes);
  const createSkillsStr = _dumpSkills(pix1DSkills, otherSkills);
  return [createFrameworksStr, createAreasStr, createCompetencesStr, createThematicsStr, createTubesStr, createSkillsStr].join('\n');
}

export async function pluckAndDumpLearningContent(airtableClient) {
  const {
    pix1DFramework, otherFrameworks,
    pix1DAreas, otherAreas,
    pix1DCompetences, otherCompetences,
    pix1DThematics, otherThematics,
    pix1DTubes, otherTubes,
    pix1DSkills, otherSkills,
    pix1DChallenges, otherChallenges,
    pix1DAttachments, otherAttachments,
    pix1DTutorials, otherTutorials,
    pix1DLocalizedChallenges, otherLocalizedChallenges,
    pix1DTranslations, otherTranslations,
    tags, missions,
  } = await _pluckLearningContent(airtableClient);
  const dumpStr = _dumpLearningContentForSeeding({
    pix1DFramework, otherFrameworks,
    pix1DAreas, otherAreas,
    pix1DCompetences, otherCompetences,
    pix1DThematics, otherThematics,
    pix1DTubes, otherTubes,
    pix1DSkills, otherSkills,
    pix1DChallenges, otherChallenges,
    pix1DAttachments, otherAttachments,
    pix1DTutorials, otherTutorials,
    pix1DLocalizedChallenges, otherLocalizedChallenges,
    pix1DTranslations, otherTranslations,
    tags, missions,
  });
  console.log(dumpStr);
}

async function test(airtableClient) {
  const pix1DFrameworkRecords = await airtableClient('Referentiel').create([
    {
      fields: {
        'Nom': 'Pix 1D',
      }
    }
  ]);
  const pix1DFrameworkId = records[0].getId();
  const otherFrameworkRecords = await airtableClient('Referentiel').create([
    {
      fields: {
        'Nom': 'Pix',
      }
    },
    {
      fields: {
        'Nom': 'Droit',
      }
    }
  ]);
  const otherFrameworkIds = records.map((record) => record.getId());

}

async function main() {
  const startTime = performance.now();
  logger.info(`Script ${__filename} has started`);
  const {
    AIRTABLE_API_KEY: airtableApiKey,
    AIRTABLE_BASE: airtableBase,
  } = process.env;
  const airtableClient = new Airtable({ apiKey: airtableApiKey }).base(airtableBase);
  await pluckAndDumpLearningContent(airtableClient);
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  logger.info(`Script has ended: took ${duration} milliseconds`);
}

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

if (isLaunchedFromCommandLine) {
  main().catch((error) => {
    logger.error(error);
    process.exitCode = 1;
  }).finally(async () => {
    await disconnect();
  });
}
