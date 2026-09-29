import { PixToastContainer } from '@1024pix/nebulix-ember';

<template>
  {{outlet}}

  <PixToastContainer @closeButtonAriaLabel="Fermer la notification" />
</template>
