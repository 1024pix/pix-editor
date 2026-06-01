import slice from 'lodash/slice';
import { Response } from 'miragejs';

/* eslint-disable ember/no-get */
export default function routes() {
  this.namespace = 'api';

  this.post('/admin/entities/:entity_name', function (schema) {
    const adminEntity = this.normalizedRequestAttrs('admin-entity');
    return schema.create('admin-entity', adminEntity);
  });
  // this route doesn't exist, but ember-data calls it in tests ☺️
  this.get('/admin/entities', ({ adminEntities }) => adminEntities.all());
  this.get('/admin/entities/:entity_name', ({ adminEntities, adminSchemas }, { params, queryParams }) => {
    let columnToSort;
    let sortOrder;

    if (!queryParams.sort) {
      const entityName = params.entity_name;
      const entitySchema = adminSchemas.findBy({ entityName });
      columnToSort = entitySchema.defaultSort.field;
      sortOrder = entitySchema.defaultSort.direction;
    } else {
      sortOrder = 'asc';
      columnToSort = queryParams.sort;
      if (columnToSort.startsWith('-')) {
        sortOrder = 'desc';
      }
      columnToSort = columnToSort.replace('-', '');
    }

    const adminEntitiesObject = adminEntities.all();

    adminEntitiesObject.models.sort((a, b) => {
      const aField = a.attrs.properties[columnToSort].toString();
      const bField = b.attrs.properties[columnToSort].toString();
      if (sortOrder === 'asc') {
        return aField.localeCompare(bField);
      } else {
        return bField.localeCompare(aField);
      }
    });

    return adminEntitiesObject;
  });
  this.delete('/admin/entities/:entity_name/:entity_id', function (schema, request) {
    schema.db.adminEntities.remove(request.params.entity_id);
    return new Response(204);
  });
  this.get('/admin/schemas', ({ adminSchemas }) => adminSchemas.all());

  this.get('/users/me', ({ users }) => users.first());
  this.get('/config', ({ configs }) => configs.first());

  this.get('/competences/:id/overviews/challenges-production', (schema, request) => {
    let id = `${request.params.id}:challenges-production`;
    if (request.queryParams.locale) {
      id += `:${request.queryParams.locale}`;
    }
    const competenceOverview = schema.competenceOverviews.where((competenceOverview) => competenceOverview.id === id)
      .models[0];
    if (!competenceOverview) return;
    return schema.competenceOverviews.find(competenceOverview.id);
  });

  this.get('/competences/:id/overviews/challenges-workbench', (schema, request) => {
    const competenceOverview = schema.competenceOverviews.where(
      (competenceOverview) => competenceOverview.id === `${request.params.id}:challenges-workbench`,
    ).models[0];
    if (!competenceOverview) return;
    return schema.competenceOverviews.find(competenceOverview.id);
  });

  this.get('/skills/:pixId/challenges-production', (schema, request) => {
    const pixId = request.params.pixId;
    const skill = schema.skills.findBy({ pixId });
    return skill.challengesProduction;
  });

  this.get('/localized-framework-tubes');
  this.post('/localized-framework-tubes');
  this.patch('/localized-framework-tubes/:id');

  this.get('/frameworks');
  this.post('/frameworks');

  this.get('/areas');
  this.post('/areas');

  this.get('/attachments', function (schema, request) {
    const { 'filter[localizedChallengeId]': localizedChallengeId } = request.queryParams;
    return schema.attachments
      .all()
      .filter((attachment) => [localizedChallengeId].includes(attachment.localizedChallengeId));
  });
  this.get('/attachments/:id');
  this.post('/attachments');
  this.patch('/attachments/:id');
  this.delete('/attachments/:id');

  this.get('/competences');
  this.get('/competences/:id');
  this.patch('/competences/:id');
  this.post('/competences', function (schema) {
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

  this.get('/thematics/:id', (schema, request) => {
    return schema.themes.find(request.params.id);
  });
  this.get('/thematics', (schema) => {
    return schema.themes.all();
  });
  this.post('/thematics', (schema) => {
    const thematic = this.normalizedRequestAttrs();
    thematic.index = 0;
    return schema.themes.create(thematic);
  });
  this.patch('/thematics/:id', (schema) => {
    const thematic = this.normalizedRequestAttrs();
    thematic.index = 0;
    return schema.themes.create(thematic);
  });

  this.get('/tubes/:id');
  this.get('/tubes');
  this.post('/tubes');
  this.patch('/tubes');

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

  this.post('/skills/clone', function (schema, request) {
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

  this.get('/notes', (schema) => {
    schema.notes.create();
    schema.notes.create();
    return schema.notes.all();
  });

  this.post('/notes');

  this.post('/changelog-entries');

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
    const {
      locale,
      status,
      instruction,
      challenge,
      'embed-url': embedURL,
      geography,
    } = JSON.parse(request.requestBody);

    localizedChallenge.update({
      locale,
      status,
      instruction,
      challenge,
      embedURL,
      geography,
    });

    return localizedChallenge;
  });

  this.post('/challenges', (schema, request) => {
    const challenge = JSON.parse(request.requestBody);
    const skillId = challenge.data.relationships.skill.data.id;
    const skill = schema.skills.find(skillId);
    challenge.updatedAt = new Date();

    const createdChallenge = schema.challenges.create({ ...challenge, id: challenge.data.id });
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

  // TODO extraire le contenu des configs liées aux missions dans un fichier dédié
  this.get('/missions', function (schema, request) {
    const queryParams = request.queryParams;
    const { 'filter[statuses]': statuses } = queryParams;
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

  this.post('/missions', function (schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    const mission = schema.create('mission', { ...attributes });
    schema.create('mission-summary', { id: mission.id, ...attributes });
    return mission;
  });

  this.get('/missions/:id', function (schema, request) {
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

  this.patch('/missions/:id', function (schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    if (attributes.name === 'will trigger error') {
      return new Response(
        400,
        {},
        {
          errors: [
            {
              status: '400',
              title: 'Bad Request',
              detail: 'La mission ne peut pas être mise à jour car les épreuves X, Y ne sont pas au statut VALIDE.',
            },
          ],
        },
      );
    }
    const id = request.params.id;
    const mission = schema.missions.find(id);
    mission.update({ ...attributes });
    schema.create('mission-summary', { ...attributes, id });
    return mission;
  });

  this.post('/draft-modules', function (schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    return schema.create('draft-module', { id: crypto.randomUUID(), ...attributes });
  });

  this.get('/draft-modules', function (schema, request) {
    const pagination = _getPaginationFromQueryParams(request.queryParams);

    const allDraftModules = schema.draftModules.all();

    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;

    const draftModulesPage = allDraftModules.slice(start, end);

    const json = this.serialize(draftModulesPage);

    const rowCount = allDraftModules.length;
    json.meta = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      rowCount,
      pageCount: Math.ceil(rowCount / pagination.pageSize),
    };

    return json;
  });

  this.get('/modules', function (schema, request) {
    const pagination = _getPaginationFromQueryParams(request.queryParams);

    const allModules = schema.modules.all();

    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;

    const modulesPage = allModules.slice(start, end);

    const json = this.serialize(modulesPage);

    const rowCount = allModules.length;
    json.meta = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      rowCount,
      pageCount: Math.ceil(rowCount / pagination.pageSize),
    };

    return json;
  });

  this.get('modules/:id');

  this.get('/static-course-summaries', function (schema, request) {
    const queryParams = request.queryParams;
    const { 'filter[isActive]': isActiveFilter, 'filter[name]': nameFilter, 'filter[tagIds]': tagFilter } = queryParams;
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

    const json = this.serialize(
      { modelName: 'static-course-summary', models: paginatedStaticCourseSummaries },
      'static-course-summary',
    );
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

  this.post('/static-courses', function (schema, request) {
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

  this.put('/static-courses/:id', function (schema, request) {
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

  this.put('/static-courses/:id/deactivate', function (schema, request) {
    const attributes = JSON.parse(request.requestBody).data.attributes;
    const staticCourse = schema.staticCourses.find(request.params.id);
    staticCourse.update({
      isActive: false,
      deactivationReason: attributes.reason,
    });
    return staticCourse;
  });

  this.put('/static-courses/:id/reactivate', function (schema, request) {
    const staticCourse = schema.staticCourses.find(request.params.id);
    staticCourse.update({
      isActive: true,
      deactivationReason: '',
    });
    return staticCourse;
  });

  this.get('/tags', function (schema, request) {
    const { 'filter[title]': title } = request.queryParams;
    return schema.tags.all().filter((tag) => tag.title.toLowerCase().includes(title.toLowerCase()));
  });
  this.get('/tags/:id');
  this.post('/tags');

  this.get('/tutorials', function (schema, request) {
    const { 'filter[title]': title, 'filter[source]': source } = request.queryParams;
    if (title) {
      return schema.tutorials.all().filter((tutorial) => tutorial.title.toLowerCase().includes(title.toLowerCase()));
    }
    return schema.tutorials.all().filter((tutorial) => tutorial.source.toLowerCase().includes(source.toLowerCase()));
  });
  this.get('/tutorials/:id');
  this.post('/tutorials');
  this.patch('/tutorials/:id');

  this.get('/whitelisted-urls');
  this.delete('/whitelisted-urls/:id');
  this.patch('/whitelisted-urls/:id', function (schema, request) {
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
  this.post('/whitelisted-urls', function (schema, request) {
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

  this.post('/phrase/download', function () {
    return { ok: 'cool' };
  });

  this.get('/search', (schema) => schema.searchResults.all());
}

/* eslint-enable ember/no-get */

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

function newId(prefix = RECORD_ID_PREFIX) {
  return `${prefix}${window.crypto.randomUUID()}`;
}
