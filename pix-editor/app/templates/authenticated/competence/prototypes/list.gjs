import { on } from '@ember/modifier';
import eq from 'ember-truth-helpers/helpers/eq';
import { fn } from '@ember/helper';
import Prototypes from 'pixeditor/components/list/prototypes';
<template>
  <div class="main-title {{if @controller.config.lite 'lite' ''}}">
    <h1 class="ui header">
      <div class="ui right floated menu">
        <button class="ui button icon item" {{on "click" @controller.close}} type="button"><i
            class="icon window close"
          ></i>
        </button>
      </div>
      Prototypes de
      {{@controller.model.skill.name}}
      (v.{{@controller.selectedSkill.version}})
    </h1>
  </div>
  <div class="ui top attached borderless labelled icon menu">
    <div class="ui top attached tabular menu">
      {{#each @controller.model.skills as |skill|}}
        <div
          data-test-skill-tab
          class="item skill-tab {{if (eq @controller.selectedSkill.id skill.id) 'active' ''}}"
          {{on "click" (fn @controller.setSelectedSkill skill)}}
        >
          {{skill.name}}
          v.{{skill.version}}
          <span class="skill-tab__status {{skill.statusCSS}}" title={{skill.status}}></span>
        </div>
      {{/each}}
    </div>
  </div>
  <div data-test-prototype-list class="ui attached segment competence {{@controller.size}}">
    <Prototypes @list={{@controller.selectedSkill.sortedPrototypes}} />
  </div>
  <div class="ui borderless bottom attached labelled icon menu">
    {{#if @controller.mayCreatePrototype}}
      <button
        data-test-new-prototype-action
        class="ui button right item"
        {{on "click" @controller.newVersion}}
        type="button"
      >
        <i class="plus square outline icon"></i>
        Nouvelle version
      </button>
    {{/if}}
  </div>
  {{outlet}}
</template>
