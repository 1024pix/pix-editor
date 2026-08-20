import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import Component from '@glimmer/component';
import { not } from 'ember-truth-helpers';
import Files from 'pixeditor/components/field/files';
import Illustration from 'pixeditor/components/field/illustration';
import Input from 'pixeditor/components/field/input';
import Textarea from 'pixeditor/components/field/textarea';
import FieldToggleFieldComponent from 'pixeditor/components/field/toggle-field';

export default class LocalizedChallengeForm extends Component {
  get localizedChallengeGeographyValue() {
    return this.args.localizedChallenge.geography || 'AA';
  }

  <template>
    <form action="" class="form">
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
          @change={{@setIllustrationAlt}}
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
        @change={{@setEmbedURL}}
      />
      {{#if @shouldDisplayPrimaryEmbedUrl}}
        <div class="message message--blue">
          <p data-testid="default-embed-url">Embed URL auto-générée : {{@localizedChallenge.defaultEmbedURL}}</p>
        </div>
      {{/if}}
      {{#if @invalidEmbedURL}}
        <p class="message message--red" data-test-invalid-embed-url>
          URL invalide :
          {{@invalidEmbedURL}}
        </p>
      {{/if}}
      <PixSelect
        @id="localized-select-geography"
        @placeholder="Géographie"
        @isDisabled={{not @edition}}
        @onChange={{fn (mut @localizedChallenge.geography)}}
        @value={{this.localizedChallengeGeographyValue}}
        @options={{@countryList}}
        @hideDefaultOption={{true}}
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
        <p class="message message--red" data-test-invalid-urls-to-consult>
          URLs invalides :
          {{@invalidUrlsToConsult}}
        </p>
      {{/if}}

      {{#unless @edition}}
        <Input @id="localized-challenge-id" @value={{@localizedChallenge.id}} @label="Id" @edition={{false}} />
      {{/unless}}
    </form>
  </template>
}
