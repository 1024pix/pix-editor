import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import AdminEntityList from 'pixeditor/components/admin/entity-list';

<template>
  <AdminEntityList
    @schema={{@controller.schema}}
    @entityList={{@controller.entityList}}
    @sort={{@controller.sort}}
    @onDeleteEntity={{@controller.onDeleteEntity}}
    @actions={{@controller.actions}}
  />
  <div class="pagination">
    <PixPagination @pagination={{@controller.entityList.meta}} />
  </div>
  {{#if @controller.modal}}
    <PixModal
      @title={{@controller.modal.title}}
      @onCloseButtonClick={{@controller.closeModal}}
      @showModal={{@controller.modal}}
    >
      <:content>
        <p>{{@controller.modal.description}}</p>
      </:content>
      <:footer>
        <PixButton
          @variant="secondary"
          @triggerAction={{@controller.closeModal}}
          @disabled={{@controller.modal.isLoading}}
        >
          Annuler
        </PixButton>
        <PixButton @triggerAction={{@controller.modal.onConfirm}} @isLoading={{@controller.modal.isLoading}}>
          Confirmer
        </PixButton>
      </:footer>
    </PixModal>
  {{/if}}
</template>
