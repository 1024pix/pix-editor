import Component from '@glimmer/component';

/**
 * Champ de repli pour les types non reconnus dans le schema.
 *
 * Affiche un warning explicite et présente les données brutes en lecture seule.
 * Les données sont PRÉSERVÉES : ce composant ne modifie jamais la valeur.
 *
 * Ce composant corrige le bug critique de json-editor : quand un objet JSON
 * avait un `type` absent du `oneOf`, json-editor l'écrasait silencieusement
 * par un objet `text` par défaut. Ici, l'utilisateur voit le problème
 * et peut décider de la marche à suivre.
 */
export default class UnknownField extends Component {
  get unknownType() {
    return this.args.value?.type ?? null;
  }

  get warningMessage() {
    const type = this.unknownType;
    if (type) {
      return `Type "${type}" non reconnu dans le schema. Les données sont préservées et non éditables jusqu'à la prochaine mise à jour du schema.`;
    }
    return `Type de schema non reconnu ("${this.args.schema?.type}"). Les données sont préservées et non éditables.`;
  }

  get rawJson() {
    try {
      return JSON.stringify(this.args.value, null, 2);
    } catch {
      return String(this.args.value);
    }
  }

  <template>
    <div class='schema-form-unknown' role='region' aria-label='Champ non éditable'>
      {{#if @label}}
        <p class='schema-form__label'>{{@label}}</p>
      {{/if}}
      <div class='schema-form-unknown__warning' role='alert'>
        <strong>⚠ Attention</strong>
        <p>{{this.warningMessage}}</p>
      </div>
      <pre class='schema-form-unknown__raw' aria-label='Données brutes préservées'>{{this.rawJson}}</pre>
    </div>
  </template>
}
