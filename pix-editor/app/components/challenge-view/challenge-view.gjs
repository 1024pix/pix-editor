import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import ChallengeViewHeader from './challenge-view-header';
import Component from '@glimmer/component';
import Challenge from 'pixeditor/models/challenge';

export default class ChallengeViewProduction extends Component {

  getChallengeStatusColor(challengeStatus) {
    if (challengeStatus === Challenge.STATUSES.PROPOSE) {
      return 'tertiary';
    }
    if (challengeStatus === Challenge.STATUSES.VALIDE) {
      return 'success';
    }
    if (challengeStatus === Challenge.STATUSES.ARCHIVE) {
      return 'neutral';
    }
    if (challengeStatus === Challenge.STATUSES.PERIME) {
      return 'error';
    }
    return 'secondary';
  }

  <template>
    <ChallengeViewHeader @challenge={{@challenge}} @statusColor={{this.getChallengeStatusColor @challenge.status}} />

    <div class="challenge-view">
      <PixTextarea
        @id="instruction"
        @value={{@challenge.instruction}}
        @maxlength="500"
        readonly
      >
        <:label>Consigne</:label>
      </PixTextarea>
      <PixInput
        @id="type"
        @value={{@challenge.type}}
        @maxlength="500"
        readonly
      >
        <:label>Type</:label>
      </PixInput>

      {{#if @challenge.isTextBased}}
        <PixInput
          @id="format"
          @value={{@challenge.format}}
          readonly
        >
          <:label>Format</:label>
        </PixInput>
      {{/if}}
      <PixTextarea
        @id="proposals"
        @value={{@challenge.proposals}}
        @maxlength="500"
        readonly
      >
        <:label>Propositions</:label>
      </PixTextarea>
      <PixTextarea
        @id="solution"
        @value={{@challenge.solution}}
        @maxlength="500"
        readonly
      >
        <:label>Réponses</:label>
      </PixTextarea>
      {{#if @challenge.illustration}}
        <p>Illustration</p>
        <img src="{{@challenge.illustration.url}}" alt="">
        <PixTextarea
          @id="illustrationAlt"
          @value={{@challenge.illustrationAlt}}
          @maxlength="500"
          readonly
        >
          <:label>Texte alternatif</:label>
        </PixTextarea>
      {{/if}}
      <div>
        <p>Tolérance</p>
        <div class="challenge-view__tolerance">
          <PixCheckbox
            @checked={{@challenge.t1Status}}
            disabled
          >
            <:label>T1 (espaces/casse/accents)</:label>
          </PixCheckbox>
          <PixCheckbox
            @checked={{@challenge.t2Status}}
            disabled
          >
            <:label>T2 (ponctuation)</:label>
          </PixCheckbox>
          <PixCheckbox
            @checked={{@challenge.t3Status}}
            disabled
          >
            <:label>T3 (distance d'édition)</:label>
          </PixCheckbox>
        </div>
      </div>
      <PixInput
        @id="embedUrl"
        @value={{@challenge.embedURL}}
        readonly
      >
        <:label>Embed URL</:label>
      </PixInput>
      <PixInput
        @id="embedHeight"
        @value={{@challenge.embedHeight}}
        readonly
      >
        <:label>Hauteur</:label>
      </PixInput>
      <PixInput
        @id="title"
        @value={{@challenge.title}}
        readonly
      >
        <:label>Titre</:label>
      </PixInput>
      <PixInput
        @id="pedagogy"
        @value={{@challenge.pedagogy}}
        readonly
      >
        <:label>Type pédagogie</:label>
      </PixInput>
      <PixInput
        @id="declinable"
        @value={{@challenge.declinable}}
        readonly
      >
        <:label>Déclinable</:label>
      </PixInput>
      <PixCheckbox
        @checked={{@challenge.timer}}
        disabled
      >
        <:label>Timer</:label>
      </PixCheckbox>
      <PixCheckbox
        @checked={{@challenge.focusable}}
        disabled
      >
        <:label>Focus</:label>
      </PixCheckbox>
      <div>
        <p>Internationalisation</p>
        <div class="challenge-view-internationalisation">
          <PixInput
            @id="locales"
            @value={{@challenge.locales}}
            readonly
          >
            <:label>Langue(s)</:label>
          </PixInput>
          <PixInput
            @id="geography"
            @value={{@challenge.geography}}
            readonly
          >
            <:label>Géographie</:label>
          </PixInput>
        </div>
      </div>

      <PixInput
        @id="contextualizedFields"
        @value={{@challenge.contextualizedFields}}
        readonly
      >
        <:label>Champs contextualisés</:label>
      </PixInput>
      <PixInput
        @id="id"
        @value={{@challenge.id}}
        readonly
      >
        <:label>Id</:label>
      </PixInput>
    </div>
  </template>
}
