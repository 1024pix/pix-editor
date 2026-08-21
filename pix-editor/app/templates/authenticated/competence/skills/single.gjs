import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import or from 'ember-truth-helpers/helpers/or';
import ChallengeHeader from 'pixeditor/components/competence/prototypes/challenge-header';
import Skill from 'pixeditor/components/form/skill';
import Changelog from 'pixeditor/components/pop-in/changelog';
import ConfirmLog from 'pixeditor/components/pop-in/confirm-log';
import SelectLocation from 'pixeditor/components/pop-in/select-location';
import scrollTop from 'pixeditor/modifiers/scroll-top';
<template>
  <ChallengeHeader
    @class="skill"
    @maximized={{@controller.maximized}}
    @minimize={{@controller.minimize}}
    @maximize={{@controller.maximize}}
    @close={{@controller.close}}
  >
    <:actions>
      {{#unless @controller.edition}}
        {{#if @controller.mayDuplicate}}
          <PixIconButton
            class="skill-view__action-button"
            @ariaLabel="Dupliquer vers"
            @iconName="copy"
            @plainIcon={{true}}
            @triggerAction={{@controller.duplicateSkill}}
            title="Dupliquer vers"
          />
        {{/if}}
        <PixIconButton
          class="skill-view__action-button"
          @ariaLabel="Liste des versions"
          title="Liste des versions"
          @iconName="copy"
          @plainIcon={{false}}
          @triggerAction={{@controller.showVersions}}
        />
        {{#if (or @controller.mayArchive @controller.mayObsolete)}}
          <div class="skill-view__status-actions">
            <PixIconButton
              @ariaLabel="Changer le statut de l'acquis"
              title="Changer le statut de l'acquis"
              @iconName="bolt"
              @plainIcon={{true}}
              @triggerAction={{@controller.toggleStatusActionMenu}}
              {{on "focusout" @controller.hideStatusActionMenu}}
            />
            {{#if @controller.isStatusActionMenuOpen}}
              <div class="skill-view__status-menu">
                {{#if @controller.mayArchive}}
                  <button
                    class="skill-view__status-menu-item skill-view__status-menu-item--archive"
                    type="button"
                    {{on "click" @controller.archiveSkill}}
                  >
                    <PixIcon @name="inventory" @ariaHidden={{true}} />
                    {{t "competence.skills.archive"}}
                  </button>
                {{/if}}
                {{#if @controller.mayObsolete}}
                  <button
                    class="skill-view__status-menu-item skill-view__status-menu-item--delete"
                    type="button"
                    {{on "click" @controller.obsoleteSkill}}
                  >
                    <PixIcon @name="delete" @ariaHidden={{true}} />
                    {{t "competence.skills.obsolete"}}
                  </button>
                {{/if}}
              </div>
            {{/if}}
          </div>
        {{/if}}
      {{/unless}}
    </:actions>
    <:default>
      {{@controller.skill.name}}
      (v{{@controller.skill.version}})
      <div
        class="skill-view__status-label skill-view__status-label--{{@controller.skill.statusCSS}}"
      >{{@controller.skill.status}}</div>
    </:default>
  </ChallengeHeader>
  <div class="skill-view__details">
    <div class="skill-view__data" {{scrollTop @controller.edition}}>
      <Skill @skill={{@controller.skill}} @edition={{@controller.edition}} />
    </div>

    <div class="lateral-menu">
      {{#if @controller.edition}}
        <PixButton @iconBefore="check" @triggerAction={{@controller.save}}>
          Enregistrer
          <span class="sr-only"> l'acquis {{@controller.skill.name}}</span>
        </PixButton>
        <PixButton @variant="secondary" @iconBefore="close" @triggerAction={{@controller.cancelEdit}}>
          Annuler
        </PixButton>
      {{else}}
        {{#if @controller.skill.productionPrototype}}
          <PixButtonLink
            class="lateral-menu__item"
            @variant="tertiary"
            @iconBefore="eye"
            @href={{@controller.previewPrototypeUrl}}
            target="_blank"
          >
            Prévisualiser
          </PixButtonLink>
        {{/if}}
        {{#if @controller.mayEdit}}
          <PixButton
            class="lateral-menu__item"
            @variant="tertiary"
            @iconBefore="edit"
            @triggerAction={{@controller.edit}}
          >
            Modifier
          </PixButton>
        {{/if}}
        {{#unless @controller.skill.isLive}}
          <PixButton
            class="lateral-menu__item"
            @variant="tertiary"
            @iconBefore="inventory"
            @triggerAction={{@controller.displayChallenges}}
          >
            Épreuves &gt;&gt;
          </PixButton>
        {{/unless}}
      {{/if}}
    </div>
  </div>
  <SelectLocation
    @variant="skill"
    @onSubmit={{@controller.duplicateToLocation}}
    @title={{concat "Destination de la copie de " @controller.skill.name}}
    @tube={{@controller.skill.tube}}
    @close={{@controller.closeSelectLocation}}
    @showModal={{@controller.displaySelectLocation}}
  />
  <Changelog
    @onApprove={{@controller.approveChangelog}}
    @defaultValue={{@controller.changelogText}}
    @showModal={{@controller.displayChangeLog}}
  />
  <ConfirmLog
    @title={{t "common.confirm-log.save"}}
    @onApprove={{@controller.saveSkillCallBack}}
    @defaultValue={{@controller.defaultSaveChangelog}}
    @inputId="changelog-message"
    @onDeny={{@controller.closeComfirmLogPopin}}
    @content={{t "common.confirm-log.content"}}
    @label={{t "common.confirm-log.label"}}
    @showModal={{@controller.displayConfirmLog}}
  />
  {{outlet}}
</template>
