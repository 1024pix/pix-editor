import PixToastContainer from '@1024pix/pix-ui/components/pix-toast-container';

<template>
  {{outlet}}

  <PixToastContainer @closeButtonAriaLabel="Fermer la notification" />
</template>
