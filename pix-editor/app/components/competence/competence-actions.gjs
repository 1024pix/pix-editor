import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { eq, or } from 'ember-truth-helpers';

export default class CompetenceActions extends Component {
  @service config;

  get skillClass() {
    return this.args.section === 'skills' ? 'skill-mode ' : '';
  }

  <template>
    <div class="ui top attached borderless labelled icon menu {{this.skillClass}}">
      {{#unless this.config.lite}}
        {{#if (eq @section "skills")}}
          <div class="ui top attached tabular menu">
            <div class="item production {{if (eq @view "production") "active" ""}}" {{on "click" (fn @selectView "production")}}>
              En production
              {{#if @languageFilter}}
                <PixTooltip
                  @id="language-filter-info"
                  @position="right"
                  @isLight ={{true}}
                >
                  <:triggerElement>
                    <PixIcon aria-describedby="language-filter-info" @name="info"/>
                  </:triggerElement>
                  <:tooltip>
                    <table class="ui table skillSection">
                      <thead>
                      <tr>
                        <th colspan="2"> Pour la langue sélectionnée</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr>
                        <td class="color warning"></td>
                        <td>L'acquis possède un des deux types de tutoriel</td>
                      </tr>
                      <tr>
                        <td class="color danger"></td>
                        <td>L'acquis ne possède pas de tutoriel</td>
                      </tr>
                      </tbody>
                    </table>
                  </:tooltip>
                </PixTooltip>
              {{/if}}
            </div>
            <div class="item workbench {{if (eq @view "workbench") "active" ""}}" {{on "click" (fn @selectView "workbench")}}>Atelier</div>
            <div data-test-select-draft-view class="item proposal {{if (eq @view "draft") "active" ""}}" {{on "click" (fn @selectView "draft")}}>En construction</div>
          </div>
          {{#if (eq @view "production")}}
            <button class="ui button left item" type="button" {{on "click" @shareSkills}}>
              <i class="share square icon"></i> Exporter
            </button>
          {{/if}}
        {{else if (eq @section "challenges")}}
          <div class="ui top attached tabular menu">
            <div class="item production {{if (eq @view "production") "active" ""}}" {{on "click" (fn @selectView "production")}}>
              En production
              {{#if @languageFilter}}
                <PixTooltip
                  @id="language-filter-info"
                  @position="right"
                  @isInline ={{true}}
                  @isLight ={{true}}
                  className="custom-tooltip language-filter-info"
                >
                  <:triggerElement>
                    <PixIcon aria-describedby="language-filter-info" @name="info"/>
                  </:triggerElement>
                  <:tooltip>
                    <table class="ui table challengeSection">
                      <thead>
                      <tr>
                        <th colspan="2"> Pour la langue sélectionnée</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr>
                        <td class="color warning"></td>
                        <td>L'acquis ne possède que des épreuves en cours de construction</td>
                      </tr>
                      <tr>
                        <td class="color danger"></td>
                        <td>L'acquis ne possède aucune épreuve</td>
                      </tr>
                      </tbody>
                    </table>
                  </:tooltip>
                </PixTooltip>
              {{/if}}
            </div>
            <div class="item workbench {{if (or (eq @view "workbench") (eq @view "workbench-list")) "active" ""}}" {{on "click" (fn @selectView "workbench")}}>Atelier</div>
          </div>
        {{/if}}
      {{/unless}}
      <button class="ui button right item" {{on "click" (fn @refresh true)}} type="button">
        <i class="sync alternate icon"></i> Actualiser
      </button>
    </div>

  </template>
}
