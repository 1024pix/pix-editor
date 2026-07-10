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
        <button class="ui button icon item" {{on "click" @controller.challengeLog}} type="button"><i
            class="icon window chat"
          ></i></button>
      {{/if}}
      {{#unless @controller.edition}}
        {{#if @controller.mayHaveDifferentChallengeVersions}}
          <button
            class="ui button icon item"
            {{on "click" @controller.showVersions}}
            type="button"
            title="Afficher les différentes versions d'épreuves"
          ><i class="clone icon"></i>&nbsp;v{{@controller.challenge.version}}</button>
        {{/if}}
        {{#if @controller.shouldDisplayStatusActionsMenu}}
          <div class="challenge-status-actions" id={{@controller.challengeStatusActionsId}}>
            <PixIconButton
              @ariaLabel={{@controller.challengeStatusActionsLabel}}
              @iconName="bolt"
              @plainIcon={{true}}
              @triggerAction={{@controller.toggleStatusActionMenu}}
              {{on "focusout" @controller.hideStatusActionMenu}}
            />
            {{#if @controller.isStatusActionMenuOpen}}
              <div class="challenge-status-actions__menu">
                {{#if @controller.mayValidate}}
                  <button class="ui button validate item" {{on "click" @controller.validate}} type="button">
                    <i class="checkmark icon"></i>
                    {{t "common.validate"}}
                  </button>
                {{/if}}
                {{#if @controller.mayValidateQuality}}
                  <button class="ui button validate item" {{on "click" @controller.validateQuality}} type="button">
                    <i class="checkmark icon"></i>
                    Valider qualité
                  </button>
                {{/if}}
                {{#if @controller.mayArchive}}
                  <button class="ui button archive item" {{on "click" @controller.archive}} type="button">
                    <i class="archive icon"></i>
                    {{t "competence.prototypes.archive"}}
                  </button>
                {{/if}}
                {{#if @controller.mayObsolete}}
                  <button class="ui button archive item" {{on "click" @controller.obsolete}} type="button">
                    <i class="trash alternate icon"></i>
                    {{t "competence.prototypes.obsolete"}}
                  </button>
                {{/if}}
              </div>
            {{/if}}
          </div>
        {{/if}}
        {{#if @controller.mayMove}}
          <button
            title="Déplacer l'épreuve"
            class="ui icon button item"
            {{on "click" @controller.movePrototype}}
            type="button"
          ><i class="icon random"></i></button>
        {{/if}}
      {{/unless}}
    </:actions>
    <:default>
      <div class={{if @controller.creation " creation" ""}}>
        {{@controller.challengeTitle}}
      </div>
      <div class="ui circular label {{@controller.challenge.statusCSS}}">{{@controller.challenge.computedStatus}}</div>
      {{#unless @controller.challenge.isNew}}
        <time
          class="ui colored label"
          title="Dernière modification"
          datetime="{{@controller.lastUpdatedAtISO}}"
        >{{formatDate @controller.challenge.updatedAt}}</time>
      {{/unless}}
    </:default>
  </ChallengeHeader>
  <div class="challenge" data-testid="panel-{{@controller.elementClass}}">
    <div class="challenge-data {{@controller.elementClass}}" {{scrollTop @controller.edition}}>
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
        @invalidEmbedURL={{@controller.invalidEmbedURL}}
        @checkEmbedURL={{@controller.checkEmbedURL}}
      />
    </div>
    <div class="ui vertical compact labeled icon menu challenge-menu">
      {{#if @controller.edition}}
        <button
          data-test-save-challenge-button
          class="ui button item important-action"
          {{on "click" @controller.save}}
          type="button"
        >
          <i class="save icon"></i>
          Enregistrer
        </button>
        <button
          data-test-cancel-challenge-button
          class="ui button item"
          {{on "click" @controller.cancelEdit}}
          type="button"
        >
          <i class="ban icon"></i>
          Annuler
        </button>
      {{else}}
        <a class="ui button item" href={{@controller.challenge.previewUrl}} target="_blank">
          <i class="eye icon"></i>
          Prévisualiser
        </a>
        <CopyLink @link={{@controller.challenge.previewUrl}} />
        {{#each @controller.challenge.otherLocalizedChallenges as |localizedChallenge|}}
          <LinkTo
            @route={{@controller.localizedChallengeLinkRoute}}
            @models={{@controller.getLocalizedChallengeLinkModels localizedChallenge}}
            class="ui button item"
          >
            <i class="globe icon"></i>
            Version
            {{localizedChallenge.locale}}
          </LinkTo>
        {{/each}}
        {{#if @controller.mayEdit}}
          <button
            data-test-modify-challenge-button={{@controller.challenge.id}}
            class="ui button item"
            {{on "click" @controller.edit}}
            type="button"
          >
            <i class="edit icon"></i>
            Modifier
          </button>
        {{/if}}
        {{#if @controller.mayDuplicate}}
          <button class="ui button item" {{on "click" @controller.duplicate}} type="button">
            <i class="copy icon"></i>
            Dupliquer
          </button>
        {{/if}}
        {{#if @controller.mayAccessAlternatives}}
          <button class="ui button item alternatives" {{on "click" @controller.showAlternatives}} type="button">
            <i class="cubes icon"></i>
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
