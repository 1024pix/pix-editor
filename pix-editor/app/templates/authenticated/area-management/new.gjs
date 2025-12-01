import Input from 'pixeditor/components/field/input';
import { on } from '@ember/modifier';
<template>
  <div class="main-left area-management">
    <div class="ui main-title">
      <h1 class="ui left floated header">Nouveau domaine du pix + {{@controller.framework.name}}</h1>
    </div>
    <div class="area-management__details">
      <div class="area-management__data">
        <form action class="ui form">
          <Input
            data-test-area-title-input
            @value={{@controller.area.titleFrFr}}
            @edition={{true}}
            @label="Titre"
            @id="area-title-fr"
          />
          <div class="ui raised segment">
            <i class="flag gb uk"></i>
            <Input @value={{@controller.area.titleEnUs}} @edition={{true}} @label="Titre (en)" @id="area-title-en" />
          </div>
        </form>
      </div>
      <div class="ui vertical compact labeled icon menu area-management__menu">
        <button
          data-test-save-button
          class="ui button item important-action"
          {{on "click" @controller.save}}
          type="button"
        >
          <i class="save icon"></i>
          Enregistrer
        </button>
        <button data-test-cancel-button class="ui button item" {{on "click" @controller.cancelEdit}} type="button">
          <i class="ban icon"></i>
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>
