import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import { array, concat } from '@ember/helper';
import or from 'ember-truth-helpers/helpers/or';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import t from 'ember-intl/helpers/t';
import scrollTop from 'pix-editor/modifiers/scroll-top';
import Skill from 'pix-editor/components/form/skill';
import SelectLocation from 'pix-editor/components/pop-in/select-location';
import Changelog from 'pix-editor/components/pop-in/changelog';
import ConfirmLog from 'pix-editor/components/pop-in/confirm-log';
<template>
  <div class="skill-header {{@controller.skill.statusCSS}}">
    <div class="ui menu">
      <div class="ui left menu">
        {{#unless @controller.edition}}
          {{#if @controller.mayDuplicate}}
            <button
              class="ui icon button"
              {{on "click" @controller.duplicateSkill}}
              type="button"
              title="Dupliquer vers"
            ><i class="icon copy"></i></button>
          {{/if}}
          <LinkTo
            class="ui button icon item"
            title="Liste des versions"
            @route="authenticated.competence.skills.list"
            @models={{array @controller.skill.tube.id @controller.skill.level}}
          >
            <i class="clone icon"></i>&nbsp;v{{@controller.skill.version}}
          </LinkTo>
          {{#if (or @controller.mayArchive @controller.mayObsolete)}}
            <div class="skill-status-actions">
              <PixIconButton
                @ariaLabel="Changer le statut de l'acquis"
                @iconName="bolt"
                @plainIcon={{true}}
                @triggerAction={{@controller.toggleStatusActionMenu}}
                {{on "focusout" @controller.hideStatusActionMenu}}
              />
              {{#if @controller.isStatusActionMenuOpen}}
                <div class="skill-status-actions__menu">
                  {{#if @controller.mayArchive}}
                    <button class="ui button archive item" {{on "click" @controller.archiveSkill}} type="button">
                      <i class="archive icon"></i>
                      {{t "competence.skills.archive"}}
                    </button>
                  {{/if}}
                  {{#if @controller.mayObsolete}}
                    <button class="ui button delete item" {{on "click" @controller.obsoleteSkill}} type="button">
                      <i class="trash alternate icon"></i>
                      {{t "competence.skills.obsolete"}}
                    </button>
                  {{/if}}
                </div>
              {{/if}}
            </div>
          {{/if}}
        {{/unless}}
      </div>
      <div class="item header">
        {{@controller.skill.name}}
        <div class="ui circular label {{@controller.skill.statusCSS}}">{{@controller.skill.status}}</div>
      </div>
      <div class="ui right menu">
        {{#if @controller.maximized}}
          <button class="ui icon button" {{on "click" @controller.minimize}} type="button"><i
              class="window minimize icon"
            ></i>
          </button>
        {{else}}
          <button class="ui icon button" {{on "click" @controller.maximize}} type="button"><i
              class="window maximize outline icon"
            ></i></button>
        {{/if}}
        <button class="ui icon button" {{on "click" @controller.close}} type="button"><i
            class="icon window close"
          ></i></button>
      </div>
    </div>
  </div>
  <div class="skill-details">
    <div class="skill-data" {{scrollTop @controller.edition}}>
      <Skill @skill={{@controller.skill}} @edition={{@controller.edition}} />
    </div>
    <div class="ui vertical compact labeled icon menu skill-menu">
      {{#if @controller.edition}}
        <button class="ui button important-action item" {{on "click" @controller.save}} type="button">
          <i class="save icon"></i>
          Enregistrer
          <span class="sr-only">l'acquis {{@controller.skill.name}}</span>
        </button>
        <button class="ui button item" {{on "click" @controller.cancelEdit}} type="button">
          <i class="ban icon"></i>
          Annuler
        </button>
      {{else}}
        {{#if @controller.skill.productionPrototype}}
          <a class="ui button item" href={{@controller.previewPrototypeUrl}} target="_blank">
            <i class="eye icon"></i>
            Prévisualiser
          </a>
        {{/if}}
        {{#if @controller.mayEdit}}
          <button class="ui button item" {{on "click" @controller.edit}} type="button">
            <i class="edit icon"></i>
            Modifier
          </button>
        {{/if}}
        {{#unless @controller.skill.isLive}}
          <button class="ui button item" {{on "click" @controller.displayChallenges}} type="button">
            <i class="archive icon"></i>
            Épreuves &gt;&gt;
          </button>
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
