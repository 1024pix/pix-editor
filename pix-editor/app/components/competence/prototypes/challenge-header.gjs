import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { concat } from '@ember/helper';

<template>
  <div class="challenge-header">
    <div class="challenge-header__menu">
      <div class="challenge-header__left">
        {{yield to="actions"}}
      </div>
      <div class="challenge-header__title">
        <div>
          {{yield}}
        </div>
        <span class={{concat "bullet_status " @class}}></span>
      </div>
      <div class="challenge-header__right">
        {{#if @maximized}}
          <PixIconButton
            @ariaLabel="Minimiser la fenêtre"
            title="Minimiser la fenêtre"
            @iconName="minus"
            @triggerAction={{@minimize}}
            @size="small"
          />
        {{else}}
          <PixIconButton
            @ariaLabel="Maximiser la fenêtre"
            title="Maximiser la fenêtre"
            @iconName="openInFull"
            @triggerAction={{@maximize}}
            @size="small"
          />
        {{/if}}
        <PixIconButton
          @ariaLabel="Fermer la fenêtre"
          title="Fermer la fenêtre"
          @iconName="close"
          @triggerAction={{@close}}
          @size="small"
        />
      </div>
    </div>
  </div>
</template>
