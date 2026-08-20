import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import not from 'ember-truth-helpers/helpers/not';

export default class Quality extends Component {
  <template>
    <div class={{concat "field" (if @edition "" " disabled")}} ...attributes>
      <label>{{@title}}</label>
      <div class="fields--selectors">
        <PixSelect
          data-test-accessibility1-challenge-id={{@challenge.id}}
          @options={{this.accessibility1Options}}
          @value={{@challenge.accessibility1}}
          @onChange={{fn (mut @challenge.accessibility1)}}
          @isDisabled={{not @edition}}
          @hideDefaultOption={{true}}
        >
          <:label>Non voyant</:label>
        </PixSelect>
        <PixSelect
          data-test-accessibility2-challenge-id={{@challenge.id}}
          @options={{this.accessibility2Options}}
          @value={{@challenge.accessibility2}}
          @onChange={{fn (mut @challenge.accessibility2)}}
          @isDisabled={{not @edition}}
          @hideDefaultOption={{true}}
        >
          <:label>Daltonien</:label>
        </PixSelect>
        <PixSelect
          data-test-spoil-challenge-id={{@challenge.id}}
          @options={{this.spoilOptions}}
          @value={{@challenge.spoil}}
          @onChange={{fn (mut @challenge.spoil)}}
          @isDisabled={{not @edition}}
          @hideDefaultOption={{true}}
        >
          <:label>Spoil</:label>
        </PixSelect>
        <PixSelect
          data-test-responsive-challenge-id={{@challenge.id}}
          @options={{this.responsiveOptions}}
          @value={{@challenge.responsive}}
          @onChange={{fn (mut @challenge.responsive)}}
          @isDisabled={{not @edition}}
          @hideDefaultOption={{true}}
        >
          <:label>Responsive</:label>
        </PixSelect>
        <PixSelect
          data-test-deaf-and-hard-of-hearing-challenge-id={{@challenge.id}}
          @options={{this.deafAndHardOfHearingOptions}}
          @value={{@challenge.deafAndHardOfHearing}}
          @onChange={{fn (mut @challenge.deafAndHardOfHearing)}}
          @isDisabled={{not @edition}}
          @hideDefaultOption={{true}}
        >
          <:label>Sourds et malentendants</:label>
        </PixSelect>
      </div>
      <div class="fields--selectors">
        <PixCheckbox
          data-test-is-awareness-challenge-challenge-id={{@challenge.id}}
          {{on "click" (fn this.toggleChallengeField "isAwarenessChallenge")}}
          @checked={{@challenge.isAwarenessChallenge}}
          disabled={{not @edition}}
        >
          <:label>Épreuve de sensibilisation</:label>
        </PixCheckbox>
        <PixCheckbox
          data-test-require-gafam-website-access-challenge-challenge-id={{@challenge.id}}
          {{on "click" (fn this.toggleChallengeField "requireGafamWebsiteAccess")}}
          @checked={{@challenge.requireGafamWebsiteAccess}}
          disabled={{not @edition}}
        >
          <:label>Accès GAFAM requis</:label>
        </PixCheckbox>
        <PixCheckbox
          data-test-to-rephrase-challenge-id={{@challenge.id}}
          {{on "click" (fn this.toggleChallengeField "toRephrase")}}
          @checked={{@challenge.toRephrase}}
          disabled={{not @edition}}
        >
          <:label>Épreuve à revoir</:label>
        </PixCheckbox>
        <PixCheckbox
          data-test-is-incompatible-ipad-certif-challenge-id={{@challenge.id}}
          {{on "click" (fn this.toggleChallengeField "isIncompatibleIpadCertif")}}
          @checked={{@challenge.isIncompatibleIpadCertif}}
          disabled={{not @edition}}
        >
          <:label>Incompatible iPad certif</:label>
        </PixCheckbox>
      </div>
    </div>
  </template>

  @action
  toggleChallengeField(field) {
    this.args.challenge[field] = !this.args.challenge[field];
  }

  accessibility1Options = [
    { value: 'RAS', label: 'RAS' },
    { value: 'OK', label: 'OK' },
    { value: 'Acquis Non Pertinent', label: 'Acquis Non Pertinent' },
    { value: 'KO', label: 'KO' },
    { value: 'A tester', label: 'A tester' },
  ];

  accessibility2Options = [
    { value: 'RAS', label: 'RAS' },
    { value: 'OK', label: 'OK' },
    { value: 'KO', label: 'KO' },
  ];

  responsiveOptions = [
    { value: 'Tablette', label: 'Tablette' },
    { value: 'Smartphone', label: 'Smartphone' },
    { value: 'Tablette/Smartphone', label: 'Tablette/Smartphone' },
    { value: 'Non', label: 'Non' },
  ];

  spoilOptions = [
    { value: 'Non Sp', label: 'Non Sp' },
    { value: 'Difficilement Sp', label: 'Difficilement Sp' },
    { value: 'Facilement Sp', label: 'Facilement Sp' },
  ];

  deafAndHardOfHearingOptions = [
    { value: 'RAS', label: 'RAS' },
    { value: 'OK', label: 'OK' },
    { value: 'Acquis Non Pertinent', label: 'Acquis Non Pertinent' },
    { value: 'KO', label: 'KO' },
  ];
}
