import { PixIconButton } from '@1024pix/nebulix-ember';
import { concat } from '@ember/helper';
<template>
  <div class={{concat "challenge-header " @class}} data-testid="challenge-header">
    <div class="challenge-header__menu">
      <div class="challenge-header__left">
        {{yield to="actions"}}
      </div>
      <h2 class="challenge-header__title">
        {{yield}}
      </h2>
      <div class="challenge-header__right">
        {{#if @maximized}}
          <PixIconButton @ariaLabel="Minimiser la fenêtre" @iconName="minus" @triggerAction={{@minimize}} />
        {{else}}
          <PixIconButton @ariaLabel="Maximiser la fenêtre" @iconName="openInFull" @triggerAction={{@maximize}} />
        {{/if}}
        <PixIconButton @ariaLabel="Fermer la fenêtre" @iconName="close" @triggerAction={{@close}} />
      </div>
    </div>
  </div>
</template>
