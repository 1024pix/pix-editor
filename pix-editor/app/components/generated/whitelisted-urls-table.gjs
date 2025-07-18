
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { createApp, reactive, h } from 'vue';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import didInsert from '../../modifiers/custom-did-insert';
import didUpdate from '../../modifiers/custom-did-update';
import VueWhitelistedUrlsTable from './whitelisted-urls-table.dist.js';

export default class WhitelistedUrlsTable extends Component {
  @tracked vueApp = null;

  propsData = reactive(this.serializeProp({ ...this.args }));

  constructor(...args) {
    super(...args);
    this.updateProps();
  }

  serializeProp(prop) {
    if (!prop) return prop;
    if (Array.isArray(prop)) {
      return prop.map((el) => this.serializeProp(el));
    }
    if (prop?.constructor?.name?.toLowerCase()?.includes('model')) {
      const serialized = prop.serialize({ includeId: true });
      return { ...serialized?.data?.attributes, id: serialized?.data?.id };
    }
    if (typeof prop === 'object') {
      const res = {};
      for (const key in prop) {
        res[key] = this.serializeProp(prop[key]);
      }
      return res;
    }
    return prop;
  }

  @action
  mountVue(element) {
    this.vueApp = createApp({
      render: () => h(VueWhitelistedUrlsTable, this.propsData),
    });
    this.vueApp.mount(element);
  }

  @action
  updateProps(propName) {
    if (!propName) return;
    this.propsData[propName] = this.serializeProp(this.args[propName]);
  }

  willDestroy() {
    if (this.vueApp) {
      this.vueApp.unmount();
    }
    super.willDestroy(...arguments);
  }

  <template>
    <div
      {{didInsert this.mountVue}}
      {{didUpdate (fn this.updateProps "whitelistedUrls") @whitelistedUrls}}
    ></div>
  </template>
}
