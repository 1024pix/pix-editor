import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import Component from '@glimmer/component';
import { not } from 'ember-truth-helpers';

import Files from '../field/files';
import Illustration from '../field/illustration';
import Input from '../field/input';
import Textarea from '../field/textarea';
import FieldToggleFieldComponent from '../field/toggle-field';

export default class LocalizedChallengeForm extends Component {
  get localizedChallengeGeographyValue() {
    return this.args.localizedChallenge.geography || 'AA';
  }

  <template>
    <form action="" class="ui form">
      <Illustration
        @title="Illustration"
        @value={{@localizedChallenge.illustration}}
        @edition={{@edition}}
        @addIllustration={{@addIllustration}}
        @removeIllustration={{@removeIllustration}}
        @display={{@showIllustration}}
        data-test-file-input-illustration
      />
      {{#if @localizedChallenge.illustration}}
        <Textarea
          @value={{@localizedChallenge.illustration.alt}}
          @title="Texte alternatif"
          @edition={{false}}
          @id="challenge-illustration-alt"
        />
      {{/if}}
      <Files
        @title="Pièces jointes"
        @value={{@localizedChallenge.piecesJointes}}
        @baseName={{@localizedChallenge.attachmentBaseName}}
        @addAttachment={{@addAttachment}}
        @edition={{@edition}}
        @removeAttachment={{@removeAttachment}}
        data-test-file-input-attachment
      />
      <Input
        @id="localized-challenge-embed-url"
        @label="Embed URL"
        @value={{@localizedChallenge.embedURL}}
        @edition={{@edition}}
        @placeholder="Url de l'embed"
        @change={{@checkEmbedURL}}
      />
      {{#if @shouldDisplayPrimaryEmbedUrl }}
        <div class="ui  blue message">
          <p data-testid="default-embed-url">Embed URL auto-générée : {{@localizedChallenge.defaultEmbedURL}}</p>
        </div>
      {{/if}}
      {{#if @invalidEmbedURL}}
        <p class="ui red message" data-test-invalid-embed-url>
          URL invalide :
          {{@invalidEmbedURL}}
        </p>
      {{/if}}
      <PixSelect
        @id="localized-select-geography"
        @placeholder="Géographie"
        @disabled={{not @edition}}
        @onChange={{fn (mut @localizedChallenge.geography)}}
        @value={{this.localizedChallengeGeographyValue}}
        @options={{@countryList}}
        @hideDefaultOption={{false}}
      >
        <:label>Géographie</:label>
      </PixSelect>
      <FieldToggleFieldComponent
        @edition={{@edition}}
        @model={{@localizedChallenge}}
        @modelField="urlsToConsult"
        @hideTextButton="Supprimer les URLs externes nécessaires à la résolution de l'épreuve"
        @displayTextButton="Ajouter des URLs nécessaires à la résolution de l'épreuve"
        @confirmText="URLs externes nécessaires à la résolution de l'épreuve"
        @displayField={{@displayUrlsToConsultField}}
        @setDisplayField={{@setDisplayUrlsToConsultField}}
        @textToolTip="Ces URLs doivent être trouvées par l’utilisateur car elles ne sont pas communiquées dans la consigne ou les propositions."
      >
        <Textarea
          @title="URLs externes nécessaires à la résolution de l'épreuve"
          @value={{@urlsToConsult}}
          @edition={{@edition}}
          @change={{@setUrlsToConsult}}
          @helpContent={{@helpUrlsToConsult}}
          data-test-localized-challenge-urls-to-consult
          @id="localized-challenge-urls-to-consult"
        />
      </FieldToggleFieldComponent>
      {{#if @invalidUrlsToConsult}}
        <p class="ui red message" data-test-invalid-urls-to-consult>
          URLs invalides :
          {{@invalidUrlsToConsult}}
        </p>
      {{/if}}

      {{#unless @edition}}
        <Input
          @id="localized-challenge-id"
          @value={{@localizedChallenge.id}}
          @label="Id"
          @edition={{false}}
        />
      {{/unless}}
    </form>
  </template>
}
