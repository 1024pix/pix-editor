import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';

<template>
  <PixTabs @ariaLabel={{t "modules.components.modules-tabs.navigation"}}>
    <LinkTo @route="authenticated.modules.workbench">
      {{t "modules.components.modules-tabs.workbench"}}
    </LinkTo>
    <LinkTo @route="authenticated.modules.production">
      {{t "modules.components.modules-tabs.production"}}
    </LinkTo>
  </PixTabs>
</template>
