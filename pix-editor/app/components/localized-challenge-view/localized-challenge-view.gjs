import PixInput from '@1024pix/pix-ui/components/pix-input';
import { action } from '@ember/object';
import Component from '@glimmer/component';

import Files from '../field/files';
import LocalizedChallengeViewHeader from './localized-challenge-view-header';

export default class LocalizedChallenge extends Component {

  get embedURL() {
    const { localizedChallenge } = this.args;
    return localizedChallenge.embedURL ? localizedChallenge.embedURL : localizedChallenge.defaultEmbedURL;
  }

  get shouldDisplayEmbedURL() {
    return !!this.args.challengeLocale.challenge.embedURL;
  }

  @action
  toDeleteWhenEditionIsOK() {
    return null;
  }

  <template>
    <LocalizedChallengeViewHeader
      @challengeLocale={{@challengeLocale}}
      @localizedChallenge={{@localizedChallenge}}
      @overview={{@overview}}
      @competence={{@competence}}
      @skillId={{@skillId}}
    />
    {{#if this.shouldDisplayEmbedURL}}
      <PixInput @id="embedURL" @value={{this.embedURL}} readonly>
        <:label>Embed URL</:label>
      </PixInput>

      {{#unless @localizedChallenge.embedURL }}
        <div class="ui blue message">
          <p data-testid="default-embed-url">Embed URL auto-générée : {{@localizedChallenge.defaultEmbedURL}}</p>
        </div>
      {{/unless}}
    {{/if}}

    <Files
      @title="Pièces jointes"
      @value={{@localizedChallenge.piecesJointes}}
      @baseName={{@localizedChallenge.attachmentBaseName}}
      @edition={{false}}
      @removeAttachment={{this.toDeleteWhenEditionIsOK}}
      @addAttachment={{this.toDeleteWhenEditionIsOK}}
    />
  </template>
}
