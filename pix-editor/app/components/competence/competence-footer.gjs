import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import eq from 'ember-truth-helpers/helpers/eq';

export default class CompetenceFooter extends Component {
  <template>
    <div class="competence-footer {{if (eq @section 'skills') 'competence-footer--skill-mode'}}">
      {{#if this.displayWorkbenchViews}}
        <PixIconButton
          class="competence-footer__view {{if (eq @view 'workbench') 'competence-footer__view--active'}}"
          title="Grille d'atelier des épreuves"
          @iconName="displaySettings"
          @ariaLabel="Grille d'atelier des épreuves"
          @triggerAction={{fn @selectView "workbench"}}
        />
        <PixIconButton
          class="competence-footer__view {{if (eq @view 'workbench-list') 'competence-footer__view--active'}}"
          title="Atelier d'atelier des épreuves"
          @iconName="menu"
          @ariaLabel="Atelier d'atelier des épreuves"
          @triggerAction={{fn @selectView "workbench-list"}}
        />
      {{/if}}
      {{#if this.mayCreateTheme}}
        <PixButton
          class="competence-footer__action competence-footer__action--left"
          @iconBefore="add"
          @triggerAction={{@newTheme}}
        >
          Nouvelle Thématique
        </PixButton>

        <PixButton
          class="competence-footer__action competence-footer__action--left"
          @iconBefore="sort"
          @triggerAction={{@displaySortThemesPopIn}}
        >
          Trier les Thématiques
        </PixButton>
      {{/if}}
      <div class="competence-footer__info">
        <div class="competence-footer__count">Tubes : {{this.tubesCount}}</div>
        <div class="competence-footer__count">Acquix : {{this.skillsCount}}</div>
      </div>
      {{#if this.mayCreatePrototype}}
        <PixButton
          class="competence-footer__action competence-footer__action--right"
          @iconBefore="add"
          @triggerAction={{@newPrototype}}
          data-test-create-new-challenge
        >
          Nouveau prototype
        </PixButton>
      {{/if}}
    </div>
  </template>

  @service access;

  get isOverview() {
    return this.args.competenceOverview != null;
  }

  get tubesCount() {
    if (this.isOverview) {
      return this.args.competenceOverview.tubesCount;
    }
    return this.displayProductionStats ? this.args.competence.productionTubeCount : this.args.competence.tubeCount;
  }

  get skillsCount() {
    if (this.isOverview) {
      return this.args.competenceOverview.skillsCount;
    }
    return this.displayProductionStats ? this.args.competence.productionSkillCount : this.args.competence.skillCount;
  }

  get skillClass() {
    return this.args.section === 'skills' ? ' skill-mode ' : '';
  }

  get displayWorkbenchViews() {
    return this.args.section === 'challenges' && this.args.view !== 'production';
  }

  get displayProductionStats() {
    const section = this.args.section;
    return section === 'quality' || (section === 'challenges' && this.args.view === 'production');
  }

  get mayCreateTheme() {
    const section = this.args.section;
    const view = this.args.view;
    return section === 'skills' && view === 'workbench' && this.access.mayCreateTheme();
  }

  get mayCreatePrototype() {
    const section = this.args.section;
    const view = this.args.view;
    return (
      section === 'challenges' &&
      (view === 'workbench' || view === 'workbench-list') &&
      this.access.mayCreatePrototype()
    );
  }
}
