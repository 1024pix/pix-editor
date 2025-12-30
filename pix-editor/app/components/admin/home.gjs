import PixAppLayout from '@1024pix/pix-ui/components/pix-app-layout';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNavigation from '@1024pix/pix-ui/components/pix-navigation';
import PixNavigationButton from '@1024pix/pix-ui/components/pix-navigation-button';
import { LinkTo } from '@ember/routing';

<template>
  <PixAppLayout @variant="admin" class="admin">
    <:navigation>
      <PixNavigation>
        <:brand>
          <LinkTo @route="admin" class="elephant-container">
            <img src="/assets/images/elephant_admin.svg" alt="Pix Editor - Administration" />
            <span class="sr-only">Accueil de l'administration</span>
          </LinkTo>
        </:brand>
        <:navElements>
          {{#each @schemas as |schema|}}
            <PixNavigationButton @route="admin">
              {{schema.label}}
            </PixNavigationButton>
          {{/each}}
        </:navElements>
        <:footer>
          <p>{{@user.trigram}} - {{@user.name}}</p>
          <PixButtonLink @route="authenticated" @variant="secondary">
            Retourner sur Pix Editor
          </PixButtonLink>
        </:footer>
      </PixNavigation>
    </:navigation>
    <:main>
      {{yield}}
    </:main>
  </PixAppLayout>
</template>
