import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import Confirm from 'pixeditor/components/pop-in/confirm';
import Logout from 'pixeditor/components/pop-in/logout';
import Main from 'pixeditor/components/sidebar/main';

<template>
  <div class="ui container fluid application">
    <div class={{concat "ui page dimmer inverted" (if @controller.loading " active" "")}}>
      <div class="ui text loader">{{@controller.loadingMessage}}</div>
    </div>
    <Main @openLogout={{@controller.openLogout}} @open={{@controller.menuOpen}} @close={{@controller.closeMenu}} />
    <div class="pusher">
      <div class="ui vertical inverted icon menu main-menu {{if @controller.config.lite 'lite' ''}}">
        <button
          class="ui icon button menu-toggle"
          type="button"
          title="Afficher/cacher la barre latérale"
          {{on "click" @controller.toggleMenu}}
        >
          <i class="bars icon"></i>
        </button>
      </div>
      <div class="{{if @controller.shouldApplyV2Styles 'v2-main' 'main'}}" {{on "click" @controller.closeMenu}}>
        {{#if @controller.isIndex}}
          <div class="main-left">
            <main class="elephant ui attached"></main>
            <footer class="ui bottom attached block header centered">
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
