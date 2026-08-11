import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixSegmentedControl from '@1024pix/pix-ui/components/pix-segmented-control';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import Export from 'pixeditor/components/sidebar/export';
import Navigation from 'pixeditor/components/sidebar/navigation';
import Search from 'pixeditor/components/sidebar/search';
import ENV from 'pixeditor/config/environment';

import FrameworkModel from '../../models/framework';

export default class SidebarMain extends Component {
  <template>
    <aside class="main-sidebar {{if @open 'main-sidebar--visible' ''}}">
      <header class="main-sidebar__header">
        <h1 class="main-sidebar-header__title">Pix Editor</h1>

        {{#unless this.displayReduceButton}}
          <PixIconButton
            class="main-sidebar-header__reduce-button"
            @ariaLabel="Réduire le menu principal"
            @iconName="chevronLeft"
            @triggerAction={{@close}}
          />
        {{/unless}}
      </header>
      {{#if this.maySearch}}
        <Search @close={{@close}} />
      {{/if}}
      <Navigation @displayFrameworkList={{this.maySwitchFramework}} @close={{@close}} />
      <div class="main-sidebar__secondary-links">
        {{#if this.shouldShowMissionsLink}}
          <LinkTo class="main-sidebar-secondary-links--action" @route="authenticated.missions" {{on "click" @close}}>
            <PixIcon @name="school" @ariaHidden={{true}} />
            Missions Pix 1D
          </LinkTo>
        {{/if}}
        <LinkTo class="main-sidebar-secondary-links--action" @route="authenticated.modules" {{on "click" @close}}>
          <PixIcon @name="studyLesson" @ariaHidden={{true}} />
          Modules
        </LinkTo>
        {{#if this.mayAccessStaticCourses}}
          <LinkTo
            class="main-sidebar-secondary-links--action"
            @route="authenticated.static-courses"
            {{on "click" @close}}
          >
            <PixIcon @name="displaySettings" @ariaHidden={{true}} />
            Tests statiques
          </LinkTo>
        {{/if}}
        {{#if this.mayGenerateTargetProfile}}
          <LinkTo
            data-test-target-profile-link
            class="main-sidebar-secondary-links--action"
            @route="authenticated.target-profile"
            {{on "click" @close}}
          >
            <PixIcon @name="assignment" @ariaHidden={{true}} />
            Générateur de profil cible
          </LinkTo>
        {{/if}}
        {{#if this.mayAccessWhitelistedUrls}}
          <LinkTo
            class="main-sidebar-secondary-links--action"
            data-test-whitelisted-urls-link
            @route="authenticated.whitelisted-urls"
            {{on "click" @close}}
          >
            <PixIcon @name="bookAlt" @ariaHidden={{true}} />
            URLs à ne pas analyser
          </LinkTo>
        {{/if}}
        <Export @areas={{this.areas}} />
        <LinkTo class="main-sidebar-secondary-links--action" @route="authenticated.statistics" {{on "click" @close}}>
          <PixIcon @name="monitoring" @ariaHidden={{true}} />
          Statistiques
        </LinkTo>
        {{#if this.mayAccessAdministration}}
          <LinkTo class="main-sidebar-secondary-links--action" @route="admin"><PixIcon
              @name="shieldPerson"
              @ariaHidden={{true}}
            />
            Administration</LinkTo>
        {{/if}}
      </div>
      <PixSegmentedControl @screenReaderOnly={{true}} @onChange={{this.switchVersion}} @toggled={{this.isV2}}>
        <:label>changer de version</:label>
        <:viewA>V1</:viewA>
        <:viewB>V2</:viewB>
      </PixSegmentedControl>
      <footer class="main-sidebar__footer">
        <PixButton
          class="main-sidebar__logout"
          @variant="tertiary-white"
          @iconAfter="logout"
          @triggerAction={{@openLogout}}
        >Déconnexion
        </PixButton>
        <div class="main-sidebar-footer__version">
          {{#if this.author}}
            {{this.author}}
            -
          {{/if}}
          Version
          {{this.version}}</div>
      </footer>
    </aside>
  </template>

  version = ENV.APP.version;
  @service access;
  @service config;
  @service currentData;
  @service versionManager;
  @service router;

  constructor(...args) {
    super(...args);
  }

  get displayReduceButton() {
    return this.router.currentRouteName === 'authenticated.index';
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
