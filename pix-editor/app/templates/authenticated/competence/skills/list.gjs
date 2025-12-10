import { on } from '@ember/modifier';
import Skills from 'pix-editor/components/list/skills';
<template>
  <div class="main-title skill-header">
    <h1 class="ui header">
      <div class="ui right floated menu">
        <button class="ui button icon item" {{on "click" @controller.close}} type="button"><i
            class="icon window close"
          ></i></button>
      </div>
      Versions de
      {{@controller.firstSkill.name}}
    </h1>
  </div>
  <div class="ui attached segment competence">
    <Skills @list={{@controller.model.sortedSkills}} />
  </div>
  <div class="ui borderless bottom attached labelled icon menu">
    {{#if @controller.mayCreateSkill}}
      <button class="ui button right item" {{on "click" @controller.newSkillVersion}} type="button">
        <i class="plus square outline icon"></i>
        Nouvelle Version
      </button>
    {{/if}}
  </div>
</template>
