import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import formatDate from 'ember-intl/helpers/format-date';
import t from 'ember-intl/helpers/t';
import CopyLink from 'pixeditor/components/buttons/copy-link';
import ChallengeHeader from 'pixeditor/components/competence/prototypes/challenge-header';
import Challenge from 'pixeditor/components/form/challenge';
import ChallengeLog from 'pixeditor/components/pop-in/challenge-log';
import Changelog from 'pixeditor/components/pop-in/changelog';
import ConfirmLog from 'pixeditor/components/pop-in/confirm-log';
import Image from 'pixeditor/components/pop-in/image';
import SelectLocation from 'pixeditor/components/pop-in/select-location';
import scrollTop from 'pixeditor/modifiers/scroll-top';

<template>
  <ChallengeHeader
    @class={{@controller.challenge.statusCSS}}
    @maximized={{@controller.maximized}}
    @minimize={{@controller.minimize}}
    @maximize={{@controller.maximize}}
    @close={{@controller.close}}
  >
    <:actions>
      {{#if @controller.mayAccessLog}}
        <PixIconButton
          class="prototype-view__action"
          @iconName="chat"
          @ariaLabel="Journal"
          @triggerAction={{@controller.challengeLog}}
        />
      {{/if}}
      {{#unless @controller.edition}}
        {{#if @controller.mayHaveDifferentChallengeVersions}}
          <PixButton
            class="prototype-view__action prototype-view__action--text"
            @iconBefore="copy"
            @triggerAction={{@controller.showVersions}}
            title="Afficher les différentes versions d'épreuves"
          >v{{@controller.challenge.version}}</PixButton>
        {{/if}}
        {{#if @controller.shouldDisplayStatusActionsMenu}}
          <div class="prototype-view__status-actions" id={{@controller.challengeStatusActionsId}}>
            <PixIconButton
              @ariaLabel={{@controller.challengeStatusActionsLabel}}
              @iconName="bolt"
              @plainIcon={{true}}
              @triggerAction={{@controller.toggleStatusActionMenu}}
              {{on "focusout" @controller.hideStatusActionMenu}}
            />
            {{#if @controller.isStatusActionMenuOpen}}
              <div class="prototype-view__status-menu">
                {{#if @controller.mayValidate}}
                  <button
                    class="prototype-view__status-menu-item prototype-view__status-menu-item--validate"
                    {{on "click" @controller.validate}}
                    type="button"
                  >
                    <PixIcon @name="check" @ariaHidden={{true}} />
                    {{t "common.validate"}}
                  </button>
                {{/if}}
                {{#if @controller.mayValidateQuality}}
                  <button
                    class="prototype-view__status-menu-item prototype-view__status-menu-item--validate"
                    {{on "click" @controller.validateQuality}}
                    type="button"
                  >
                    <PixIcon @name="check" @ariaHidden={{true}} />
                    Valider qualité
                  </button>
                {{/if}}
                {{#if @controller.mayArchive}}
                  <button
                    class="prototype-view__status-menu-item prototype-view__status-menu-item--archive"
                    {{on "click" @controller.archive}}
                    type="button"
                  >
                    <PixIcon @name="inventory" @ariaHidden={{true}} />
                    {{t "competence.prototypes.archive"}}
                  </button>
                {{/if}}
                {{#if @controller.mayObsolete}}
                  <button
                    class="prototype-view__status-menu-item prototype-view__status-menu-item--archive"
                    {{on "click" @controller.obsolete}}
                    type="button"
                  >
                    <PixIcon @name="delete" @ariaHidden={{true}} />
                    {{t "competence.prototypes.obsolete"}}
                  </button>
                {{/if}}
              </div>
            {{/if}}
          </div>
        {{/if}}
        {{#if @controller.mayMove}}
          <PixIconButton
            class="prototype-view__action"
            title="Déplacer l'épreuve"
            @iconName="conversionPath"
            @ariaLabel="Déplacer l'épreuve"
            @triggerAction={{@controller.movePrototype}}
          />
        {{/if}}
      {{/unless}}
    </:actions>
    <:default>
      <div class={{if @controller.creation "prototype-view__title--creation" ""}}>
        {{@controller.challengeTitle}}
      </div>
      <div
        class="prototype-view__status-label prototype-view__status-label--{{@controller.challenge.statusCSS}}"
      >{{@controller.challenge.computedStatus}}</div>
      {{#unless @controller.challenge.isNew}}
        <time
          class="prototype-view__updated-label"
          title="Dernière modification"
          datetime="{{@controller.lastUpdatedAtISO}}"
        >{{formatDate @controller.challenge.updatedAt}}</time>
      {{/unless}}
    </:default>
  </ChallengeHeader>
  <div class="prototype-view" data-testid="panel-{{@controller.elementClass}}">
    <div class="prototype-view__data {{@controller.elementClass}}" {{scrollTop @controller.edition}}>
      <Challenge
        @challenge={{@controller.challenge}}
        @countries={{@controller.countryList}}
        @showIllustration={{@controller.showIllustration}}
        @edition={{@controller.edition}}
        @displayAlternativeInstructionsField={{@controller.displayAlternativeInstructionsField}}
        @setDisplayAlternativeInstructionsField={{@controller.setDisplayAlternativeInstructionsField}}
        @displaySolutionToDisplayField={{@controller.displaySolutionToDisplayField}}
        @setDisplaySolutionToDisplayField={{@controller.setDisplaySolutionToDisplayField}}
        @removeIllustration={{@controller.removeIllustration}}
        @removeAttachment={{@controller.removeAttachment}}
        @invalidUrlsToConsult={{@controller.invalidUrlsToConsult}}
        @displayUrlsToConsultField={{@controller.displayUrlsToConsultField}}
        @setDisplayUrlsToConsultField={{@controller.setDisplayUrlsToConsultField}}
        @urlsToConsult={{@controller.urlsToConsult}}
        @setUrlsToConsult={{@controller.setUrlsToConsult}}
        @setSolutions={{@controller.setSolutions}}
        @setSolutionToDisplay={{@controller.setSolutionToDisplay}}
        @setIllustrationAlt={{@controller.setIllustrationAlt}}
        @invalidEmbedURL={{@controller.invalidEmbedURL}}
        @setEmbedURL={{@controller.setEmbedURL}}
        @setEmbedHeight={{@controller.setEmbedHeight}}
        @setEmbedTitle={{@controller.setEmbedTitle}}
        @setEmbedTimer={{@controller.setEmbedTimer}}
      />
    </div>
    <div class="prototype-view__menu">
      {{#if @controller.edition}}
        <button
          data-test-save-challenge-button
          class="prototype-view__menu-item prototype-view__menu-item--important"
          {{on "click" @controller.save}}
          type="button"
        >
          <PixIcon @name="check" @ariaHidden={{true}} />
          Enregistrer
        </button>
        <button
          data-test-cancel-challenge-button
          class="prototype-view__menu-item"
          {{on "click" @controller.cancelEdit}}
          type="button"
        >
          <PixIcon @name="close" @ariaHidden={{true}} />
          Annuler
        </button>
      {{else}}
        <a class="prototype-view__menu-item" href={{@controller.challenge.previewUrl}} target="_blank">
          <PixIcon @name="eye" @ariaHidden={{true}} />
          Prévisualiser
        </a>
        <CopyLink @link={{@controller.challenge.previewUrl}} />
        {{#each @controller.challenge.otherLocalizedChallenges as |localizedChallenge|}}
          <LinkTo
            @route={{@controller.localizedChallengeLinkRoute}}
            @models={{@controller.getLocalizedChallengeLinkModels localizedChallenge}}
            class="prototype-view__menu-item"
          >
            <PixIcon @name="globe" @ariaHidden={{true}} />
            Version
            {{localizedChallenge.locale}}
          </LinkTo>
        {{/each}}
        {{#if @controller.mayEdit}}
          <button
            data-test-modify-challenge-button={{@controller.challenge.id}}
            class="prototype-view__menu-item"
            {{on "click" @controller.edit}}
            type="button"
          >
            <PixIcon @name="edit" @ariaHidden={{true}} />
            Modifier
          </button>
        {{/if}}
        {{#if @controller.mayDuplicate}}
          <button class="prototype-view__menu-item" {{on "click" @controller.duplicate}} type="button">
            <PixIcon @name="copy" @ariaHidden={{true}} />
            Dupliquer
          </button>
        {{/if}}
        {{#if @controller.mayAccessAlternatives}}
          <button
            class="prototype-view__menu-item prototype-view__menu-item--alternatives"
            {{on "click" @controller.showAlternatives}}
            type="button"
          >
            <PixIcon @name="extension" @ariaHidden={{true}} />
            Déclinaisons &gt;&gt;
          </button>
        {{/if}}
        {{#if @controller.maySwitchGenealogy}}
          <button
            class="ui button item switch-genealogy"
            {{on "click" @controller.switchGenealogy}}
            type="button"
            title="Inverser cette déclinaison avec le prototype"
          >
            <i class="exchange icon"></i>
            <span>
              Inverser avec
              <br />le prototype
            </span>
          </button>
        {{/if}}
      {{/if}}
    </div>
  </div>
  <ChallengeLog
    @challenge={{@controller.challenge}}
    @close={{@controller.closeChallengeLog}}
    @showModal={{@controller.displayChallengeLog}}
  />
  <Image
    @imageSrc={{@controller.popinImageSrc}}
    @close={{@controller.closeIllustration}}
    @showModal={{@controller.displayImage}}
  />
  <Changelog
    @onApprove={{@controller.changelogApprove}}
    @defaultValue={{@controller.changelogDefault}}
    @showModal={{@controller.displayChangeLog}}
  />
  <ConfirmLog
    @title={{t "common.confirm-log.save"}}
    @onApprove={{@controller.saveChallengeCallback}}
    @defaultValue={{@controller.defaultSaveChangelog}}
    @inputId="changelog-message"
    @onDeny={{@controller.closeComfirmLogPopin}}
    @content={{t "common.confirm-log.content"}}
    @label={{t "common.confirm-log.label"}}
    @showModal={{@controller.displayConfirmLog}}
  />
  {{#if @controller.mayMove}}
    <SelectLocation
      @variant="prototype"
      @onSubmit={{@controller.setSkill}}
      @title="Déplacer le prototype dans un autre acquis"
      @tube={{@controller.challenge.skill.tube}}
      @skill={{@controller.challenge.skill}}
      @close={{@controller.closeMovePrototype}}
      @showModal={{@controller.displaySelectLocation}}
    />
  {{/if}}
  {{outlet}}
</template>
