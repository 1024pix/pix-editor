import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';

<template>
  <PixTabs @ariaLabel="Navigation">
    <LinkTo @route="authenticated.modules.workbench">
      Atelier
    </LinkTo>
    <LinkTo @route="authenticated.modules.production">
      En production
    </LinkTo>
  </PixTabs>
</template>
