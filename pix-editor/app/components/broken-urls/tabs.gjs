import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
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
