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
import flagForLanguage from 'pixeditor/helpers/flag-for-language';

import PopInTutorialComponent from '../pop-in/tutorial';
import SelectSearch from './select-search';

export default class Tutorials extends Component {
  @tracked tutorialList = [];
  @tracked displayTutorialPopin = false;
  @tracked tutorial = null;
  @tracked isTutorialQueryOngoing = false;

  @service store;
  @service idGenerator;
  @service notify;
  @service loader;

  async _searchTutorial(query) {
    this.emptyTutorialList();
    if (!query || query.length === 0 || query === '>') {
      return;
    }
    this.isTutorialQueryOngoing = true;
    const filter = {};
    if (query.startsWith('>')) {
      filter.tagTitles = query
        .split('>')
        .filter((tag) => tag)
        .map((tag) => tag.trim());
    } else {
      filter.title = query.replace(/'/g, '\\\'');
    }
    try {
      const tutorials = await this.store.query('tutorial', { filter });
      const tagsLoad = tutorials.map((tutorial) => tutorial.tags);
      await Promise.all(tagsLoad);
      this.tutorialList = [...tutorials];
    } catch (err) {
      console.error(err);
    } finally {
      this.isTutorialQueryOngoing = false;
    }
  }

  @action
  async attachTutorial(tutorialOption) {
    const tutorial = await this.store.findRecord('tutorial', tutorialOption.id);
    this.args.addTutorial(this.args.tutorials, tutorial);
    this.emptyTutorialList();
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
    await this._searchTutorial(query.toLowerCase());
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
  emptyTutorialList() {
    this.tutorialList = [];
  }

  get searchLabel() {
    return `Rechercher un tutoriel ${this.args.title.toLowerCase()}`;
  }

  <template>
    <div class="field {{if this.edition "" " disabled"}}">
      {{#if @edition}}
        <SelectSearch
          @onSearch={{this.getSearchTutorialResults}}
          @onSelect={{this.attachTutorial}}
          @options={{this.tutorialList}}
          @isLoading={{this.isTutorialQueryOngoing}}
          @searchPlaceholder="Exemple: Rédiger un e-mail"
          @searchLabel={{this.searchLabel}}
          class="tutorial-search"
        >
          <:option as |tutorial|>
            <p class="tutorial-option">
              <span class="tutorial-option__title">{{tutorial.title}}</span>
              <span class="tutorial-option__tags">{{tutorial.tagsTitle}}</span>
            </p>
          </:option>
        </SelectSearch>
      {{else}}
        <p class="pix-label">{{@title}}</p>
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
                      <span class="flag" aria-label={{tutorial.language}}>{{flagForLanguage tutorial.language}}</span>
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
                Aucun tutoriel
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
