import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
<template>
  <PixModal @title="Déconnexion" @onCloseButtonClick={{@onDeny}} @showModal={{@showModal}}>
    <:content>
      <p data-test-logout-message>Voulez-vous vraiment vous déconnecter ?</p>
    </:content>
    <:footer>
      <PixButton
        data-test-logout-cancel-button
        @backgroundColor="transparent-light"
        @isBorderVisible={{true}}
        @triggerAction={{@onDeny}}
      >
        Non
      </PixButton>
      <PixButton data-test-logout-ok-button @triggerAction={{@onConfirm}}>
        Oui
      </PixButton>
    </:footer>
  </PixModal>
</template>
