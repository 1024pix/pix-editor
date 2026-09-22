import { concat, fn } from '@ember/helper';
import not from 'ember-truth-helpers/helpers/not';
import Checkbox from 'pixeditor/components/field/checkbox';
import Select from 'pixeditor/components/field/select';

const accessibility1Options = [
  { value: 'RAS', label: 'RAS' },
  { value: 'OK', label: 'OK' },
  { value: 'Acquis Non Pertinent', label: 'Acquis Non Pertinent' },
  { value: 'KO', label: 'KO' },
  { value: 'A tester', label: 'A tester' },
];

const accessibility2Options = [
  { value: 'RAS', label: 'RAS' },
  { value: 'OK', label: 'OK' },
  { value: 'KO', label: 'KO' },
];

const responsiveOptions = [
  { value: 'Tablette', label: 'Tablette' },
  { value: 'Smartphone', label: 'Smartphone' },
  { value: 'Tablette/Smartphone', label: 'Tablette/Smartphone' },
  { value: 'Non', label: 'Non' },
];

const spoilOptions = [
  { value: 'Non Sp', label: 'Non Sp' },
  { value: 'Difficilement Sp', label: 'Difficilement Sp' },
  { value: 'Facilement Sp', label: 'Facilement Sp' },
];

const deafAndHardOfHearingOptions = [
  { value: 'RAS', label: 'RAS' },
  { value: 'OK', label: 'OK' },
  { value: 'Acquis Non Pertinent', label: 'Acquis Non Pertinent' },
  { value: 'KO', label: 'KO' },
];

<template>
  <div class={{concat "field" (if @edition "" " disabled")}} ...attributes>
    <label>{{@title}}</label>
    <div class="fields--selectors">
      <Select
        data-test-accessibility1-challenge-id={{@challenge.id}}
        @options={{accessibility1Options}}
        @value={{@challenge.accessibility1}}
        @onChange={{fn (mut @challenge.accessibility1)}}
        @isDisabled={{not @edition}}
        @hideDefaultOption={{true}}
      >
        <:label>Non voyant</:label>
      </Select>
      <Select
        data-test-accessibility2-challenge-id={{@challenge.id}}
        @options={{accessibility2Options}}
        @value={{@challenge.accessibility2}}
        @onChange={{fn (mut @challenge.accessibility2)}}
        @isDisabled={{not @edition}}
        @hideDefaultOption={{true}}
      >
        <:label>Daltonien</:label>
      </Select>
      <Select
        data-test-spoil-challenge-id={{@challenge.id}}
        @options={{spoilOptions}}
        @value={{@challenge.spoil}}
        @onChange={{fn (mut @challenge.spoil)}}
        @isDisabled={{not @edition}}
        @hideDefaultOption={{true}}
      >
        <:label>Spoil</:label>
      </Select>
      <Select
        data-test-responsive-challenge-id={{@challenge.id}}
        @options={{responsiveOptions}}
        @value={{@challenge.responsive}}
        @onChange={{fn (mut @challenge.responsive)}}
        @isDisabled={{not @edition}}
        @hideDefaultOption={{true}}
      >
        <:label>Responsive</:label>
      </Select>
      <Select
        data-test-deaf-and-hard-of-hearing-challenge-id={{@challenge.id}}
        @options={{deafAndHardOfHearingOptions}}
        @value={{@challenge.deafAndHardOfHearing}}
        @onChange={{fn (mut @challenge.deafAndHardOfHearing)}}
        @isDisabled={{not @edition}}
        @hideDefaultOption={{true}}
      >
        <:label>Sourds et malentendants</:label>
      </Select>
    </div>
    <div class="fields--selectors">
      <Checkbox
        data-test-is-awareness-challenge-challenge-id={{@challenge.id}}
        @label="Épreuve de sensibilisation"
        @checked={{@challenge.isAwarenessChallenge}}
        @disabled={{not @edition}}
      />
      <Checkbox
        data-test-require-gafam-website-access-challenge-challenge-id={{@challenge.id}}
        @label="Accès GAFAM requis"
        @checked={{@challenge.requireGafamWebsiteAccess}}
        @disabled={{not @edition}}
      />
      <Checkbox
        data-test-to-rephrase-challenge-id={{@challenge.id}}
        @label="Épreuve à revoir"
        @checked={{@challenge.toRephrase}}
        @disabled={{not @edition}}
      />
      <Checkbox
        data-test-is-incompatible-ipad-certif-challenge-id={{@challenge.id}}
        @label="Incompatible iPad certif"
        @checked={{@challenge.isIncompatibleIpadCertif}}
        @disabled={{not @edition}}
      />
    </div>
  </div>
</template>
