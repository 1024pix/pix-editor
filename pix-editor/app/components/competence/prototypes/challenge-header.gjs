import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
<template>
  <div class={{concat "challenge-header " @class}} data-testid="challenge-header">
    <div class="ui menu">
      <div class="ui left menu">
        {{yield to="actions"}}
      </div>
      <div class="item header">
        {{yield}}
      </div>
      <div class="ui right menu">
        {{#if @maximized}}
          <button {{on "click" @minimize}} class="ui icon button item" type="button" title="Minimiser la fenêtre">
            <i class="window minimize icon"></i>
          </button>
        {{else}}
          <button {{on "click" @maximize}} class="ui icon button item" type="button" title="Maximiser la fenêtre">
            <i class="window maximize outline icon"></i>
          </button>
        {{/if}}
        <button {{on "click" @close}} class="ui icon button item" type="button" title="Fermer la fenêtre">
          <i class="icon window close"></i>
        </button>
      </div>
    </div>
  </div>
</template>
