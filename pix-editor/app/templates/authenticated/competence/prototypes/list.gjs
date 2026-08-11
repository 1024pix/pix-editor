import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import eq from 'ember-truth-helpers/helpers/eq';
import Prototypes from 'pixeditor/components/list/prototypes';
<template>
  <div class="prototypes-list__title">
    <h1 class="prototypes-list__heading">
      Prototypes de
      {{@controller.model.skill.name}}
      (v.{{@controller.selectedSkill.version}})
      <div class="prototypes-list__actions">
        <button type="button" class="prototypes-list__close" aria-label="Fermer" {{on "click" @controller.close}}>
          <PixIcon @name="close" @ariaHidden={{true}} />
        </button>
      </div>
    </h1>
  </div>
  <div class="prototypes-list__tabs">
    {{#each @controller.model.skills as |skill|}}
      <div
        data-test-skill-tab
        class="prototypes-list__skill-tab {{if (eq @controller.selectedSkill.id skill.id) 'active' ''}}"
        {{on "click" (fn @controller.setSelectedSkill skill)}}
      >
        {{skill.name}}
        v.{{skill.version}}
        <span class="prototypes-list__skill-tab__status {{skill.statusCSS}}" title={{skill.status}}></span>
      </div>
    {{/each}}
  </div>
  <div data-test-prototype-list class="prototypes-list__content {{@controller.size}}">
    <Prototypes @list={{@controller.selectedSkill.sortedPrototypes}} />
  </div>
  <div class="prototypes-list__footer">
    {{#if @controller.mayCreatePrototype}}
      <PixButton class="prototypes-list__create" @iconBefore="add" @triggerAction={{@controller.newVersion}}>
        Nouvelle version
      </PixButton>
    {{/if}}
  </div>
  {{outlet}}
</template>
