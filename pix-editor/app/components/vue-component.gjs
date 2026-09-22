import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { createApp } from 'vue';
import { tracked } from "@glimmer/tracking";

const mountVueComponent = modifier((element, [vueApp]) => (
  vueApp.mount(element)
));

export default class VueComponent extends Component {
  @tracked vueApp;

  constructor(...args) {
    super(...args);
    this.vueApp = createApp(this.args.component);
  }

  willDestroy(...args) {
    this.vueApp?.unmount?.();
    super.willDestroy(...args);
  }



  <template>
    <div {{mountVueComponent this.vueApp}} />
  </template>
}
