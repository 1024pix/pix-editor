import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import not from 'ember-truth-helpers/helpers/not';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import Card from 'pix-editor/components/card';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import MarkdownToHtml from 'ember-cli-showdown/components/markdown-to-html';
import formatDate from 'ember-intl/helpers/format-date';
<template>
  <header class="page-header">
    <h1 class="page-title">Détails d'une mission</h1>
    <div class="page-actions">
      <PixButtonLink
        @route="authenticated.missions.mission.edit"
        @isDisabled={{not @controller.model.userMayCreateOrEditMissions}}
        class="pix-button-link-with-icon white-font"
      >
        <PixIcon @name="edit" @ariaHidden={{true}} />
        Modifier la mission
      </PixButtonLink>
    </div>
  </header>
  <main class="page-body">
    <section class="page-section">
      <Card class="mission-details__card-information" @title="1. Informations">
        <ul>
          <li><span class="bold">Nom : </span>{{@controller.model.mission.name}}</li>
          <li><span class="bold">Image carte : </span>{{@controller.model.mission.cardImageUrl}}</li>
          <li>
            <span class="bold">Compétence : </span>
            {{@controller.model.competence}}
          </li>
          <li>
            <span class="bold">Thématiques : </span>
            {{@controller.model.thematics}}
          </li>
          <li><span class="bold">Statut : </span>
            <PixTag @color="{{@controller.model.mission.statusColor}}">
              {{@controller.model.mission.displayableStatus}}
            </PixTag>
          </li>
          <li>
            <span class="bold">Objectifs d'apprentissage : </span>
            <div class="mission-details__description">
              <MarkdownToHtml @markdown={{@controller.model.mission.learningObjectives}} />
            </div>
          </li>
          <li>
            <span class="bold">Objectifs validés dans la mission : </span>
            <div class="mission-details__description">
              <MarkdownToHtml @markdown={{@controller.model.mission.validatedObjectives}} />
            </div>
          </li>
          <li>
            <span class="bold">URL du média d'introduction de la mission : </span>
            <a
              href={{@controller.model.mission.introductionMediaUrl}}
              target="_blank"
              referrerpolicy="strict-origin"
            >{{@controller.model.mission.introductionMediaUrl}}</a>
          </li>
          <li>
            <span class="bold">Type de média d'introduction : </span>
            {{@controller.model.mission.introductionMediaType}}
          </li>
          <li>
            <span class="bold">Texte alternatif au média d'introduction de la mission : </span>
            {{@controller.model.mission.introductionMediaAlt}}
          </li>
          <li>
            <span class="bold">URL de la documentation de la mission : </span>
            <a
              href={{@controller.model.mission.documentationUrl}}
              target="_blank"
              referrerpolicy="strict-origin"
            >{{@controller.model.mission.documentationUrl}} </a>
          </li>
          <li><span class="bold">Crée le : </span>{{formatDate
              @controller.model.mission.createdAt
              "DD/MM/YYYY"
              allow-empty=true
            }}</li>
        </ul>
      </Card>
    </section>
    <PixButtonLink @route="authenticated.missions" class="mission-details__back-home">
      Retour à la liste des missions
    </PixButtonLink>
  </main>
</template>
