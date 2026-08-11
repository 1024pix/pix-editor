import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { on } from '@ember/modifier';
import Confirm from 'pixeditor/components/pop-in/confirm';
import Logout from 'pixeditor/components/pop-in/logout';
import Main from 'pixeditor/components/sidebar/main';

<template>
  <div class="application">
    <div class="application__loader {{if @controller.loading 'application__loader--active' ''}}">
      <div class="application__loader-text">{{@controller.loadingMessage}}</div>
    </div>
    <Main @openLogout={{@controller.openLogout}} @open={{@controller.menuOpen}} @close={{@controller.closeMenu}} />
    <div class="content-wrapper">
      <div class="main-menu">
        <button
          class="main-menu__toggle"
          type="button"
          title="Afficher/cacher la barre latérale"
          {{on "click" @controller.toggleMenu}}
        >
          <PixIcon @name="menu" @ariaHidden={{true}} />
        </button>
      </div>
      <div class="{{if @controller.shouldApplyV2Styles 'v2-main' 'main'}}" {{on "click" @controller.closeMenu}}>
        {{#if @controller.isIndex}}
          <div class="main-left">
            <main class="elephant"></main>
            <footer class="confidential-footer">
              <p>Tout contenu Pix Editor est strictement confidentiel - secret - ne pas divulguer</p>
            </footer>
          </div>
        {{/if}}
        {{outlet}}
      </div>
    </div>
    <Logout
      @onDeny={{@controller.closeLogout}}
      @onConfirm={{@controller.logout}}
      @showModal={{@controller.displayLogout}}
      @class="popin-logout"
    />
    <Confirm
      @title={{@controller.confirmTitle}}
      @content={{@controller.confirmContent}}
      @onApprove={{@controller.confirmApprove}}
      @onDeny={{@controller.confirmDeny}}
      @showModal={{@controller.displayConfirm}}
    />
  </div>
</template>
