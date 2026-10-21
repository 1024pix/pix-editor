import Route from '@ember/routing/route';

const SCHEMA_URL = '/api/module-schema/module-json-schema.json';

export default class PocModulixEditorRoute extends Route {
  async model() {
    const response = await fetch(SCHEMA_URL);
    if (!response.ok) {
      throw new Error(`Impossible de charger le schema Modulix (${response.status})`);
    }
    const schema = await response.json();
    return { schema };
  }
}
