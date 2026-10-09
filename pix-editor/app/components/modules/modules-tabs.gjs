import { PixTabs } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';

<template>
  <PixTabs @ariaLabel={{t "modules.components.modules-tabs.navigation"}}>
    <LinkTo @route="authenticated.modules.workbench" @query={{hash internalTitle=@internalTitle}}>
      {{t "modules.components.modules-tabs.workbench"}}
    </LinkTo>
    <LinkTo @route="authenticated.modules.production" @query={{hash internalTitle=@internalTitle}}>
      {{t "modules.components.modules-tabs.production"}}
    </LinkTo>
  </PixTabs>
</template>
