import { service } from '@ember/service';
import Component from '@glimmer/component';
import eq from 'ember-truth-helpers/helpers/eq';
import CellProduction from 'pixeditor/components/competence/grid/cell-production';
import CellWorkbench from 'pixeditor/components/competence/grid/cell-workbench';
import CellSkillWorkbench from 'pixeditor/components/competence/grid/cell-skill-workbench';
import CellSkill from 'pixeditor/components/competence/grid/cell-skill';
import { LinkTo } from '@ember/routing';
import { array, concat } from '@ember/helper';
import CellQuality from 'pixeditor/components/competence/grid/cell-quality';

export default class GridCell extends Component {
  <template>
    {{#if (eq this.cellType "production")}}
      <CellProduction @skillOverview={{@skillOverview}} @link={{@link}} @languageFilter={{@languageFilter}} />
    {{else if (eq this.cellType "workbench")}}
      <CellWorkbench @tubeId={{@tubeId}} @skillOverview={{@skillOverview}} />
    {{else if (eq this.cellType "skill-workbench")}}
      <CellSkillWorkbench @tube={{@tube}} @skill={{@skill}} @skills={{@skills}} />
    {{else if (eq this.cellType "skill")}}
      <CellSkill @skill={{@skill}} @languageFilter={{@languageFilter}} />
    {{else if (eq this.cellType "skill-draft")}}
      <CellSkill @skill={{@skill}} @languageFilter={{@languageFilter}} />
    {{else if (eq this.cellType "add-skill")}}
      <td>
        <LinkTo
          @route="authenticated.competence.skills.new"
          @models={{array @tube.id this.skillLevel}}
          class="add-skill"
          aria-label="{{concat 'ajouter un acquis de niveau ' this.skillLevel ' pour le sujet ' @tube.name}}"
        >
          <i class="icon plus circle"></i>
        </LinkTo>
      </td>
    {{else if (eq this.cellType "quality")}}
      <CellQuality @skill={{@skill}} />
    {{else}}
      <td class="skill-cell__empty">
        <div class="no-visibility">{{@tube.name}}</div>
      </td>
    {{/if}}
  </template>

  @service access;
  @service config;

  get cellType() {
    const { skill, skillOverview } = this.args;
    switch (this.args.section) {
      case 'challenges':
        switch (this.args.view) {
          case 'production':
            if (skillOverview) {
              return 'production';
            }
            break;
          case 'workbench':
            if (skillOverview) {
              return 'workbench';
            }
            break;
        }
        break;
      case 'skills':
        switch (this.args.view) {
          case 'production':
            if (skill) {
              return 'skill';
            }
            break;
          case 'workbench':
            if (skill) {
              return 'skill-workbench';
            } else if (this.access.mayEditSkills()) {
              return 'add-skill';
            }
            break;
          case 'draft':
            if (skill) {
              return 'skill-draft';
            } else if (this.access.mayEditSkills()) {
              return 'add-skill';
            }
            break;
        }
        break;
      case 'quality':
        if (skill) {
          return 'quality';
        }
        break;
    }
    return 'empty';
  }

  get skillLevel() {
    return this.args.index + 1;
  }
}
