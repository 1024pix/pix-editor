import Component from '@glimmer/component';

import SchemaFormField from './schema-form/field';

/**
 * SchemaForm — renderer de formulaire piloté par JSON schema.
 *
 * Remplace json-editor par des composants Glimmer natifs.
 * Le formulaire suit automatiquement les évolutions du schema exposé par l'API.
 *
 * Usage :
 *   <SchemaForm @schema={{this.schema}} @value={{this.module}} @onChange={{this.handleChange}} />
 *
 * @arg {Object} schema  - JSON schema (fetché depuis l'API Pix Editor)
 * @arg {Object} value   - valeur courante du module
 * @arg {Function} onChange - appelé avec la nouvelle valeur à chaque changement
 */
export default class SchemaForm extends Component {
  <template>
    <div class='schema-form'>
      <SchemaFormField
        @schema={{@schema}}
        @value={{@value}}
        @onChange={{@onChange}}
        @label={{@schema.title}}
      />
    </div>
  </template>
}
