import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
<template>
  <div class={{concat "challenge-header " @class}} data-testid="challenge-header">
    <div class="challenge-header__menu">
      <div class="challenge-header__left">
        {{yield to="actions"}}
      </div>
      <div class="challenge-header__title">
        {{yield}}
      </div>
      <div class="challenge-header__right">
        {{#if @maximized}}
          <button {{on "click" @minimize}} class="challenge-header__action" type="button" title="Minimiser la fenêtre">
            <PixIcon @name="minus" @ariaHidden={{true}} />
          </button>
        {{else}}
          <button {{on "click" @maximize}} class="challenge-header__action" type="button" title="Maximiser la fenêtre">
            <PixIcon @name="openInFull" @ariaHidden={{true}} />
          </button>
        {{/if}}
        <button {{on "click" @close}} class="challenge-header__action" type="button" title="Fermer la fenêtre">
          <PixIcon @name="close" @ariaHidden={{true}} />
        </button>
      </div>
    </div>
  </div>
</template>
