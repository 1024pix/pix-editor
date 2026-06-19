import { on } from '@ember/modifier';
import Input from 'pixeditor/components/field/input';
import Textarea from 'pixeditor/components/field/textarea';
<template>
  <div class="main-left competence-management">
    <div class="ui main-title">
      {{#if @controller.creation}}
        <h1 class="ui left floated header">Nouvelle compétence {{@controller.competence.code}}</h1>
      {{else}}
        <h1 class="ui left floated header">{{@controller.competence.name}}</h1>
      {{/if}}
    </div>
    <div class="competence-management__details">
      <div class="competence-management__data">
        <form action class="ui form">
          <Input
            @value={{@controller.competence.title}}
            @edition={{@controller.edition}}
            @label="Titre"
            @id="competence-title-fr"
          />
          <Textarea
            @title="Description :"
            @value={{@controller.competence.description}}
            @edition={{@controller.edition}}
            @id="competence-description-fr"
          />
          <div class="ui raised segment">
            <i class="flag gb uk"></i>
            <Input
              @value={{@controller.competence.titleEn}}
              @edition={{@controller.edition}}
              @label="Titre (en)"
              @id="competence-title-en"
            />
            <Textarea
              @title="Description (en) :"
              @value={{@controller.competence.descriptionEn}}
              @edition={{@controller.edition}}
              @id="competence-description-en"
            />
          </div>
          {{#unless @controller.edition}}
            <Input @value={{@controller.competence.pixId}} @title="Id" @edition={{false}} />
          {{/unless}}
        </form>
      </div>
      <div class="ui vertical compact labeled icon menu competence-management__menu">
        {{#if @controller.mayEdit}}
          <button class="ui button item" type="button" {{on "click" @controller.edit}}>
            <i class="edit icon"></i>
            Modifier
          </button>
        {{/if}}
        {{#if @controller.edition}}
          <button class="ui button item important-action" type="button" {{on "click" @controller.save}}>
            <i class="save icon"></i>
            Enregistrer
          </button>
          <button class="ui button item" type="button" {{on "click" @controller.cancelEdit}}>
            <i class="ban icon"></i>
            Annuler
          </button>
        {{/if}}
      </div>
    </div>
  </div>
</template>
