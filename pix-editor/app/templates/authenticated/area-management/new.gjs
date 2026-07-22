import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { on } from '@ember/modifier';
import Input from 'pixeditor/components/field/input';
<template>
  <div class="main-left area-management">
    <div class="main-title">
      <h1 class="main-title__heading">Nouveau domaine du pix + {{@controller.framework.name}}</h1>
    </div>
    <div class="area-management__details">
      <div class="area-management__data">
        <form action class="form">
          <Input
            data-test-area-title-input
            @value={{@controller.area.titleFrFr}}
            @edition={{true}}
            @label="Titre"
            @id="area-title-fr"
          />
          <div class="segment segment--raised">
            <span class="flag">🇬🇧</span>
            <Input @value={{@controller.area.titleEnUs}} @edition={{true}} @label="Titre (en)" @id="area-title-en" />
          </div>
        </form>
      </div>
      <div class="area-management__menu">
        <button
          data-test-save-button
          class="area-management__menu-button area-management__menu-button--important"
          {{on "click" @controller.save}}
          type="button"
        >
          <PixIcon @name="save" @ariaHidden={{true}} />
          Enregistrer
        </button>
        <button
          data-test-cancel-button
          class="area-management__menu-button"
          {{on "click" @controller.cancelEdit}}
          type="button"
        >
          <PixIcon @name="block" @ariaHidden={{true}} />
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>
