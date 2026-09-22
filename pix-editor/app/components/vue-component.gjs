import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { tracked } from "@glimmer/tracking";
import { PiniaColada } from "@pinia/colada";

const mountVueComponent = modifier((element, [vueApp]) => (
  vueApp.mount(element)
));

export default class VueComponent extends Component {
  @tracked vueApp;

  constructor(...args) {
    super(...args);
    const pinia = createPinia();
    this.vueApp = createApp(this.args.component);
    this.vueApp.use(pinia);
    this.vueApp.use(PiniaColada);
  }

  willDestroy(...args) {
    this.vueApp?.unmount?.();
    super.willDestroy(...args);
  }



  <template>
    <div {{mountVueComponent this.vueApp}} />
  </template>
}
