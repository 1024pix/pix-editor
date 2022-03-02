import Mirage, { createServer, discoverEmberDataModels, applyEmberDataSerializers } from 'ember-cli-mirage';
import { getDsSerializers, getDsModels } from 'ember-cli-mirage/ember-data';

export function makeServer(config) {
  const finalConfig = {
    ...config,
    models: { ...discoverEmberDataModels(), ...config.models },
    serializers: applyEmberDataSerializers(config.serializers),
    routes,
  };

  return createServer(finalConfig);
}

function routes() {

  this.namespace = 'api';

  this.get('/users/me', ({ users }, request) => _response(request, users.first()));
  this.get('/config', ({ configs }, request) => _response(request, configs.first()));

  this.post('/airtable/content/Attachments', (schema, request) => {
    const payload = JSON.parse(request.requestBody);
    const attachment = _deserializePayload(payload, 'attachment');
    const createdAttachment = schema.attachments.create(attachment);
    return _serializeModel(createdAttachment, 'attachment');
  });

  this.get('/airtable/content/Referentiel', (schema, request) => {
    const records = schema.frameworks.all().models.map((framework) => {
      return _serializeModel(framework, 'framework');
    });
    return _response(request, { records });
  });

  this.post('/airtable/content/Referentiel', (schema, request) => {
    const areaPayload = JSON.parse(request.requestBody);
    const framework = _deserializePayload(areaPayload, 'framework');
    const createdFramework = schema.competences.create(framework);
    return _serializeModel(createdFramework, 'framework');
  });

  this.get('/airtable/content/Domaines', (schema, request) => {
    const records = schema.areas.all().models.map((area) => {
      return _serializeModel(area, 'area');
    });
    return _response(request, { records });
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

  this.get('/airtable/content/Competences', (schema, request) => {
    const records = schema.competences.all().models.map((competence) => {
      return _serializeModel(competence, 'competence');
    });
    return _response(request, { records });
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

  this.get('/airtable/content/Thematiques', (schema, request) => {
    const records = schema.themes.all().models.map(theme => {
      return _serializeModel(theme, 'theme');
    });
    return _response(request, { records });
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

  this.get('/airtable/content/Tubes', (schema, request) => {
    const records = schema.tubes.all().models.map(tube => {
      return _serializeModel(tube, 'tube');
    });
    return _response(request, { records });
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

  this.get('/airtable/content/Acquis', (schema, request) => {
    const records = schema.skills.all().models.map((skill) => {
      return _serializeModel(skill, 'skill');
    });
    return _response(request, { records });
  });

  this.post('/airtable/content/Acquis', (schema, request) => {
    const skillPayload = JSON.parse(request.requestBody);
    const skill = _deserializePayload(skillPayload, 'skill');
    const createdSkill =  schema.themes.create(skill);
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
    let records = null;

    if (ids) {
      records = schema.challenges.find(ids);
    } else {
      records = schema.challenges.all();
    }
    return records;
  });

  this.get('/challenges/:id', (schema, request) => {
    return schema.challenges.find(request.params.id);
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

    return challenge;
  });
}

function _response(request, responseData) {
  return _isRequestAuthorized(request) ? responseData : unauthorizedErrorResponse;
}

function _isRequestAuthorized(request) {
  const apiKey = request.requestHeaders && request.requestHeaders['Authorization'];
  return apiKey === 'Bearer valid-api-key';
}

const unauthorizedErrorResponse = new Mirage.Response(401);

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
