import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import CopyLink from 'pixeditor/components/buttons/copy-link';
import ChallengeHeader from 'pixeditor/components/competence/prototypes/challenge-header';
import LocalizedChallenge from 'pixeditor/components/form/localized-challenge';
import Confirm from 'pixeditor/components/pop-in/confirm';
import Image from 'pixeditor/components/pop-in/image';
import convertLanguageAsFlag from 'pixeditor/helpers/convert-language-as-flag';
import scrollTop from 'pixeditor/modifiers/scroll-top';
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
        class="localized-prototype-view__status localized-prototype-view__status--{{@controller.localizedChallenge.statusCSS}}"
      >{{@controller.localizedChallenge.statusText}}</div>
    </:default>
  </ChallengeHeader>
  <div class="localized-prototype-view">
    <div class="localized-prototype-view__data {{@controller.elementClass}}" {{scrollTop false}}>
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
    <div class="localized-prototype-view__menu">
      {{#if @controller.edition}}
        <PixButton
          class="localized-prototype-view__action localized-prototype-view__action--important"
          @variant="tertiary"
          @iconBefore="save"
          @triggerAction={{@controller.save}}
        >
          Enregistrer
        </PixButton>
        <PixButton
          class="localized-prototype-view__action"
          @variant="tertiary"
          @iconBefore="block"
          @triggerAction={{@controller.cancelEdit}}
        >
          Annuler
        </PixButton>
      {{else}}
        <PixButtonLink
          class="localized-prototype-view__action"
          @variant="tertiary"
          @href={{@controller.previewUrl}}
          target="_blank"
          @iconBefore="eye"
        >
          Prévisualiser
        </PixButtonLink>
        <CopyLink @link={{@controller.previewUrl}} />
        <LinkTo
          class="localized-prototype-view__action"
          @route={{@controller.challengeRoute}}
          @models={{@controller.challengeModels}}
        >
          <PixIcon @name="globe" @ariaHidden={{true}} />
          Version originale
        </LinkTo>
        <PixButtonLink
          class="localized-prototype-view__action"
          @variant="tertiary"
          @href={{@controller.translationsUrl}}
          target="_blank"
          referrerpolicy="strict-origin"
          @iconBefore="language"
        >
          Traductions
        </PixButtonLink>
        {{#if @controller.mayEdit}}
          <PixButton
            class="localized-prototype-view__action"
            @variant="tertiary"
            @iconBefore="edit"
            @triggerAction={{@controller.edit}}
          >
            Modifier
          </PixButton>
        {{/if}}
        {{#if @controller.mayChangeStatus}}
          <button class="localized-prototype-view__action" {{on "click" @controller.editStatus}} type="button">
            <i class="{{@controller.changeStatusButtonIcon}} icon localized-prototype-view__action-icon"></i>
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
