import { PixCheckbox } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';

<template>
  <div
    {{on "click" (fn @clickAction @tube)}}
    ...attributes
    class="tube-profile {{if @selectedSkillLevel 'tube-profile--active' ''}}"
  >
    <div data-test-tube-profile>
      <PixCheckbox @checked={{if @selectedSkillLevel true false}} @screenReaderOnly={{true}}>
        <:label>{{@tube.name}} : {{@tube.practicalTitleFr}}</:label>
      </PixCheckbox>
      {{#if @showTubeDetails}}
        <div class="max-skill-level"><p>{{if @selectedSkillLevel @selectedSkillLevel ""}}</p></div>
      {{/if}}
      <p class="practicalTitle-profile">
        <span class="practicalTitle-profile__color-red">{{@tube.name}} </span>:
        {{@tube.practicalTitleFr}}
      </p>
    </div>
    <p class="practicalDescription-profile">{{@tube.practicalDescriptionFr}}</p>
  </div>
</template>
