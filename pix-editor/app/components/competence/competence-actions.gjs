import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { eq, or } from 'ember-truth-helpers';

export default class CompetenceActions extends Component {
  @service config;

  get skillClass() {
    return this.args.section === 'skills' ? 'competence-actions--skill-mode ' : '';
  }

  <template>
    <div class="competence-actions {{this.skillClass}}">
      {{#unless this.config.lite}}
        {{#if (eq @section "skills")}}
          <div class="competence-actions__tabs">
            <div
              class="competence-actions__tab competence-actions__tab--production
                {{if (eq @view 'production') 'competence-actions__tab--active' ''}}"
              {{on "click" (fn @selectView "production")}}
            >
              En production
              {{#if @languageFilter}}
                <PixTooltip @id="language-filter-info" @position="right" @isLight={{true}}>
                  <:triggerElement>
                    <PixIcon aria-describedby="language-filter-info" @name="info" />
                  </:triggerElement>
                  <:tooltip>
                    <table class="legend-table legend-table--skill">
                      <thead>
                        <tr>
                          <th colspan="2"> Pour la langue sélectionnée</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="legend-table__color legend-table__color--warning"></td>
                          <td>L'acquis possède un des deux types de tutoriel</td>
                        </tr>
                        <tr>
                          <td class="legend-table__color legend-table__color--danger"></td>
                          <td>L'acquis ne possède pas de tutoriel</td>
                        </tr>
                      </tbody>
                    </table>
                  </:tooltip>
                </PixTooltip>
              {{/if}}
            </div>
            <div
              class="competence-actions__tab competence-actions__tab--workbench
                {{if (eq @view 'workbench') 'competence-actions__tab--active' ''}}"
              {{on "click" (fn @selectView "workbench")}}
            >Atelier</div>
            <div
              data-test-select-draft-view
              class="competence-actions__tab competence-actions__tab--proposal
                {{if (eq @view 'draft') 'competence-actions__tab--active' ''}}"
              {{on "click" (fn @selectView "draft")}}
            >En construction</div>
          </div>
          {{#if (eq @view "production")}}
            <button
              class="competence-actions__button competence-actions__button--left"
              type="button"
              {{on "click" @shareSkills}}
            >
              <PixIcon @name="share" @ariaHidden={{true}} />
              Exporter
            </button>
          {{/if}}
        {{else if (eq @section "challenges")}}
          <div class="competence-actions__tabs">
            <div
              class="competence-actions__tab competence-actions__tab--production
                {{if (eq @view 'production') 'competence-actions__tab--active' ''}}"
              {{on "click" (fn @selectView "production")}}
            >
              En production
              {{#if @languageFilter}}
                <PixTooltip
                  @id="language-filter-info"
                  @position="right"
                  @isInline={{true}}
                  @isLight={{true}}
                  className="custom-tooltip language-filter-info"
                >
                  <:triggerElement>
                    <PixIcon aria-describedby="language-filter-info" @name="info" />
                  </:triggerElement>
                  <:tooltip>
                    <table class="legend-table legend-table--challenge">
                      <thead>
                        <tr>
                          <th colspan="2"> Pour la langue sélectionnée</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="legend-table__color legend-table__color--warning"></td>
                          <td>L'acquis ne possède que des épreuves en cours de construction</td>
                        </tr>
                        <tr>
                          <td class="legend-table__color legend-table__color--danger"></td>
                          <td>L'acquis ne possède aucune épreuve</td>
                        </tr>
                      </tbody>
                    </table>
                  </:tooltip>
                </PixTooltip>
              {{/if}}
            </div>
            <div
              class="competence-actions__tab competence-actions__tab--workbench
                {{if (or (eq @view 'workbench') (eq @view 'workbench-list')) 'competence-actions__tab--active' ''}}"
              {{on "click" (fn @selectView "workbench")}}
            >Atelier</div>
          </div>
        {{/if}}
      {{/unless}}
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
