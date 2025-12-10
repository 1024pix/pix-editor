import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import Component from '@glimmer/component';
import Challenge from 'pix-editor/models/challenge';

import ChallengeViewHeader from './challenge-view-header';

export default class ChallengeViewProduction extends Component {
  challengeTypeOptions = [
    { value: 'QCU', label: 'QCU' },
    { value: 'QCM', label: 'QCM' },
    { value: 'QROC', label: 'QROC' },
    { value: 'QROCM-ind', label: 'QROCM-ind' },
    { value: 'QROCM-dep', label: 'QROCM-dep' },
    { value: 'autoReply', label: 'Embed-auto' },
  ];

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

  get hasTimer() {
    return !!this.args.challenge.timer;
  }

  <template>
    <ChallengeViewHeader
      @challenge={{@challenge}}
      @statusColor={{this.getChallengeStatusColor @challenge.status}}
      @overview={{@overview}}
      @competenceId={{@competenceId}}
      @skillId={{@skillId}}
    />

    <div class="challenge-view">
      <PixTextarea @value={{@challenge.instruction}} readonly rows="5">
        <:label>Consigne</:label>
      </PixTextarea>
      <PixTextarea @value={{@challenge.alternativeInstruction}} readonly rows="5">
        <:label>Alternative textuelle</:label>
      </PixTextarea>
      <PixSelect @options={{this.challengeTypeOptions}} @value={{@challenge.type}} @isDisabled={{true}}>
        <:label>Modalité</:label>
      </PixSelect>

      {{#if @challenge.isTextBased}}
        <PixInput @value={{@challenge.format}} readonly>
          <:label>Format</:label>
        </PixInput>
      {{/if}}
      <PixTextarea @value={{@challenge.proposals}} readonly rows="5">
        <:label>Propositions</:label>
      </PixTextarea>
      <PixTextarea @value={{@challenge.solution}} readonly rows="3">
        <:label>Réponses</:label>
      </PixTextarea>
      {{#if @challenge.illustration}}
        <p>Illustration</p>
        <img src="{{@challenge.illustration.url}}" alt="" />
        <PixInput @value={{@challenge.illustrationAlt}} readonly>
          <:label>Texte alternatif</:label>
        </PixInput>
      {{/if}}
      <fieldset>
        <legend>Tolérance</legend>
        <div class="challenge-view__tolerance">
          <PixCheckbox @checked={{@challenge.t1Status}} disabled>
            <:label>T1 (espaces/casse/accents)</:label>
          </PixCheckbox>
          <PixCheckbox @checked={{@challenge.t2Status}} disabled>
            <:label>T2 (ponctuation)</:label>
          </PixCheckbox>
          <PixCheckbox @checked={{@challenge.t3Status}} disabled>
            <:label>T3 (distance d'édition)</:label>
          </PixCheckbox>
        </div>
      </fieldset>
      <PixInput @value={{@challenge.embedURL}} readonly>
        <:label>Embed URL</:label>
      </PixInput>
      <PixInput @value={{@challenge.embedHeight}} readonly>
        <:label>Hauteur</:label>
      </PixInput>
      <PixInput @value={{@challenge.embedTitle}} readonly>
        <:label>Titre</:label>
      </PixInput>
      <PixInput @value={{@challenge.pedagogy}} readonly>
        <:label>Type pédagogie</:label>
      </PixInput>
      <PixCheckbox @checked={{this.hasTimer}} disabled>
        <:label>Timer</:label>
      </PixCheckbox>
      {{#if this.hasTimer}}
        <PixInput class="sr-only-label" @value={{@challenge.timer}} readonly>
          <:label>Durée du timer</:label>
        </PixInput>
      {{/if}}
      <PixCheckbox @checked={{@challenge.focusable}} disabled>
        <:label>Focus</:label>
      </PixCheckbox>
      <div>
        <p>Internationalisation</p>
        <div class="challenge-view-internationalisation">
          <PixInput @value={{@challenge.locales}} readonly>
            <:label>Langue(s)</:label>
          </PixInput>
        </div>
      </div>
      <div class="challenge-view-quality">
        <fieldset>
          <legend>Qualité et classification</legend>
          <PixInput @value={{@challenge.spoil}} readonly>
            <:label>Spoil</:label>
          </PixInput>
          <PixInput @value={{@challenge.declinable}} readonly>
            <:label>Déclinable</:label>
          </PixInput>
          <PixInput @value={{@challenge.responsive}} readonly>
            <:label>Responsive</:label>
          </PixInput>
          <PixInput @value={{@challenge.geography}} readonly>
            <:label>Géographie</:label>
          </PixInput>
        </fieldset>
        <fieldset>
          <legend>Accessibilité</legend>
          <PixInput @value={{@challenge.accessibility1}} readonly>
            <:label>Non voyant</:label>
          </PixInput>
          <PixInput @value={{@challenge.accessibility2}} readonly>
            <:label>Daltonien</:label>
          </PixInput>
          <PixInput @value={{@challenge.deafAndHardOfHearing}} readonly>
            <:label>Sourds et malentendants</:label>
          </PixInput>
        </fieldset>
        <fieldset>
          <legend>Certification</legend>
          <div class="challenge-view-quality__certification">
            <PixCheckbox @checked={{@challenge.isAwarenessChallenge}} disabled>
              <:label>Épreuve de sensibilisation</:label>
            </PixCheckbox>
            <PixCheckbox @checked={{@challenge.requireGafamWebsiteAccess}} disabled>
              <:label>Accès GAFAM requis</:label>
            </PixCheckbox>
            <PixCheckbox @checked={{@challenge.toRephrase}} disabled>
              <:label>Formulation à revoir</:label>
            </PixCheckbox>
            <PixCheckbox @checked={{@challenge.isIncompatibleIpadCertif}} disabled>
              <:label>Incompatible iPad certif</:label>
            </PixCheckbox>
          </div>
        </fieldset>
      </div>

      <PixInput @value={{@challenge.contextualizedFields}} readonly>
        <:label>Champs contextualisés</:label>
      </PixInput>
      <PixInput @value={{@challenge.id}} readonly>
        <:label>Id</:label>
      </PixInput>
    </div>
  </template>
}
