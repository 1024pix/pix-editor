import ChallengeHeader from 'pix-editor/components/competence/prototypes/challenge-header';
import convertLanguageAsFlag from 'pix-editor/helpers/convert-language-as-flag';
import scrollTop from 'pix-editor/modifiers/scroll-top';
import LocalizedChallenge from 'pix-editor/components/form/localized-challenge';
import { on } from '@ember/modifier';
import CopyLink from 'pix-editor/components/buttons/copy-link';
import { LinkTo } from '@ember/routing';
import Confirm from 'pix-editor/components/pop-in/confirm';
import Image from 'pix-editor/components/pop-in/image';
<template>
  <ChallengeHeader
    @class=""
    @maximized={{@controller.maximized}}
    @minimize={{@controller.minimize}}
    @maximize={{@controller.maximize}}
    @close={{@controller.close}}
  >
    <:default>
      <i
        class="{{convertLanguageAsFlag @controller.localizedChallenge.locale}} flag"
        title={{@controller.localizedChallenge.locale}}
      ></i>
      {{@controller.challengeTitle}}
      <div
        class="ui circular label {{@controller.localizedChallenge.statusCSS}}"
      >{{@controller.localizedChallenge.statusText}}</div>
    </:default>
  </ChallengeHeader>
  <div class="challenge">
    <div class="challenge-data {{@controller.elementClass}}" {{scrollTop false}}>
      <LocalizedChallenge
        @localizedChallenge={{@controller.localizedChallenge}}
        @edition={{@controller.edition}}
        @addIllustration={{@controller.addIllustration}}
        @removeIllustration={{@controller.removeIllustration}}
        @showIllustration={{@controller.showIllustration}}
        @addAttachment={{@controller.addAttachment}}
        @removeAttachment={{@controller.removeAttachment}}
        @checkEmbedURL={{@controller.checkEmbedURL}}
        @shouldDisplayPrimaryEmbedUrl={{@controller.shouldDisplayPrimaryEmbedUrl}}
        @invalidEmbedURL={{@controller.invalidEmbedURL}}
        @countryList={{@controller.countryList}}
        @displayUrlsToConsultField={{@controller.displayUrlsToConsultField}}
        @setDisplayUrlsToConsultField={{@controller.setDisplayUrlsToConsultField}}
        @urlsToConsult={{@controller.urlsToConsult}}
        @setUrlsToConsult={{@controller.setUrlsToConsult}}
        @helpUrlsToConsult={{@controller.helpUrlsToConsult}}
        @invalidUrlsToConsult={{@controller.invalidUrlsToConsult}}
      />
    </div>
    <div class="ui vertical compact labeled icon menu challenge-menu">
      {{#if @controller.edition}}
        <button class="ui button item important-action" {{on "click" @controller.save}} type="button">
          <i class="save icon"></i>
          Enregistrer
        </button>
        <button class="ui button item" {{on "click" @controller.cancelEdit}} type="button">
          <i class="ban icon"></i>
          Annuler
        </button>
      {{else}}
        <a class="ui button item" href={{@controller.previewUrl}} target="_blank">
          <i class="eye icon"></i>
          Prévisualiser
        </a>
        <CopyLink @link={{@controller.previewUrl}} />
        <LinkTo @route={{@controller.challengeRoute}} @models={{@controller.challengeModels}} class="ui button item">
          <i class="globe icon"></i>
          Version originale
        </LinkTo>
        <a class="ui button item" href={{@controller.translationsUrl}} target="_blank" referrerpolicy="strict-origin">
          <i class="language icon"></i>
          Traductions
        </a>
        {{#if @controller.mayEdit}}
          <button class="ui button item" {{on "click" @controller.edit}} type="button">
            <i class="edit icon"></i>
            Modifier
          </button>
        {{/if}}
        {{#if @controller.mayChangeStatus}}
          <button class="ui button item" {{on "click" @controller.editStatus}} type="button">
            <i class="{{@controller.changeStatusButtonIcon}} icon"></i>
            {{@controller.changeStatusButtonText}}
          </button>
        {{/if}}
      {{/if}}
    </div>
    <Confirm
      @title={{@controller.confirmTitle}}
      @content={{@controller.confirmContent}}
      @onApprove={{@controller.confirmApprove}}
      @onDeny={{@controller.confirmDeny}}
      @showModal={{@controller.displayConfirm}}
      data-testid="change-status-confirm-popin"
    />
    <Image
      @imageSrc={{@controller.localizedChallenge.illustration.url}}
      @close={{@controller.closeIllustration}}
      @showModal={{@controller.displayIllustration}}
      data-testid="display-illustration-pop-in"
    />
  </div>
</template>
