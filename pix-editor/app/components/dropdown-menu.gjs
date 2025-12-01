import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { autoUpdate, computePosition, flip } from '@floating-ui/dom';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { runTask } from 'ember-lifeline';

export default class DropdownMenu extends Component {
  @service router;

  @tracked isMenuDisplayed = false;
  @tracked cleanup;

  randomMenuId = `menu-id-${window.crypto.randomUUID()}`;
  randomButtonId = `button-id-${window.crypto.randomUUID()}`;

  displayMenuManager() {
    const button = document.getElementById(this.randomButtonId);
    const menu = document.getElementById(this.randomMenuId);

    this.updatePosition();
    menu.style.visibility = 'visible';

    this.cleanup = autoUpdate(button, menu, this.updatePosition.bind(this));
    menu.focus();
  }

  updatePosition() {
    const button = document.getElementById(this.randomButtonId);
    const menu = document.getElementById(this.randomMenuId);

    computePosition(button, menu, {
      placement: 'bottom-end',
      middleware: [flip({ fallbackAxisSideDirection: 'start' })],
    }).then(({ x, y }) => {
      Object.assign(menu.style, {
        top: `${y}px`,
        left: `${x}px`,
      });
    });
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.cleanup) this.cleanup();
  }

  @action
  onTrigger() {
    this.isMenuDisplayed = !this.isMenuDisplayed;
    if (this.isMenuDisplayed) {
      runTask(this, this.displayMenuManager, 0);
    }
  }

  @action
  onHide(event) {
    if (document.querySelector(`#${this.randomMenuId}`).contains(event.relatedTarget)) return;
    this.isMenuDisplayed = false;
    this.cleanup();
  }

  <template>
    <div class="dropdown" ...attributes>
      <PixIconButton
        id={{this.randomButtonId}}
        class="dropdown-button"
        @ariaLabel={{@ariaLabel}}
        @iconName={{@iconName}}
        @plainIcon={{@plainIcon}}
        @triggerAction={{this.onTrigger}}
        @withBackground={{@withBackground}}
        @size={{@size}}
        aria-haspopup="true"
        aria-controls={{this.randomMenuId}}
        aria-expanded="{{this.isMenuDisplayed}}"
      />
      {{#if this.isMenuDisplayed}}
        <ul
          id={{this.randomMenuId}}
          tabindex="-1"
          class="dropdown-menu"
          {{on "focusout" this.onHide}}
          aria-labelledby={{this.randomButtonId}}
          role="menu"
        >
          {{yield}}
        </ul>
      {{/if}}

    </div>
  </template>
}
