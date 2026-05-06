import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
<template>
  <header class="page-header">
    <h1 class="page-title">Modules</h1>
    <div class="page-actions">

    </div>
  </header>
  <main class="page-body">
    <section class="page-section">
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
              <th>title</th>
              <th>isBeta</th>
              <th>visibility</th>
              <th>level</th>
            </tr>
          </thead>
          <tbody>
            {{#each @model.modules as |module|}}
              <tr class="tr--clickable">
                <td>{{module.title}}</td>
                <td>{{module.isBeta}}</td>
                <td>{{module.visibility}}</td>
                <td>{{module.level}}</td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
      <div class="modules-list__pagination">
        <PixPagination @pagination={{@model.modules.meta}} />
      </div>
    </section>
  </main>
</template>
