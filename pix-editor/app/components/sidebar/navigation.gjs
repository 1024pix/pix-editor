import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

import PopInNewFrameworkComponent from '../pop-in/new-framework';

export default class SidebarNavigationComponent extends Component {
  addFrameworkLabel = 'Créer un nouveau référentiel';

  @service access;
  @service currentData;
  @service loader;
  @service notify;
  @service router;
  @service store;

  @tracked newFramework;
  @tracked displayNewFrameworkPopIn;

  get areas() {
    return this.currentData.getAreas();
  }

  get frameworks() {
    return this.currentData.getFrameworks() || [];
  }

  get framework() {
    return this.currentData.getFramework();
  }

  get selectedFrameworkId() {
    return this.framework?.id;
  }

  get frameworkOptionList() {
    const frameworkList = this.frameworks.map((framework) => ({
      label: framework.name,
      value: framework.id,
    }));
    if (this.access.isAdmin()) {
      frameworkList.push({
        label: this.addFrameworkLabel,
        value: 'create',
      });
    }
    return frameworkList;
  }

  get mayCreateCompetence() {
    return this.access.isAdmin() && !this.currentData.isPixFramework;
  }

  get mayCreateArea() {
    return this.access.isAdmin() && !this.currentData.isPixFramework;
  }

  @action
  setFramework(frameworkId) {
    if (frameworkId === 'create') {
      this._openNewFrameworkPopIn();
      return;
    }
    const framework = this.frameworks.find(({ id }) => id === frameworkId);
    this.currentData.setFramework(framework);
  }

  @action
  _openNewFrameworkPopIn() {
    this.newFramework = this.store.createRecord('framework', {});
    this.displayNewFrameworkPopIn = true;
  }

  @action
  closeNewFrameworkPopIn() {
    this.store.deleteRecord(this.newFramework);
    this.displayNewFrameworkPopIn = false;
  }

  @action
  async saveFramework() {
    try {
      const router = this.router;
      this.loader.start();
      await this.newFramework.save();
      this.setFramework(this.newFramework.id);
      this.notify.message('Référentiel créé');
      this.displayNewFrameworkPopIn = false;
      router.transitionTo('authenticated');
    } catch (error) {
      Sentry.captureException(error);
      console.error(error);
      this.notify.error('Erreur lors de la création du Référentiel');
    } finally {
      this.loader.stop();
    }
  }

  <template>
    {{#if @displayFrameworkList}}
      <PixSelect
        @id="select-framework"
        @value={{this.selectedFrameworkId}}
        @options={{this.frameworkOptionList}}
        @onChange={{this.setFramework}}
        @placeholder={{"Sélectionner un référentiel"}}
        @placement="bottom"
        class="select-framework"
        @hideDefaultOption={{true}}
      >
        <:label>
          <span class="sr-only">Sélectionner un référentiel</span>
        </:label>
      </PixSelect>
    {{/if}}
    <div class="area-accordion">
      {{#each this.areas as |area|}}
        <PixAccordions>
          <:title>
            <span data-test-area-item>
              {{area.name}}
            </span>
          </:title>
          <:content>
            {{#each area.sortedCompetences as |competence|}}
              <LinkTo
                data-test-competence-item
                @route="authenticated.competence"
                @model={{competence.id}}
                @query={{hash leftMaximized=false}}
                class="area-link"
                {{on "click" @close}}
              >
                {{competence.name}}
              </LinkTo>
            {{/each}}
            {{#if this.mayCreateCompetence}}
              <LinkTo
                @route="authenticated.competence-management.new"
                @model={{area.id}}
                class="area-link"
                {{on "click" @close}}
              >
                <i class="plus square icon"></i>Ajouter une compétence
              </LinkTo>
            {{/if}}
          </:content>
        </PixAccordions>
      {{/each}}
      {{#if this.mayCreateArea}}
        <LinkTo
          @route="authenticated.area-management.new"
          @model={{this.framework.id}}
          class="area-link"
          {{on "click" @close}}
        >
          <i class="plus square icon"></i>Ajouter un domaine
        </LinkTo>
      {{/if}}
    </div>
    {{#if this.displayNewFrameworkPopIn}}
      <PopInNewFrameworkComponent
        @framework={{this.newFramework}}
        @close={{this.closeNewFrameworkPopIn}}
        @save={{this.saveFramework}}
        @showModal={{this.displayNewFrameworkPopIn}}
      />
    {{/if}}
  </template>
}
