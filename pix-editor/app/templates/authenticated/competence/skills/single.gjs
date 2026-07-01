import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { array, concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import or from 'ember-truth-helpers/helpers/or';
import Skill from 'pixeditor/components/form/skill';
import Changelog from 'pixeditor/components/pop-in/changelog';
import ConfirmLog from 'pixeditor/components/pop-in/confirm-log';
import SelectLocation from 'pixeditor/components/pop-in/select-location';
import scrollTop from 'pixeditor/modifiers/scroll-top';
<template>
  <div class="skill-view__header skill-view__header--{{@controller.skill.statusCSS}}">
    <div class="skill-view__menu-bar">
      <div class="skill-view__menu-left">
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
          <LinkTo
            class="skill-view__version-link"
            title="Liste des versions"
            @route="authenticated.competence.skills.list"
            @models={{array @controller.skill.tube.id @controller.skill.level}}
          >
            <PixIcon @name="copy" @ariaHidden={{true}} />&nbsp;v{{@controller.skill.version}}
          </LinkTo>
          {{#if (or @controller.mayArchive @controller.mayObsolete)}}
            <div class="skill-view__status-actions">
              <PixIconButton
                @ariaLabel="Changer le statut de l'acquis"
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
      </div>
      <div class="skill-view__title">
        {{@controller.skill.name}}
        <div
          class="skill-view__status-label skill-view__status-label--{{@controller.skill.statusCSS}}"
        >{{@controller.skill.status}}</div>
      </div>
      <div class="skill-view__menu-right">
        {{#if @controller.maximized}}
          <PixIconButton
            class="skill-view__action-button"
            @ariaLabel="Minimiser la fenêtre"
            @iconName="openInFull"
            @triggerAction={{@controller.minimize}}
            title="Minimiser la fenêtre"
          />
        {{else}}
          <PixIconButton
            class="skill-view__action-button"
            @ariaLabel="Maximiser la fenêtre"
            @iconName="openInFull"
            @triggerAction={{@controller.maximize}}
            title="Maximiser la fenêtre"
          />
        {{/if}}
        <PixIconButton
          class="skill-view__action-button"
          @ariaLabel="Fermer la fenêtre"
          @iconName="close"
          @triggerAction={{@controller.close}}
          title="Fermer la fenêtre"
        />
      </div>
    </div>
  </div>
  <div class="skill-view__details">
    <div class="skill-view__data" {{scrollTop @controller.edition}}>
      <Skill @skill={{@controller.skill}} @edition={{@controller.edition}} />
    </div>
    <div class="skill-view__side-menu">
      {{#if @controller.edition}}
        <PixButton
          class="skill-view__side-menu-item skill-view__side-menu-item--important"
          @variant="tertiary"
          @iconBefore="check"
          @triggerAction={{@controller.save}}
        >
          Enregistrer
          <span class="skill-view__sr-only">l'acquis {{@controller.skill.name}}</span>
        </PixButton>
        <PixButton
          class="skill-view__side-menu-item"
          @variant="tertiary"
          @iconBefore="close"
          @triggerAction={{@controller.cancelEdit}}
        >
          Annuler
        </PixButton>
      {{else}}
        {{#if @controller.skill.productionPrototype}}
          <PixButtonLink
            class="skill-view__side-menu-item"
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
            class="skill-view__side-menu-item"
            @variant="tertiary"
            @iconBefore="edit"
            @triggerAction={{@controller.edit}}
          >
            Modifier
          </PixButton>
        {{/if}}
        {{#unless @controller.skill.isLive}}
          <PixButton
            class="skill-view__side-menu-item"
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
