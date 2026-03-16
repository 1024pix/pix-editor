import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import AdminEntityList from 'pixeditor/components/admin/entity-list';

<template>
  <AdminEntityList @schema={{@controller.schema}} @entityList={{@controller.entityList}} @sort={{@controller.sort}} />
  <div class="pagination">
    <PixPagination @pagination={{@controller.entityList.meta}} />
  </div>
</template>
