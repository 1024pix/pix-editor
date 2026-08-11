import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { and, eq } from 'ember-truth-helpers';

export default class CompetenceActions extends Component {
  get tootltipWarning() {
    return this.args.section === 'skills'
      ? "L'acquis possède un des deux types de tutoriel"
      : "L'acquis ne possède que des épreuves en cours de construction";
  }

  get tootltipDanger() {
    return this.args.section === 'skills'
      ? "L'acquis ne possède pas de tutoriel"
      : "L'acquis ne possède aucune épreuve";
  }

  <template>
    <div class="competence-actions">
      <PixTabs @variant="orga">
        <a
          href="#"
          {{on "click" (fn @selectView "production")}}
          class="competence-actions__tab-tooltip {{if (eq @view 'production') 'active' ''}}"
        >
          En production
          {{#if @languageFilter}}
            <PixTooltip @id="language-filter-info" @position="right" @isLight={{true}}>
              <:triggerElement>
                <PixIcon aria-describedby="language-filter-info" @name="info" />
              </:triggerElement>
              <:tooltip>
                <table
                  class="legend-table {{if (eq @section 'skills') 'legend-table--skill' 'legend-table--challenge'}}"
                >
                  <thead>
                    <tr>
                      <th colspan="2"> Pour la langue sélectionnée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="legend-table__color legend-table__color--warning"></td>
                      <td>{{this.tootltipWarning}}</td>
                    </tr>
                    <tr>
                      <td class="legend-table__color legend-table__color--danger"></td>
                      <td>{{this.tootltipDanger}}</td>
                    </tr>
                  </tbody>
                </table>
              </:tooltip>
            </PixTooltip>
          {{/if}}
        </a>
        <a href="#" {{on "click" (fn @selectView "workbench")}} class="{{if (eq @view 'workbench') 'active' ''}}">
          Atelier
        </a>
        {{#if (eq @section "skills")}}
          <a href="#" {{on "click" (fn @selectView "draft")}} class="{{if (eq @view 'draft') 'active' ''}}">
            En construction
          </a>
        {{/if}}
      </PixTabs>
      {{#if (and (eq @view "production") (eq @section "skills"))}}
        <button
          class="competence-actions__button competence-actions__button--left"
          type="button"
          {{on "click" @shareSkills}}
        >
          <PixIcon @name="share" @ariaHidden={{true}} />
          Exporter
        </button>
      {{/if}}
      <button
        class="competence-actions__button competence-actions__button--right"
        {{on "click" (fn @refresh true)}}
        type="button"
      >
        <PixIcon @name="refresh" @ariaHidden={{true}} />
        Actualiser
      </button>
    </div>
  </template>
}
