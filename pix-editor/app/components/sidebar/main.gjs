import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pixeditor/config/environment';
import FrameworkModel from '../../models/framework';
import PixSegmentedControl from '@1024pix/pix-ui/components/pix-segmented-control';
import Search from 'pixeditor/components/sidebar/search';
import Navigation from 'pixeditor/components/sidebar/navigation';
import { LinkTo } from '@ember/routing';
import { on } from '@ember/modifier';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import Export from 'pixeditor/components/sidebar/export';

export default class SidebarMain extends Component {
  <template>
    <div
      class="ui inverted left wide sidebar
        {{if @open 'visible '}}main-sidebar menu vertical
        {{if this.config.lite 'lite' ''}}"
    >
      <div class="main-sidebar__header">
        <h1>Pix Editor</h1>
        <PixSegmentedControl @screenReaderOnly={{true}} @onChange={{this.switchVersion}} @toggled={{this.isV2}}>
          <:label>changer de version</:label>
          <:viewA>V1</:viewA>
          <:viewB>V2</:viewB>
        </PixSegmentedControl>
      </div>
      <p class="legal-mention" style="margin: 0;">Confidentiel - secret - ne pas divulguer</p>
      {{#if this.maySearch}}
        <Search @close={{@close}} />
      {{/if}}
      <Navigation @displayFrameworkList={{this.maySwitchFramework}} @close={{@close}} />
      <div class="secondary-links">
        {{#if this.shouldShowMissionsLink}}
          <LinkTo @route="authenticated.missions" {{on "click" @close}}>
            <i class="graduation cap icon"></i>
            Missions Pix 1D
          </LinkTo>
        {{/if}}
        {{#if this.mayAccessStaticCourses}}
          <LinkTo class="secondary-links--action" @route="authenticated.static-courses" {{on "click" @close}}>
            <PixIcon @name="assignment" @ariaHidden={{true}} />
            Tests statiques
          </LinkTo>
        {{/if}}
        {{#if this.mayGenerateTargetProfile}}
          <LinkTo data-test-target-profile-link @route="authenticated.target-profile" {{on "click" @close}}>
            <i class="crosshairs icon"></i>
            Générateur de profil cible
          </LinkTo>
        {{/if}}
        {{#if this.mayAccessWhitelistedUrls}}
          <LinkTo
            class="secondary-links--action"
            data-test-whitelisted-urls-link
            @route="authenticated.whitelisted-urls"
            {{on "click" @close}}
          >
            <PixIcon @name="bookAlt" @ariaHidden={{true}} />
            URLs à ne pas analyser
          </LinkTo>
        {{/if}}
        <Export @areas={{this.areas}} />
        <LinkTo @route="authenticated.statistics" {{on "click" @close}}>
          <i class="chart bar icon"></i>
          Statistiques
        </LinkTo>
        {{#if this.mayAccessAdministration}}
          <LinkTo @route="admin"><i class="shield icon"></i> Administration</LinkTo>
        {{/if}}
      </div>
      <div class="ui labelled icon menu">
        <button class="ui button item" type="button" {{on "click" @openLogout}}><i class="logout icon"></i>Déconnexion
        </button>
        <div class="right item">
          {{#if this.author}}
            {{this.author}}
            -
          {{/if}}
          Version
          {{this.version}}</div>
      </div>
    </div>
  </template>

  version = ENV.APP.version;
  @service access;
  @service config;
  @service currentData;
  @service versionManager;

  constructor(...args) {
    super(...args);
  }

  get author() {
    return this.config.author;
  }

  get areas() {
    return this.currentData.getAreas();
  }

  get mayAccessAdministration() {
    return this.access.mayAccessAdministration();
  }

  get mayAccessStaticCourses() {
    return this.access.mayAccessStaticCourses();
  }

  get mayAccessWhitelistedUrls() {
    return this.access.mayAccessWhitelistedUrls();
  }

  get mayGenerateTargetProfile() {
    return this.access.isReadOnly();
  }

  get maySwitchFramework() {
    return this.access.isReadOnly();
  }

  get maySearch() {
    return this.access.isReadOnly();
  }

  get shouldShowMissionsLink() {
    return this.currentData?.getFramework()?.name.toLowerCase() === FrameworkModel.pix1DFrameworkName.toLowerCase();
  }

  get isV2() {
    return this.versionManager.isV2;
  }

  @action
  switchVersion() {
    this.versionManager.toggleV2();
  }
}
