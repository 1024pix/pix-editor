import AirtableAdapter from './airtable';

export default class SkillAdapter extends AirtableAdapter {

  urlForCreateRecord(model, snapshot) {
    if (snapshot.adapterOptions?.clone) return '/api/skills/clone';
    return super.urlForCreateRecord(model, snapshot);
  }

  pathForType() {
    return 'Acquis';
  }
}
