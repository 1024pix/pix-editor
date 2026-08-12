import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import CreateModuleButton from 'pixeditor/components/modules/create-module-button';
import ModuleForm from 'pixeditor/components/modules/module-form';
import ModuleNotification from 'pixeditor/components/modules/module-notification';
import PlayModuleButtons from 'pixeditor/components/modules/play-module-buttons';

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
    <header class="module__header">
      <div>
        <PixBreadcrumb class="module-header__breadcrumb" @links={{this.links}} />
        <h1 class="module-header__title">{{@model.module.internalTitle}}</h1>
      </div>
      <div class="page-actions">
        <PlayModuleButtons @module={{@model.module}} />
        <div class="module__separator"></div>
        <CreateModuleButton @module={{@model.module}} />
      </div>
    </header>
    <main class="page-body">
      <section class="page-section module-form">
        <ModuleNotification @module={{@model.module}} />
        <ModuleForm @module={{@model.module}} @readonly={{true}} />
      </section>
    </main>
  </template>
}
