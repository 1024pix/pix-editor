import ApplicationAdapter from './application';

export default class SkillAdapter extends ApplicationAdapter {
  coalesceFindRequests = true;

  createRecord(_store, type, snapshot) {
    if (snapshot.adapterOptions?.clone) {
      // TODO: voir si on peut faire this.serialize()
      return this.ajax('/api/skills/clone', 'POST', {
        data: { data: { type: 'skills', attributes: snapshot.adapterOptions.body } },
      });
    }
    return super.createRecord(_store, type, snapshot);
  }
}
