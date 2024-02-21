import { applyEmberDataSerializers, discoverEmberDataModels } from 'ember-cli-mirage';
import { createServer, Response } from 'miragejs';
import { getDsModels, getDsSerializers } from 'ember-cli-mirage/ember-data';
import slice from 'lodash/slice';

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

  this.post('/airtable/content/Attachments', (schema, request) => {
    const payload = JSON.parse(request.requestBody);
    const attachment = _deserializePayload(payload, 'attachment');
    if (attachment.localizedChallenge) {
      attachment.localizedChallenge = schema.localizedChallenges.find(attachment.localizedChallenge);
    }
    const createdAttachment = schema.attachments.create(attachment);
    return _serializeModel(createdAttachment, 'attachment');
  });

  this.get('/airtable/content/Referentiel', (schema) => {
    const records = schema.frameworks.all().models.map((framework) => {
      return _serializeModel(framework, 'framework');
    });
    return { records };
  });

  this.post('/airtable/content/Referentiel', (schema, request) => {
    const areaPayload = JSON.parse(request.requestBody);
    const framework = _deserializePayload(areaPayload, 'framework');
    const createdFramework = schema.competences.create(framework);
    return _serializeModel(createdFramework, 'framework');
  });

  this.get('/airtable/content/Domaines', (schema) => {
    const records = schema.areas.all().models.map((area) => {
      return _serializeModel(area, 'area');
    });
    return { records };
  });

  this.get('/airtable/content/Domaines/:id', (schema, request) => {
    const area = schema.areas.find(request.params.id);
    return _serializeModel(area, 'area');
  });

  this.post('/airtable/content/Domaines', (schema, request) => {
    const areaPayload = JSON.parse(request.requestBody);
    const area = _deserializePayload(areaPayload, 'area');
    const createdArea = schema.competences.create(area);
    return _serializeModel(createdArea, 'area');
  });

  this.get('/airtable/content/Competences', (schema) => {
    const records = schema.competences.all().models.map((competence) => {
      return _serializeModel(competence, 'competence');
    });
    return { records };
  });

  this.get('/airtable/content/Competences/:id', (schema, request) => {
    const competence = schema.competences.find(request.params.id);
    return _serializeModel(competence, 'competence');
  });

  this.patch('/airtable/content/Competences/:id', (schema, request) => {
    const competencePayload = JSON.parse(request.requestBody);
    const competence = schema.competences.find(request.params.id);
    const competenceNew = _deserializePayload(competencePayload, 'competence');
    competence.update({ ...competenceNew });
    return _serializeModel(competence, 'competence');
  });

  this.post('/airtable/content/Competences', (schema, request) => {
    const competencePayload = JSON.parse(request.requestBody);
    const competence = _deserializePayload(competencePayload, 'competence');
    const createdCompetence = schema.competences.create(competence);
    return _serializeModel(createdCompetence, 'competence');
  });

  this.get('/airtable/content/Thematiques/:id', (schema, request) => {
    const theme = schema.themes.find(request.params.id);
    return _serializeModel(theme, 'theme');
  });

  this.get('/airtable/content/Thematiques', (schema) => {
    const records = schema.themes.all().models.map(theme => {
      return _serializeModel(theme, 'theme');
    });
    return { records };
  });

  this.post('/airtable/content/Thematiques', (schema, request) => {
    const themePayload = JSON.parse(request.requestBody);
    const theme = _deserializePayload(themePayload, 'theme');
    const createdTheme =  schema.themes.create(theme);
    return _serializeModel(createdTheme, 'theme');
  });

  this.get('/airtable/content/Tubes/:id', (schema, request) => {
    const tube = schema.tubes.find(request.params.id);
    return _serializeModel(tube, 'tube');
  });

  this.get('/airtable/content/Tubes', (schema) => {
    const records = schema.tubes.all().models.map(tube => {
      return _serializeModel(tube, 'tube');
    });
    return { records };
  });

  this.post('/airtable/content/Tubes', (schema, request) => {
    const tubePayload = JSON.parse(request.requestBody);
    const tube = _deserializePayload(tubePayload, 'tube');
    const createdTube =  schema.tubes.create(tube);
    return _serializeModel(createdTube, 'tube');
  });

  this.get('/airtable/content/Acquis/:id', (schema, request) => {
    const skill = schema.skills.find(request.params.id);
    return _serializeModel(skill, 'skill');
  });

  this.get('/airtable/content/Acquis', (schema) => {
    const records = schema.skills.all().models.map((skill) => {
      return _serializeModel(skill, 'skill');
    });
    return { records };
  });

  this.post('/airtable/content/Acquis', (schema, request) => {
    const skillPayload = JSON.parse(request.requestBody);
    const skill = _deserializePayload(skillPayload, 'skill');
    const createdSkill =  schema.skills.create(skill);
    return _serializeModel(createdSkill, 'skill');
  });

  this.get('/airtable/content/Attachments/:id', (schema, request) => {
    const attachment = schema.attachments.find(request.params.id);
    return _serializeModel(attachment, 'attachment');
  });

  this.patch('/airtable/content/Attachments/:id', (schema, request) => {
    const attachment = schema.attachments.find(request.params.id);
    return _serializeModel(attachment, 'attachment');
  });

  this.delete('/airtable/content/Attachments/:id', (schema, request) => {
    const attachment = schema.attachments.find(request.params.id);
    attachment.destroy();
    return {
      deleted: true,
      id: request.params.id,
    };
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
      records = schema.challenges.where((challenge)=> ids.includes(challenge.id));
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
    } catch (e) {
      return new Response(404);
    }
  });

  this.get('/localized-challenges', (schema, request) => {
    const ids = request.queryParams['filter[ids]'];
    if (ids) {
      return schema.localizedChallenges.where((localizedChallenge)=> ids.includes(localizedChallenge.id));
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
    challenge.skill = skill;

    const files = body.data.relationships.files.data.map(({ id }) => {
      return schema.attachments.find(id);
    });
    challenge.files = files;
    challenge.save();

    return challenge;
  });

  //TODO extraire le contenu des configs liées aux missions dans un fichier dédié
  this.get('/missions', function (schema, request) {
    const queryParams = request.queryParams;
    const {
      'filter[isActive]': isActiveFilter,
    } = queryParams;
    let allmissionSummaries;
    if (isActiveFilter === 'true') {
      allmissionSummaries = schema.missionSummaries.where({ status: 'ACTIVE' }).models;
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
      validatedObjectives: null
    });
  });

  this.patch('/missions/:id', function(schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
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
      'filter[name]' : nameFilter,
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

  this.post('/static-courses', function(schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    return schema.create('static-course', {
      id: 'newStaticCourseId',
      name: attributes.name,
      description: attributes.description,
      challengeSummaryIds: attributes['challenge-ids'],
    });
  });

  this.put('/static-courses/:id', function(schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    const staticCourse = schema.staticCourses.find(request.params.id);
    staticCourse.update({
      name: attributes.name,
      description: attributes.description,
      challengeSummaryIds: attributes['challenge-ids'],
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
}

function _serializeModel(instance, modelName) {
  const serializer = new (getDsSerializers()[modelName]);
  const payload = { id: instance.id, fields: { [serializer.primaryKey] : instance.id } };
  const model = new getDsModels();
  const relationships = model[modelName].relationships;

  for (const [key, value] of Object.entries(serializer.attrs)) {
    payload.fields[value] = instance[key];
  }
  relationships.forEach(allRelationships => {
    allRelationships.forEach(relationship => {
      const meta = relationship.meta;
      const relationshipSerializedKey = serializer.attrs[meta.key];
      if (meta.kind === 'hasMany') {
        payload.fields[relationshipSerializedKey] = instance.attrs[`${meta.name.slice(0, -1)}Ids`];
      }
      if (meta.kind === 'belongsTo') {
        payload.fields[relationshipSerializedKey] = instance.attrs[`${meta.name}Id`];
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
