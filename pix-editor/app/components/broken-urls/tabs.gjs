import { PixTabs } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';

<template>
  <PixTabs @ariaLabel="Navigation" @variant="orga">
    <LinkTo @route="authenticated.broken-urls.challenges">
      Épreuves
    </LinkTo>
    <LinkTo @route="authenticated.broken-urls.tutorials">
      Tutoriels
    </LinkTo>
  </PixTabs>
</template>
