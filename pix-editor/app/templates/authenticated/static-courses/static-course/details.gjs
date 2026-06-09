import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import formatDate from 'ember-intl/helpers/format-date';
import eq from 'ember-truth-helpers/helpers/eq';
import not from 'ember-truth-helpers/helpers/not';
import Card from 'pixeditor/components/card';
<template>
  <header class="page-header">
    <h1 class="page-title">{{@controller.model.staticCourse.name}}</h1>
    <div class="page-actions">
      <PixButtonLink
        @backgroundColor="blue"
        @route="authenticated.static-courses.static-course.edit"
        @isDisabled={{not @controller.canEditStaticCourse}}
        class="pix-button-link-with-icon white-font"
      >
        <PixIcon @name="edit" @ariaHidden={{true}} />
        Éditer le test statique
      </PixButtonLink>
      <PixButton
        @backgroundColor="grey"
        @isBorderVisible={{true}}
        @triggerAction={{@controller.showActivationModal}}
        @isDisabled={{not @controller.canDeactivateOrReactivateStaticCourse}}
      >
        {{#if @controller.model.staticCourse.isActive}}
          Désactiver
        {{else}}
          Réactiver
        {{/if}}
      </PixButton>
    </div>
  </header>
  <main class="page-body">
    <section class="page-section">
      <Card class="static-course-details__card-information" @title="1. Informations">
        {{#each @controller.model.staticCourse.tags as |tag|}}
          <PixTag class="static-course-tag" @color="yellow">
            {{tag.label}}
          </PixTag>
        {{/each}}
        <ul>
          <li><span class="bold">Nom : </span>{{@controller.model.staticCourse.name}}</li>
          <li>
            <span class="bold">Description : </span>
            <div class="static-course-details__description">{{@controller.model.staticCourse.description}}</div>
          </li>
          <li><span class="bold">Statut du test : </span>
            <PixTag @color="{{if @controller.model.staticCourse.isActive 'green' 'grey'}}">
              {{if @controller.model.staticCourse.isActive "Actif" "Inactif"}}
            </PixTag>
            {{#if @controller.model.staticCourse.deactivationReason}}
              (Motif:
              {{@controller.model.staticCourse.deactivationReason}})
            {{/if}}
          </li>
          <li><span class="bold">Crée le : </span>{{formatDate
              @controller.model.staticCourse.createdAt
              "DD/MM/YYYY"
              allow-empty=true
            }}</li>
          <li><span class="bold">Dernière modification : </span>{{formatDate
              @controller.model.staticCourse.updatedAt
              "DD/MM/YYYY"
              allow-empty=true
            }}</li>
        </ul>
        <div class="static-course-details__card-information--actions">
          <PixButton
            @triggerAction={{fn @controller.copyStaticCoursePreviewUrl @controller.model.staticCourse}}
            @iconBefore="copy"
            @plainIconBefore="far"
            @backgroundColor="transparent-light"
            @isBorderVisible={{true}}
            @isDisabled={{not @controller.model.staticCourse.isActive}}
          >
            Copier le lien
          </PixButton>
          <PixButtonLink
            @href={{if @controller.model.staticCourse.isActive @controller.model.staticCourse.previewURL "#"}}
            target={{if @controller.model.staticCourse.isActive "_blank" "_self"}}
            @backgroundColor="transparent-light"
            @isBorderVisible={{true}}
            class="pix-button-link-with-icon"
            @isDisabled={{not @controller.model.staticCourse.isActive}}
          >
            <PixIcon @name="eye" @plainIcon={{true}} />
            Prévisualiser
          </PixButtonLink>
          <PixTooltip @id="info-preview-links-tooltip" @position="right" @isWide={{true}}>
            <:triggerElement>
              <PixIcon aria-describedby="info-preview-links-tooltip" @name="info" @plainIcon={{true}} />
            </:triggerElement>
            <:tooltip>
              Le test statique sera accessible à compter du lendemain de sa création / mise à jour. Si besoin d’accéder
              au test d’ici-là, recharger le cache de la recette depuis l’application PixAdmin puis “copier le lien” du
              test et remplacer la partie de l’URL “app.pix” par “app.recette.pix”.
            </:tooltip>
          </PixTooltip>
        </div>
      </Card>
      <Card @title="2. Liste des épreuves">
        <div class="panel-table-v2">
          <table class="content-text content-text--small">
            <colgroup class="table__column">
              <col class="table__column--tiny" />
              <col class="table__column--small" />
              <col class="table__column--wide" />
              <col class="table__column--small" />
              <col class="table__column--small" />
              <col class="table__column--small" />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Consigne</th>
                <th>Acquis</th>
                <th>Statut</th>
                <th>Prévisualisation</th>
              </tr>
            </thead>
            <tbody>
              {{#each @controller.model.staticCourse.sortedChallengeSummaries as |challengeSummary|}}
                <tr>
                  <td>{{challengeSummary.indexForDisplay}}</td>
                  <td>{{challengeSummary.id}}</td>
                  <td class="ellipsis">{{challengeSummary.instruction}}</td>
                  <td>{{challengeSummary.skillName}}</td>
                  <td>
                    {{#if (eq challengeSummary.status "validé")}}
                      <PixTag @color="green-light">{{challengeSummary.status}}</PixTag>
                    {{else if (eq challengeSummary.status "proposé")}}
                      <PixTag @color="blue-light">{{challengeSummary.status}}</PixTag>
                    {{else if (eq challengeSummary.status "archivé")}}
                      <PixTag @color="grey-light">{{challengeSummary.status}}</PixTag>
                    {{else if (eq challengeSummary.status "périmé")}}
                      <PixTag @color="orange-light">{{challengeSummary.status}}</PixTag>
                    {{else}}
                      <PixTag @color="purple-light">{{challengeSummary.status}}</PixTag>
                    {{/if}}
                  </td>
                  <td>
                    <a href="{{challengeSummary.previewUrl}}" target="_blank">
                      <PixIcon @name="eye" @plainIcon={{true}} />
                    </a>
                  </td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      </Card>
      <div class="page-actions">
        <PixButtonLink
          @backgroundColor="transparent-light"
          @route="authenticated.static-courses.list"
          @isBorderVisible={{true}}
        >
          Retour
        </PixButtonLink>
        <PixButtonLink
          @backgroundColor="blue"
          @route="authenticated.static-courses.static-course.edit"
          @isDisabled={{not @controller.canEditStaticCourse}}
          class="pix-button-link-with-icon white-font"
        >
          <PixIcon @name="edit" />
          Éditer le test statique
        </PixButtonLink>
      </div>
    </section>
  </main>
  <PixModal
    @title="Désactivation"
    @onCloseButtonClick={{@controller.closeDeactivationModal}}
    @showModal={{@controller.shouldDisplayDeactivationModal}}
  >
    <:content>
      <p>
        Êtes-vous sûr de vouloir désactiver le test statique
        <b>{{@controller.model.staticCourse.name}}</b>
        ?<br />
        <PixInput
          @id="deactivationReason"
          @value={{@controller.deactivationReason}}
          {{on "input" @controller.setDeactivationReason}}
        ><:label>Raison de désactivation (facultatif)</:label></PixInput>
      </p>
    </:content>
    <:footer>
      <PixButton
        @backgroundColor="transparent-light"
        @isBorderVisible={{true}}
        @triggerAction={{@controller.closeDeactivationModal}}
      >
        Non
      </PixButton>
      <PixButton @triggerAction={{@controller.deactivateStaticCourse}}>
        Oui
      </PixButton>
    </:footer>
  </PixModal>
  <PixModal
    @title="Réactivation"
    @onCloseButtonClick={{@controller.closeReactivationModal}}
    @showModal={{@controller.shouldDisplayReactivationModal}}
  >
    <:content>
      <p>
        Êtes-vous sûr de vouloir réactiver le test statique
        <b>{{@controller.model.staticCourse.name}}</b>
        ?
      </p>
    </:content>
    <:footer>
      <PixButton
        @backgroundColor="transparent-light"
        @isBorderVisible={{true}}
        @triggerAction={{@controller.closeReactivationModal}}
      >
        Non
      </PixButton>
      <PixButton @triggerAction={{@controller.reactivateStaticCourse}}>
        Oui
      </PixButton>
    </:footer>
  </PixModal>
</template>
