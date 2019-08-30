import ApplicationAdapter from './application';
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';

export default ApplicationAdapter.extend({
  offset: null,
  config: service(),
  namespace: computed("config.airtableEditorBase", function () {
    return "v0/" + this.get("config").get("airtableEditorBase");
  }),
  pathForType() {
    return "Notes";
  },
  query(store, type, query) {
    const offset = this.get('offset');
    if (query.nextPage && offset) {
      delete query.nextPage
      query.offset = offset;
      return this._super(store, type, query)
        .then((data) => {
          this.set('offset', data.offset);
          return data;
        })
    }else{
      return this._super(...arguments)
        .then((data) => {
          if (data.offset) {
            this.set('offset', data.offset);
          }
          return data;
        })
    }

  }
});
