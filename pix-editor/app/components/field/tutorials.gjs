import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';
import { not } from 'ember-truth-helpers';

import PopInTutorialComponent from '../pop-in/tutorial';
import SelectSearch from './select-search';

export default class Tutorials extends Component {
  @tracked tutorialList = [];
  @tracked displayTutorialPopin = false;
  @tracked tutorial = null;
  defaultTitle = '';

  @service store;

  @service idGenerator;
  @service notify;
  @service loader;

  async _searchTutorial(query) {
    let tagSearch = false;
    if (query.startsWith('>')) {
      tagSearch = query
        .split('>')
        .filter((tag) => tag)
        .map((tag) => `FIND('${tag.trim()}', LOWER(Tags))`)
        .join(', ');
    }
    const tutorials = await this.store.query('tutorial', {
      filterByFormula: tagSearch ? `AND(${tagSearch})` : `FIND('${query.replace(/'/g, '\\\'')}', LOWER(Titre))`,
      maxRecords: 100,
      sort: [{ field: 'Titre', direction: 'asc' }],
    });
    const tagsLoad = tutorials.map((tutorial) => tutorial.tags);
    await Promise.all(tagsLoad);
    return tutorials.map((tutorial) => {
      const haveTags = tagSearch ? true : tutorial.tagsTitle !== null && tutorial.tagsTitle !== '';
      return {
        label: tutorial.title,
        description: haveTags ? `TAG : ${tutorial.tagsTitle}` : false,
        value: tutorial.id,
      };
    });
  }

  @action
  async attachTutorial(itemId) {
    const tutorial = await this.store.findRecord('tutorial', itemId);
    this.args.addTutorial(this.args.tutorials, tutorial);
  }

  @action
  addTutorial(e) {
    e.preventDefault();
    this.tutorial = this.store.createRecord('tutorial');
    this.displayTutorialPopin = true;
  }

  @action
  editTutorial(tutorial) {
    this.tutorial = tutorial;
    this.displayTutorialPopin = true;
  }

  @action
  async getSearchTutorialResults(query) {
    this.tutorialList = await this._searchTutorial(query.toLowerCase());
  }

  @action
  closeTutorialPopin() {
    this.tutorial.rollbackAttributes();
    this.displayTutorialPopin = false;
  }

  @action
  async saveTutorial() {
    this.loader.start();
    try {
      if (this.tutorial.link) {
        this.tutorial.link = this.tutorial.link.replaceAll(' ', '');
        new URL(this.tutorial.link);
      }
    } catch {
      this.loader.stop();
      this.notify.error('Lien du tutoriel non valide');
      return;
    }
    try {
      const tutorial = await this.tutorial.save();
      this.notify.message('Tutoriel créé');
      this.args.addTutorial(this.args.tutorials, tutorial);
      this.displayTutorialPopin = false;
    } catch (error) {
      Sentry.captureException(error);
      this.notify.error('Erreur lors de la création du tutoriel');
    } finally {
      this.loader.stop();
    }
  }

  @action
  setTutorialList(list) {
    this.tutorialList = list;
  }

  get selectId() {
    return `select-tutorial-${this.args.searchId}`;
  }

  get searchLabel() {
    return `Rechercher un tutoriel ${this.args.title.toLowerCase()}`;
  }

  <template>
    <div class="field {{if this.edition "" " disabled"}}">
      <label for={{this.selectId}}>
        {{@title}}
      </label>
      {{#if @edition}}
        <SelectSearch
          @selectId={{this.selectId}}
          @resultList={{this.tutorialList}}
          @setResultList={{this.setTutorialList}}
          @onChange={{this.attachTutorial}}
          @searchLabel={{this.searchLabel}}
          @searchPlaceholder="Commencer la recherche par > pour rechercher par Tag"
          @getResults={{this.getSearchTutorialResults}}
        />
      {{/if}}

    </div>
    <div class="field" id="tutorials-field">
      {{#if @tutorials.isPending}}
        <div class="ui active centered inline loader"></div>
      {{else}}
        <div class="ui cards">
          {{#each @tutorials as |tutorial|}}
            <div class="card">
              <div class="content">
                <div class="header">
                  {{tutorial.title}}
                  <span>
                    <a class="ui right floated button tutorial-link" href={{tutorial.link}} target="_blank"
                       rel="noreferrer noopener">
                      <PixIcon @name="openNew" />
                    </a>
                    {{#if @edition}}
                      <PixIconButton @ariaLabel="Modifier le tutoriel" @iconName="edit" @triggerAction={{fn this.editTutorial tutorial}} class="ui right floated" />
                      <PixIconButton @ariaLabel="Supprimer le tutoriel" @iconName="close" @triggerAction={{fn @removeTutorial @tutorials tutorial}} class="ui right floated" />
                    {{/if}}
                  </span>
                </div>
                <div class="description">
                  <div>Format : {{tutorial.format}}</div>
                  <div>Durée : {{tutorial.duration}}</div>
                  <div>Source : {{tutorial.source}}
                    <div class="ui right floated favorite">
                      {{#if tutorial.crush}}
                        <PixIcon @name="favorite" @plainIcon={{true}} />
                      {{/if}}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {{else if (not @edition)}}
            <div class="card">
              <div class="content">
                aucun élément
              </div>
            </div>
          {{/each}}
          {{#if @edition}}
            <div class="card">
              <div class="content">
                <PixButton @triggerAction={{this.addTutorial}} @variant="tertiary" @size="small" @iconBefore="add">
                  Ajouter un tutoriel <span class="sr-only">{{@title}}</span>
                </PixButton>
              </div>
            </div>
          {{/if}}
        </div>
      {{/if}}
    </div>
    <PopInTutorialComponent
      @tutorial={{this.tutorial}}
      @close={{this.closeTutorialPopin}}
      @saveTutorial={{this.saveTutorial}}
      @showModal={{this.displayTutorialPopin}}
    />
  </template>
}
