import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import CreateModuleButton from 'pixeditor/components/modules/create-module-button';
import ModuleBackButton from 'pixeditor/components/modules/module-back-button';
import ModuleForm from 'pixeditor/components/modules/module-form';
import ModuleNotification from 'pixeditor/components/modules/module-notification';
import PlayModuleButtons from 'pixeditor/components/modules/play-module-buttons';
import {inject as service} from "@ember/service";

export default class ProductionModule extends Component {
  @service intl;

  get links() {
    return [
      {
        route: 'authenticated.modules.production',
        label: this.intl.t('modules.breadcrumb.production.label'),
      },
      {
        label: this.intl.t('modules.breadcrumb.production-module.label'),
      },
    ];
  }

  <template>
    <header class="page-header">
      <PixBreadcrumb @links={{this.links}} />
      <h1 class="page-title">{{t "modules.production-module.title"}}</h1>
      <div class="page-actions">
        <PlayModuleButtons @module={{@model.module}} />
        <CreateModuleButton @module={{@model.module}} />
      </div>
    </header>
    <main class="page-body">
      <section class="page-section module-form">
        <ModuleNotification @module={{@model.module}} />
        <ModuleForm @module={{@model.module}} @readonly={{true}} />
        <div class="page-actions">
          <ModuleBackButton />
        </div>
      </section>
    </main>
  </template>
}
