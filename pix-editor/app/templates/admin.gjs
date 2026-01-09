import AdminHome from 'pixeditor/components/admin/home';

<template>
  <AdminHome @user={{@controller.user}} @schemas={{@controller.schemas}}>
    {{outlet}}
  </AdminHome>
</template>
