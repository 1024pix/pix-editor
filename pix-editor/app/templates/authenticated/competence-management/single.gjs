import PixButton from '@1024pix/pix-ui/components/pix-button';
import Input from 'pixeditor/components/field/input';
import Textarea from 'pixeditor/components/field/textarea';
<template>
  <div class="competence-management-view">
    <div class="competence-management-view__title">
      {{#if @controller.creation}}
        <h1 class="competence-management-view__heading">Nouvelle compétence {{@controller.competence.code}}</h1>
      {{else}}
        <h1 class="competence-management-view__heading">{{@controller.competence.name}}</h1>
      {{/if}}
    </div>
    <div class="competence-management-view__details">
      <div class="competence-management-view__data">
        <form action class="competence-management-view__form">
          <Input
            @value={{@controller.competence.title}}
            @change={{@controller.setTitle}}
            @edition={{@controller.edition}}
            @label="Titre"
            @id="competence-title-fr"
          />
          <Textarea
            @title="Description :"
            @value={{@controller.competence.description}}
            @change={{@controller.setDescription}}
            @hideActionBar={{true}}
            @edition={{@controller.edition}}
            @id="competence-description-fr"
          />
          <div class="competence-management-view__segment">
            <span class="flag competence-management-view__flag">🇬🇧</span>
            <Input
              @value={{@controller.competence.titleEn}}
              @change={{@controller.setTitleEn}}
              @edition={{@controller.edition}}
              @label="Titre (en)"
              @id="competence-title-en"
            />
            <Textarea
              @title="Description (en) :"
              @hideActionBar={{true}}
              @value={{@controller.competence.descriptionEn}}
              @change={{@controller.setDescriptionEn}}
              @edition={{@controller.edition}}
              @id="competence-description-en"
            />
          </div>
          {{#unless @controller.edition}}
            <Input @value={{@controller.competence.pixId}} @label="Id" @edition={{false}} />
          {{/unless}}
        </form>
      </div>
      <div class="competence-management-view__menu">
        {{#if @controller.mayEdit}}
          <PixButton class="competence-management-view__action" @iconBefore="edit" @triggerAction={{@controller.edit}}>
            Modifier
          </PixButton>
        {{/if}}
        {{#if @controller.edition}}
          <PixButton
            class="competence-management-view__action competence-management-view__action--important"
            @iconBefore="save"
            @triggerAction={{@controller.save}}
          >
            Enregistrer
          </PixButton>
          <PixButton
            class="competence-management-view__action"
            @iconBefore="block"
            @triggerAction={{@controller.cancelEdit}}
          >
            Annuler
          </PixButton>
        {{/if}}
      </div>
    </div>
  </div>
</template>
