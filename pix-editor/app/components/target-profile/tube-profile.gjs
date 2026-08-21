import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
<template>
  <div {{on "click" (fn @clickAction @tube)}} ...attributes>
    <div class={{if @selectedSkillLevel "active" ""}}>
      <PixIcon
        @name={{if @selectedSkillLevel "checkCircle" "stopCircle"}}
        class="tube-profile__check {{if @selectedSkillLevel 'active' ''}}"
        @title={{if @selectedSkillLevel "Actif" "Inactif"}}
      />
      {{#if @showTubeDetails}}
        <div class="max-skill-level"><p>{{if @selectedSkillLevel @selectedSkillLevel ""}}</p></div>
      {{/if}}
      <div class="practicalTitle-profile {{if @selectedSkillLevel ' active' ''}}">
        <p>
          <span class="practicalTitle-profile__color-red">{{@tube.name}} </span>:
          {{@tube.practicalTitleFr}}
        </p>
      </div>
    </div>
    <p class="practicalDescription-profile {{if @selectedSkillLevel ' active'}}">{{@tube.practicalDescriptionFr}}</p>
  </div>
</template>
