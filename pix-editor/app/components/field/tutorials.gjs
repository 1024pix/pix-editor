import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
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
  async getSearchTutorialResults(query) {
    this.tutorialList = await this._searchTutorial(query.toLowerCase());
  }

  @action
  addTutorial(e) {
    e.preventDefault();
    const date = new Date();
    this.tutorial = this.store.createRecord('tutorial', {
      pixId: this.idGenerator.newId('tutorial'),
      date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
    });
    this.displayTutorialPopin = true;
  }

  @action
  editTutorial(tutorial) {
    this.tutorial = tutorial;
    this.displayTutorialPopin = true;
  }

  @action
  closeTutorialPopin() {
    this.displayTutorialPopin = false;
  }

  @action
  async saveTutorial() {
    this.displayTutorialPopin = false;
    this.loader.start();
    try {
      const tutorial = await this.tutorial.save();
      this.loader.stop();
      this.notify.message('Tutoriel créé');
      this.args.addTutorial(this.args.tutorials, tutorial);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.loader.stop();
      this.notify.error('Erreur lors de la création du tutoriel');
    }
  }

  @action
  async attachTutorial(itemId) {
    const tutorial = await this.store.findRecord('tutorial', itemId);
    this.args.addTutorial(this.args.tutorials, tutorial);
  }

  @action
  setTutorialList(list) {
    this.tutorialList = list;
  }

  // @action
  // formatOptionLabel(result) {
  //   return `
  //     <div class="search-title">
  //       ${result.title}
  //     </div>
  //     ${result.description ? '<div class="search-description">${result.description}</div>' : ''}
  //   `;
  // }

  get selectId() {
    return `select-tutorial-${this.args.searchId}`;
  }

  <template>
    <div class="field {{if this.edition "" " disabled"}}">
      <label>
        {{@title}}
      </label>
      {{#if @edition}}
        <SelectSearch
          @selectId={{this.selectId}}
          @resultList={{this.tutorialList}}
          @setResultList={{this.setTutorialList}}
          @onChange={{this.attachTutorial}}
          @searchPlaceholder="Commencer la recherche par > pour rechercher par Tag"
          @getResults={{this.getSearchTutorialResults}}
        />
      {{/if}}

    </div>
    <div class="field">
      {{#if @tutorials.isPending}}
        <div class="ui active centered inline loader"></div>
      {{else}}
        <div class="ui cards">
          {{#each @tutorials as |tutorial|}}
            <div class="card">
              <div class="content">
                <div class="header">
                  {{#if @edition}}
                    <div {{on "click" (fn @removeTutorial @tutorials tutorial)}} title="Supprimer le tutoriel" class="ui right floated icon button">
                      <i class="close icon"></i>
                    </div>
                    <div {{on "click" (fn this.editTutorial tutorial)}} title="Modifier le tutoriel" class="ui right floated button">
                      <i class="edit icon"></i>
                    </div>
                  {{/if}}
                  <a class="ui right floated button basic" href={{tutorial.link}} target="_blank"
                     rel="noreferrer noopener">
                    <i class="external icon"></i>
                  </a>
                  {{tutorial.title}}
                </div>
                <div class="description">
                  <div>Format : {{tutorial.format}}</div>
                  <div>Durée : {{tutorial.duration}}</div>
                  <div>Source : {{tutorial.source}}
                    <div class="ui right floated">

                      {{#if tutorial.crush}}
                        <i class="red heart icon"></i>
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
                <a href="#" {{on "click" this.addTutorial}}>
                  <i class="icon plus circle"></i>
                  Ajouter un tutoriel
                </a>
              </div>
            </div>
          {{/if}}
        </div>
      {{/if}}
    </div>
    <PopInTutorialComponent @tutorial={{this.tutorial}}
                     @close={{this.closeTutorialPopin}}
                     @saveTutorial={{this.saveTutorial}}
                     @showModal={{this.displayTutorialPopin}}
    />

  </template>
}
