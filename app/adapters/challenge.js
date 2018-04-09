import ApplicationAdapter from './application';

//TODO: handle airtable pagination (for more than 100 records)

export default ApplicationAdapter.extend({
  pathForType() {
    return "Epreuves";
  }
});
