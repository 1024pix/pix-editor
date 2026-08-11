import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import formatDate from 'ember-intl/helpers/format-date';
<template>
  <header class="page-header">
    <h1>Missions</h1>
    {{#if @controller.model.mayCreateOrEditMissions}}
      <div class="page-actions">
        <PixButtonLink
          @backgroundColor="blue"
          @route="authenticated.missions.new"
          class="pix-button-link-with-icon white-font"
        >
          <PixIcon @name="add" @ariaHidden={{true}} />
          Créer une nouvelle mission
        </PixButtonLink>
      </div>
    {{/if}}
  </header>
  <main class="page-body">
    <section class="page-section">
      <PixFilterBanner
        @title="Filtres"
        class="table-filter-banner"
        @clearFiltersLabel="Réinitialiser les filtres"
        @onClearFilters={{@controller.clearFilters}}
        @isClearFilterButtonDisabled={{false}}
      >
        <PixMultiSelect
          @id="mission-status-multi-select"
          @screenReaderOnly={{true}}
          @placeholder="Aucun"
          @onChange={{@controller.onChangesStatus}}
          @values={{@controller.getStatusSelected}}
          @emptyMessage="Il n'y a pas de statut"
          @options={{@controller.statusesOption}}
        >
          <:label>Statut</:label>
          <:default as |option|>{{option.label}}</:default>
        </PixMultiSelect>

      </PixFilterBanner>
      <div class="panel-table-v2">
        <table class="content-text content-text--small">
          <colgroup class="table__column">
            <col class="table__column--small" />
            <col class="table__column--wide" />
            <col class="table__column--small" />
            <col class="table__column--small" />
          </colgroup>
          <thead>
            <tr>
              <th>Nom de la mission</th>
              <th>Compétence liée</th>
              <th>Créé le</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {{#each @controller.model.missions as |mission|}}
              <tr class="tr--clickable" {{on "click" (fn @controller.goToMissionDetails mission.id)}}>
                <td>
                  {{mission.name}}
                </td>
                <td>{{mission.competence}}</td>
                <td>{{formatDate mission.createdAt "DD/MM/YYYY" allow-empty=true}}</td>
                <td>
                  <PixTag @color="{{mission.statusColor}}">
                    {{mission.displayableStatus}}
                  </PixTag>
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    </section>
    <div class="missions-list__pagination">
      <PixPagination @pagination={{@controller.model.missions.meta}} />
    </div>
  </main>
</template>
