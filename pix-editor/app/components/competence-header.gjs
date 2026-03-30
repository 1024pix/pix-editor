import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import LocaleTag from './v2/locale-tag';

export default class CompetenceHeader extends Component {
  @service router;
  localeOptions = [
    {
      label: 'Langue source',
      value: 'source',
    },
    {
      label: 'Français',
      value: 'fr',
    },
    {
      label: 'Franco-français',
      value: 'fr-fr',
    },
    {
      label: 'Franco Belge',
      value: 'fr-BE',
    },
    {
      label: 'Allemand (Autriche)',
      value: 'de-AT',
    },
    {
      label: 'Anglais',
      value: 'en',
    },
    {
      label: 'Anglais (Ouganda)',
      value: 'en-UG',
    },
    {
      label: 'Anglais (Rwanda)',
      value: 'en-RW',
    },
    {
      label: 'Anglais (Tanzanie)',
      value: 'en-TZ',
    },
    {
      label: 'Espagnol',
      value: 'es',
    },
    {
      label: 'Espagnol (Amérique latine)',
      value: 'es-419',
    },
    {
      label: 'Italien',
      value: 'it',
    },
    {
      label: 'Néerlandais',
      value: 'nl',
    },
  ];
  sections = [
    {
      label: 'Epreuves',
      value: 'challenges',
    },
    {
      label: 'Acquis',
      value: 'skills',
    },
    {
      label: 'Qualité',
      value: 'quality',
    },
  ];

  get localeValue() {
    if (!this.args.locale) return 'source';
    return this.args.locale;
  }

  get localeEntry() {
    return this.localeOptions.find((localeEntry) => localeEntry.value === this.localeValue);
  }

  get hasLocaleSelected() {
    return !!this.args.locale;
  }

  @action
  setLocale(locale) {
    if (locale === 'source') locale = undefined;
    this.router.transitionTo({ queryParams: { locale } });
  }

  @action
  setSection(section) {
    if (section === 'skills') {
      this.router.transitionTo('authenticated.competence.skills', this.args.competence.id, {
        queryParams: {
          view: 'production',
          languageFilter: this.args.locale,
        },
      });
    }
    if (section === 'quality') {
      this.router.transitionTo('authenticated.competence.quality', this.args.competence.id);
    }
  }

  <template>
    <div class="competence-header">
      {{#if this.hasLocaleSelected}}
        <LocaleTag @locale={{this.localeEntry.value}} />
      {{/if}}
      <h2>
        <LinkTo
          @route="authenticated.competence-management.single"
          @model={{@competence.id}}
        >{{@competence.name}}</LinkTo>
      </h2>
      <div class="competence-header__spacer"></div>
      <PixSelect
        @options={{this.localeOptions}}
        @value={{this.localeValue}}
        @onChange={{this.setLocale}}
        @hideDefaultOption={{true}}
        @screenReaderOnly={{true}}
      >
        <:label>Choix de la langue</:label>
      </PixSelect>
      <PixSelect
        @options={{this.sections}}
        @value="challenges"
        @onChange={{this.setSection}}
        @hideDefaultOption={{true}}
      />
    </div>
  </template>
}
