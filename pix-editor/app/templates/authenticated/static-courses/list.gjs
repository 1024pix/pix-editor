import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import not from 'ember-truth-helpers/helpers/not';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixToggleButton from '@1024pix/pix-ui/components/pix-toggle-button';
import { fn } from '@ember/helper';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import formatDate from 'ember-intl/helpers/format-date';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
<template> <header class="page-header">
  <h1 class="page-title">Tests Statiques</h1>
  <div class="page-actions">
    <PixTooltip @id="create-static-course-tooltip" @position="bottom-left" @hide={{@controller.model.mayCreateStaticCourse}}>
      <:triggerElement>
        <PixButtonLink @backgroundColor="blue" @route="authenticated.static-courses.new" @isDisabled={{not @controller.model.mayCreateStaticCourse}} aria-describedby="create-static-course-tooltip" class="pix-button-link-with-icon white-font">
          <PixIcon @name="add" @ariaHidden={{true}} />
          Créer un nouveau test
        </PixButtonLink>
      </:triggerElement>

      <:tooltip>
        Vous n'avez pas les droits suffisants pour créer un test statique.
      </:tooltip>
    </PixTooltip>
  </div>
</header>
<main class="page-body">
  <section class="page-section">
    <PixFilterBanner @title="Filtres" class="table-filter-banner new-mission-form" @clearFiltersLabel="Réinitialiser les filtres" @onClearFilters={{@controller.clearFilters}} @isClearFilterButtonDisabled={{false}} @loadFiltersLabel="Filtrer" @onLoadFilters={{@controller.submitFilters}}>
      <PixInput @id="static-course-filter-name" placeholder="Nom" @screenReaderOnly={{true}} @value={{@controller.name}} {{on "keyup" @controller.updateName}}><:label>Nom</:label></PixInput>
      <PixMultiSelect @id="filter-tags-selector" @placeholder="Sélectionnez des tags" @isSearchable="true" @emptyMessage="Pas de résultats" @screenReaderOnly={{true}} @onChange={{@controller.selectTags}} @values={{@controller.tempTagIds}} @options={{@controller.tagOptions}}>
        <:label>Tags</:label>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>
      <PixToggleButton @inlineLabel={{true}} @toggled={{@controller.showActiveOnly}} @onChange={{@controller.toggleShowActiveOnly}} @screenReaderOnly={{true}}>
        <:label>Statut</:label>
        <:viewA>Actifs</:viewA>
        <:viewB>Tous</:viewB>
      </PixToggleButton>
    </PixFilterBanner>
    <div class="panel-table-v2">
      <table class="content-text content-text--small">
        <colgroup class="table__column">
          <col class="table__column--wide" />
          <col class="table__column--wide" />
          <col class="table__column--small" />
          <col class="table__column--small" />
          <col class="table__column--small" />
          <col class="table__column--small" />
        </colgroup>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Tags</th>
            <th>Epreuves</th>
            <th>Créé le</th>
            <th>Statut</th>
            <th>Prévisualisation</th>
          </tr>
        </thead>
        <tbody>
        {{#each @controller.model.staticCourseSummaries as |staticCourseSummary|}}
          <tr class="tr--clickable">
            <td {{on "click" (fn @controller.goToStaticCourseDetails staticCourseSummary.id)}}>
              {{staticCourseSummary.name}}
            </td>
            <td {{on "click" (fn @controller.goToStaticCourseDetails staticCourseSummary.id)}}>
              {{#each staticCourseSummary.tags as |tag|}}
                <PixTag class="static-course-tag" @color="yellow">
                  {{tag.label}}
                </PixTag>
              {{/each}}
            </td>
            <td {{on "click" (fn @controller.goToStaticCourseDetails staticCourseSummary.id)}}>{{staticCourseSummary.challengeCount}}</td>
            <td {{on "click" (fn @controller.goToStaticCourseDetails staticCourseSummary.id)}}>{{formatDate staticCourseSummary.createdAt "DD/MM/YYYY" allow-empty=true}}</td>
            <td {{on "click" (fn @controller.goToStaticCourseDetails staticCourseSummary.id)}}>
              <PixTag @color="{{if staticCourseSummary.isActive "green" "grey"}}">
                {{if staticCourseSummary.isActive "Actif" "Inactif"}}
              </PixTag>
            </td>
            <td class="actions">
              <PixTooltip @id="copy-static-course-link-tooltip" @position="top" @isInline={{true}} @hide={{not staticCourseSummary.isActive}}>
                <:triggerElement>
                  <PixIconButton @triggerAction={{fn @controller.copyStaticCoursePreviewUrl staticCourseSummary}} @iconName="copy" @iconPrefix="far" @ariaLabel="copier le lien vers la preview" class="icon" aria-describedby="copy-static-course-link-tooltip" disabled={{not staticCourseSummary.isActive}}>
                  </PixIconButton>
                </:triggerElement>
                <:tooltip>Copier l’URL d’accès au test</:tooltip>
              </PixTooltip>
              <PixTooltip @id="open-static-course-link-tooltip" @position="top" @isInline={{true}} @hide={{not staticCourseSummary.isActive}} class="{{if staticCourseSummary.isActive "" "disabled-tooltip-content"}}">
                <:triggerElement>
                  <a href="{{staticCourseSummary.previewURL}}" target="_blank" rel="noopener noreferrer" aria-describedby="open-static-course-link-tooltip" class="{{if staticCourseSummary.isActive "" "disabled-link-with-icon"}}">
                    <PixIcon @name="eye" @plainIcon={{true}} />
                  </a>
                </:triggerElement>
                <:tooltip>Accéder au test</:tooltip>
              </PixTooltip>

            </td>
          </tr>
        {{/each}}
        </tbody>
      </table>
    </div>
  </section>
  <div class="static-course-list__pagination">
    <PixPagination @pagination={{@controller.model.staticCourseSummaries.meta}} />
  </div>
</main>
</template>
