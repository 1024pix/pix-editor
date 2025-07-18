import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileScript, compileTemplate, parse } from 'vue/compiler-sfc';

const VUE_COMPONENTS_DIR = './components';
const GJS_OUTPUT_DIR = '../../pix-editor/app/components/generated';

function camelToKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

for (const file of await readdir(VUE_COMPONENTS_DIR)) {
  if (!file.endsWith('.vue')) continue;
  const componentName = path.basename(file, '.vue');
  const kekabizedComponentName = camelToKebab(componentName);
  const componentContent = await readFile(`${VUE_COMPONENTS_DIR}/${componentName}.vue`, 'utf-8');
  const jsName = `${kekabizedComponentName}.dist.js`;

  const parsed = parse(componentContent);
  const template = compileTemplate({
    source: parsed.descriptor.template.content,
    filename: jsName,
    id: kekabizedComponentName,
  });
  const script = compileScript(parsed.descriptor, {
    id: kekabizedComponentName,
    reactivityTransform: true,
  });

  const renderFunction = template.code.replaceAll('export function', 'export default {\n') + ',';

  const jsContent = script.content
    .replaceAll( // wrong file type import
      /import \w+ from '.\/(\w+)\.vue';/g,
      (_, importName) => {
        const kebabizedImportName = camelToKebab(importName);
        return `import ${importName} from './${kebabizedImportName}.dist.js';`
      }
    )
    .replace('export default {', renderFunction) // adds render function to default export
    .replace("Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })", '') // fix template binding
    .replaceAll(/_resolveComponent\("([^"]*)"\)/g, '$1'); // replace resolver with var reference

  await writeFile(`${GJS_OUTPUT_DIR}/${jsName}`, jsContent);

  const jsComponent = await import(`${GJS_OUTPUT_DIR}/${jsName}`);
  const props = Object.keys(jsComponent.default.props ?? {});

  const gjsContent = `import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { createApp, reactive, h } from 'vue';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import didInsert from '../../modifiers/custom-did-insert';
import didUpdate from '../../modifiers/custom-did-update';
import Vue${componentName} from './${jsName}';

export default class ${componentName} extends Component {
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
      render: () => h(Vue${componentName}, this.propsData),
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
      ${props.map((prop) => `{{didUpdate (fn this.updateProps "${prop}") @${prop}}}`).join('\n      ')}
    ></div>
  </template>
}
`;
  await writeFile(`${GJS_OUTPUT_DIR}/${kekabizedComponentName}.gjs`, gjsContent);
}
