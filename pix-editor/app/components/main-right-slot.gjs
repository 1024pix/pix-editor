import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { tracked } from '@glimmer/tracking';

export default class MainRightSlot extends Component {
  <template>
    <div class="main-right" {{this.onMount}}></div>
  </template>

  isMounted = false;

  onMount = modifier((element) => {
    if (this.isMounted) {
      return;
    }
    this.args.onMount(element);
    this.isMounted = true;
  });
}
