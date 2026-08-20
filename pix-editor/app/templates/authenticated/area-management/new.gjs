import PixButton from '@1024pix/pix-ui/components/pix-button';
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
            @change={{@controller.setTitleFrFr}}
            @edition={{true}}
            @label="Titre"
            @id="area-title-fr"
          />
          <div class="segment segment--raised">
            <span class="flag">🇬🇧</span>
            <Input
              @value={{@controller.area.titleEnUs}}
              @change={{@controller.setTitleEnUs}}
              @edition={{true}}
              @label="Titre (en)"
              @id="area-title-en"
            />
          </div>
        </form>
      </div>
      <div class="lateral-menu">
        <PixButton data-test-save-button @triggerAction={{@controller.save}} type="button" @iconBefore="check">
          Enregistrer
        </PixButton>
        <PixButton
          data-test-cancel-button
          @variant="secondary"
          @triggerAction={{@controller.cancelEdit}}
          type="button"
          @iconBefore="close"
        >
          Annuler
        </PixButton>
      </div>
    </div>
  </div>
</template>
