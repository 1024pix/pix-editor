import ApplicationAdapter from './application';

export default class MissionAdapter extends ApplicationAdapter {
  createRecord(_store, type, snapshot) {
    const payload = preparePayloadForCreateAndUpdate(this.serialize(snapshot), snapshot.adapterOptions);
    const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'createRecord');
    return this.ajax(url, 'POST', { data: payload });
  }
}

function preparePayloadForCreateAndUpdate(payload, adapterOptions) {
  payload.data.attributes = {};
  payload.data.attributes.name = adapterOptions.name;
  payload.data.attributes.status = adapterOptions.status;
  payload.data.attributes['competence-id'] = adapterOptions.competenceId;
  payload.data.attributes['thematic-id'] = adapterOptions.thematicId;
  payload.data.attributes['learning-objectives'] = adapterOptions.learningObjectives;
  payload.data.attributes['validated-objectives'] = adapterOptions.validatedObjectives;
  return payload;
}
