import { LinkTo } from '@ember/routing';
import Archive from 'pixeditor/components/list/archive';
<template>{{#if @controller.competenceController.mainRightSlot}}
  {{#in-element @controller.competenceController.mainRightSlot}}
    <div class="main-title  {{if @controller.config.lite "lite" ""}}">
      <h1 class="ui header">
      <div class="ui right floated menu">
        <LinkTo @route="authenticated.competence.skills.single" class="ui button icon item"><i class="icon window close"></i></LinkTo>
      </div>
          Anciennes épreuves de {{@controller.skill.name}} ({{@controller.skill.id}})
      </h1>
    </div>
    {{#unless @controller.rightMaximized}}
      <div class="ui attached segment competence {{@controller.size}}">
        <Archive @list={{@controller.challengeList}} />
      </div>
      <div class="ui borderless bottom attached labelled icon menu">
        <div class="item competence-info"><div>Prototypes : {{@controller.prototypesCount}}</div><div>Déclinaisons : {{@controller.alternativesCount}}</div></div>
      </div>
    {{/unless}}
    {{outlet}}
  {{/in-element}}
{{/if}}</template>
