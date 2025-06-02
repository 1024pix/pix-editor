import basex from 'base-x';
import { applyEmberDataSerializers, discoverEmberDataModels } from 'ember-cli-mirage';
import { getDsModels, getDsSerializers } from 'ember-cli-mirage/ember-data';
import random from 'js-crypto-random';
import slice from 'lodash/slice';
import { createServer, Response } from 'miragejs';

export default function makeServer(config) {
  const finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(config.store), ...config.models },
    serializers: applyEmberDataSerializers(config.serializers),
    routes,
  };

  return createServer(finalConfig);
}

function routes() {

  this.namespace = 'api';

  this.get('/users/me', ({ users }) => users.first());
  this.get('/config', ({ configs }) => configs.first());

  this.get('/competences/:id/overviews/challenges-production', (schema, request) => {
    let id = `${request.params.id}:challenges-production`;
    if (request.queryParams.locale) {
      id += `:${request.queryParams.locale}`;
    }
    const competenceOverview = schema.competenceOverviews
      .where((competenceOverview) => competenceOverview.id === id)
      .models[0];
    if (!competenceOverview) return;
    return schema.competenceOverviews.find(competenceOverview.id);
  });

  this.get('/competences/:id/overviews/challenges-workbench', (schema, request) => {
    const competenceOverview = schema.competenceOverviews
      .where((competenceOverview) => competenceOverview.id === `${request.params.id}:challenges-workbench`)
      .models[0];
    if (!competenceOverview) return;
    return schema.competenceOverviews.find(competenceOverview.id);
  });

  this.get('/skills/:pixId/challenges-production', (schema, request) => {
    const pixId = request.params.pixId;
    const skill = schema.skills.findBy({ pixId });
    return skill.challengesProduction;
  });

  this.get('/skills/:pixId/localized-challenges-production', (schema, request) => {
    const pixId = request.params.pixId;
    const skill = schema.skills.findBy({ pixId });
    return skill.localizedChallengesProduction;
  });

  this.get('/frameworks');
  this.post('/frameworks');

  this.get('/areas');
  this.post('/areas');

  this.get('/attachments', function(schema, request) {
    const {
      'filter[localizedChallengeId]': localizedChallengeId,
    } = request.queryParams;
    return schema.attachments.all().filter((attachment) => [localizedChallengeId].includes(attachment.localizedChallengeId));
  });
  this.get('/attachments/:id');
  this.post('/attachments');
  this.patch('/attachments/:id');
  this.delete('/attachments/:id');

  this.get('/competences');
  this.get('/competences/:id');
  this.patch('/competences/:id');
  this.post('/competences', function(schema) {
    const competence = this.normalizedRequestAttrs();
    const area = schema.areas.find(competence.areaId);
    const areaCompetences = schema.competences.where({ areaId: competence.areaId });

    competence.pixId = newId('competence');
    competence.code = `${area.code}.${areaCompetences.length + 1}`;
    const createdCompetence = schema.competences.create(competence);

    const createdThematic = schema.themes.create({
      pixId: newId('thematic'),
      name: `workbench_${area.code}_${areaCompetences.length + 1}`,
      index: 0,
      competence: createdCompetence,
    });
    competence.rawThemes = [createdThematic];

    const createdTube = schema.tubes.create({
      pixId: newId('tube'),
      name: '@workbench',
      title: 'Tube pour l’atelier',
      competence: createdCompetence,
      theme: createdThematic,
    });

    createdCompetence.rawTubes = [createdTube];

    schema.skills.create({
      pixId: newId('skill'),
      name: '@workbench',
      tube: createdTube,
    });

    return createdCompetence;
  });

  this.get('/airtable/content/Thematiques/:id', (schema, request) => {
    const theme = schema.themes.find(request.params.id);
    return _serializeModel(theme, 'theme');
  });

  this.get('/airtable/content/Thematiques', (schema) => {
    const records = schema.themes.all().models.map((theme) => {
      return _serializeModel(theme, 'theme');
    });
    return { records };
  });

  this.post('/airtable/content/Thematiques', (schema, request) => {
    const themePayload = JSON.parse(request.requestBody);
    const theme = _deserializePayload(themePayload, 'theme');
    const createdTheme = schema.themes.create(theme);
    return _serializeModel(createdTheme, 'theme');
  });

  this.get('/airtable/content/Tubes/:id', (schema, request) => {
    const tube = schema.tubes.find(request.params.id);
    return _serializeModel(tube, 'tube');
  });

  this.get('/airtable/content/Tubes', (schema) => {
    const records = schema.tubes.all().models.map((tube) => {
      return _serializeModel(tube, 'tube');
    });
    return { records };
  });

  this.post('/airtable/content/Tubes', (schema, request) => {
    const tubePayload = JSON.parse(request.requestBody);
    const tube = _deserializePayload(tubePayload, 'tube');
    const createdTube = schema.tubes.create(tube);
    return _serializeModel(createdTube, 'tube');
  });

  this.patch('/skills/:id');

  this.get('/skills', (schema, request) => {
    const { 'filter[ids]': ids, 'filter[name]': name, 'filter[pixId]': pixId } = request.queryParams;
    if (ids) {
      return schema.skills.where((skill) => ids.includes(skill.id));
    }
    if (name) {
      return schema.skills.where({ name });
    }
    if (pixId) {
      return schema.skills.where({ pixId });
    }
    return [];
  });

  this.get('/skills/:id');

  this.post('/skills', (schema, request) => {
    const skillPayload = JSON.parse(request.requestBody);
    const tube = schema.tubes.find(skillPayload.data.relationships.tube.data.id);
    const createdSkill = schema.skills.create({
      ...skillPayload.data.attributes,
      id: 'newSkillId',
      pixId: 'newPixId',
      status: 'en construction',
      tubeId: skillPayload.data.relationships.tube.data.id,
      name: tube.name === '@workbench' ? '@workbench' : `${tube.name}${skillPayload.data.attributes.level}`,
      level: tube.name === '@workbench' ? undefined : skillPayload.data.attributes.level,
    });
    return createdSkill;
  });

  this.post('/skills/clone', function(schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    const level = attributes.level;
    const skillToClone = schema.skills.findBy({ pixId: attributes.skillIdToClone });
    const tubeDestination = schema.tubes.findBy({ pixId: attributes.tubeDestinationId });
    const createdSkill = schema.create('skill', {
      id: 'newSkillId',
      pixId: 'newPixId',
      tubeId: tubeDestination.id,
      level,
      status: 'en construction',
      name: `${tubeDestination.name}${level}`,
      tutoSolution: skillToClone.tutoSolution,
      tutoMore: skillToClone.tutoMore,
      challenges: skillToClone.challenges,
    });
    return createdSkill;
  });

  this.get('/airtable/content/Tutoriels', (schema) => {
    const records = schema.tutorials.all().models.map((note) => {
      return _serializeModel(note, 'tutorial');
    });
    return { records };
  });

  this.post('/airtable/content/Tutoriels', (schema, request) => {
    const tutorialPayload = JSON.parse(request.requestBody);
    const tutorial = _deserializePayload(tutorialPayload, 'tutorial');
    const createdTutorial = schema.tutorials.create(tutorial);
    createdTutorial.update({ tagIds: createdTutorial.tagsIds });

    if (createdTutorial.tagIds) {
      createdTutorial.tags = createdTutorial.tagIds.map((tag)=> {
        return schema.tags.find(tag);
      });
    }
    return _serializeModel(createdTutorial, 'tutorial');
  });

  this.get('/airtable/content/Tags', (schema) => {
    const records = schema.tags.all().models.map((note) => {
      return _serializeModel(note, 'tag');
    });
    return { records };
  });

  this.get('/airtable/content/Tags/:id', (schema, request) => {
    const tag = schema.tags.find(request.params.id);
    return _serializeModel(tag, 'tag');
  });

  this.get('/airtable/changelog/Notes', (schema) => {
    schema.notes.create();
    schema.notes.create();
    const records = schema.notes.all().models.map((note) => {
      return _serializeModel(note, 'note');
    });
    return { records };
  });

  this.post('/airtable/changelog/Notes', (schema, request) => {
    const notePayload = JSON.parse(request.requestBody);
    const note = _deserializePayload(notePayload, 'note');
    const createdNote = schema.notes.create(note);
    return _serializeModel(createdNote, 'note');
  });

  this.post('/file-storage-token', () => {
    return { token: 'token' };
  });

  this.get('/challenges', (schema, request) => {
    const ids = request.queryParams['filter[ids]'];
    const search = request.queryParams['filter[search]'];
    let records = null;
    if (ids) {
      records = schema.challenges.where((challenge) => ids.includes(challenge.id));
    } else if (search) {
      records = schema.challenges.where((challenge) => challenge.instruction.includes(search));
    } else {
      records = schema.challenges.all();
    }
    return records;
  });

  this.get('/challenges/:id', (schema, request) => {
    try {
      return schema.challenges.find(request.params.id);
    } catch {
      return new Response(404);
    }
  });

  this.get('/localized-challenges', (schema, request) => {
    const ids = request.queryParams['filter[ids]'];
    if (ids) {
      return schema.localizedChallenges.where((localizedChallenge) => ids.includes(localizedChallenge.id));
    }
    return schema.localizedChallenges.all();
  });

  this.get('/localized-challenges/:id', (schema, request) => {
    return schema.localizedChallenges.find(request.params.id);
  });

  this.patch('/localized-challenges/:id', (schema, request) => {
    const localizedChallenge = schema.localizedChallenges.find(request.params.id);
    const { status } = JSON.parse(request.requestBody);

    localizedChallenge.update({ status });

    return localizedChallenge;
  });

  this.post('/challenges', (schema, request) => {
    const challenge = JSON.parse(request.requestBody);
    const skillId = challenge.data.relationships.skill.data.id;
    const skill = schema.skills.find(skillId);
    challenge.updatedAt = new Date();

    const createdChallenge = schema.challenges.create(challenge);
    createdChallenge.skill = skill;

    skill.challengeIds = [...skill.challengeIds, createdChallenge.id];
    skill.save();
    return createdChallenge;
  });

  this.patch('/challenges/:id', (schema, request) => {
    const challenge = schema.challenges.find(request.params.id);
    const body = JSON.parse(request.requestBody);
    const skillId = body.data.relationships.skill.data.id;
    const skill = schema.skills.find(skillId);
    const attachments = body.data.relationships.attachments.data.map(({ id }) => {
      return schema.attachments.find(id);
    });
    challenge.update({
      ...body.data.attributes,
      skill,
      attachments,
    });

    return challenge;
  });

  //TODO extraire le contenu des configs liées aux missions dans un fichier dédié
  this.get('/missions', function(schema, request) {
    const queryParams = request.queryParams;
    const {
      'filter[statuses]': statuses,
    } = queryParams;
    let allmissionSummaries;
    if (statuses) {
      allmissionSummaries = schema.missionSummaries.where((mission) => statuses.includes(mission.status)).models;
    } else {
      allmissionSummaries = schema.missionSummaries.all().models;
    }
    const rowCount = allmissionSummaries.length;
    const pagination = _getPaginationFromQueryParams(queryParams);
    const paginatedMissions = _applyPagination(allmissionSummaries, pagination);

    const json = this.serialize({ modelName: 'mission-summary', models: paginatedMissions }, 'mission-summary');
    json.meta = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      rowCount,
      pageCount: Math.ceil(rowCount / pagination.pageSize),
    };
    return json;
  });

  this.post('/missions', function(schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    const mission = schema.create('mission', { ...attributes });
    schema.create('mission-summary', { id: mission.id, ...attributes });
    return mission;
  });

  this.get('/missions/:id', function(schema, request) {
    const id = request.params.id;
    const mission = schema.missions.find(id);
    if (mission) return mission;
    return schema.create('mission', {
      id,
      name: 'Mission impossible',
      competenceId: 'recCompetence1.1',
      thematicId: null,
      status: 'ACTIVE',
      learningObjectives: null,
      validatedObjectives: null,
    });
  });

  this.patch('/missions/:id', function(schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    if (attributes.name === 'will trigger error') {
      return new Response(400, {}, {
        errors: [{
          status: '400',
          title: 'Bad Request',
          detail: 'La mission ne peut pas être mise à jour car les épreuves X, Y ne sont pas au statut VALIDE.',
        }],
      });
    }
    const id = request.params.id;
    const mission = schema.missions.find(id);
    mission.update({ ...attributes });
    schema.create('mission-summary', { ...attributes, id });
    return mission;
  });

  this.get('/static-course-summaries', function(schema, request) {
    const queryParams = request.queryParams;
    const {
      'filter[isActive]': isActiveFilter,
      'filter[name]': nameFilter,
      'filter[tagIds]': tagFilter,
    } = queryParams;
    let allStaticCourseSummaries;
    if (isActiveFilter === '') {
      allStaticCourseSummaries = schema.staticCourseSummaries.all().models;
    } else {
      const isActive = isActiveFilter === 'true';
      allStaticCourseSummaries = schema.staticCourseSummaries.where({ isActive }).models;
    }
    if (nameFilter.length > 0) {
      allStaticCourseSummaries = allStaticCourseSummaries.filter((staticCourse) => {
        const staticCourseName = staticCourse.name.toLowerCase();
        return staticCourseName.includes(nameFilter.toLowerCase());
      });
    }

    if (tagFilter?.length > 0) {
      allStaticCourseSummaries = allStaticCourseSummaries.filter((staticCourse) => {
        return staticCourse.tagIds.some((tagId) => {
          return tagFilter.includes(tagId);
        });
      });
    }
    const rowCount = allStaticCourseSummaries.length;

    const pagination = _getPaginationFromQueryParams(queryParams);
    const paginatedStaticCourseSummaries = _applyPagination(allStaticCourseSummaries, pagination);

    const json = this.serialize({ modelName: 'static-course-summary', models: paginatedStaticCourseSummaries }, 'static-course-summary');
    json.meta = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      rowCount,
      pageCount: Math.ceil(rowCount / pagination.pageSize),
    };
    return json;
  });

  this.get('/static-courses/:id');

  this.get('/static-course-tags');

  this.post('/static-courses', function(schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    const tagIds = attributes['tag-ids'];
    const tags = schema.staticCourseTags.all().models.filter(({ id }) => tagIds.includes(id));
    return schema.create('static-course', {
      id: 'newStaticCourseId',
      name: attributes.name,
      description: attributes.description,
      challengeSummaryIds: attributes['challenge-ids'],
      tags,
    });
  });

  this.put('/static-courses/:id', function(schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    const tagIds = attributes['tag-ids'];
    const tags = schema.staticCourseTags.all().models.filter(({ id }) => tagIds.includes(id));
    const staticCourse = schema.staticCourses.find(request.params.id);
    staticCourse.update({
      name: attributes.name,
      description: attributes.description,
      challengeSummaryIds: attributes['challenge-ids'],
      tags,
    });
    return staticCourse;
  });

  this.put('/static-courses/:id/deactivate', function(schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    const staticCourse = schema.staticCourses.find(request.params.id);
    staticCourse.update({
      isActive: false,
      deactivationReason: attributes.reason,
    });
    return staticCourse;
  });

  this.put('/static-courses/:id/reactivate', function(schema, request) {
    const staticCourse = schema.staticCourses.find(request.params.id);
    staticCourse.update({
      isActive: true,
      deactivationReason: '',
    });
    return staticCourse;
  });

  this.get('/whitelisted-urls');
  this.delete('/whitelisted-urls/:id');
  this.patch('/whitelisted-urls/:id', function(schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    const whitelistedUrl = schema.whitelistedUrls.find(request.params.id);
    whitelistedUrl.update({
      url: attributes.url,
      relatedSkillNames: attributes['related-skill-names'],
      checkType: attributes['check-type'],
      comment: attributes.comment,
      creatorName: 'TEST USER',
      createdAt: new Date().toISOString(),
      latestUpdatorName: 'TEST USER',
      updatedAt: new Date().toISOString(),
    });
    return whitelistedUrl;
  });
  this.post('/whitelisted-urls', function(schema, request) {
    const whitelistedUrl = JSON.parse(request.requestBody).data.attributes;
    return schema.create('whitelisted-url', {
      url: whitelistedUrl.url,
      relatedSkillNames: whitelistedUrl['related-skill-names'],
      checkType: whitelistedUrl['check-type'],
      comment: whitelistedUrl.comment,
      creatorName: 'TEST USER',
      createdAt: new Date().toISOString(),
      latestUpdatorName: 'TEST USER',
      updatedAt: new Date().toISOString(),
    });
  });

  this.post('/phrase/download', function() {
    return { ok: 'cool' };
  });
}

function _serializeModel(instance, modelName) {
  const serializer = new (getDsSerializers()[modelName]);
  const payload = { id: instance.id, fields: { [serializer.primaryKey]: instance.id } };
  const model = new getDsModels();
  const relationships = model[modelName].relationships;

  for (const [key, value] of Object.entries(serializer.attrs)) {
    payload.fields[value] = instance[key];
  }
  relationships.forEach((allRelationships) => {
    allRelationships.forEach((relationship) => {
      const relationshipSerializedKey = serializer.attrs[relationship.key];
      if (relationship.kind === 'hasMany') {
        payload.fields[relationshipSerializedKey] = instance.attrs[`${relationship.name.slice(0, -1)}Ids`];
      }
      if (relationship.kind === 'belongsTo') {
        payload.fields[relationshipSerializedKey] = instance.attrs[`${relationship.name}Id`];
      }
    });
  });
  return payload;
}

function _deserializePayload(payload, modelName) {
  const serializer = new (getDsSerializers()[modelName]);
  for (const [key, value] of Object.entries(serializer.attrs)) {
    const payloadValue = payload.fields[value];
    if (payloadValue && Array.isArray(payloadValue) && key[key.length - 1] !== 's') {
      payload[key + 'Id'] = payloadValue[0];
    } else if (payloadValue && Array.isArray(payloadValue)) {
      payload[key + 'Ids'] = payloadValue;
    } else if (payloadValue) {
      payload[key] = payloadValue;
    }
  }
  payload.id = payload.fields[serializer.primaryKey];
  return payload;
}

function _getPaginationFromQueryParams(queryParams) {
  return {
    pageSize: parseInt(queryParams['page[size]']) || 10,
    page: parseInt(queryParams['page[number]']) || 1,
  };
}

function _applyPagination(data, { page, pageSize }) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return slice(data, start, end);
}

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62_encode = basex(BASE62).encode;

const RECORD_ID_PREFIX = 'rec';

function newId(prefix = RECORD_ID_PREFIX) {
  const randomString = random.getRandomAsciiString(10);
  const buf = new TextEncoder('utf-8').encode(randomString);
  const randomBase62 = base62_encode(buf);
  return `${prefix}${randomBase62}`;
}
