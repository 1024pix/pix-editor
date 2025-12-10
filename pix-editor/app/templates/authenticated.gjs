import { concat } from '@ember/helper';
import Main from 'pix-editor/components/sidebar/main';
import { on } from '@ember/modifier';
import Logout from 'pix-editor/components/pop-in/logout';
import Confirm from 'pix-editor/components/pop-in/confirm';
<template>
  <div class="ui container fluid application">
    <div class={{concat "ui page dimmer inverted" (if @controller.loading " active" "")}}>
      <div class="ui text loader">{{@controller.loadingMessage}}</div>
    </div>
    <Main @openLogout={{@controller.openLogout}} @open={{@controller.menuOpen}} @close={{@controller.closeMenu}} />
    <div class="pusher">
      <div class="ui vertical inverted icon menu main-menu {{if @controller.config.lite 'lite' ''}}">
        {{! template-lint-disable }}
        <button class="ui icon button menu-toggle" type="button" {{on "click" @controller.toggleMenu}}>
          <i class="bars icon"></i>
        </button>
        {{! template-lint-enable }}
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
        {{#if @controller.messages.length}}
          <div class="messages">
            {{#each @controller.messages as |message|}}
              <div
                data-test-main-message
                class={{concat "ui floating message " (if message.positive "positive" "warning")}}
                id={{message.id}}
              >
                <p>
                  {{#if message.positive}}
                    <i class="check icon"></i>
                  {{else}}
                    <i class="exclamation icon"></i>
                  {{/if}}
                  {{message.text}}
                </p>
              </div>
            {{/each}}
          </div>
        {{/if}}
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
