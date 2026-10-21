import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

/**
 * Champ rich text pour les propriétés de type `string` avec `format: "jodit"`.
 *
 * TODO: Intégrer Jodit WYSIWYG à la place du <textarea>.
 *   1. Installer jodit : `npm install jodit`
 *   2. Remplacer le modifier `initTextarea` par un modifier `initJodit`
 *      qui initialise Jodit sur l'élément et écoute ses événements onChange.
 *
 * Exemple de modifier Jodit à venir :
 *   const initJodit = modifier((element, [value, onChange]) => {
 *     const editor = Jodit.make(element, { ... });
 *     editor.value = value ?? '';
 *     editor.events.on('change', (newValue) => onChange(newValue));
 *     return () => editor.destruct();
 *   });
 */

// Modifier temporaire pour synchroniser la valeur sur le textarea
const syncValue = modifier((element, [value]) => {
  if (element.value !== (value ?? '')) {
    element.value = value ?? '';
  }
});

export default class JoditField extends Component {
  get infoText() {
    return this.args.schema?.options?.infoText ?? null;
  }

  @action
  handleInput(event) {
    this.args.onChange?.(event.target.value);
  }

  <template>
    <div class='schema-form-field'>
      <label class='schema-form__label'>
        {{@label}}
        <span class='schema-form__badge schema-form__badge--rich-text'>rich text</span>
      </label>
      {{#if this.infoText}}
        <p class='schema-form__info'>{{this.infoText}}</p>
      {{/if}}
      {{! TODO: Remplacer par le modifier Jodit (cf. commentaire en tête de fichier) }}
      <textarea
        class='schema-form__textarea'
        rows='4'
        {{syncValue @value}}
        {{on 'input' this.handleInput}}
      ></textarea>
    </div>
  </template>
}
