import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import NewAdminEntityForm from 'pixeditor/components/admin/new-entity-form';

<template>
  <div class="new-entity__header">
    <h1>
      Création d'une entité "{{@model.schema.label}}"
    </h1>
    <PixButtonLink @route="admin.entities.list" @variant="secondary" @iconBefore="arrowLeft">
      Revenir à l'accueil
    </PixButtonLink>
  </div>
  <NewAdminEntityForm @entityFields={{@controller.fieldsToDisplay}} @onSubmit={{@controller.onSubmit}} />
</template>
