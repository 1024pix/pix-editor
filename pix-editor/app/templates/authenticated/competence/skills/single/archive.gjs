import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { LinkTo } from '@ember/routing';
import Archive from 'pixeditor/components/list/archive';
<template>
  {{#if @controller.competenceController.mainRightSlot}}
    {{#in-element @controller.competenceController.mainRightSlot}}
      <div class="archive__title {{if @controller.config.lite 'archive__title--lite'}}">
        <h1 class="archive__heading">
          Anciennes épreuves de
          {{@controller.skill.name}}
          ({{@controller.skill.id}})
          <div class="archive__menu">
            <LinkTo @route="authenticated.competence.skills.single" class="archive__close" aria-label="Fermer">
              <PixIcon @name="close" @ariaHidden={{true}} />
            </LinkTo>
          </div>
        </h1>
      </div>
      {{#unless @controller.rightMaximized}}
        <div class="archive__segment {{@controller.size}}">
          <Archive @list={{@controller.challengeList}} />
        </div>
        <div class="archive__info-menu">
          <div class="archive__info"><div>Prototypes : {{@controller.prototypesCount}}</div><div>Déclinaisons :
              {{@controller.alternativesCount}}</div></div>
        </div>
      {{/unless}}
      {{outlet}}
    {{/in-element}}
  {{/if}}
</template>
