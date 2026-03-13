import { service } from '@ember/service';
import Component from '@glimmer/component';
import flagForLanguage from 'pixeditor/helpers/flag-for-language.js';


export default class LocaleTag extends Component {
  @service config;

  get label() {
    return this.config.localeToLanguageMap[this.args.locale];
  }

  <template>
    <p class="locale-tag" title={{@locale}}>
      <span>{{flagForLanguage @locale}}</span>
      {{this.label}}
    </p>
  </template>
}
