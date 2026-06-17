import PixButton from '@1024pix/pix-ui/components/pix-button';

function back() {
  return window.history.back();
}

<template>
  <PixButton @triggerAction={{back}}>Retour</PixButton>
</template>
