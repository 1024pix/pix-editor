import { databaseBuffer } from './database-buffer.js';
import * as factory from './factory/index.js';
import { emptyAllTables, listTablesByDependencyOrderDesc } from '../../../db/knex-database-connection.js';
import _ from 'lodash';

export class DatabaseBuilder {
  constructor({ knex }) {
    this.knex = knex;
    this.databaseBuffer = databaseBuffer;
    this.tablesOrderedByDependencyWithDirtinessMap = [];
    this.factory = factory;
    this.isFirstCommit = true;
  }

  async commit() {
    if (this.isFirstCommit) {
      this.isFirstCommit = false;
      await emptyAllTables();
      await this._initTablesOrderedByDependencyWithDirtinessMap();
    }
    const trx = await this.knex.transaction();
    for (const objectToInsert of this.databaseBuffer.objectsToInsert) {
      await trx(objectToInsert.tableName).insert(objectToInsert.values);
      this._setTableAsDirty(objectToInsert.tableName);
    }
    this.databaseBuffer.objectsToInsert = [];
    this.databaseBuffer.tablesToDelete = this._selectDirtyTables();
    await trx.commit();
  }

  async clean() {
    let rawQuery = '';
    _.times(this.databaseBuffer.tablesToDelete.length, () => {
      rawQuery += 'DELETE FROM ??;';
    });
    if (rawQuery !== '') {
      await this.knex.raw(rawQuery, this.databaseBuffer.tablesToDelete);
      this.databaseBuffer.purge();
      this._purgeDirtiness();
    }
  }

  async _initTablesOrderedByDependencyWithDirtinessMap() {
    const dependencyOrderedTables = await listTablesByDependencyOrderDesc();
    this.tablesOrderedByDependencyWithDirtinessMap = _.map(dependencyOrderedTables, (table) => {
      return {
        table,
        isDirty: false,
      };
    });
  }

  _setTableAsDirty(table) {
    const tableWithDirtiness = _.find(this.tablesOrderedByDependencyWithDirtinessMap, { table });
    tableWithDirtiness.isDirty = true;
  }

  _selectDirtyTables() {
    const dirtyTableObjects = _.filter(this.tablesOrderedByDependencyWithDirtinessMap, { isDirty: true });
    return _.map(dirtyTableObjects, 'table');
  }

  _purgeDirtiness() {
    _.each(this.tablesOrderedByDependencyWithDirtinessMap, (table) => {
      table.isDirty = false;
    });
  }
}
