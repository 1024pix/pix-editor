import {
  areaDatasource,
  challengeDatasource,
  competenceDatasource,
  frameworkDatasource,
} from '../../../lib/infrastructure/datasources/airtable/index.js';
import {
  pickNRandomValuesInObj,
  pickRandomBoolean,
  pickRandomValueInArr,
  pickRandomValueInObj,
  saveInAirtable
} from './utils.js';
import { Challenge, LocalizedChallenge, Mission } from '../../../lib/domain/models/index.js';
import { fields } from '../../../lib/infrastructure/translations/challenge.js';

export async function buildPix1D({ airtableClient, databaseBuilder, logger, locales }) {
  logger.info('About to create whole framework Pix 1D...');
  const pix1DFrameworkData = {
    name: 'Pix 1D',
  };
  const airtableFramework = frameworkDatasource.toAirTableObject(pix1DFrameworkData);
  const [frameworkRecord] = await saveInAirtable({ tableName: 'Referentiel', data: [airtableFramework], logger, airtableClient });
  pix1DFrameworkData.id = frameworkRecord.id;

  const area1Data = buildArea({ i: 1, frameworkId: pix1DFrameworkData.id, databaseBuilder, locales });
  const area2Data = buildArea({ i: 2, frameworkId: pix1DFrameworkData.id, databaseBuilder, locales });
  const airtableArea1 = areaDatasource.toAirTableObject(area1Data);
  const airtableArea2 = areaDatasource.toAirTableObject(area2Data);
  const areaRecords = await saveInAirtable({ tableName: 'Domaines', data: [airtableArea1, airtableArea2], logger, airtableClient });
  [area1Data, area2Data].forEach((areaItem) => {
    areaItem.airtableId = areaRecords.shift().id;
  });

  const competenceItems = [];
  for (const configCompetence of [{ iCompetence: 1, iArea: 1, areaItem: area1Data }, { iCompetence: 2, iArea: 1, areaItem: area1Data }, { iCompetence: 1, iArea: 2, areaItem: area2Data }]) {
    const competenceItem = buildCompetence({ iCompetence: configCompetence.iCompetence, iArea: configCompetence.iArea, areaItem: configCompetence.areaItem, databaseBuilder, locales });
    competenceItems.push(competenceItem);
  }
  const airtableCompetenceItems = competenceItems.map(competenceDatasource.toAirTableObject);
  const competenceRecords = await saveInAirtable({ tableName: 'Competences', data: airtableCompetenceItems, logger, airtableClient });
  competenceItems.forEach((competenceItem) => {
    competenceItem.airtableId = competenceRecords.shift().id;
  });
  const thematicItems = [];
  const workbenchThematicItems = [];
  for (const competenceItem of competenceItems) {
    for (let i = 0; i < 3; ++i) {
      const thematicItem = buildThematic({ iThematic: i, competenceItem, databaseBuilder, locales });
      thematicItem.isLastThematic = i === 2;
      thematicItems.push(thematicItem);
    }
    workbenchThematicItems.push(buildWorkbenchThematic({ competenceItem, databaseBuilder, locales }));
  }
  const airtableThematicItems = [...thematicItems, ...workbenchThematicItems].map(thematicToAirtableObject);
  const thematicRecords = await saveInAirtable({ tableName: 'Thematiques', data: airtableThematicItems, logger, airtableClient });
  [...thematicItems, ...workbenchThematicItems].forEach((thematicItem) => {
    thematicItem.airtableId = thematicRecords.shift().id;
  });

  const tubeNames = ['crapaud', 'écureuil', 'mangouste', 'souris', 'éléphant', 'renard', 'kangourou', 'lion', 'girafe', 'bison', 'buffle', 'gazelle', 'perroquet', 'rhinocéros','zèbre', 'castor', 'hamster', 'escargot', 'lézard', 'serpent', 'cheval'];
  const tubeItems = [];
  const workbenchTubeItems = [];
  for (const thematicItem of thematicItems) {
    if (thematicItem.isLastThematic) {
      const tubeDe = buildTube({ iTube: 0, tubeName: `${tubeNames.pop()}_de`, thematicItem, databaseBuilder, locales });
      tubeItems.push(tubeDe);
    } else {
      const tubeEn = buildTube({ iTube: 0, tubeName: `${tubeNames.pop()}_en`, thematicItem, databaseBuilder, locales });
      const tubeDi = buildTube({ iTube: 1, tubeName: `${tubeNames.pop()}_di`, thematicItem, databaseBuilder, locales });
      const tubeVa = buildTube({ iTube: 2, tubeName: `${tubeNames.pop()}_va`, thematicItem, databaseBuilder, locales });
      tubeItems.push(tubeEn);
      tubeItems.push(tubeDi);
      tubeItems.push(tubeVa);
    }
  }
  for (const workbenchThematicItem of workbenchThematicItems) {
    workbenchTubeItems.push(buildWorkbenchTube({ thematicItem: workbenchThematicItem, databaseBuilder, locales }));
  }
  const airtableTubeItems = [...tubeItems, ...workbenchTubeItems].map(tubeToAirtableObject);
  const tubeRecords = await saveInAirtable({ tableName: 'Tubes', data: airtableTubeItems, logger, airtableClient });
  [...tubeItems, ...workbenchTubeItems].forEach((tubeItem) => {
    tubeItem.airtableId = tubeRecords.shift().id;
  });

  const skillItems = [];
  const workbenchSkillItems = [];
  for (const tubeItem of tubeItems) {
    const skillItem1 = buildSkill({ iSkill: 0, tubeItem });
    const skillItem2 = buildSkill({ iSkill: 1, tubeItem });
    skillItems.push(skillItem1);
    skillItems.push(skillItem2);
  }
  for (const workbenchTubeItem of workbenchTubeItems) {
    workbenchSkillItems.push(buildWorkbenchSkill({ tubeItem: workbenchTubeItem }));
  }
  const airtableSkillItems = [...skillItems, ...workbenchSkillItems].map(skillToAirtableObject);
  const skillRecords = await saveInAirtable({ tableName: 'Acquis', data: airtableSkillItems, logger, airtableClient });
  [...skillItems, ...workbenchSkillItems].forEach((skillItem) => {
    skillItem.airtableId = skillRecords.shift().id;
  });

  const challengeItems = [];
  for (const skillItem of skillItems) {
    challengeItems.push(buildActiveProto({ skillItem, databaseBuilder, locales }));
  }
  const airtableChallengeItems = challengeItems.map(challengeDatasource.toAirTableObject);
  await saveInAirtable({ tableName: 'Epreuves', data: airtableChallengeItems, logger, airtableClient });

  let iCompetence = 0;
  let iThematic = 0;
  for (const missionStatus of [Mission.status.VALIDATED, Mission.status.INACTIVE, Mission.status.EXPERIMENTAL]) {
    const competenceItem = competenceItems[iCompetence];
    const [thematicItem1, thematicItem2, thematicItem3] = thematicItems.slice(iThematic, 3 + iThematic);
    databaseBuilder.factory.buildMission({
      name: `Mission test au statut ${missionStatus}`,
      cardImageUrl: `https://example.net/image_for_${missionStatus}.png`,
      competenceId: competenceItem.id,
      learningObjectives: `Learning objectif pour ${missionStatus}`,
      thematicIds: [thematicItem1.id, thematicItem2.id, thematicItem3.id].join(','),
      validatedObjectives: `- Ca pour ${missionStatus}
 Et puis ça pour ${missionStatus}`,
      status: missionStatus,
      createdAt: new Date('2023-12-17'),
    });
    ++iCompetence;
    iThematic += 3;
  }
  logger.info('Done !');
}

function buildArea({ i, frameworkId, databaseBuilder, locales }) {
  const areaId = `areaPix1DA${i}`;
  const areaTitle = `areaPix1DA${i} title`;
  locales.forEach((locale) => databaseBuilder.factory.buildTranslation(
    {
      locale,
      key: `area.${areaId}.title`,
      value: `${areaTitle} ${locale}`,
    }
  ));
  return {
    id: areaId,
    code: `${i}`,
    frameworkId,
    title: areaTitle,
  };
}

function buildCompetence({ iCompetence, iArea, areaItem, databaseBuilder, locales }) {
  const competenceId = `competencePix1DA${iArea}C${iCompetence}`;
  const competenceName = `${competenceId} name`;
  const competenceDescription = `${competenceId} description`;
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `competence.${competenceId}.name`,
        value: `${competenceName} ${locale}`,
      }
    );
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `competence.${competenceId}.description`,
        value: `${competenceDescription} ${locale}`,
      }
    );
  });
  return {
    id: competenceId,
    index: `${iArea}.${iCompetence}`,
    areaAirtableId: areaItem.airtableId,
    areaId: areaItem.id,
    name: competenceName,
    description: competenceDescription,
  };
}

function buildThematic({ iThematic, competenceItem, databaseBuilder, locales }) {
  const partId = competenceItem.id.split('competence')[1];
  const thematicId = `thematic${partId}Th${iThematic}`;
  const thematicName = `${thematicId} name`;
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `thematic.${thematicId}.name`,
        value: `${thematicName} ${locale}`,
      }
    );
  });
  return {
    id: thematicId,
    index: iThematic,
    competenceAirtableId: competenceItem.airtableId,
    name: thematicName,
  };
}

function buildWorkbenchThematic({ competenceItem, databaseBuilder, locales }) {
  const partId = competenceItem.id.split('competence')[1];
  const [iArea, iCompetence] = competenceItem.index.split('.');
  const thematicWorkbenchId = `thematic${partId}ThW`;
  const thematicWorkbenchName = `workbench_Pix1D_${iArea}_${iCompetence}`;
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `thematic.${thematicWorkbenchId}.name`,
        value: `${thematicWorkbenchName} ${locale}`,
      }
    );
  });
  return {
    id: thematicWorkbenchId,
    index: 0,
    competenceAirtableId: competenceItem.airtableId,
    name: thematicWorkbenchName,
  };
}

function buildTube({ iTube, tubeName, thematicItem, databaseBuilder, locales }) {
  const partId = thematicItem.id.split('thematic')[1];
  const tubeId = `tube${partId}Tu${iTube}`;
  const tubePracticalDescription = `${tubeId} practicalDescription`;
  const tubePracticalTitle = `${tubeId} practicalTitle`;
  const tubeItem = {
    id: tubeId,
    index: iTube,
    name: tubeName,
    competenceAirtableId: thematicItem.competenceAirtableId,
    thematicAirtableId: thematicItem.airtableId,
    practicalDescription: tubePracticalDescription,
    practicalTitle: tubePracticalTitle,
  };
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `tube.${tubeItem.id}.practicalTitle`,
        value: `${tubeItem.practicalTitle} ${locale}`,
      }
    );
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `tube.${tubeItem.id}.practicalDescription`,
        value: `${tubeItem.practicalDescription} ${locale}`,
      }
    );
  });

  return tubeItem;
}

function buildWorkbenchTube({ thematicItem, databaseBuilder, locales }) {
  const partId = thematicItem.id.split('thematic')[1];
  const tubeWorkbenchId = `tube${partId}TuW`;
  const tubeWorkbenchName = '@workbench';
  const tubeWorkbenchPracticalDescription = `${tubeWorkbenchId} practicalDescription`;
  const tubeWorkbenchPracticalTitle = `${tubeWorkbenchId} practicalTitle`;

  const tubeWorkbenchItem = {
    id: tubeWorkbenchId,
    index: null,
    name: tubeWorkbenchName,
    competenceAirtableId: thematicItem.competenceAirtableId,
    thematicAirtableId: thematicItem.airtableId,
    practicalDescription: tubeWorkbenchPracticalDescription,
    practicalTitle: tubeWorkbenchPracticalTitle,
  };

  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `tube.${tubeWorkbenchItem.id}.practicalTitle`,
        value: `${tubeWorkbenchItem.practicalTitle} ${locale}`,
      }
    );
    databaseBuilder.factory.buildTranslation(
      {
        locale,
        key: `tube.${tubeWorkbenchItem.id}.practicalDescription`,
        value: `${tubeWorkbenchItem.practicalDescription} ${locale}`,
      }
    );
  });
  return tubeWorkbenchItem;
}

function buildSkill({ iSkill, tubeItem }) {
  const partId = tubeItem.id.split('tube')[1];
  const skillId =  `skill${partId}S${iSkill}`;
  return {
    id: skillId,
    level: iSkill + 1,
    hintStatus: 'à retravailler',
    description: `${skillId} description`,
    status: 'actif',
    internationalisation: 'Monde',
    version: 1,
    tubeAirtableId: tubeItem.airtableId,
  };
}

function buildWorkbenchSkill({ tubeItem }) {
  const partId = tubeItem.id.split('tube')[1];
  const skillWorkbenchId = `skill${partId}SW`;

  return {
    id: skillWorkbenchId,
    level: null,
    hintStatus:null,
    description: 'Acquis workbench',
    status: 'en construction',
    internationalisation: null,
    version: null,
    tubeAirtableId: tubeItem.airtableId,
  };
}

function buildActiveProto({ skillItem, databaseBuilder, locales }) {
  const challengeId = `challenge${skillItem.id.split('skill')[1]}Ch`;
  const challengeProto = {
    id: challengeId,
    accessibility1: pickRandomValueInObj(Challenge.ACCESSIBILITY1),
    accessibility2: pickRandomValueInObj(Challenge.ACCESSIBILITY2),
    alpha: pickRandomValueInArr([...Array(5).keys(), null]),
    author: ['DEV'],
    autoReply: pickRandomBoolean(),
    contextualizedFields: pickNRandomValuesInObj(Challenge.CONTEXTUALIZED_FIELDS, 2),
    declinable: pickRandomValueInObj(Challenge.DECLINABLES),
    delta: pickRandomValueInArr([...Array(5).keys(), null]),
    files: [],
    focusable: pickRandomBoolean(),
    format: pickRandomValueInObj(Challenge.FORMATS),
    geography: 'Monde',
    pedagogy: pickRandomValueInObj(Challenge.PEDAGOGIES),
    responsive: pickRandomValueInObj(Challenge.RESPONSIVES),
    shuffled: pickRandomBoolean(),
    spoil: pickRandomValueInObj(Challenge.SPOILS),
    t1Status: pickRandomBoolean(),
    t2Status: pickRandomBoolean(),
    t3Status: pickRandomBoolean(),
    timer: pickRandomValueInArr([30, 120, 180, null]),
    type: pickRandomValueInObj(Challenge.TYPES),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-03-03'),
    validatedAt: new Date('2023-03-03'),
    archivedAt: null,
    madeObsoleteAt: null,
    status: Challenge.STATUSES.VALIDE,
    skills: [skillItem.airtableId],
    skillId: skillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.PROTOTYPE,
    version: skillItem.version,
    alternativeVersion: null,
  };
  databaseBuilder.factory.buildLocalizedChallenge({
    id: challengeProto.id,
    challengeId: challengeProto.id,
    locale: challengeProto.locales[0],
    status: null,
    embedUrl: null,
    requireGafamWebsiteAccess: pickRandomBoolean(),
    isIncompatibleIpadCertif: pickRandomBoolean(),
    isAwarenessChallenge: pickRandomBoolean(),
    toRephrase: pickRandomBoolean(),
    deafAndHardOfHearing: pickRandomValueInObj(LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES),
    geography: 'VN',
    urlsToConsult: null,
  });
  for (const translatableField of fields) {
    databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeProto.id}.${translatableField}`,
      locale: challengeProto.locales[0],
      value: `value ${challengeProto.locales[0]} for ${translatableField}`,
    });
  }

  return challengeProto;
}

function thematicToAirtableObject(item) {
  return {
    fields: {
      'id persistant': item.id,
      'Index': item.index,
      Competence: [item.competenceAirtableId],
    }
  };
}

function tubeToAirtableObject(item) {
  return {
    fields: {
      'id persistant': item.id,
      'Index': item.index,
      'Nom': item.name,
      Competences: [item.competenceAirtableId],
      Thematique: [item.thematicAirtableId],
    }
  };
}

function skillToAirtableObject(item) {
  return {
    fields: {
      'id persistant': item.id,
      'Statut de l\'indice': item.hintStatus,
      'Comprendre': [],
      'En savoir plus': [],
      'Status': item.status,
      'Tube': [item.tubeAirtableId],
      'Description': item.description,
      'Level': item.level,
      'Internationalisation': item.internationalisation,
      'Version': item.version,
    }
  };
}
